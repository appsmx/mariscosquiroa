# Guía de configuración: WhatsApp Business Cloud API + Bot IA

Este documento explica, **desde cero**, cómo llevar el número **+52 663 699 9689** a la **WhatsApp Business API oficial de Meta** de modo que las conversaciones entrantes las atienda el **bot de IA** de Mariscos Quiroa (mismo agente que ya vive en el sitio).

> **Estado real actual:** Meta Business Suite **NO** está creado ni verificado todavía. Esta guía arranca desde la cuenta Facebook del dueño y termina con el webhook en producción. Cualquier mención anterior a "ya verificado" era incorrecta y fue corregida.

Todo el flujo se hace bajo la **metodología LOGAN**: cada paso queda documentado y versionado para que sea repetible para futuros canales (Facebook Messenger, Instagram DM).

---

## ✅ Lo que ya está hecho (en el código)

La infraestructura técnica del lado de Mariscos Quiroa **ya está lista y commiteada**:

- **`src/lib/whatsapp.ts`** — Cliente de la Graph API: enviar mensajes de texto, plantillas, marcar como leído, validar firma del webhook.
- **`src/lib/whatsapp-bridge.ts`** — Puente entre mensaje entrante y el agente IA existente (`processCustomerMessage`). Persiste conversaciones en DB y mantiene contexto.
- **`src/app/api/whatsapp/webhook/route.ts`** — Webhook de Meta (GET verificación + POST recepción de mensajes).
- **`src/app/api/whatsapp/send-message/route.ts`** — Ruta admin para enviar mensajes manuales.
- **`src/app/api/whatsapp/test/route.ts`** — Diagnóstico de configuración.
- **Prisma schema** — Modelos `WhatsappConversation` + `WhatsappMessage` para historial completo.
- **`.env.example`** — Variables listas para llenar.

**Lo único que falta:** crear y verificar todo en Meta. Eso es lo que cubre esta guía.

---

## 🗺️ Mapa del proceso completo

```
[Cuenta Facebook del dueño]            ← ya tiene (login)
        ↓
[Meta Business Suite / Business Manager]   ← crear (Paso 1)
        ↓
[Verificar el negocio en Meta]            ← Paso 2 (lento, 1-7 días)
        ↓
[App en Meta for Developers]              ← Paso 3
        ↓
[Añadir producto WhatsApp]                ← Paso 4
        ↓
[Migrar/verificar número +52 663 699 9689]← Paso 5
        ↓
[Crear System User + token permanente]    ← Paso 6
        ↓
[Configurar webhook en Meta]              ← Paso 7
        ↓
[Suscribir campos del webhook]            ← Paso 8
        ↓
[Llenar variables en Vercel]              ← Paso 9
        ↓
[Migrar DB (Prisma)]                      ← Paso 10
        ↓
[Verificar end-to-end]                    ← Paso 11
```

Tiempo estimado realista: **2 a 10 días** (el cuello de botella es la verificación de negocio en Meta, que es revisión humana).

---

## 🔧 Setup en Meta — paso a paso desde cero

### Paso 1: Crear el Meta Business Suite / Business Manager

Hoy **no existe** todavía. Hay que crearlo.

1. Entrar con la cuenta Facebook personal del dueño a: https://business.facebook.com/
2. Click en **"Crear una cuenta comercial"** (Create a Business Account).
3. Llenar:
   - **Nombre del negocio:** `Mariscos Quiroa`
   - **Tu nombre y email laboral** (se puede usar el personal si no hay uno corporativo)
   - **País:** México
4. Click **"Enviar"**.
5. Una vez dentro, ir a **Business Settings → Business Info** y llenar:
   - **Legal business name:** Mariscos Quiroa (o el nombre fiscal real)
   - **Business address:** calle, número, colonia, CP de Rosarito, Baja California
   - **Phone:** +52 663 699 9689
   - **Website:** https://mariscosquiroa.com
   - **Industry:** Food & Beverage / Wholesale
6. Subir documentos de soporte (cuando Meta lo pida en la verificación): RFC o acta constitutiva, constancia de situación fiscal, o recibo de servicios a nombre del negocio.

> ⚠️ **Importante:** sin la verificación de negocio (siguiente paso), Meta **no permite** usar el número de teléfono en producción. Solo se podrá probar en modo sandbox con números de prueba.

