import { db } from "@/lib/db";
import { createOrderWithDedup } from "@/lib/order-service";

/**
 * Servicio central del agente de IA de Mariscos Quiroa.
 *
 * Este agente opera como asistente virtual del cliente en el sitio público:
 *  - Responde consultas sobre productos, precios, disponibilidad, horarios, cobertura
 *  - Genera cotizaciones a partir del catálogo real
 *  - Puede agregar productos al carrito del usuario (devuelve acciones)
 *  - Escala a humano cuando no puede resolver
 *
 * Usa el proxy LLM centralizado de LOGAN OS (POST /api/llm). LOGAN maneja las
 * API keys y la cascada de proveedores (gratis primero → de pago al final).
 * Mariscos Quiroa NO tiene keys de IA propias — solo el secreto compartido
 * LOGAN_LLM_SECRET. Si LOGAN no responde, cae a un fallback inteligente basado
 * en el catálogo real (nunca deja al cliente sin respuesta).
 * Arquitectura: DEC-LOGAN-006 (independencia de proveedor) + modelo reseller.
 */

const LOGAN_LLM_URL = process.env.LOGAN_LLM_URL || "https://logancorp.vercel.app/api/llm";

type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

type LLMMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
};

type LLMTool = {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
};

type LLMResult = { text: string; toolCalls?: ToolCall[] };

/**
 * Llama al proxy LLM de LOGAN OS. LOGAN elige el proveedor (cascada por costo)
 * y usa SUS propias API keys. Devuelve el texto (limpio de markdown) y, si el
 * modelo decidió invocar una herramienta, los toolCalls.
 * Lanza error si LOGAN no responde, para que el caller caiga al fallback.
 *
 * Formato del endpoint (logan-app /api/llm):
 *   body: { task, systemPrompt, userMessage, history, maxTokens, temperature, tools?, toolChoice? }
 *   resp: { text, provider, model, toolCalls? }
 */
