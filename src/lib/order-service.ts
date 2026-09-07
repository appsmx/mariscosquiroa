import { db } from "@/lib/db";
import { generateOrderCode } from "@/lib/admin";

/**
 * Servicio de creación de pedidos.
 *
 * Extrae la lógica que antes vivía embebida en POST /api/public/orders, para
 * que la puedan reutilizar tanto ese endpoint (carrito web) como el agente de
 * IA (function calling: la tool `crear_pedido` que atiende WhatsApp, Messenger,
 * Instagram y el chat web).
 *
 * Un solo camino de creación de órdenes = un solo lugar donde mantener las
 * reglas (código secuencial, cálculo de totales, búsqueda/creación de cliente).
 */

export type CreateOrderItemInput = {
  productId?: string | null;
  productName: string;
  presentation?: string | null;
  quantity: number;
  unit?: string;
  unitPrice?: number;
  notes?: string | null;
};

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  channel?: "MAYOREO" | "MENUDEO";
  businessName?: string | null;
  rfc?: string | null;
  deliveryAddress?: string | null;
  deliveryCity?: string | null;
  deliveryState?: string | null;
  deliveryDate?: string | null; // ISO
  deliveryCost?: number;
  notes?: string | null;
  items: CreateOrderItemInput[];
  /** Origen del pedido: "web", "whatsapp", "messenger", "instagram", "admin". */
  source?: string;
};

export type CreatedOrder = {
  id: string;
  code: string;
  total: number;
  subtotal: number;
  status: string;
  createdAt: Date;
  items: Array<{
    productName: string;
    presentation: string | null;
    quantity: number;
    unit: string;
    unitPrice: number;
    subtotal: number;
  }>;
};

/** Estados en los que un pedido todavía se considera "abierto" (modificable). */
const OPEN_STATUSES = ["NUEVO", "EN_REVISION"] as const;

/** Ventana (ms) dentro de la cual un pedido abierto del mismo cliente se
 *  considera "el pedido en curso" y candidato a actualizar en vez de duplicar. */
const DEDUP_WINDOW_MS = 6 * 60 * 60 * 1000; // 6 horas

/** Ventana (ms) para idempotencia dura: si llega un pedido idéntico en este
 *  lapso, se asume reintento/doble confirmación y se devuelve el mismo pedido. */
const IDEMPOTENCY_WINDOW_MS = 3 * 60 * 1000; // 3 minutos

/** Teléfono placeholder del chat web sin identificación: NO se deduplica. */
const NO_PHONE = "sin-telefono";

export type DedupResult = {
  order: CreatedOrder;
  /** "created" = pedido nuevo · "updated" = se actualizó uno abierto reciente ·
   *  "duplicate_ignored" = idéntico reciente, se devolvió el existente. */
  action: "created" | "updated" | "duplicate_ignored";
};

/**
 * Crea un pedido en la base de datos.
 *  1. Busca o crea el Customer por teléfono.
 *  2. Genera el código secuencial (MEJ-2026-0001).
 *  3. Calcula subtotal y total.
 *  4. Crea el Order con status "NUEVO" y sus OrderItem.
 *
 * Lanza Error con mensaje claro si faltan datos obligatorios.
 */
export async function createOrder(input: CreateOrderInput): Promise<CreatedOrder> {
  validateOrderInput(input);

  const channel = input.channel === "MAYOREO" ? "MAYOREO" : "MENUDEO";
  const cleanPhone = normalizePhone(input.customerPhone);

  const customer = await findOrCreateCustomer(input, cleanPhone, channel);
  const { items, subtotal, total, deliveryCost } = buildItemsAndTotals(input);
  const code = await nextOrderCode();

  const order = await db.order.create({
    data: {
      code,
      customerId: customer.id,
      customerName: input.customerName,
      customerPhone: cleanPhone,
      customerEmail: input.customerEmail || null,
      channel,
      status: "NUEVO",
      subtotal,
      deliveryCost,
      total,
      deliveryAddress: input.deliveryAddress || null,
      deliveryCity: input.deliveryCity || null,
      deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : null,
      notes: input.notes || null,
      source: input.source || "web",
      items: { create: items },
    },
    include: { items: true },
  });

  return toCreatedOrder(order);
}

/**
 * Crea un pedido con detección de duplicados / actualización (Opción C híbrida).
 *
 * Solo aplica dedup en canales identificables (WhatsApp/Messenger/Instagram) con
 * un `customerPhone` real (o convoKey ig:/msgr:). El chat web sin teléfono
 * (`sin-telefono`) SIEMPRE crea, porque no podemos distinguir clientes.
 *
 * Comportamiento cuando el mismo cliente ya tiene un pedido ABIERTO
 * (NUEVO / EN_REVISION) creado dentro de DEDUP_WINDOW_MS:
 *  - **duplicate_ignored**: si los productos son idénticos y llegó dentro de
 *    IDEMPOTENCY_WINDOW_MS → se asume reintento/doble confirmación; se devuelve
 *    el pedido existente sin cambios.
 *  - **updated**: se reemplazan los renglones del pedido existente por los
 *    nuevos y se recalculan los totales, MANTENIENDO el mismo código MEJ.
 *  - Si `forceNew` es true → se ignora la dedup y se crea un pedido nuevo
 *    (para el caso en que el cliente confirma que quiere un pedido aparte).
 */