### Paso 2: Verificar el negocio en Meta

Meta exige verificar que el negocio es real antes de dar acceso completo a la WhatsApp Business API.

1. En **Business Settings → Security → Business Verification**, click **"Start Verification"**.
2. Elegir verificación por:
   - **Documentos:** RFC + comprobante de domicilio + ID del representante legal.
   - **O teléfono comercial:** Meta llama al número del negocio y pide confirmar un código.
3. Subir los documentos en PDF o imagen nítida (≥ 200 KB).
4. Esperar revisión. Meta dice "hasta 14 días" pero normalmente resuelve en **1 a 7 días hábiles**. Te llegará correo a la dirección del Business Manager.
5. Cuando Meta marque el estatus como **"Verified"**, recién ahí se puede:
   - Migrar un número real a la WhatsApp Business API
   - Solicitar aumento de límites de mensajes
   - Crear plantillas de mensaje aprobadas

> Si Meta pide información adicional, responder dentro de las 48 h o cierran el trámite. Revisar el correo (incluyendo spam).

### Paso 3: Crear la App en Meta for Developers

1. Entrar a https://developers.facebook.com/apps/ con la misma cuenta Facebook del Paso 1.
2. Click **"Create App"**.
3. Tipo de app: **"Business"** (no "Consumer" ni "Other").
4. Llenar:
   - **App name:** `Mariscos Quiroa WhatsApp`
   - **App contact email:** email del dueño
   - **Business Manager:** seleccionar el `Mariscos Quiroa` creado en el Paso 1.
5. Aceptar términos → Create App.
6. En el panel de la app, verificar que el **App ID** y el **App Secret** quedan a la mano:
   - **App ID** → ya está visible en el dashboard.
   - **App Secret** → Settings → Basic → "Show" → copiar. **Es el valor que irá en `WHATSAPP_APP_SECRET`.**

### Paso 4: Añadir el producto WhatsApp

1. En el menú izquierdo de la app, click en **"Add Product"** (o "Products").
2. Buscar **WhatsApp** → click **"Set Up"**.
3. Seleccionar:
   - **Business Manager:** Mariscos Quiroa
   - **WhatsApp Business Account:** se crea uno nuevo automáticamente con el nombre del negocio
4. Confirmar.

Una vez añadido, dentro de **WhatsApp → API Setup** verás tres bloques:
- **Phone Number** → número de prueba que Meta te regala para hacer pruebas.
- **WhatsApp Business Account ID** → copiar (va en `WHATSAPP_BUSINESS_ACCOUNT_ID`).
- **Phone Number ID** → copiar (va en `WHATSAPP_PHONE_NUMBER_ID`, **pero ojo: este cambia cuando migres al número real**).

### Paso 5: Migrar / verificar el número real +52 663 699 9689

⚠️ **Pre-requisito:** el Paso 2 (verificación de negocio) debe estar **completo** antes de esto.

**Caso A: el número ya está en uso en la app WhatsApp Business del celular del dueño.**

1. Hacer **respaldo de chats importantes** del teléfono actual (exportar conversación → se manda por correo). Una vez migrado, **se pierde el historial local**.
2. En la app de WhatsApp Business del celular: **Settings → Account → Change number → Migrate to API**. Meta implementó un flujo guiado para esto.
3. Confirmar que aceptas perder el historial de chats locales.
4. Meta envía un código por SMS o llamada al número.
5. Entras al flujo en el dashboard de Meta y lo escribes.

**Caso B: el número está libre (no está en una app de WhatsApp).**

1. En **WhatsApp → API Setup → Phone Number**, click **"Add phone number"**.
2. Llenar:
   - **Display name:** `Mariscos Quiroa`
   - **Category:** Food & Beverage
   - **Description:** `Distribuidora de pescados y mariscos frescos en Baja California`
   - **Logo:** subir el logo cuadrado (mínimo 192x192 px, ideal 640x640)
3. Verificar el número por **SMS** o **llamada**.
4. Esperar la revisión del display name (Meta aprueba o lo rechaza en minutos a horas).

Una vez completado el Paso 5, vuelve a copiar el **Phone Number ID** actualizado desde el dashboard. Ese es el definitivo para producción.