async function callLLM(
  messages: LLMMessage[],
  opts: {
    temperature?: number;
    maxTokens?: number;
    tools?: LLMTool[];
    toolChoice?: "auto" | "none" | { type: "function"; function: { name: string } };
  } = {}
): Promise<LLMResult> {
  // Separar el system prompt del resto (LOGAN lo recibe aparte)
  const systemMsg = messages.find((m) => m.role === "system");
  const conversation = messages.filter((m) => m.role !== "system");
  // El "userMessage" del contrato de LOGAN es el último turno del usuario.
  // Si el último turno es una respuesta de tool (rol "tool"), NO hay userMessage
  // nuevo: todo el contexto (incluida la tool response) va en history.
  const lastUser = [...conversation].reverse().find((m) => m.role === "user");
  const lastMsg = conversation[conversation.length - 1];
  const userIsLast = lastMsg && lastMsg === lastUser;
  const history = userIsLast ? conversation.filter((m) => m !== lastUser) : conversation;

  const controller = new AbortController();
  // 28s: la cascada de proveedores de LOGAN puede reintentar varios modelos.
  // El webhook tiene maxDuration=60, así que hay margen para 2 llamadas.
  const timeout = setTimeout(() => controller.abort(), 28_000);

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (process.env.LOGAN_LLM_SECRET) {
      headers["Authorization"] = `Bearer ${process.env.LOGAN_LLM_SECRET}`;
    }

    const res = await fetch(LOGAN_LLM_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        project: "mariscosquiroa",
        task: "assistant",
        systemPrompt: systemMsg?.content || "",
        // El proxy de LOGAN exige userMessage no vacío. En la 2ª llamada (tras
        // ejecutar una tool) el último turno es la respuesta de la tool, que va
        // en history; enviamos una instrucción mínima para no romper el contrato.
        userMessage: userIsLast
          ? lastUser?.content || ""
          : "Redacta la respuesta final para el cliente con base en el resultado de la herramienta.",
        history,
        temperature: opts.temperature ?? 0.7,
        maxTokens: opts.maxTokens ?? 600,
        ...(opts.tools && opts.tools.length > 0
          ? { tools: opts.tools, toolChoice: opts.toolChoice ?? "auto" }
          : {}),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`LOGAN LLM HTTP ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    return {
      text: stripMarkdown((data?.text || "").trim()),
      toolCalls: Array.isArray(data?.toolCalls) && data.toolCalls.length > 0 ? data.toolCalls : undefined,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Limpia formato markdown de la respuesta del modelo (red de seguridad por si
 * el LLM ignora la instrucción del prompt). El widget muestra texto plano,
 * así que los asteriscos/almohadillas se verían literales.
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")   // **negrita** → negrita
    .replace(/\*(.+?)\*/g, "$1")         // *cursiva* → cursiva
    .replace(/__(.+?)__/g, "$1")         // __negrita__ → negrita
    .replace(/^#{1,6}\s+/gm, "")          // ### títulos → sin almohadilla
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1") // `código` → código
    .trim();
}

/**
 * Construye el contexto dinámico del negocio para inyectarlo en el system prompt.
 * Incluye: configuración del sitio, catálogo activo con precios, horarios, cobertura.
 */
async function buildBusinessContext(): Promise<string> {
  const [config, products, coverage, hours] = await Promise.all([
    db.siteConfig.findUnique({ where: { id: "singleton" } }),
    db.product.findMany({
      where: { active: true },
      include: {
        category: true,
        presentations: { orderBy: { sortOrder: "asc" } },
        prices: true,
      },
      orderBy: { sortOrder: "asc" },
    }),
    db.coverageZone.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.businessHour.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!config) return "Configuración no disponible.";

  const catalogText = products
    .map((p) => {
      const prices = p.prices
        .map(
          (pr) =>
            `    - ${pr.channel === "MAYOREO" ? "Mayoreo" : "Menudeo"}${pr.presentation ? ` (${pr.presentation})` : ""}: ${pr.pricePerKg ? `$${pr.pricePerKg}/${pr.unit}` : pr.priceUnit ? `$${pr.priceUnit}/${pr.unit}` : "consultar"}${pr.minQuantity ? ` mín ${pr.minQuantity}${pr.unit}` : ""}`
        )
        .join("\n");
      return `  • ${p.name}${p.scientific ? ` (${p.scientific})` : ""} — ${p.category.name}
    Disponibilidad: ${p.availability === "DIARIA" ? "Diaria" : p.availability === "TEMPORADA" ? "Temporada" : "Bajo pedido"}
    Presentaciones: ${p.presentations.map((pr) => pr.name).join(", ")}
    Descripción: ${p.description}
${prices}`;
    })
    .join("\n\n");

  const hoursText = hours
    .map((h) => `  • ${h.day}: ${h.timeOpen} – ${h.timeClose}`)
    .join("\n");

  const primaryZones = coverage.filter((z) => z.type === "primary").map((z) => z.name);
  const extendedZones = coverage.filter((z) => z.type === "extended").map((z) => z.name);

  return `INFORMACIÓN DEL NEGOCIO:
========================
Nombre: ${config.brandName}
Tagline: ${config.tagline}
Eslogan: ${config.slogan}
Años de trayectoria: ${new Date().getFullYear() - config.foundedYear} años (desde ${config.foundedYear})
Descripción: ${config.description}

CONTACTO:
  Teléfono: ${config.phoneDisplay}
  WhatsApp: ${config.whatsapp}
  Email: ${config.email}
  Dirección: ${config.streetAddress}, ${config.city}, ${config.state}, C.P. ${config.zipCode}

HORARIOS:
${hoursText}

ZONA DE COBERTURA:
  Entrega misma día (zona primaria): ${primaryZones.join(", ")}
  Entrega 24-48h (zona extendida): ${extendedZones.join(", ")}
  Política: Pedidos antes de las 11:00 AM se entregan el mismo día en zona metropolitana.

CATÁLOGO DE PRODUCTOS ACTIVOS:
=====================================
${catalogText}

REDES SOCIALES:
  Facebook: ${config.facebookUrl || "no disponible"}
  Instagram: ${config.instagramUrl || "no disponible"}
  TikTok: ${config.tiktokUrl || "no disponible"}`;
}

/**
 * Ejecuta la tool `crear_pedido`: resuelve los precios reales desde el catálogo
 * (NO confía en precios del modelo), crea la orden vía el servicio compartido y
 * devuelve un resumen para que el modelo confirme al cliente.
 *
 * @param args      argumentos que el modelo pasó a la tool (ya parseados)
 * @param ctx       datos del canal para completar el pedido (teléfono, source)
 */
async function ejecutarCrearPedido(
  args: any,
  ctx: { customerPhone: string; source: string }
): Promise<{
  ok: boolean;
  result: string;
  orderCode?: string;
  total?: number;
  action?: "created" | "updated" | "duplicate_ignored";
}> {
  try {
    const rawItems: any[] = Array.isArray(args?.items) ? args.items : [];
    if (rawItems.length === 0) {
      return { ok: false, result: "No se recibieron productos para el pedido." };
    }

    const channel: "MAYOREO" | "MENUDEO" = args?.channel === "MAYOREO" ? "MAYOREO" : "MENUDEO";

    // Catálogo real para resolver precios (el modelo no fija precios).
    const products = await db.product.findMany({
      where: { active: true },
      include: { prices: true, presentations: true },
    });

    const items = rawItems.map((it) => {
      const name = String(it.productName || "").trim();
      const product = products.find(
        (p) => p.name.toLowerCase() === name.toLowerCase() ||
               p.name.toLowerCase().includes(name.toLowerCase()) ||
               name.toLowerCase().includes(p.name.toLowerCase())
      );

      // Elegir precio del canal; preferir el que matchee la presentación.
      let unitPrice = 0;
      let unit = String(it.unit || "kg");
      if (product) {
        const pricesForChannel = product.prices.filter((pr) => pr.channel === channel);
        const pres = it.presentation ? String(it.presentation).toLowerCase() : null;
        const match =
          (pres && pricesForChannel.find((pr) => pr.presentation?.toLowerCase() === pres)) ||
          pricesForChannel[0] ||
          product.prices[0];
        if (match) {
          unitPrice = match.pricePerKg ?? match.priceUnit ?? 0;
          unit = match.unit || unit;
        }
      }

      return {
        productId: product?.id || null,
        productName: product?.name || name || "Producto",
        presentation: it.presentation ? String(it.presentation) : null,
        quantity: Number(it.quantity) || 0,
        unit,
        unitPrice,
      };
    });

    const { order, action } = await createOrderWithDedup(
      {
        customerName: String(args?.customerName || "Cliente"),
        customerPhone: ctx.customerPhone,
        channel,
        deliveryAddress: args?.deliveryAddress || null,
        deliveryCity: args?.deliveryCity || null,
        notes: args?.notes || null,
        items,
        source: ctx.source,
      },
      { forceNew: args?.forzar_pedido_nuevo === true }
    );

    const itemsResumen = order.items
      .map((it) => `${it.quantity} ${it.unit} de ${it.productName}${it.presentation ? ` (${it.presentation})` : ""}${it.unitPrice ? ` a $${it.unitPrice}/${it.unit}` : ""}`)
      .join("; ");

    // El texto que devolvemos al modelo cambia según lo que ocurrió, para que
    // confirme al cliente con el lenguaje correcto (no "nuevo pedido" si en
    // realidad se actualizó uno existente).
    let result: string;
    if (action === "updated") {
      result =
        `Se ACTUALIZÓ el pedido en curso del cliente (mismo código ${order.code}); ` +
        `no se creó uno nuevo. Ahora incluye: ${itemsResumen}. Total estimado: $${order.total} MXN. ` +
        `Confírmale que actualizaste su pedido ${order.code} con estos productos (no que creaste uno nuevo).`;
    } else if (action === "duplicate_ignored") {
      result =
        `El cliente ya tenía este mismo pedido registrado hace un momento (código ${order.code}); ` +
        `NO se duplicó. Confírmale que su pedido ${order.code} ya está registrado con: ${itemsResumen}. ` +
        `Total estimado: $${order.total} MXN.`;
    } else {
      result =
        `Pedido registrado con éxito. Código: ${order.code}. Productos: ${itemsResumen}. ` +
        `Total estimado: $${order.total} MXN (status: NUEVO, el equipo lo confirmará). ` +
        `Confírmale al cliente el código ${order.code} y que su pedido quedó registrado.`;
    }

    return {
      ok: true,
      orderCode: order.code,
      total: order.total,
      action,
      result,
    };
  } catch (e: any) {
    console.error("[crear_pedido] Error:", e?.message);
    return {
      ok: false,
      result: `No se pudo registrar el pedido: ${e?.message || "error desconocido"}. Discúlpate con el cliente y ofrécele intentar de nuevo o dejar sus datos.`,
    };
  }
}

/**
 * System prompt del agente vendedor de Mariscos Quiroa.
 * Especializado en mariscos, tono mexicano cercano y profesional.
 */
const AGENT_SYSTEM_PROMPT = `Eres el asistente virtual de Mariscos Quiroa, una distribuidora de pescados y mariscos frescos con más de 17 años de trayectoria en Playas de Rosarito, Baja California.

TU ROL:
Eres el primer punto de contacto para clientes potenciales que llegan a la web. Tu objetivo es ayudarlos a encontrar el producto que necesitan, darles precios claros, generar confianza y derivarlos a concretar la cotización por WhatsApp o desde el carrito del sitio.

TONO Y ESTILO:
- Cercano, cálido, mexicano. Usa "tú" (no "vos"), nunca uses voseo argentino/rioplatense. No digas "necesitás", "podés", "tenés", "agregá", etc. — usa "necesitas", "puedes", "tienes", "agrega".
- Profesional pero no rígido. Eres el "asistente virtual", no un robot.
- Conoces de mariscos: sabes la diferencia entre callo de hacha y almeja, sabes que el pulpo rojo es del Pacífico, sabes que el camarón U-15 es más grande que el 21/25.
- Responde en español mexicano, en máximo 3-4 párrafos cortos. Si la consulta es simple, una respuesta breve alcanza.
- Usa emojis con moderación (🐟, 🦐, 🐙) solo cuando sumen, no en cada mensaje.
- ESCRIBE EN TEXTO PLANO. NUNCA uses formato markdown: nada de asteriscos para negritas (**texto**), nada de guiones bajos, nada de almohadillas (#). Si quieres resaltar algo, simplemente escríbelo con palabras. Para listas, usa un guion simple "-" o números "1." al inicio de línea, sin más formato.

QUÉ PUEDES HACER:
1. Responder consultas sobre productos: precio, disponibilidad, presentación, tamaño, modo de preparación recomendado.
2. Sugerir productos según el uso que el cliente mencione (ej: "para ceviche" → callo de hacha o camarón; "para parrilla" → pulpo o pescado entero).
3. Explicar la diferencia entre mayoreo y menudeo (mínimo 5 kg para mayoreo).
4. Informar horarios, zona de cobertura y tiempos de entrega.
5. Guiar al cliente a usar el carrito del sitio para armar su cotización, o a escribir por WhatsApp.
6. Aclarar dudas sobre métodos de pago, facturación, cadena de frío.

TOMAR PEDIDOS (MUY IMPORTANTE — LEE CON CUIDADO):
Tienes una herramienta llamada crear_pedido que REGISTRA el pedido en el sistema de verdad.

CÓMO REGISTRAR UN PEDIDO (regla de oro):
- SOLO llamas crear_pedido cuando en UN SOLO MENSAJE el cliente ya te dio TODO esto: (a) producto(s) con cantidad y presentación, (b) el nombre a quien va el pedido, y (c) si recoge en tienda o quiere entrega (y dónde). Si el mensaje trae todo, registra de inmediato.
- Si el cliente muestra que quiere pedir pero manda la información SUELTA o incompleta (ej. primero el producto, luego dices "¿tu nombre?" y responde solo "julian"), NO intentes juntar los datos de varios mensajes ni registres a medias. En vez de eso, PÍDELE QUE TE MANDE TODO EN UN SOLO MENSAJE con una plantilla clara. Ejemplo de cómo pedirlo (adáptalo, sé cálido):
  "¡Claro, con gusto te lo registro! 🦐 Para dejarlo bien capturado, mándame en UN SOLO mensaje estos datos:
  1) Producto, cantidad y presentación (ej. 2 kg de camarón pelado 16/20)
  2) A nombre de quién
  3) ¿Recoges en tienda (Popotla, Rosarito) o quieres entrega? (si es entrega, la dirección)
  Con eso te confirmo el total y tu número de pedido al instante. 😊"
