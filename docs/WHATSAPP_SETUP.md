# Guía de configuración: WhatsApp Business Cloud API + Bot IA

Este documento explica cómo conectar el número **+52 663 699 9689** con la **WhatsApp Business API oficial de Meta**, de modo que las conversaciones entrantes las atienda nuestro **bot de IA** (mismo agente que ya está en el sitio).

---

## ✅ Lo que ya está hecho (en el código)

El proyecto ya tiene toda la infraestructura lista:

- **`src/lib/whatsapp.ts`** — Cliente de la Graph API: enviar mensajes de texto, plantillas, marcar como leído, validar firma del webhook.
- **`src/lib/whatsapp-bridge.ts`** — Puente entre mensaje entrante y el agente IA existente (`processCustomerMessage`). Persiste conversaciones en DB y mantiene contexto.
- **`src/app/api/whatsapp/webhook/route.ts`** — Webhook de Meta (GET verificación + POST recepción de mensajes).
- **`src/app/api/whatsapp/send-message/route.ts`** — Ruta admin para enviar mensajes manuales.
- **`src/app/api/whatsapp/test/route.ts`** — Diagnóstico de configuración.
- **Prisma schema** — Modelos `WhatsappConversation` + `WhatsappMessage` para historial completo.
- **`.env.example`** — Variables listas para llenar.

**Lo único que falta:** configurar la app en Meta Business y llenar las variables de entorno.

---

## 🔧 Setup en Meta (paso a paso)

### Paso 1: Crear la App de Meta

1. Ve a https://developers.facebook.com/apps/
2. Click en **"Create App"**
3. Tipo de app: **"Business"** (no "Consumer" ni "Other")
4. Nombre: `Mariscos Quiroa WhatsApp`
5. Email de contacto del dueño
6. **Business Manager**: si ya tienen uno creado (`Mariscos Quiroa`), seleccionarlo. Si no, crearlo en https://business.facebook.com/

### Paso 2: Añadir WhatsApp

1. En la app creada, en el menú izquierdo click en **"Add Product"**
2. Selecciona **WhatsApp** → Set Up
3. Selecciona el Business Manager y la cuenta publicitaria

### Paso 3: Verificar el número

En **WhatsApp → API Setup**:

1. En **"Phone Number"** verás:
   - Un número de prueba temporal
   - Un **Phone Number ID**
   - Un **WhatsApp Business Account ID**
   - Un **temporary access token** (sirve para pruebas 24h)

2. Para usar el número real **+52 663 699 9689**:
   - Click en **"Add phone number"**
   - Display name: `Mariscos Quiroa`
   - Category: `Food & Beverage`
   - Description: `Distribuidora de pescados y mariscos frescos en Baja California`
   - Logo: subir el logo cuadrado (mínimo 192x192, ideal 640x640)
   - Verificación por SMS/llamada al número

3. **Migración del número** (si ya tiene WhatsApp Business app instalada):
   - Hay que seguir el flujo de Meta para migrar el número (puede tardar hasta 24h)
   - El flujo te pide confirmar que aceptas perder el historial de chats de la app
   - Importante: respaldar chats importantes antes de migrar

### Paso 4: Generar token permanente

Los tokens temporales caducan en 24h. Para producción:

1. Ve a **Business Settings** → Users → People → selecciona tu usuario
2. Click en **"Add assets"**
3. Selecciona la app → "Manage app" (full control)
4. Click en **"Generate long-term access token"** (60 días, renovable)

Para un token realmente permanente hay que usar **System User**:
1. Business Settings → Users → System Users → Add
2. Name: `Bot Mariscos Quiroa`, Role: `Admin`
3. Add assets → App → "Manage app"
4. Generate token (no caduca hasta que se revoque)

### Paso 5: Configurar el webhook

1. En la app: **WhatsApp → Configuration → Webhook**
2. Click **"Edit"**
3. **Callback URL**: `https://mariscosquiroa.com/api/whatsapp/webhook`
4. **Verify token**: el valor que pongas en `WHATSAPP_VERIFY_TOKEN` del `.env`
   (recomendado: `mariscos_quiroa_webhook_verify_token_cambiar` o cualquier string único)
5. Click **"Verify and Save"** — Meta hace un GET al endpoint, debe devolver el challenge

### Paso 6: Suscribirse a los campos del webhook

En la misma sección, después de verificar:
1. Click en **"Manage"** junto al webhook
2. Suscribirse a los campos:
   - `messages` ← **obligatorio** (mensajes entrantes)
   - `message_template_status_update` ← recomendado
   - `phone_number_quality_update` ← recomendado
   - `business_capability_update` ← opcional

### Paso 7: Llenar el `.env`

```env
WHATSAPP_ACCESS_TOKEN="EAAxxxxxxxxxxxxxxxxxxx..."
WHATSAPP_PHONE_NUMBER_ID="123456789012345"
WHATSAPP_BUSINESS_ACCOUNT_ID="987654321098765"
WHATSAPP_APP_SECRET="abcd1234efgh5678..."
WHATSAPP_VERIFY_TOKEN="mariscos_quiroa_webhook_verify_token_cambiar"
WHATSAPP_API_VERSION="v20.0"
```

**En Vercel**: Settings → Environment Variables → añadir cada una.

