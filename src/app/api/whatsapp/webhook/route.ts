import { NextRequest, NextResponse } from "next/server";
import { handleIncomingMessage } from "@/lib/whatsapp-bridge";
import { verifyWebhookSignature, isWhatsappConfigured } from "@/lib/whatsapp";

/**
 * GET /api/whatsapp/webhook
 *
 * Verificación del webhook por parte de Meta.
 * Meta manda:
 *   - hub.mode=subscribe
 *   - hub.verify_token=TU_VERIFY_TOKEN
 *   - hub.challenge=string
 *
 * Si el verify_token coincide con WHATSAPP_VERIFY_TOKEN,
 * respondemos con el challenge en texto plano.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (!mode || !token || !challenge) {
    return new NextResponse("Faltan parámetros", { status: 400 });
  }

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!expectedToken) {
    console.error("[whatsapp-webhook] WHATSAPP_VERIFY_TOKEN no configurado en .env");
    return new NextResponse("Server not configured", { status: 500 });
  }

  if (mode === "subscribe" && token === expectedToken) {
    console.log("[whatsapp-webhook] Webhook verificado correctamente");
    // Meta espera el challenge como texto plano
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  console.warn("[whatsapp-webhook] Verificación fallida — token mismatch");
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * POST /api/whatsapp/webhook
 *
 * Recibe los eventos de WhatsApp Cloud API:
 *  - Mensajes entrantes de clientes
 *  - Status updates (sent, delivered, read, failed)
 *
 * Body shape (resumido):
 * {
 *   "object": "whatsapp_business_account",
 *   "entry": [{
 *     "id": "...",
 *     "changes": [{
 *       "value": {
 *         "messaging_product": "whatsapp",
 *         "metadata": { "phone_number_id": "..." },
 *         "messages": [{ "from": "5266...", "id": "wamid.xxxx", "type": "text", "text": { "body": "..." } }],
 *         "statuses": [{ "id": "wamid.xxxx", "status": "delivered", ... }]
 *       },
 *       "field": "messages"
 *     }]
 *   }]
 * }
 *
 * Seguridad: validamos X-Hub-Signature-256 con HMAC-SHA256.
 */
export async function POST(req: NextRequest) {
  // Si la integración no está configurada, salir rápido
  if (!isWhatsappConfigured()) {
    return NextResponse.json(
      { error: "WhatsApp integration not configured" },
      { status: 503 }
    );
  }

  try {
    // 1. Leer raw body para validar firma
    const rawBody = await req.text();

    // 2. Validar firma si está configurada
    const signature = req.headers.get("x-hub-signature-256") || "";
    if (process.env.WHATSAPP_APP_SECRET) {
      const valid = verifyWebhookSignature(rawBody, signature);
      if (!valid) {
        console.warn("[whatsapp-webhook] Firma X-Hub-Signature-256 inválida");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    // 3. Parsear payload
    const body = JSON.parse(rawBody);

    // 4. Validar que sea un evento de whatsapp
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const entries = body.entry || [];

    // 5. Procesar cada entry en paralelo (no bloquear respuesta a Meta)
    //    Meta exige 200 OK en menos de 5s, así que disparamos y olvidamos.
    const processingPromises: Promise<void>[] = [];

    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field !== "messages") continue;
        const value = change.value || {};

        // 5a. Mensajes entrantes
        const messages = value.messages || [];
        for (const msg of messages) {
          processingPromises.push(processIncomingMessage(msg, value));
        }

        // 5b. Status updates (delivered, read, etc.) — actualizar en DB
        const statuses = value.statuses || [];
        for (const status of statuses) {
          processingPromises.push(processStatusUpdate(status));
        }
      }
    }

    // 6. Responder 200 OK a Meta INMEDIATAMENTE (no esperar el procesamiento)
    //    El procesamiento se hace en background.
    //    Importante: capturamos errores para no romper el event loop.
    Promise.allSettled(processingPromises).catch((e) => {
      console.error("[whatsapp-webhook] Error en procesamiento background:", e);
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.error("[whatsapp-webhook] Error fatal:", e);
    // Aún así respondemos 200 para que Meta no reintente
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

/**
 * Procesa un mensaje entrante de WhatsApp.
 */
async function processIncomingMessage(msg: any, value: any): Promise<void> {
  try {
    const from = msg.from;
    const messageId = msg.id;
    const type = msg.type as string;

    // Extraer info del contacto (nombre)
    const contact = (value.contacts || []).find((c: any) => c.wa_id === from);
    const customerName = contact?.profile?.name;

    // Extraer texto según tipo
    let text = "";
    let buttonPayload: string | undefined;

    if (type === "text") {
      text = msg.text?.body || "";
    } else if (type === "button") {
      text = msg.button?.text || "";
      buttonPayload = msg.button?.payload;
    } else if (type === "interactive") {
      const interactiveType = msg.interactive?.type;
      if (interactiveType === "button_reply") {
        text = msg.interactive?.button_reply?.title || "";
        buttonPayload = msg.interactive?.button_reply?.id;
      } else if (interactiveType === "list_reply") {
        text = msg.interactive?.list_reply?.title || "";
        buttonPayload = msg.interactive?.list_reply?.id;
      }
    }

    // Procesar vía el bridge
    const result = await handleIncomingMessage({
      from,
      messageId,
      text,
      type: (type as any) || "unknown",
      customerName,
      buttonPayload,
    });

    if (!result.ok) {
      console.error("[whatsapp-webhook] Error en handleIncomingMessage:", result.error);
    }
  } catch (e) {
    console.error("[whatsapp-webhook] Excepción procesando mensaje:", e);
  }
}

/**
 * Actualiza el estado de entrega de un mensaje saliente.
 */
async function processStatusUpdate(status: any): Promise<void> {
  try {
    const messageId = status.id;
    const statusStr = status.status; // sent, delivered, read, failed
    const errors = status.errors;

    // Actualizar en DB si existe
    // (no es crítico si falla — solo es tracking)
    const { db } = await import("@/lib/db");
    await db.whatsappMessage.updateMany({
      where: { waMessageId: messageId },
      data: { status: statusStr },
    });

    if (errors && errors.length > 0) {
      console.warn("[whatsapp-webhook] Error en mensaje saliente:", errors);
    }
  } catch (e) {
    // No romper el flujo por un error de tracking
    console.warn("[whatsapp-webhook] Error actualizando status:", e);
  }
}
