import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { sendTextMessage } from "@/lib/whatsapp";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/whatsapp/send-message
 *
 * Permite al admin enviar un mensaje manual a un cliente desde el dashboard.
 * Requiere sesión admin (NextAuth).
 *
 * Body:
 * { "to": "526636999689", "text": "Hola, tu pedido va en camino" }
 */
export async function POST(req: NextRequest) {
  // 1. Verificar sesión admin
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { to, text } = body;

    if (!to || !text) {
      return NextResponse.json(
        { error: "Faltan campos: to, text" },
        { status: 400 }
      );
    }

    // Limpiar número (quitar +, espacios, guiones)
    const cleanTo = String(to).replace(/[^0-9]/g, "");

    if (cleanTo.length < 10) {
      return NextResponse.json(
        { error: "Número inválido" },
        { status: 400 }
      );
    }

    const result = await sendTextMessage({ to: cleanTo, text });

    if (!result) {
      return NextResponse.json(
        { error: "Error enviando mensaje. Revisa logs." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      messageId: result.messages?.[0]?.id,
      waId: result.contacts?.[0]?.wa_id,
    });
  } catch (e: any) {
    console.error("[whatsapp/send-message] Error:", e);
    return NextResponse.json(
      { error: e?.message || "Error interno" },
      { status: 500 }
    );
  }
}