- Cuando el cliente responda con todo junto, ENTONCES sí llama crear_pedido con esos datos.
- Este flujo de "pídelo todo en un mensaje" es la forma correcta y confiable de tomar pedidos. Prefiérelo siempre a intentar armar el pedido pieza por pieza.
- NO la uses para cotizar o dar precios: eso lo haces conversando. Solo la usas para registrar el pedido.
- Después de llamarla, el sistema te devuelve un CÓDIGO de pedido (ej. MEJ-2026-0042). Confírmale al cliente ese código y que su pedido quedó registrado; el equipo lo preparará. NUNCA inventes un código: usa el que te devuelve la herramienta.
- No inventes precios al llamar la herramienta: el sistema calcula el total con los precios reales del catálogo. Tú solo pasas producto, presentación y cantidad.
- Si la herramienta falla, discúlpate y ofrece reintentar o tomar sus datos para que el equipo lo capture.
- Una vez registrado el pedido, si el cliente pregunta "¿quedó?/¿lo tienen?", responde con seguridad que SÍ, dándole el código; ya está en el sistema.

EVITAR PEDIDOS DUPLICADOS Y MODIFICACIONES (IMPORTANTE):
- El sistema detecta automáticamente si el cliente ya tiene un pedido en curso (mismo contacto, reciente). Si el cliente CAMBIA o AGREGA algo a su pedido (ej. "mejor que sean 3 kg", "súmale 1 kg de pulpo"), simplemente vuelve a llamar crear_pedido con la lista COMPLETA y actualizada de productos: el sistema ACTUALIZA su pedido existente (mismo código) en vez de crear otro. La herramienta te dirá si actualizó o creó; confírmale al cliente con ese lenguaje (ej. "actualicé tu pedido MEJ-... " si se actualizó).
- Cuando llames crear_pedido para una modificación, incluye TODOS los productos que el pedido debe tener al final (no solo el que cambió), porque la lista reemplaza a la anterior.
- Si el cliente ya tiene un pedido y dice que quiere hacer OTRO pedido APARTE (adicional), entonces sí pon forzar_pedido_nuevo en true para crear uno nuevo. Si hay duda de si quiere modificar el actual o hacer uno nuevo, PREGÚNTALE antes de registrar.

