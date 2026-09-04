/**
 * Puente entre la Messenger Platform (FB Messenger / Instagram Direct) y el
 * agente de IA existente (processCustomerMessage, el mismo del sitio y WhatsApp).
 *
 * Flujo:
 * 1. El webhook recibe un evento de mensaje (Messenger o Instagram).
 * 2. Se guarda/recupera la conversación (reutiliza las tablas WhatsappConversation
 *    / WhatsappMessage, distinguiendo el canal por un prefijo en el "phone").
 * 3. Se invoca processCustomerMessage con el canal correcto.
 * 4. Se envía la respuesta con la Send API.
 */

import { db } from "@/lib/db";
import { sendMessengerMessage, sendTypingOn, type MessengerChannel } from "@/lib/messenger";
import { processCustomerMessage } from "@/lib/ai-agent";

interface IncomingMessengerMessage {
  senderId: string; // PSID o IGSID
  text: string;
  channel: MessengerChannel;
}

/**
 * Procesa un mensaje entrante de Messenger o Instagram y responde con la IA.
 * Reutiliza las tablas de conversación de WhatsApp, usando un identificador
 * con prefijo de canal (ej. "msgr:123..." / "ig:456...") en customerPhone,
 * para no mezclar hilos entre canales.
 */
export async function handleIncomingMessengerMessage(
  incoming: IncomingMessengerMessage
): Promise<{ ok: boolean; replySent: boolean }> {
  const { senderId, text, channel } = incoming;

  if (!text?.trim()) {
    return { ok: true, replySent: false };
  }

  // Identificador único por canal (para no chocar con los teléfonos de WhatsApp)
  const convoKey = `${channel === "instagram" ? "ig" : "msgr"}:${senderId}`;

  try {
    // Indicador de "escribiendo..." mientras la IA responde
    await sendTypingOn(senderId);

    // 1. Recuperar / crear conversación
    const conversation = await db.whatsappConversation.upsert({
      where: { customerPhone: convoKey },
      create: {
        customerPhone: convoKey,
        customerLocale: "es",
        status: "ACTIVE",
        waId: senderId,
      },
      update: { lastMessageAt: new Date() },
    });

    // 2. Guardar mensaje entrante
    await db.whatsappMessage.create({
      data: {
        conversationId: conversation.id,
        direction: "INBOUND",
        type: "text",
        content: text,
        source: "HUMAN",
      },
    });

    // 3. Historial (últimos 10 mensajes de texto)
    const historyRows = await db.whatsappMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    const history = historyRows
      .reverse()
      .filter((m) => m.type === "text" && m.content)
      .map((m) => ({
        role: m.direction === "INBOUND" ? "user" : "assistant",
        content: m.content,
      })) as Array<{ role: "user" | "assistant"; content: string }>;

    // 4. Invocar al agente IA (mismo cerebro; canal específico)
    const iaResponse = await processCustomerMessage(text, history, channel);

    // 5. Enviar respuesta
    const sent = await sendMessengerMessage({ recipientId: senderId, text: iaResponse.content });

    // 6. Persistir mensaje saliente
    await db.whatsappMessage.create({
      data: {
        conversationId: conversation.id,
        direction: "OUTBOUND",
        type: "text",
        content: iaResponse.content,
        status: sent ? "sent" : "failed",
        source: "AI",
      },
    });

    // 7. Actualizar conversación
    await db.whatsappConversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        lastBotMessage: iaResponse.content,
        lastIntent: iaResponse.needsHuman ? "ESCALATED" : "AI_HANDLED",
        status: iaResponse.needsHuman ? "ESCALATED_HUMAN" : "ACTIVE",
      },
    });

    return { ok: true, replySent: sent };
  } catch (e) {
    console.error("[messenger-bridge] Error:", (e as Error).message);
    return { ok: false, replySent: false };
  }
}
