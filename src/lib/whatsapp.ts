/**
 * Cliente de WhatsApp Business Cloud API (Meta).
 *
 * Documentación: https://developers.facebook.com/docs/whatsapp/cloud-api
 *
 * Variables de entorno necesarias (ver .env.example):
 *  - WHATSAPP_ACCESS_TOKEN    Token permanente de la app de Meta
 *  - WHATSAPP_PHONE_NUMBER_ID  ID del número de teléfono verificado
 *  - WHATSAPP_BUSINESS_ACCOUNT_ID  ID de la WhatsApp Business Account
 *  - WHATSAPP_APP_SECRET       Secreto de la app (para validar X-Hub-Signature-256)
 *  - WHATSAPP_VERIFY_TOKEN    Token que configuraste en Meta para el webhook GET
 *  - WHATSAPP_API_VERSION      "v20.0" (default)
 */

const API_VERSION = process.env.WHATSAPP_API_VERSION || "v20.0";
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

interface SendTextParams {
  to: string; // E.164 sin +, ej "526636999689"
  text: string;
  previewUrl?: boolean;
  replyToMessageId?: string;
}

interface SendTextResponse {
  messaging_product: "whatsapp";
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string; message_status?: string }>;
}

/**
 * Envía un mensaje de texto a través de WhatsApp Cloud API.
 */
export async function sendTextMessage({
  to,
  text,
  previewUrl = false,
  replyToMessageId,
}: SendTextParams): Promise<SendTextResponse | null> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.error("[whatsapp] Falta WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID");
    return null;
  }

  const url = `${BASE_URL}/${phoneNumberId}/messages`;

  const body: any = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: {
      body: text,
      preview_url: previewUrl,
    },
  };

  if (replyToMessageId) {
    body.context = { message_id: replyToMessageId };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[whatsapp] Error ${res.status} enviando mensaje:`, errText);
      return null;
    }

    const data = (await res.json()) as SendTextResponse;
    return data;
  } catch (e) {
    console.error("[whatsapp] Excepción al enviar mensaje:", e);
    return null;
  }
}

/**
 * Marca un mensaje entrante como leído (reduce el costo y da mejor UX).
 */
export async function markMessageAsRead(messageId: string): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) return false;

  const url = `${BASE_URL}/${phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      }),
    });
    return res.ok;
  } catch (e) {
    console.error("[whatsapp] Error marcando como leído:", e);
    return false;
  }
}

/**
 * Valida la firma X-Hub-Signature-256 del webhook de Meta.
 * Usa HMAC-SHA256 con WHATSAPP_APP_SECRET.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string
): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    console.warn("[whatsapp] WHATSAPP_APP_SECRET no configurado, no se valida firma");
    return false;
  }

  if (!signatureHeader.startsWith("sha256=")) {
    return false;
  }

  const signature = signatureHeader.slice(7);
  const expected = require("crypto")
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");

  // Comparación en tiempo constante para evitar timing attacks
  if (expected.length !== signature.length) return false;
  return require("crypto").timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signature, "hex")
  );
}

/**
 * Envía una plantilla de mensaje (template) previamente aprobada por Meta.
 * Útil para iniciar conversaciones fuera de la ventana de 24h.
 */
interface SendTemplateParams {
  to: string;
  templateName: string;
  languageCode?: string; // "es_MX" o "en_US"
  components?: any[];
}

export async function sendTemplateMessage({
  to,
  templateName,
  languageCode = "es_MX",
  components,
}: SendTemplateParams): Promise<SendTextResponse | null> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.error("[whatsapp] Falta WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID");
    return null;
  }

  const url = `${BASE_URL}/${phoneNumberId}/messages`;

  const body: any = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
    },
  };

  if (components && components.length > 0) {
    body.template.components = components;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[whatsapp] Error ${res.status} enviando template:`, errText);
      return null;
    }

    return (await res.json()) as SendTextResponse;
  } catch (e) {
    console.error("[whatsapp] Excepción al enviar template:", e);
    return null;
  }
}

/**
 * ¿Está la integración configurada?
 */
export function isWhatsappConfigured(): boolean {
  return !!(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_VERIFY_TOKEN
  );
}