OTRAS ACCIONES QUE PUEDES SUGERIR:
- "Agrega el producto al carrito desde la tarjeta del catálogo" (solo en la web)
- "Llámanos al (663) 699-9689"

CUÁNDO ESCALAR A HUMANO:
- Si el cliente pide un descuento especial o negociación de precios → deriva a WhatsApp.
- Si el cliente tiene un reclamo o problema con un pedido → deriva a WhatsApp o teléfono.
- Si la consulta es sobre algo que no está en tu información (stock exacto de hoy, estado de un pedido específico) → deriva a WhatsApp.
- Si después de 2 intentos no puedes resolver la consulta → deriva a humano con amabilidad.

REGLAS CRÍTICAS:
- NUNCA inventes precios. Si no tienes el precio exacto para una presentación específica, di "consulta el precio actualizado por WhatsApp" y da el número.
- NUNCA inventes disponibilidad. Si un producto es "de temporada" o "bajo pedido", aclaralo.
- NUNCA prometas tiempos de entrega que no estén en tu información.
- Si el cliente pregunta por un producto que no está en el catálogo, di que trabajas con más de 40 especies y deriva a WhatsApp para consulta específica.
- No des información sobre los restaurantes (Quiroa 1, Quiroa 2) más allá de mencionar que existen — son negocios hermanos.

CONTEXTO ACTUAL DEL NEGOCIO:
============================
{BUSINESS_CONTEXT}