### Paso 6: Generar el token de acceso permanente (System User)

Los tokens temporales caducan en 24 h. Para producción necesitamos un **System User** cuyo token **no caduca hasta que se revoque manualmente**.

1. Ir a **Business Settings → Users → System Users**.
2. Click **"Add"**:
   - **Name:** `Bot Mariscos Quiroa`
   - **Role:** `Admin` (o `Employee Access` con permisos explícitos si prefieres menor privilegio)
3. Una vez creado, click sobre el System User → **"Assign assets"**:
   - Apps → seleccionar `Mariscos Quiroa WhatsApp` → **"Manage app"** (full control)
   - WhatsApp Accounts → seleccionar la cuenta de WhatsApp Business → **"Manage phone number"** + **"Manage templates"**
4. Click **"Generate access token"**:
   - Validity: **No expiry** (no caduca)
   - Copiar el token (`EAAxxxxxxxxxxxxxxxxxxxxxxxxx...`) **de una vez** — Meta solo lo muestra una vez.
5. Guardar este token en un **gestor de contraseñas** (Bitwarden, 1Password, KeePass) bajo el nombre `WHATSAPP_ACCESS_TOKEN Mariscos Quiroa`. Es la pieza más sensible del setup.

> **Rotación de PAT de GitHub:** recordar que la PAT de GitHub que se compartió para este proyecto (`ghp_...`) **debe rotarse al terminar** todo el setup, por seguridad.

### Paso 7: Configurar el webhook en Meta

1. En la app de Meta Developers: **WhatsApp → Configuration → Webhook**.
2. Click **"Edit"**.
3. Llenar:
   - **Callback URL:** `https://mariscosquiroa.com/api/whatsapp/webhook`
   - **Verify token:** cualquier string único y difícil de adivinar. Ejemplo recomendado:
     ```
     mariscos_quiroa_logan_webhook_2026_<aleatorio>
     ```
     (Ese mismo valor va en `WHATSAPP_VERIFY_TOKEN` del `.env` de Vercel. **No subirlo al repo**.)
4. Click **"Verify and Save"**:
   - Meta hace un `GET` al callback URL con `hub.mode=subscribe`, `hub.verify_token=…` y `hub.challenge=…`.
   - El endpoint en `src/app/api/whatsapp/webhook/route.ts` ya valida el token y responde con el `hub.challenge`.
   - Si Meta dice "Verify successful" → ✅ el webhook queda registrado.

> ⚠️ Si el callback URL es rechazado (Meta dice "Cannot verify" o "URL not reachable"):
> - Confirmar que la URL en Vercel responde `200` a `GET /api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=X&hub.challenge=Y`.
> - Verificar que `WHATSAPP_VERIFY_TOKEN` en Vercel coincide exactamente con el valor puesto en Meta.
> - No usar localhost ni http. Tiene que ser HTTPS público.

### Paso 8: Suscribir el webhook a los campos correctos

1. En la misma sección **WhatsApp → Configuration → Webhook**, después de verificar, click **"Manage"**.
2. Marcar los campos:
   - ✅ `messages` ← **obligatorio**, mensajes entrantes del cliente
   - ✅ `message_template_status_update` ← recomendado, saber si plantillas fueron aprobadas/rechazadas
   - ✅ `phone_number_quality_update` ← recomendado, alertas de calidad del número
   - ⬜ `business_capability_update` ← opcional
3. Save.

### Paso 9: Llenar las variables de entorno en Vercel

Ir a **Vercel → Mariscos Quiroa → Settings → Environment Variables** y agregar **las 6 variables**:

| Variable | Valor | Entornos |
|---|---|---|
| `WHATSAPP_ACCESS_TOKEN` | El token del System User del Paso 6 (`EAA...`) | Production (y Preview si se quiere probar) |
| `WHATSAPP_PHONE_NUMBER_ID` | El Phone Number ID definitivo del Paso 5 | Production |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | El WhatsApp Business Account ID del Paso 4 | Production |
| `WHATSAPP_APP_SECRET` | El App Secret del Paso 3 | Production |
| `WHATSAPP_VERIFY_TOKEN` | El verify token del Paso 7 (el mismo que pusiste en Meta) | Production |
| `WHATSAPP_API_VERSION` | `v20.0` | Production |