### Paso 8: Migrar DB (Prisma)

```bash
# Local
bun run db:push

# En Vercel (auto-deploy lo hará solo en cada push a main)
```

### Paso 9: Verificar

Visitar `https://mariscosquiroa.com/api/whatsapp/test` — debe responder:
```json
{
  "integration": { "configured": true, ... },
  "database": { "ok": true, "conversationsCount": 0 },
  "setupSteps": "✅ Listo. ..."
}
```

---

## 🤖 Cómo funciona el bot

### Flujo de un mensaje entrante:

1. Cliente escribe al WhatsApp +52 663 699 9689
2. Meta hace POST a `/api/whatsapp/webhook` con el mensaje
3. Validamos firma X-Hub-Signature-256 con HMAC-SHA256 + APP_SECRET
4. Marcar el mensaje como leído (reduce costo en Meta)
5. Buscar/crear conversación en DB (`WhatsappConversation`)
6. Persistir mensaje entrante en `WhatsappMessage` (direction=INBOUND)
7. Detectar idioma (es/en) por heurística simple → persistir en `customerLocale`
8. Si conversación está `ESCALATED_HUMAN`, no responder con IA
9. Cargar últimos 20 mensajes de la conversación como historial
10. Invocar `processCustomerMessage` con el mismo contexto del negocio (catálogo, horarios, cobertura) que usa el ChatWidget del sitio
11. Enviar la respuesta del bot vía Graph API
12. Persistir respuesta en `WhatsappMessage` (direction=OUTBOUND, source=AI)
13. Si `needsHuman=true`, marcar conversación como `ESCALATED_HUMAN`

### Modo híbrido (recomendado)

El bot responde automáticamente. Si el cliente pide "humano" o el bot no puede resolver, la conversación se marca como `ESCALATED_HUMAN` y el bot deja de responder automáticamente. El dueño puede responder manualmente desde su app normal de WhatsApp Business, y esas respuestas NO se guardan en el bot (es responsabilidad del dueño seguir la conversación).

### Tipos de mensaje soportados

| Tipo | Comportamiento |
|---|---|
| `text` | ✅ Procesado por IA |
| `button` | ✅ Procesado por IA (usa el título del botón) |
| `interactive` | ✅ Procesado por IA (button_reply y list_reply) |
| `image` | ⚠️ Responde pidiendo texto (MVP) |
| `audio` | ⚠️ Responde pidiendo texto (MVP) |
| `video` | ⚠️ Responde pidiendo texto (MVP) |
| `document` | ⚠️ Responde pidiendo texto (MVP) |
| `location` | ⚠️ Responde pidiendo texto (MVP) |

**Roadmap (cuando se libere lo primero):**
- Audio: transcripción con Whisper → proceso IA
- Imagen: VLM (vision-language model) → proceso IA
- Ubicación: pasar al contexto del bot

---

## 💰 Costos de WhatsApp Cloud API

Meta cobra por conversación (24h window desde el primer mensaje del cliente):

- **Service conversations**: $0.00 MXN (cuando el cliente inicia) — **gratis para replies dentro de 24h**
- **Business-initiated conversations**: $0.025 USD aprox. (cuando tú mandas plantilla)
- **Marketing conversations**: $0.014 USD aprox.

Para Mariscos Quiroa, el 99% de las conversaciones serán **service** (clientes escriben primero), así que el costo será ~$0 o muy bajo.

**Límites gratuitos**: 1000 conversaciones service gratis al mes (más que suficiente para empezar).

---

## 🔒 Seguridad

- **Webhook signature**: validamos `X-Hub-Signature-256` con HMAC-SHA256 usando `WHATSAPP_APP_SECRET`. Sin firma válida, el webhook responde 401.
- **Idempotencia**: cada mensaje entrante se identifica por `waMessageId`. Si Meta reintenta, no duplicamos el procesamiento.
- **Rate limiting**: Meta manda un máximo de 100 webhook events por segundo (estándar). Nuestros handlers responden 200 inmediatamente y procesan en background.
- **Acceso admin para envío manual**: `/api/whatsapp/send-message` requiere sesión NextAuth de admin.
- **Logs**: todos los errores y eventos importantes se loguean con prefijo `[whatsapp-webhook]` o `[whatsapp-bridge]`.

---

## 🧪 Testing

### Sin Meta configurado (modo dev)

Visita `http://localhost:3000/api/whatsapp/test` → debe responder con `integration.configured: false`.

### Con Meta configurado

1. **Verificación del webhook**: desde el dashboard de Meta, click en "Verify" → debe pasar.
2. **Mensaje real**: escribir al +52 663 699 9689 desde un teléfono → debe responder el bot automáticamente.
3. **Ver conversaciones en DB**: desde el panel admin (pendiente de UI), o directamente:

```bash
# Con prisma studio
bunx prisma studio
# Buscar tabla WhatsappConversation
```

---

## 📞 Soporte

- Webhook no responde 200 → Meta marcará el webhook como failing y reintentará
- Bot no responde → revisa logs en Vercel → busca `[whatsapp-webhook]` o `[whatsapp-bridge]`
- Token caducado → el webhook responde 401 en lugar de 200

Para emergencias: el dueño puede desactivar el webhook desde Meta Business (Configuration → Webhook → unsubscribe).
