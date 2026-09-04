import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

/**
 * GET /api/admin/conversations
 *   Lista las conversaciones (WhatsApp, Messenger, Instagram) ordenadas por
 *   último mensaje. Cada conversación incluye el canal, el cliente y un preview.
 *
 * Query params:
 *   - channel: filtrar por "whatsapp" | "messenger" | "instagram" (opcional)
 *   - q: buscar por nombre o identificador (opcional)
 */
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const channelFilter = searchParams.get("channel");
  const q = searchParams.get("q")?.trim().toLowerCase();

  const conversations = await db.whatsappConversation.findMany({
    orderBy: { lastMessageAt: "desc" },
    take: 200,
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: true } },
    },
  });

  // Derivar el canal a partir del prefijo del customerPhone:
  //   "ig:..."   → instagram
  //   "msgr:..." → messenger
  //   resto      → whatsapp
  const mapped = conversations.map((c) => {
    let channel: "whatsapp" | "messenger" | "instagram" = "whatsapp";
    let displayId = c.customerPhone;
    if (c.customerPhone.startsWith("ig:")) {
      channel = "instagram";
      displayId = c.customerPhone.slice(3);
    } else if (c.customerPhone.startsWith("msgr:")) {
      channel = "messenger";
      displayId = c.customerPhone.slice(5);
    }
    return {
      id: c.id,
      channel,
      customerName: c.customerName,
      displayId,
      status: c.status,
      lastMessageAt: c.lastMessageAt,
      lastPreview: c.messages[0]?.content?.slice(0, 80) || "",
      messageCount: c._count.messages,
    };
  });

  const filtered = mapped.filter((c) => {
    if (channelFilter && c.channel !== channelFilter) return false;
    if (q) {
      const hay = `${c.customerName || ""} ${c.displayId}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return NextResponse.json({ conversations: filtered });
}