export async function createOrderWithDedup(
  input: CreateOrderInput,
  opts: { forceNew?: boolean } = {}
): Promise<DedupResult> {
  validateOrderInput(input);

  const channel = input.channel === "MAYOREO" ? "MAYOREO" : "MENUDEO";
  const cleanPhone = normalizePhone(input.customerPhone);

  const dedupEligible =
    !opts.forceNew &&
    cleanPhone !== NO_PHONE &&
    ["whatsapp", "messenger", "instagram"].includes((input.source || "").toLowerCase());

  if (dedupEligible) {
    const since = new Date(Date.now() - DEDUP_WINDOW_MS);
    const openOrder = await db.order.findFirst({
      where: {
        customerPhone: cleanPhone,
        status: { in: OPEN_STATUSES as unknown as string[] },
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    if (openOrder) {
      const { items, subtotal, total, deliveryCost } = buildItemsAndTotals(input);

      // (1) Idempotencia dura: mismos productos + muy reciente → no duplicar.
      const ageMs = Date.now() - new Date(openOrder.createdAt).getTime();
      if (ageMs <= IDEMPOTENCY_WINDOW_MS && sameItems(openOrder.items, items)) {
        return { order: toCreatedOrder(openOrder), action: "duplicate_ignored" };
      }

      // (2) Actualizar el pedido abierto: reemplazar items + recalcular totales,
      //     manteniendo el mismo código MEJ. Transacción para consistencia.
      const updated = await db.$transaction(async (tx) => {
        await tx.orderItem.deleteMany({ where: { orderId: openOrder.id } });
        return tx.order.update({
          where: { id: openOrder.id },
          data: {
            // Actualizamos datos que el cliente pudo cambiar en la conversación.
            customerName: input.customerName || openOrder.customerName,
            channel,
            subtotal,
            deliveryCost,
            total,
            deliveryAddress: input.deliveryAddress ?? openOrder.deliveryAddress,
            deliveryCity: input.deliveryCity ?? openOrder.deliveryCity,
            notes: input.notes ?? openOrder.notes,
            items: { create: items },
          },
          include: { items: true },
        });
      });

      return { order: toCreatedOrder(updated), action: "updated" };
    }
  }

  // Sin pedido abierto (o dedup no aplica) → crear nuevo.
  const created = await createOrder(input);
  return { order: created, action: "created" };
}

// ─── Helpers internos ────────────────────────────────────────────────────────

function validateOrderInput(input: CreateOrderInput) {
  if (!input.customerName?.trim()) throw new Error("Falta el nombre del cliente");
  if (!input.customerPhone?.trim()) throw new Error("Falta el teléfono del cliente");
  if (!input.items?.length) throw new Error("El pedido no tiene productos");
}

function normalizePhone(phone: string): string {
  return phone.replace(/\s/g, "");
}

async function findOrCreateCustomer(
  input: CreateOrderInput,
  cleanPhone: string,
  channel: "MAYOREO" | "MENUDEO"
) {
  let customer = await db.customer.findUnique({ where: { phone: cleanPhone } });
  if (!customer) {
    customer = await db.customer.create({
      data: {
        name: input.customerName,
        phone: cleanPhone,
        email: input.customerEmail || null,
        channel,
        businessName: input.businessName || null,
        rfc: input.rfc || null,
        address: input.deliveryAddress || null,
        city: input.deliveryCity || null,
        state: input.deliveryState || null,
      },
    });
  } else if (channel === "MAYOREO" && customer.channel !== "MAYOREO") {
    await db.customer.update({
      where: { id: customer.id },
      data: { channel: "MAYOREO" },
    });
  }
  return customer;
}

async function nextOrderCode(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.order.count({
    where: { code: { startsWith: `MEJ-${year}-` } },
  });
  return generateOrderCode(count + 1, year);
}

function buildItemsAndTotals(input: CreateOrderInput) {
  const items = input.items.map((it) => {
    const quantity = Number(it.quantity) || 0;
    const unitPrice = Number(it.unitPrice || 0);
    return {
      productId: it.productId || null,
      productName: it.productName || "Producto",
      presentation: it.presentation || null,
      quantity,
      unit: it.unit || "kg",
      unitPrice,
      subtotal: quantity * unitPrice,
      notes: it.notes || null,
    };
  });
  const subtotal = items.reduce((sum, it) => sum + it.subtotal, 0);
  const deliveryCost = Number(input.deliveryCost) || 0;
  const total = subtotal + deliveryCost;
  return { items, subtotal, total, deliveryCost };
}

/** Compara dos conjuntos de renglones ignorando el orden (para idempotencia). */
function sameItems(
  a: Array<{ productName: string; presentation: string | null; quantity: number; unit: string }>,
  b: Array<{ productName: string; presentation: string | null; quantity: number; unit: string }>
): boolean {
  if (a.length !== b.length) return false;
  const key = (it: { productName: string; presentation: string | null; quantity: number; unit: string }) =>
    `${it.productName.trim().toLowerCase()}|${(it.presentation || "").trim().toLowerCase()}|${it.quantity}|${it.unit.trim().toLowerCase()}`;
  const setA = a.map(key).sort();
  const setB = b.map(key).sort();
  return setA.every((k, i) => k === setB[i]);
}

function toCreatedOrder(order: {
  id: string;
  code: string;
  total: number;
  subtotal: number;
  status: string;
  createdAt: Date;
  items: Array<{
    productName: string;
    presentation: string | null;
    quantity: number;
    unit: string;
    unitPrice: number;
    subtotal: number;
  }>;
}): CreatedOrder {
  return {
    id: order.id,
    code: order.code,
    total: order.total,
    subtotal: order.subtotal,
    status: order.status,
    createdAt: order.createdAt,
    items: order.items.map((it) => ({
      productName: it.productName,
      presentation: it.presentation,
      quantity: it.quantity,
      unit: it.unit,
      unitPrice: it.unitPrice,
      subtotal: it.subtotal,
    })),
  };
}
