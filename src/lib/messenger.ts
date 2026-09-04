/**
 * Cliente de la Messenger Platform (Meta) — atiende Facebook Messenger e
 * Instagram Direct con el MISMO patrón (Send API de la Graph API).
 *
 * Documentación:
 *  - Messenger: https://developers.facebook.com/docs/messenger-platform
 *  - Instagram: https://developers.facebook.com/docs/messenger-platform/instagram
 *
 * Variables de entorno necesarias (ver .env.example):
 *  - MESSENGER_PAGE_ACCESS_TOKEN  Token de la Página de Facebook (sirve para FB e IG vinculado)
 *  - MESSENGER_VERIFY_TOKEN       Token para la verificación GET del webhook
 *  - WHATSAPP_APP_SECRET          Se reutiliza para validar X-Hub-Signature-256 (misma app)
 *  - WHATSAPP_API_VERSION         "v20.0" (default, compartido)
 */

const API_VERSION = process.env.WHATSAPP_API_VERSION || "v20.0";
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

export type MessengerChannel = "messenger" | "instagram";

interface SendMessageParams {
  recipientId: string; // PSID (Messenger) o IGSID (Instagram)
  text: string;
}

/**
 * Envía un mensaje de texto por Messenger o Instagram Direct usando la Send API.
 * Ambos canales usan el mismo endpoint (/me/messages) con el Page Access Token.
 */
export async function sendMessengerMessage({
  recipientId,
  text,
}: SendMessageParams): Promise<boolean> {
  const token = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
  if (!token) {
    console.error("[messenger] Falta MESSENGER_PAGE_ACCESS_TOKEN");
    return false;
  }

  const url = `${BASE_URL}/me/messages?access_token=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        messaging_type: "RESPONSE",
        message: { text },
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error(`[messenger] Error ${res.status} enviando mensaje:`, err.slice(0, 300));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[messenger] Excepción al enviar:", (e as Error).message);
    return false;
  }
}

/**
 * Marca el indicador de "escribiendo..." (typing) — opcional, mejora la UX.
 */
export async function sendTypingOn(recipientId: string): Promise<void> {
  const token = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
  if (!token) return;
  const url = `${BASE_URL}/me/messages?access_token=${encodeURIComponent(token)}`;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient: { id: recipientId }, sender_action: "typing_on" }),
    });
  } catch {
    // no crítico
  }
}

export function isMessengerConfigured(): boolean {
  return !!process.env.MESSENGER_PAGE_ACCESS_TOKEN;
}