> Marcar todas como **"Encrypted"** en Vercel para que no sean visibles en logs del dashboard.

Después de agregar las 6, hacer un **redeploy** del proyecto (push a main con un commit vacío, o "Redeploy" desde Vercel).

### Paso 10: Migrar la base de datos (Prisma)

El schema ya tiene los modelos `WhatsappConversation` y `WhatsappMessage`. En cada deploy Vercel corre `prisma migrate deploy` automáticamente, **pero** si nunca se había hecho para estos modelos, hay que verificarlo.

**En local (para probar antes de production):**
```bash
cd /home/z/my-project/mariscosquiroa
bun run db:push
```

**En Vercel:**
- Ir a la pestaña "Deployments" del último deploy.
- Revisar el log del paso de build. Debe decir algo como:
  ```
  Applied migration xxx_add_whatsapp_models
  ```
- Si no aparece, lanzar manualmente el comando de Prisma via **Vercel CLI** o forzar un redeploy con `bun run db:push` en el build.

### Paso 11: Verificar end-to-end

1. Visitar `https://mariscosquiroa.com/api/whatsapp/test` → debe responder:
   ```json
   {
     "integration": { "configured": true },
     "database": { "ok": true, "conversationsCount": 0 },
     "setupSteps": "✅ Listo..."
   }
   ```
2. Desde otro teléfono, escribir al **+52 663 699 9689** con cualquier mensaje (ej: `hola, ¿vendemos camarón hoy?`).
3. El bot de IA debe responder en menos de 5 segundos con la info del catálogo.
4. Visitar `https://mariscosquiroa.com/api/whatsapp/test` otra vez → `conversationsCount` debe ser `1`.
5. Para inspeccionar la conversación guardada:
   ```bash
   bunx prisma studio
   # Abrir tabla WhatsappConversation y WhatsappMessage
   ```

Si todo lo anterior pasa, **la integración está lista en producción**.

---

## 🤖 Cómo funciona el bot

### Flujo de un mensaje entrante

1. Cliente escribe al WhatsApp +52 663 699 9689.
2. Meta hace `POST` a `/api/whatsapp/webhook` con el mensaje.
3. Validamos firma `X-Hub-Signature-256` con HMAC-SHA256 usando `WHATSAPP_APP_SECRET`.
4. Marcar el mensaje como leído (reduce costo en Meta).
5. Buscar/crear conversación en DB (`WhatsappConversation`).
6. Persistir mensaje entrante en `WhatsappMessage` (`direction=INBOUND`).
7. Detectar idioma (es/en) por heurística simple → persistir en `customerLocale`.
8. Si la conversación está `ESCALATED_HUMAN`, el bot no responde automáticamente.
9. Cargar últimos 20 mensajes de la conversación como historial.
10. Invocar `processCustomerMessage` con el mismo contexto del negocio (catálogo, horarios, cobertura) que usa el ChatWidget del sitio.
11. Enviar la respuesta del bot vía Graph API.
12. Persistir respuesta en `WhatsappMessage` (`direction=OUTBOUND`, `source=AI`).
13. Si `needsHuman=true`, marcar conversación como `ESCALATED_HUMAN`.

### Modo híbrido (recomendado)

El bot responde automáticamente. Si el cliente pide "humano" o el bot no puede resolver, la conversación se marca como `ESCALATED_HUMAN` y el bot deja de responder automáticamente. El dueño puede responder manualmente desde su app normal de WhatsApp Business; esas respuestas **no** se guardan en el bot (es responsabilidad del dueño seguir la conversación).

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
- Audio: transcripción con Whisper → proceso IA.
- Imagen: VLM (vision-language model) → proceso IA.
- Ubicación: pasar al contexto del bot.

---

## 💰 Costos de WhatsApp Cloud API

Meta cobra por conversación (ventana de 24 h desde el primer mensaje del cliente):

- **Service conversations:** $0.00 MXN cuando el cliente inicia — **gratis para replies dentro de 24 h**.
- **Business-initiated conversations:** ~$0.025 USD (cuando tú mandas plantilla).
- **Marketing conversations:** ~$0.014 USD.

Para Mariscos Quiroa, el 99% de las conversaciones serán **service** (clientes escriben primero), así que el costo será ~$0 o muy bajo.