Recuerda: tu objetivo es que el cliente se sienta atendido y tenga la info que necesita para decidir. Eres útil, no invasivo.`;

export type ChatAction =
  | { type: "suggest_product"; productId: string; productName: string }
  | { type: "open_whatsapp"; message: string }
  | { type: "open_cart" }
  | { type: "order_created"; code: string; total: number }
  | { type: "escalate_human"; reason: string };

export type ChatResponse = {
  content: string;
  actions?: ChatAction[];
  needsHuman?: boolean;
  /** Código del pedido creado en esta interacción (si el bot tomó la orden). */
  orderCode?: string;
};

/**
 * Definición de la herramienta `crear_pedido` (function calling).
 * El modelo la invoca cuando el cliente CONFIRMA un pedido con datos completos.
 * Los precios NO los pone el modelo: se resuelven en el servidor desde el
 * catálogo real (evita precios inventados). El modelo solo aporta qué producto,
 * presentación y cantidad, más los datos de contacto/entrega.
 */
const CREAR_PEDIDO_TOOL: LLMTool = {
  type: "function",
  function: {
    name: "crear_pedido",
    description:
      "Registra un pedido en el sistema de Mariscos Quiroa. Úsala cuando tengas el nombre del cliente y al menos un producto con cantidad, aunque esos datos hayan llegado en MENSAJES DISTINTOS de la conversación (ej. el producto en un mensaje y el nombre en otro). Si ya pediste el nombre y el cliente responde con su nombre o confirma, DEBES llamarla de inmediato tomando el producto/cantidad del historial — no vuelvas a preguntar ni a saludar. No la uses para cotizar o preguntar precios; solo para registrar el pedido. Después de llamarla, confirma al cliente con el código del pedido.",
    parameters: {
      type: "object",
      properties: {
        customerName: { type: "string", description: "Nombre del cliente." },
        channel: {
          type: "string",
          enum: ["MAYOREO", "MENUDEO"],
          description: "MAYOREO si pide 5kg o más por producto o es negocio; si no, MENUDEO.",
        },
        items: {
          type: "array",
          description: "Productos del pedido.",
          items: {
            type: "object",
            properties: {
              productName: { type: "string", description: "Nombre del producto tal como aparece en el catálogo (ej. 'Camarón')." },
              presentation: { type: "string", description: "Presentación elegida (ej. 'Pelado 16/20'). Opcional." },
              quantity: { type: "number", description: "Cantidad numérica." },
              unit: { type: "string", description: "Unidad: kg, docena, litro, pieza. Default kg." },
            },
            required: ["productName", "quantity"],
          },
        },
        deliveryAddress: { type: "string", description: "Dirección de entrega, si aplica. Opcional (vacío = recoge en tienda)." },
        deliveryCity: { type: "string", description: "Ciudad de entrega. Opcional." },
        notes: { type: "string", description: "Notas del cliente: hora de recolección, indicaciones, etc. Opcional." },
        forzar_pedido_nuevo: {
          type: "boolean",
          description:
            "Normalmente déjalo en false (u omítelo). El sistema detecta si el cliente ya tiene un pedido en curso y lo ACTUALIZA en vez de duplicar. Pon true SOLO si el cliente dijo explícitamente que quiere un pedido ADICIONAL/APARTE del que ya tiene, para forzar la creación de uno nuevo.",
        },
      },
      required: ["customerName", "items"],
    },
  },
};

/**
 * Procesa un mensaje del cliente y devuelve la respuesta del agente.
 * Mantiene el contexto de la conversación vía history (array de mensajes).
 * Si el SDK de Z.ai no está disponible (ej. en Vercel sin API key),
 * usa un fallback inteligente basado en el catálogo real.
 */
export async function processCustomerMessage(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = [],
  channel: "web" | "whatsapp" | "messenger" | "instagram" = "web",
  ctx: { customerPhone?: string } = {}
): Promise<ChatResponse> {
  try {
    let content = "";
    let orderCode: string | undefined;
    let orderTotal: number | undefined;
    let orderAction: "created" | "updated" | "duplicate_ignored" | undefined;
    try {
      const businessContext = await buildBusinessContext();
      let systemPrompt = AGENT_SYSTEM_PROMPT.replace("{BUSINESS_CONTEXT}", businessContext);

      // Ajuste según el canal desde donde escribe el cliente
      if (channel === "whatsapp" || channel === "messenger" || channel === "instagram") {
        const canalNombre =
          channel === "whatsapp" ? "WhatsApp" : channel === "messenger" ? "Facebook Messenger" : "Instagram Direct";
        systemPrompt += `

