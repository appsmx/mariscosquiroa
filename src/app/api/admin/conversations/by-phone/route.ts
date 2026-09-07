import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

/**
 * GET /api/admin/conversations/by-phone?phone=<customerPhone>
 *
 * Resuelve la conversación de un cliente a partir de su identificador de
 * contacto (el mismo valor guardado en Order.customerPhone y en
 * WhatsappConversation.customerPhone: teléfono E.164 para WhatsApp, o
 * "ig:"/"msgr:"+id para Instagram/Messenger).
 *
 * Se usa para enlazar un pedido con la conversación donde se originó, ya que el
 * pedido no guarda el id de la conversación (la unión es por customerPhone).
 * Devuelve { id } o 404 si no existe conversación para ese contacto.
 */
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const phone = req.nextUrl.searchParams.get("phone")?.trim();
  if (!phone) {
    return NextResponse.json({ error: "Falta el parámetro phone" }, { status: 400 });
  }

  const conversation = await db.whatsappConversation.findUnique({
    where: { customerPhone: phone },
    select: { id: true },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "No hay conversación para ese contacto" },
      { status: 404 }
    );
  }

  return NextResponse.json({ id: conversation.id });
}