**Límites gratuitos:** 1000 conversaciones service gratis al mes (más que suficiente para empezar).

---

## 🔒 Seguridad

- **Webhook signature:** validamos `X-Hub-Signature-256` con HMAC-SHA256 usando `WHATSAPP_APP_SECRET`. Sin firma válida, el webhook responde `401`.
- **Idempotencia:** cada mensaje entrante se identifica por `waMessageId`. Si Meta reintenta, no duplicamos el procesamiento.
- **Rate limiting:** Meta manda hasta 100 webhook events por segundo (estándar). Nuestros handlers responden `200` inmediato y procesan en background.
- **Acceso admin para envío manual:** `/api/whatsapp/send-message` requiere sesión NextAuth de admin.
- **Logs:** todos los errores y eventos importantes se loguean con prefijo `[whatsapp-webhook]` o `[whatsapp-bridge]`.
- **Token del System User:** no commitearlo nunca al repo. Solo en Vercel Environment Variables (marcadas como Encrypted) y en gestor de contraseñas del dueño.
- **PAT de GitHub:** rotar al terminar todo el setup (la que se usó para este repo ya está comprometida al haberse compartido en texto plano).

---

## 🧪 Testing

### Sin Meta configurado (modo dev)

Visitar `http://localhost:3000/api/whatsapp/test` → debe responder con `integration.configured: false`.

### Con Meta configurado

1. **Verificación del webhook:** desde el dashboard de Meta, click en "Verify" → debe pasar.
2. **Mensaje real:** escribir al +52 663 699 9689 desde un teléfono → debe responder el bot automáticamente.
3. **Ver conversaciones en DB:**
   ```bash
   bunx prisma studio
   # Buscar tabla WhatsappConversation
   ```

---

## 🧯 Troubleshooting común

| Síntoma | Causa probable | Solución |
|---|---|---|
| Meta dice "Cannot verify Callback URL" | El endpoint no responde `hub.challenge` | Verificar que `WHATSAPP_VERIFY_TOKEN` en Vercel = el de Meta, y que el deploy esté en `main`. |
| Webhook recibe pero bot no responde | Token del System User sin permisos | Re-asignar assets en Business Settings (App + WhatsApp account). |
| `integration.configured: false` en `/test` | Falta una variable en Vercel | Revisar que las 6 estén presentes y el deploy sea posterior al cambio. |
| Bot responde "no puedo" a todo | `processCustomerMessage` falla | Revisar logs Vercel → buscar `[whatsapp-bridge]` y `processCustomerMessage`. |
| Token caducado (repentinamente deja de funcionar) | Usaste el token temporal de 24h en lugar del System User | Repetir el Paso 6 con el System User. |
| Meta marca el número como "low quality" | Plantillas inválidas o spam | Revisar `phone_number_quality_update` en logs, ajustar mensajes. |

---

## 📞 Soporte

- Webhook no responde `200` → Meta marcará el webhook como failing y reintentará. Revisar logs en Vercel.
- Bot no responde → revisar logs en Vercel → buscar `[whatsapp-webhook]` o `[whatsapp-bridge]`.
- Token caducado → el webhook responde `401` en lugar de `200`.
- Verificación de negocio en Meta estancada → escribir a soporte desde el Business Manager (chat de Meta Business Support, disponible 24/7 en español).

Para emergencias: el dueño puede desactivar el webhook desde Meta Business (Configuration → Webhook → unsubscribe). Los mensajes llegarán a la app de WhatsApp Business del celular normalmente mientras el webhook esté desactivado.

---

## 🪜 Próximos canales bajo metodología LOGAN

Una vez estabilizado WhatsApp en Mariscos Quiroa, la misma arquitectura se replicará para **Logan** (Facebook Messenger + Instagram DM + WhatsApp de Logan), usando el mismo patrón:

1. App única en Meta con tres productos: WhatsApp + Messenger + Instagram.
2. Mismo System User con permisos sobre los tres assets.
3. Un webhook por canal (o uno solo con routing por `entry[0].field`).
4. Mismo patrón `*-bridge.ts` que orquesta el mensaje entrante → agente IA → respuesta.

Esta guía es la base reproducible para esa siguiente fase.
