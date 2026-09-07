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
  if (!input.customerName?.trim()) {
    throw new Error("Falta el nombre del cliente");
  }
  if (!input.customerPhone?.trim()) {
    throw new Error("Falta el teléfono del cliente");
  }
  if (!input.items?.length) {
    throw new Error("El pedido no tiene productos");
  }

  const channel = input.channel === "MAYOREO" ? "MAYOREO" : "MENUDEO";
  const cleanPhone = input.customerPhone.replace(/\s/g, "");

  // 1. Buscar o crear cliente por teléfono
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

  // 2. Código secuencial del año
  const year = new Date().getFullYear();
  const count = await db.order.count({
    where: { code: { startsWith: `MEJ-${year}-` } },
  });
  const code = generateOrderCode(count + 1, year);

  // 3. Items + totales
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

  // 4. Crear pedido
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
