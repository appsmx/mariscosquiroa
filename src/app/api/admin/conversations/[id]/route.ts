import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

/**
 * GET /api/admin/conversations/[id]
 *   Devuelve el detalle de una conversación con todos sus mensajes en orden.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const conversation = await db.whatsappConversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });
  }

  // Derivar canal e identificador visible
  let channel: "whatsapp" | "messenger" | "instagram" = "whatsapp";
  let displayId = conversation.customerPhone;
  if (conversation.customerPhone.startsWith("ig:")) {
    channel = "instagram";
    displayId = conversation.customerPhone.slice(3);
  } else if (conversation.customerPhone.startsWith("msgr:")) {
    channel = "messenger";
    displayId = conversation.customerPhone.slice(5);
  }

  return NextResponse.json({
    id: conversation.id,
    channel,
    customerName: conversation.customerName,
    displayId,
    status: conversation.status,
    lastMessageAt: conversation.lastMessageAt,
    messages: conversation.messages.map((m) => ({
      id: m.id,
      direction: m.direction, // INBOUND | OUTBOUND
      content: m.content,
      source: m.source, // AI | HUMAN | SYSTEM
      type: m.type,
      createdAt: m.createdAt,
    })),
  });
}
