/**
 * Puente entre WhatsApp Business Cloud API y el agente IA existente (processCustomerMessage).
 *
 * Flujo:
 * 1. Webhook de Meta recibe mensaje entrante (POST /api/whatsapp/webhook).
 * 2. Aquí se normaliza el mensaje y se obtiene/crea la conversación en DB.
 * 3. Se invoca processCustomerMessage con el historial guardado.
 * 4. Se envía la respuesta de vuelta al cliente vía sendTextMessage.
 * 5. Se persisten ambos mensajes (inbound + outbound) en WhatsappMessage.
 *
 * El agente IA mantiene el mismo contexto dinámico (catálogo, horarios, etc.)
 * que usa el ChatWidget del sitio.
 */

import { db } from "@/lib/db";
import { sendTextMessage, markMessageAsRead } from "@/lib/whatsapp";
import { processCustomerMessage } from "@/lib/ai-agent";
import type { Locale } from "@/i18n/dictionaries";

interface IncomingMessage {
  from: string; // E.164 sin +, ej "526636999689"
  messageId: string; // wamid
  text: string;
  type: "text" | "image" | "audio" | "video" | "document" | "interactive" | "button" | "location" | "unknown";
  customerName?: string;
  buttonPayload?: string;
  // Para soporte futuro de audio: base64 + media id
  mediaId?: string;
}

interface HandleResult {
  ok: boolean;
  replySent: boolean;
  botResponse?: string;
  error?: string;
}

/**
 * Maneja un mensaje entrante de WhatsApp.
 * Esta función es idempotente: si se recibe el mismo wamid dos veces,
 * no se duplica el procesamiento.
 */
export async function handleIncomingMessage(
  incoming: IncomingMessage
): Promise<HandleResult> {
  try {
    // 1. Idempotencia: ¿ya procesamos este wamid?
    const existing = await db.whatsappMessage.findFirst({
      where: { waMessageId: incoming.messageId },
    });
    if (existing) {
      return { ok: true, replySent: false };
    }

    // 2. Marcar como leído en Meta (mejor UX, reduce costo)
    await markMessageAsRead(incoming.messageId);

    // 3. Buscar o crear conversación
    const conversation = await db.whatsappConversation.upsert({
      where: { customerPhone: incoming.from },
      create: {
        customerPhone: incoming.from,
        customerName: incoming.customerName,
        customerLocale: "es", // default; se ajusta abajo si detectamos idioma
        status: "ACTIVE",
        waId: incoming.from,
      },
      update: {
        customerName: incoming.customerName || undefined,
        lastMessageAt: new Date(),
        status: "ACTIVE",
      },
    });

    // 4. Persistir mensaje entrante
    const normalizedText = normalizeIncomingText(incoming);
    await db.whatsappMessage.create({
      data: {
        conversationId: conversation.id,
        direction: "INBOUND",
        type: incoming.type,
        content: normalizedText,
        waMessageId: incoming.messageId,
        status: "delivered",
        source: "HUMAN",
      },
    });

    // 5. Si es tipo no-texto, responder pidiendo texto (MVP)
    if (incoming.type !== "text" && incoming.type !== "button" && incoming.type !== "interactive") {
      const fallbackMsg =
        conversation.customerLocale === "en"
          ? "Thanks for your message. For now I can only process text. Could you type your question? 🙂"
          : "¡Gracias por tu mensaje! Por ahora solo puedo procesar texto. ¿Podrías escribirme tu pregunta? 🙂";
      await sendTextMessage({ to: incoming.from, text: fallbackMsg });
      await db.whatsappMessage.create({
        data: {
          conversationId: conversation.id,
          direction: "OUTBOUND",
          type: "text",
          content: fallbackMsg,
          source: "SYSTEM",
        },
      });
      return { ok: true, replySent: true, botResponse: fallbackMsg };
    }

    // 6. Detectar idioma del mensaje
    const detectedLocale = detectLocale(normalizedText);
    if (detectedLocale && detectedLocale !== conversation.customerLocale) {
      await db.whatsappConversation.update({
        where: { id: conversation.id },
        data: { customerLocale: detectedLocale },
      });
      conversation.customerLocale = detectedLocale;
    }

    // 7. Si la conversación está escalada a humano, no responder con IA
    if (conversation.status === "ESCALATED_HUMAN") {
      // Solo confirmar recepción, no responder con IA
      return { ok: true, replySent: false };
    }

    // 8. Cargar historial (últimos 20 mensajes) para el agente
    const historyRows = await db.whatsappMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const history = historyRows
      .filter((m) => m.type === "text" && m.content)
      .map((m) => ({
        role: m.direction === "INBOUND" ? "user" : "assistant",
        content: m.content,
      })) as Array<{ role: "user" | "assistant"; content: string }>;

    // 9. Invocar al agente IA (mismo que usa el ChatWidget del sitio),
    //    indicando que el canal es WhatsApp para que no derive "escríbenos por WhatsApp".
    const iaResponse = await processCustomerMessage(normalizedText, history, "whatsapp");

    // 10. Enviar respuesta de vuelta
    const sendResult = await sendTextMessage({
      to: incoming.from,
      text: iaResponse.content,
      replyToMessageId: incoming.messageId,
    });

    // 11. Persistir mensaje saliente
    await db.whatsappMessage.create({
      data: {
        conversationId: conversation.id,
        direction: "OUTBOUND",
        type: "text",
        content: iaResponse.content,
        waMessageId: sendResult?.messages?.[0]?.id,
        status: sendResult ? "sent" : "failed",
        source: "AI",
      },
    });

    // 12. Actualizar conversación
    await db.whatsappConversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        lastBotMessage: iaResponse.content,
        lastIntent: iaResponse.needsHuman ? "ESCALATED" : "AI_HANDLED",
        status: iaResponse.needsHuman ? "ESCALATED_HUMAN" : "ACTIVE",
      },
    });

    return {
      ok: true,
      replySent: !!sendResult,
      botResponse: iaResponse.content,
    };
  } catch (e: any) {
    console.error("[whatsapp-bridge] Error manejando mensaje:", e);
    return { ok: false, replySent: false, error: e?.message || "unknown" };
  }
}

