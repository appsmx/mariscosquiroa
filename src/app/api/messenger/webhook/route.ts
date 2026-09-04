import { NextRequest, NextResponse } from "next/server";
import { handleIncomingMessengerMessage } from "@/lib/messenger-bridge";
import { verifyWebhookSignature } from "@/lib/whatsapp";

// Margen para que la IA (vía LOGAN) responda antes de que Vercel corte la función.
export const maxDuration = 30;

/**
 * Webhook de la Messenger Platform (Facebook Messenger + Instagram Direct).
 *
 * GET  → verificación del webhook (Meta manda hub.challenge)
 * POST → eventos de mensajes entrantes (object: "page" o "instagram")
 *
 * Variables de entorno (ver .env.example):
 *  - MESSENGER_VERIFY_TOKEN       token para la verificación GET
 *  - MESSENGER_PAGE_ACCESS_TOKEN  token de la Página (para responder)
 *  - WHATSAPP_APP_SECRET          se reutiliza para validar la firma (misma app)
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.MESSENGER_VERIFY_TOKEN;

  if (mode === "subscribe" && token && token === verifyToken) {
    console.log("[messenger-webhook] Webhook verificado correctamente");
    return new NextResponse(challenge || "", { status: 200 });
  }

  console.warn("[messenger-webhook] Verificación fallida — token mismatch");
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Raw body para validar firma
    const rawBody = await req.text();

    // 2. Validar firma (misma app secret que WhatsApp)
    const signature = req.headers.get("x-hub-signature-256") || "";
    if (process.env.WHATSAPP_APP_SECRET) {
      const valid = verifyWebhookSignature(rawBody, signature);
      if (!valid) {
        console.warn("[messenger-webhook] Firma X-Hub-Signature-256 inválida");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);

    // 3. Determinar canal: "page" = Messenger, "instagram" = Instagram
    const object = body.object;
    if (object !== "page" && object !== "instagram") {
      return NextResponse.json({ ok: true, ignored: true });
    }
    const channel: "messenger" | "instagram" = object === "instagram" ? "instagram" : "messenger";

    const entries = body.entry || [];
    const processing: Promise<unknown>[] = [];

    for (const entry of entries) {
      // Los eventos de mensaje vienen en entry.messaging (Messenger e IG)
      const messagingEvents = entry.messaging || entry.standby || [];
      for (const event of messagingEvents) {
        // Ignorar echos (mensajes que envía la propia página) y eventos sin texto
        if (event.message?.is_echo) continue;
        const text = event.message?.text;
        const senderId = event.sender?.id;
        if (!text || !senderId) continue;

        processing.push(
          handleIncomingMessengerMessage({ senderId, text, channel })
        );
      }
    }

    // 4. Esperar el procesamiento antes de responder (Vercel congela al retornar)
    await Promise.allSettled(processing);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("[messenger-webhook] Error fatal:", (e as Error).message);
    // Responder 200 para que Meta no reintente en loop
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
