# Configuración de Messenger + Instagram (Meta)

El agente de IA de Mariscos Quiroa atiende Facebook Messenger e Instagram Direct
con el mismo cerebro que el sitio web y WhatsApp (vía LOGAN). Ambos canales usan
la **Página de Facebook** (Instagram debe estar vinculado a ella como cuenta profesional).

## Variables de entorno (Vercel)

| Variable | Valor |
|----------|-------|
| `MESSENGER_PAGE_ACCESS_TOKEN` | Token de la Página de Facebook |
| `MESSENGER_VERIFY_TOKEN` | Un token que inventas (debe coincidir con Meta) |
| `WHATSAPP_APP_SECRET` | Ya configurado — se reutiliza para validar la firma |

## Pasos en Meta (app en developers.facebook.com)

1. **Agregar productos a la app:** en la app de Meta, agrega **Messenger** y **Instagram**
   (además de WhatsApp que ya tienes).

2. **Vincular la Página:** en Messenger → Configuración de la API, conecta la
   **Página de Facebook** de Mariscos Quiroa y **genera el token de la página**
   → ponlo en Vercel como `MESSENGER_PAGE_ACCESS_TOKEN`.

3. **Configurar el webhook (Messenger):**
   - URL de callback: `https://www.mariscosquiroa.com/api/messenger/webhook`
   - Token de verificación: el mismo `MESSENGER_VERIFY_TOKEN` de Vercel
   - Suscribir campos: `messages`, `messaging_postbacks`

4. **Suscribir la Página al webhook:** en la sección de Messenger, suscribe la
   Página de Facebook a los eventos del webhook.

5. **Instagram:** en Instagram → Configuración de la API, vincula la cuenta
   profesional (ya vinculada a la Página) y suscribe el webhook al campo `messages`.
   El webhook es el MISMO endpoint (`/api/messenger/webhook`) — distingue el canal
   por el campo `object` ("page" vs "instagram").

## Prueba

- **Messenger:** manda un mensaje a la Página de Facebook desde otra cuenta.
- **Instagram:** manda un DM a `@mariscos.quiroa` desde otra cuenta.
- En ambos, el bot debe responder con la IA.

> Nota: mientras la app esté en modo desarrollo, solo responden cuentas con rol
> en la app (admin/tester). Para atender al público, publicar la app + verificación.