/**
 * Normaliza el texto del mensaje entrante.
 * Para texto plano lo devuelve tal cual.
 * Para button/interactive usa el payload o título del botón.
 */
function normalizeIncomingText(incoming: IncomingMessage): string {
  if (incoming.text) return incoming.text;
  if (incoming.buttonPayload) return incoming.buttonPayload;
  if (incoming.type === "image") return "[imagen]";
  if (incoming.type === "audio") return "[audio]";
  if (incoming.type === "video") return "[video]";
  if (incoming.type === "document") return "[documento]";
  if (incoming.type === "location") return "[ubicación]";
  return "";
}

/**
 * Heurística simple para detectar si el mensaje está en inglés o español.
 * Si el mensaje contiene palabras comunes en inglés, marcamos el locale.
 * Si tiene acentos o palabras en español, lo dejamos/marcamos es.
 */
function detectLocale(text: string): Locale | null {
  if (!text || text.length < 5) return null;

  const lower = text.toLowerCase();

  // Palabras muy comunes en inglés
  const englishHits = [
    "hello", "hi ", "hey", "price", "cost", "how much", "do you",
    "have", "want", "buy", "fresh", "fish", "shrimp", "octopus",
    "delivery", "ship", "where", "when", "thanks", "thank you",
    "yes", "no ", "today", "tomorrow", "morning", "afternoon",
  ];
  const englishCount = englishHits.filter((w) => lower.includes(w)).length;

  // Palabras en español
  const spanishHits = [
    "hola", "precio", "cuanto", "cuánto", "quiero", "comprar",
    "camarón", "camaron", "pulpo", "atún", "atun", "ostiones",
    "entrega", "envío", "envio", "hoy", "mañana", "manana",
    "gracias", "sí", "no ", "buenos días", "buenas tardes",
  ];
  const spanishCount = spanishHits.filter((w) => lower.includes(w)).length;

  if (englishCount > spanishCount && englishCount >= 2) return "en";
  if (spanishCount > englishCount && spanishCount >= 2) return "es";
  return null;
}