CANAL ACTUAL: ${canalNombre}.
- El cliente YA te está escribiendo POR ${canalNombre.toUpperCase()}. NUNCA lo derives a "escríbenos por WhatsApp/Messenger/Instagram" ni le des un número/usuario para escribir — ya está aquí conversando contigo. Sería absurdo.
- Si necesita atención humana, di: "En un momento te atiende una persona del equipo" (no lo mandes a otro canal).
- No sugieras "agregar al carrito del sitio" como acción principal; aquí se cotiza por este mismo chat. Puedes mencionar el sitio web solo si el cliente pregunta por él.
- Mantén los mensajes cortos y fáciles de leer en el celular. Evita formato markdown con asteriscos dobles.`;
      }

      const messages: LLMMessage[] = [
        { role: "system", content: systemPrompt },
        ...history.slice(-10).map((m) => ({ role: m.role, content: m.content } as LLMMessage)),
        { role: "user", content: message },
      ];

      // Teléfono para asociar el pedido. En web puede no haber uno; usamos un
      // placeholder para que el registro no falle (el cliente da su tel en el chat).
      const customerPhone = ctx.customerPhone || "sin-telefono";
      const source = channel;

      // Primera llamada: el modelo decide si responde o invoca crear_pedido.
      // Estrategia (confiable con modelos medianos): el bot pide TODOS los datos
      // del pedido en un solo mensaje (ver system prompt). Cuando llegan juntos,
      // el modelo llama crear_pedido por sí solo. No forzamos la tool ante datos
      // sueltos, porque registrar a medias es lo que fallaba antes.
      const first = await callLLM(messages, {
        temperature: 0.7,
        maxTokens: 600,
        tools: [CREAR_PEDIDO_TOOL],
      });

      if (first.toolCalls && first.toolCalls.length > 0) {
        // El modelo pidió crear el pedido. Ejecutamos la(s) tool(s) y hacemos
        // una segunda llamada para que redacte la confirmación al cliente.
        const toolMessages: LLMMessage[] = [
          ...messages,
          { role: "assistant", content: first.text || "", tool_calls: first.toolCalls },
        ];

        for (const tc of first.toolCalls) {
          let parsedArgs: any = {};
          try {
            parsedArgs = JSON.parse(tc.function.arguments || "{}");
          } catch {
            parsedArgs = {};
          }

          if (tc.function.name === "crear_pedido") {
            const exec = await ejecutarCrearPedido(parsedArgs, { customerPhone, source });
            if (exec.ok) {
              orderCode = exec.orderCode;
              orderTotal = exec.total;
              orderAction = exec.action;
            }
            toolMessages.push({
              role: "tool",
              tool_call_id: tc.id,
              name: "crear_pedido",
              content: exec.result,
            });
          } else {
            toolMessages.push({
              role: "tool",
              tool_call_id: tc.id,
              name: tc.function.name,
              content: "Herramienta no reconocida.",
            });
          }
        }

        // Segunda llamada: mensaje final para el cliente (sin tools para evitar loop).
        const second = await callLLM(toolMessages, { temperature: 0.6, maxTokens: 500 });
        content = second.text;

        // Red de seguridad: si el modelo no redactó nada pero SÍ se registró el
        // pedido, damos una confirmación mínima con el código real y el lenguaje
        // correcto según lo que ocurrió (creado vs actualizado).
        if (!content && orderCode) {
          content =
            orderAction === "updated"
              ? `¡Listo! Actualicé tu pedido ${orderCode} con estos productos. Nuestro equipo lo preparará. 🦐`
              : `¡Listo! Tu pedido quedó registrado con el código ${orderCode}. Nuestro equipo lo preparará. 🦐`;
        }
      } else {
        content = first.text;
      }
    } catch (llmError: any) {
      // Si TODOS los proveedores fallan, usar fallback inteligente (con historial).
      console.log("Ningún proveedor LLM disponible, usando fallback:", llmError?.message || "unknown");
      content = await generateFallbackResponse(message, history);
    }

    if (!content) {
      content = await generateFallbackResponse(message, history);
    }

    // Detectar si la respuesta sugiere escalar a humano
    const needsHuman =
      /whatsapp|llámanos|teléfono|tel:|hablar con|humano|asesor|dueño/i.test(content) &&
      /disculpa|no puedo|no tengo|deriva|escribe|consulta/i.test(content);

    // Detectar acciones sugeridas (heurística simple).
    // Solo aplican al widget web; en WhatsApp no hay botones de carrito/WhatsApp.
    const actions: ChatAction[] = [];
    if (orderCode) {
      actions.push({ type: "order_created", code: orderCode, total: orderTotal ?? 0 });
    }
    if (channel === "web") {
      if (/agrega.*carrito|agregar al carrito|carrito de cotización/i.test(content)) {
        actions.push({ type: "open_cart" });
      }
      if (/whatsapp|wa\.me|52661/i.test(content)) {
        actions.push({
          type: "open_whatsapp",
          message: "Hola Mariscos Quiroa, vengo desde el chat de la web.",
        });
      }
    }

    return {
      content,
      actions: actions.length > 0 ? actions : undefined,
      needsHuman,
      orderCode,
    };
  } catch (error: any) {
    console.error("Error en agente IA:", error);
    return {
      content:
        "Disculpa, tuve un problema técnico para responder. Por favor escríbenos por WhatsApp al (663) 699-9689 y te atendemos al instante. 🦐",
      actions: [
        {
          type: "open_whatsapp",
          message: "Hola Mariscos Quiroa, vengo desde el chat de la web.",
        },
      ],
      needsHuman: true,
    };
  }
}

/**
 * Genera una respuesta inteligente basada en el catálogo real.
 * Se usa cuando el SDK de Z.ai no está disponible (ej. Vercel sin API key).
 */
async function generateFallbackResponse(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<string> {
  // El fallback es por reglas (sin LLM), así que no puede "recordar" ni tomar
  // pedidos como el modelo. Para NO perder un pedido en curso cuando el LLM
  // falla, detectamos si la conversación ya venía cerrando un pedido y, en ese
  // caso, derivamos a una persona en vez de responder un saludo/menú genérico
  // (que haría "olvidar" todo lo dicho).
  const confirmacion = /^(s[ií]|si|dale|ok|okay|listo|confirm|conf[ií]rma|correcto|as[ií] es|va|ese|adelante)/i.test(
    message.trim()
  );

  // ¿Hay un pedido en curso? Señales en los últimos turnos del bot: pidió el
  // nombre, mencionó cantidades/precios, o dijo "tu pedido/cotización".
  const recentBot = history
    .filter((m) => m.role === "assistant")
    .slice(-3)
    .map((m) => m.content.toLowerCase())
    .join(" ");
  const pedidoEnCurso =
    /tu nombre|me pasas tu nombre|confirmas tu nombre|para dejar tu pedido|tu pedido|cotizaci[oó]n|\$\s?\d|\d+\s?kg/.test(
      recentBot
    );
  // El mensaje del cliente parece un dato para cerrar el pedido: una confirmación,
  // o un mensaje corto (probablemente su nombre) tras un pedido en curso.
  const pareceCierre = confirmacion || message.trim().split(/\s+/).length <= 3;

  if (history.length > 0 && pedidoEnCurso && pareceCierre) {
    return "¡Gracias! 🦐 Tengo un problemita técnico para registrar tu pedido en este instante, pero no lo pierdo: en un momento te atiende una persona del equipo para dejarlo confirmado. Si prefieres, escríbenos al (663) 699-9689.";
  }
  if (confirmacion && history.length > 0) {
    return "¡Perfecto! Estoy teniendo un problemita técnico para registrar el pedido en este instante. En un momento te atiende una persona del equipo para dejarlo confirmado y no hacerte esperar. 🦐";
  }
  try {
    const [config, products, coverage, hours] = await Promise.all([
      db.siteConfig.findUnique({ where: { id: "singleton" } }),
      db.product.findMany({
        where: { active: true },
        include: {
          category: true,
          presentations: { orderBy: { sortOrder: "asc" } },
          prices: true,
        },
        orderBy: { sortOrder: "asc" },
      }),
      db.coverageZone.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      db.businessHour.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);

    const msg = message.toLowerCase();

    // Detectar intención: precios
    if (/precio|costo|cuanto|cuesta|vale|valor/.test(msg)) {
      const productMatch = products.find(p =>
        msg.includes(p.name.toLowerCase()) ||
        (p.scientific && msg.includes(p.scientific.toLowerCase()))
      );

      if (productMatch) {
        const mayoreo = productMatch.prices.find(pr => pr.channel === "MAYOREO");
        const menudeo = productMatch.prices.find(pr => pr.channel === "MENUDEO");
        let response = `¡Claro! Te cuento los precios de ${productMatch.name}:\n\n`;
        if (mayoreo) {
          response += `📦 **Mayoreo** (mínimo ${mayoreo.minQuantity} ${mayoreo.unit}): `;
          response += mayoreo.pricePerKg ? `$${mayoreo.pricePerKg}/${mayoreo.unit}\n` : `$${mayoreo.priceUnit}/${mayoreo.unit}\n`;
        }
        if (menudeo) {
          response += `🏠 **Menudeo** (mínimo ${menudeo.minQuantity} ${menudeo.unit}): `;
          response += menudeo.pricePerKg ? `$${menudeo.pricePerKg}/${menudeo.unit}\n` : `$${menudeo.priceUnit}/${menudeo.unit}\n`;
        }
        response += `\nPresentaciones: ${productMatch.presentations.map(p => p.name).join(", ")}\n`;
        response += `\n¿Te interesa alguna en particular? Puedes agregarla al carrito o escríbenos por WhatsApp al (663) 699-9689 🦐`;
        return response;
      }
      return "Te puedo dar el precio de cualquier producto de nuestro catálogo. Tenemos: " +
        products.map(p => p.name).join(", ") + ". ¿De cuál quieres saber el precio?";
    }

    // Detectar intención: productos disponibles
    if (/producto|tienes|tienen|hay|catalogo|catálogo|que venden|que venden/.test(msg)) {
      const productList = products.map(p => {
        const mayoreo = p.prices.find(pr => pr.channel === "MAYOREO");
        const menudeo = p.prices.find(pr => pr.channel === "MENUDEO");
        const precioMenudeo = menudeo?.pricePerKg || menudeo?.priceUnit;
        return `• ${p.name}${p.scientific ? ` (${p.scientific})` : ""}${precioMenudeo ? ` - desde $${precioMenudeo}/${menudeo.unit}` : ""}`;
      }).join("\n");
      return `¡Claro! Este es nuestro catálogo disponible hoy:\n\n${productList}\n\n¿Te interesa alguno en particular? Te puedo dar más detalles o precios específicos. 🐟`;
    }

    // Detectar intención: horarios
    if (/horario|abierto|cerrado|atienden|hora|abren|cierran/.test(msg)) {
      const horarios = hours.map(h => `${h.day}: ${h.timeOpen} – ${h.timeClose}`).join("\n");
      return `Nuestros horarios de atención son:\n\n${horarios}\n\nEstamos en ${config?.streetAddress}, ${config?.city}, ${config?.state}. ¡Te esperamos! 🦐`;
    }

    // Detectar intención: ubicación/envíos
    if (/envio|envío|delivery|domicilio|entrega|donde|ubicacion|ubicación|direccion|dirección|cobertura/.test(msg)) {
      const primary = coverage.filter(z => z.type === "primary").map(z => z.name);
      const extended = coverage.filter(z => z.type === "extended").map(z => z.name);
      let response = `Hacemos entregas en:\n\n📍 **Zona primaria (mismo día):**\n${primary.join(", ")}\n\n`;
      response += `🚚 **Zona extendida (24-48 horas):**\n${extended.join(", ")}\n\n`;
      response += `Pedidos antes de las 11:00 AM se entregan el mismo día en zona metropolitana de Rosarito y Tijuana.`;
      return response;
    }

    // Detectar intención: WhatsApp/contacto
    if (/whatsapp|contacto|telefono|teléfono|llamar|hablar|contactar/.test(msg)) {
      return `Puedes contactarnos por:\n\n📱 WhatsApp: ${config?.phoneDisplay}\n📞 Teléfono: ${config?.phoneDisplay}\n📧 Email: ${config?.email}\n\n¡Estamos para ayudarte! 🦐`;
    }

    // Detectar intención: mayoreo vs menudeo
    if (/mayoreo|menudeo|diferencia|cual conviene/.test(msg)) {
      return "Trabajamos con dos canales:\n\n📦 **Mayoreo**: Para restaurantes, pescaderías y hoteles. Mínimo 5 kg por producto. Precios especiales y entrega programada.\n\n🏠 **Menudeo**: Para hogares. Sin mínimo de compra. Entrega el mismo día.\n\n¿Para qué necesitas el producto? Te recomiendo la mejor opción. 🦐";
    }

    // Detectar intención: saludo
    if (/hola|buenos|buenas|que tal|saludos/.test(msg)) {
      return `¡Hola! 🦐 Soy el asistente virtual de ${config?.brandName}. Estoy para ayudarte con consultas sobre productos, precios, disponibilidad y entregas. ¿Qué necesitas saber?`;
    }

    // Detectar intención: agradecimiento
    if (/gracias|muchas gracias|perfecto|genial|excelente/.test(msg)) {
      return "¡De nada! Si tienes alguna otra consulta, no dudes en preguntar. Estamos para ayudarte. 🦐";
    }

    // Respuesta por defecto
    return `Soy el asistente virtual de ${config?.brandName}. Te puedo ayudar con:\n\n• Información de productos y precios\n• Horarios de atención\n• Zonas de entrega\n• Diferencia entre mayoreo y menudeo\n\n¿Qué te gustaría saber? También puedes escribirnos por WhatsApp al (663) 699-9689 para atención personalizada. 🦐`;
  } catch (error) {
    console.error("Error en fallback:", error);
    return "Disculpa, tuve un problema técnico. Por favor escríbenos por WhatsApp al (663) 699-9689 y te atendemos al instante. 🦐";
  }
}

/**
 * Genera un resumen inteligente para el panel admin.
 * Usado por el asistente de gestión del dueño.
 */
export async function generateAdminSummary(context: {
  todayOrders: number;
  weekOrders: number;
  monthRevenue: number;
  topProducts: Array<{ name: string; qty: number }>;
  pendingOrders: number;
  lowStockHint?: string[];
}): Promise<string> {
  try {
    const prompt = `Eres el asistente de gestión de Mariscos Quiroa. El dueño del negocio abrió el panel y quiere un resumen rápido del estado actual.

