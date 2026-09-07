import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/order-service";

/**
 * POST /api/public/orders
 * Crea una cotización/pedido desde la web pública.
 * No requiere autenticación.
 *
 * Body:
 * {
 *   customerName: string,
 *   customerPhone: string,
 *   customerEmail?: string,
 *   channel: "MAYOREO" | "MENUDEO",
 *   deliveryAddress?: string,
 *   deliveryCity?: string,
 *   deliveryDate?: string (ISO),
 *   notes?: string,
 *   items: [{ productId?, productName, presentation?, quantity, unit, unitPrice }]
 * }
 *
 * El endpoint:
 *  1. Genera un código secuencial (MEJ-2026-0001)
 *  2. Calcula subtotal y total automáticamente
 *  3. Crea el pedido con status "NUEVO"
 *  4. Si el cliente ya existe por teléfono, lo vincula; si no, lo crea
 *  5. Devuelve el pedido creado con el código
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validación mínima
    if (!body.customerName || !body.customerPhone || !body.items?.length) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios: nombre, teléfono e items" },
        { status: 400 }
      );
    }

    // Crear el pedido a través del servicio compartido (mismo camino que usa
    // el agente de IA vía function calling).
    const order = await createOrder({
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
      channel: body.channel === "MAYOREO" ? "MAYOREO" : "MENUDEO",
      businessName: body.businessName,
      rfc: body.rfc,
      deliveryAddress: body.deliveryAddress,
      deliveryCity: body.deliveryCity,
      deliveryState: body.deliveryState,
      deliveryDate: body.deliveryDate,
      deliveryCost: body.deliveryCost,
      notes: body.notes,
      items: body.items,
      source: "web",
    });

    return NextResponse.json(
      {
        ok: true,
        order: {
          id: order.id,
          code: order.code,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
          items: order.items,
        },
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("Error creando pedido público:", e);
    return NextResponse.json(
      { error: "Error al procesar la cotización", detail: e.message },
      { status: 500 }
    );
  }
}