DATOS DE HOY:
- Pedidos hoy: ${context.todayOrders}
- Pedidos esta semana: ${context.weekOrders}
- Pedidos pendientes de gestionar: ${context.pendingOrders}
- Ingresos del mes: $${context.monthRevenue} MXN
- Productos más vendidos: ${context.topProducts.map((p) => `${p.name} (${p.qty} ${p.qty === 1 ? "pedido" : "pedidos"})`).join(", ") || "sin datos aún"}

Genera un resumen ejecutivo en español mexicano, máx 4 líneas, que:
1. Destaque lo más relevante del día (pedidos pendientes, ingresos, etc.)
2. Sugiera 1 acción concreta (ej: "tienes 3 pedidos nuevos que esperan respuesta")
3. Si hay productos destacados, menciona cuál está funcionando mejor
4. Tono profesional pero cercano, dirigido al dueño (trátalo de "tú", nunca de "vos")

Importante: usa español mexicano. Nunca uses voseo (no digas "tenés", "podés", "necesitás" — usa "tienes", "puedes", "necesitas").

No uses emojis. No uses markdown. Texto plano, conversacional.`;

    const { text } = await callLLM(
      [
        { role: "system", content: "Eres un asistente de gestión de negocios conciso y accionable. Hablas español mexicano (sin voseo)." },
        { role: "user", content: prompt },
      ],
      { temperature: 0.5, maxTokens: 300 }
    );

    return text || generateFallbackAdminSummary(context);
  } catch (e: any) {
    console.error("Error en resumen admin:", e);
    return generateFallbackAdminSummary(context);
  }
}

/**
 * Genera un resumen del admin sin IA (fallback cuando Z.ai no está disponible).
 */
function generateFallbackAdminSummary(context: {
  todayOrders: number;
  weekOrders: number;
  monthRevenue: number;
  topProducts: Array<{ name: string; qty: number }>;
  pendingOrders: number;
}): string {
  let summary = "";

  if (context.pendingOrders > 0) {
    summary += `Hoy tienes ${context.pendingOrders} pedido${context.pendingOrders === 1 ? "" : "s"} pendiente${context.pendingOrders === 1 ? "" : "s"} de gestionar. `;
  }

  if (context.todayOrders > 0) {
    summary += `Recibiste ${context.todayOrders} pedido${context.todayOrders === 1 ? "" : "s"} hoy. `;
  }

  if (context.monthRevenue > 0) {
    summary += `Los ingresos del mes van en $${context.monthRevenue.toLocaleString("es-MX")} MXN. `;
  }

  if (context.topProducts.length > 0) {
    const top = context.topProducts[0];
    summary += `Tu producto más vendido es ${top.name} con ${top.qty} pedido${top.qty === 1 ? "" : "s"}. `;
  }

  if (context.pendingOrders > 0) {
    summary += "Te sugiero priorizar los pedidos pendientes para avanzarlos en el flujo.";
  } else if (context.todayOrders === 0) {
    summary += "No hay pedidos nuevos hoy. Es un buen momento para revisar el catálogo o actualizar contenido.";
  }

  return summary || "Todo en orden. Revisa los números abajo para más detalle.";
}
