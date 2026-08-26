/**
 * ============================================================
 *  MARISCOS QUIROA — Datos centrales del sitio
 * ============================================================
 *  Este archivo concentra TODA la información editable de la
 *  empresa (nombre, contacto, productos, ubicación, etc.).
 *  Cambia los valores aquí y el sitio se actualizará entero.
 * ============================================================
 */

export const siteConfig = {
  // ---- Identidad de la empresa ----
  brand: {
    name: "Mariscos Quiroa",
    tagline: "El sabor del Pacífico en cada pedido",
    slogan:
      "Pescados y mariscos frescos seleccionados cada mañana, listos para mayoreo y menudeo en toda la región.",
    foundedYear: 2009,
    trajectoryYears: 17,
    description:
      "Distribuidora de pescados y mariscos frescos con trayectoria abasteciendo a restaurantes, pescaderías y hogares de la región. Trabajamos directamente con cooperativas de puerto para garantizar frescura, trazabilidad y precio justo en cada entrega.",
  },

  // ---- Contacto (pendiente de confirmar teléfono y WhatsApp) ----
  contact: {
    phone: "+52 663 699 9689", // TODO: confirmar teléfono real
    phoneDisplay: "(663) 699-9689", // TODO: confirmar
    whatsapp: "526636999689", // TODO: confirmar WhatsApp real
    whatsappMessage:
      "Hola Mariscos Quiroa, me gustaría cotizar productos de mariscos.",
    email: "ventas@mariscosquiroa.com", // TODO: crear cuando tenga dominio
    address: {
      street: "Carretera Tijuana-Ensenada (Libre), Terrazas del Pacífico, Popotla", // TODO: confirmar
      city: "Playas de Rosarito",
      state: "Baja California",
      zip: "22716",
      country: "México",
    },
    hours: [
      { day: "Lunes a Viernes", time: "9:00 AM – 6:00 PM" },
      { day: "Jueves", time: "Cerrado" },
      { day: "Sábado y Domingo", time: "8:00 AM – 6:00 PM" },
    ],
  },

  // ---- Redes sociales ----
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61594028451624", // TODO: crear
    instagram: "https://www.instagram.com/mariscos.quiroa/", // TODO: crear
    tiktok: "https://tiktok.com/@mariscosquiroa", // TODO: crear
  },

  // ---- Imágenes (URLs CDN, sustituibles) ----
  images: {
    hero: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/198b130d5c30.jpg",
    story:
      "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/dbc81f24f53e.jpg",
    ctaBanner:
      "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/7e5a94b57e1b.jpg",
  },

  // ---- Estadísticas (hero) ----
  stats: [
    { value: "+17", label: "Años de trayectoria" },
    { value: "+40", label: "Productos del mar" },
    { value: "+800", label: "Clientes activos" },
    { value: "100%", label: "Frescura garantizada" },
  ],
} as const;

// ============================================================
//  PRODUCTOS
// ============================================================

export type Product = {
  id: string;
  dbId?: string;
  name: string;
  scientific?: string;
  category: "marisco" | "pescado" | "especialidad";
  image: string;
  description: string;
  presentation: string[];
  availability: "Diaria" | "Temporada" | "Bajo pedido";
  tags: ("mayoreo" | "menudeo" | "premium" | "congelado" | "fresco")[];
  prices?: Array<{
    channel: "mayoreo" | "menudeo";
    presentation?: string | null;
    pricePerKg?: number | null;
    priceUnit?: number | null;
    unit: string;
    minQuantity: number;
    notes?: string | null;
  }>;
};

export const products: Product[] = [
  {
    id: "camaron",
    name: "Camarón",
    scientific: "Litopenaeus vannamei",
    category: "marisco",
    image:
      "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/7e5a94b57e1b.jpg",
    description:
      "Camarón blanco y café del Pacífico mexicano, recién capturado y clasificado por tamaño. Disponible entero, pelado, limpio o precocido. Nuestro producto estrella por su textura firme y sabor dulce.",
    presentation: ["Entero U-15", "Pelado 16/20", "Pelado 21/25", "Precocido"],
    availability: "Diaria",
    tags: ["mayoreo", "menudeo", "fresco", "premium"],
  },
  {
    id: "pulpo",
    name: "Pulpo",
    scientific: "Octopus maya / vulgaris",
    category: "marisco",
    image:
      "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d59b02deb53e.jpg",
    description:
      "Pulpo rojo del Pacífico y caribeño, seleccionado por peso y calidad de tentáculo. Ideal para parrilla, carpaccios y tacos gourmet. Limpio y listo para cocción.",
    presentation: ["Tentáculo 1-2 kg", "Entero 2-4 kg", "Precocido"],
    availability: "Diaria",
    tags: ["mayoreo", "menudeo", "fresco", "premium"],
  },
  {
    id: "calamar",
    name: "Calamar",
    scientific: "Dosidicus gigas",
    category: "marisco",
    image:
      "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3c4315c890f8.jpeg",
    description:
      "Calamar gigante del Pacífico en tubo, anillos o entero. Textura firme perfecta para empanizados, ceviches y frituras. Fresco del día congelado en sitio.",
    presentation: ["Tubo limpio", "Anillos", "Entero", "Aletas"],
    availability: "Diaria",
    tags: ["mayoreo", "menudeo", "fresco", "congelado"],
  },
  {
    id: "callo-de-hacha",
    name: "Callo de Hacha",
    scientific: "Atrina maura",
    category: "marisco",
    image:
      "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/8ad617fdb5f6.jpg",
    description:
      "El auténtico callo de hacha de Baja California, desvalvado a mano y empacado en su propio jugo. Joya de las costas del Pacífico para ceviches y cócteles premium.",
    presentation: ["Medio litro", "Litro", "Bandeja 500 g"],
    availability: "Temporada",
    tags: ["mayoreo", "menudeo", "fresco", "premium"],
  },
  {
    id: "almeja",
    name: "Almeja",
    scientific: "Megapitaria squalida",
    category: "marisco",
    image:
      "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/250e30c16398.jpg",
    description:
      "Almeja chocolata y pata de mula vivas, recibidas cada madrugada. Perfectas para prepararse al vapor, a la talla o crudas con limón. Sello de frescura en cada valva.",
    presentation: ["Viva por kilo", "Desvalvada", "Media concha"],
    availability: "Diaria",
    tags: ["mayoreo", "menudeo", "fresco"],
  },
  {
    id: "ostiones",
    name: "Ostiones",
    scientific: "Crassostrea gigas / corteziensis",
    category: "marisco",
    image:
      "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/670e74545aac.jpg",
    description:
      "Ostiones cultivados en aguas certificadas de Baja California, entregados vivos en concha o desvalvados al momento. Sabor salino intenso y textura cremosa.",
    presentation: ["En concha por docena", "Desvalvados", "Frasco litro"],
    availability: "Diaria",
    tags: ["mayoreo", "menudeo", "fresco", "premium"],
  },
  {
    id: "pescados",
    name: "Pescados Frescos",
    category: "pescado",
    image:
      "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9518189e3f08.jpg",
    description:
      "Variedad de pescados del día: sierra, lisa, robalo, huachinango, currina, mojarra y pargo. Fileteado profesionalmente bajo pedido. Trazabilidad de embarcación certificada.",
    presentation: ["Entero fresco", "Filete", "Posta", "Por kilo"],
    availability: "Diaria",
    tags: ["mayoreo", "menudeo", "fresco"],
  },
  {
    id: "especialidades",
    name: "Especialidades",
    category: "especialidad",
    image:
      "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3a02cf2cdb77.jpg",
    description:
      "Ceviches preparados al momento, aguachiles, cócteles y mariscadas listas para evento. Atendemos restaurantes, banquetes y reuniones privadas con pedido anticipado de 24 h.",
    presentation: ["Ceviche 1 kg", "Cóctel individual", "Mariscada para 4-8 p"],
    availability: "Bajo pedido",
    tags: ["mayoreo", "menudeo", "premium"],
  },
];

// ============================================================
//  MAYOREO vs MENUDEO
// ============================================================

export const salesChannels = [
  {
    id: "mayoreo",
    name: "Mayoreo",
    icon: "Building2",
    badge: "Para negocios",
    color: "teal",
    minimum: "Desde 5 kg por producto",
    description:
      "Precios preferenciales para restaurantes, pescaderías, hoteles y distribuidores. Volumen semanal o quincenal con entrega programada y línea de crédito para clientes frecuentes.",
    features: [
      "Precios escalonados por volumen",
      "Entrega programada sin costo en zona metropolitana",
      "Facturación electrónica inmediata",
      "Línea de crédito hasta 30 días",
      "Asesor comercial dedicado",
      "Reserva de inventario anticipada",
    ],
    cta: "Solicitar catálogo mayoreo",
  },
  {
    id: "menudeo",
    name: "Menudeo",
    icon: "Home",
    badge: "Para hogares",
    color: "amber",
    minimum: "Sin mínimo de compra",
    description:
      "Compra directa al mostrador o por WhatsApp con entrega a domicilio el mismo día. Frescura idéntica a la que reciben los restaurantes, en presentaciones prácticas para el hogar.",
    features: [
      "Sin mínimo de compra",
      "Entrega a domicilio el mismo día",
      "Pago en efectivo, transferencia o tarjeta",
      "Productos limpios y porcionados",
      "Atención directa por WhatsApp",
      "Recomendaciones de preparación",
    ],
    cta: "Hacer pedido por WhatsApp",
  },
] as const;

// ============================================================
//  ZONA DE COBERTURA
// ============================================================

export const coverage = {
  primary: [
    "Rosarito",
    "Tijuana",
    "Ensenada",
    "Mexicali",
    "San Quintín",
  ],
  extended: [
    "Tijuana a Tecate",
    "Rosarito y costa de Baja California",
    "Valle de Guadalupe",
    "Envíos foráneos por paquetería refrigerada",
  ],
  deliverySchedule:
    "Entregas lunes a sábado. Pedidos antes de las 11:00 AM se entregan el mismo día en zona metropolitana de Rosarito y Tijuana.",
};

// ============================================================
//  TESTIMONIOS
// ============================================================

export const testimonials = [
  {
    name: "Chef Ricardo Belmonte",
    role: "Restaurante Marea Alta",
    location: "Rosarito",
    rating: 5,
    quote:
      "Llevo seis años comprándoles el pulpo y el callo de hacha. La consistencia en frescura es lo que mantiene nuestro menú en el nivel que exigimos. Nunca me han fallado en un servicio.",
  },
  {
    name: "Laura Quintero",
    role: "Pescadería La Sirena",
    location: "Tijuana",
    rating: 5,
    quote:
      "Como pescadería dependemos totalmente de un proveedor confiable. Mariscos Quiroa nos entrega tres veces por semana puntual, con producto bien clasificado y precios justos. El trato directo del dueño hace la diferencia.",
  },
  {
    name: "Familia Ríos",
    role: "Cliente menudeo",
    location: "Rosarito",
    rating: 5,
    quote:
      "Cada quinceañero y cumpleaños pido la mariscada para la familia. Llega impecable, fresca y bien empacada. Las recomendaciones de preparación del equipo son oro. Ya no compro en otro lado.",
  },
];

// ============================================================
//  ECOSISTEMA DE MARCAS
// ============================================================

export const brandEcosystem = [
  {
    name: "Marisco Preparado Quiroa",
    subtitle: "Mariscos & Pescados",
    address: "Carretera Tijuana-Ensenada (Libre), Terrazas del Pacífico, Popotla, Rosarito, BC",
    description:
      "Nuestra casa matriz. Cocina bajacaliforniana tradicional con productos traídos directamente de la distribuidora. Especialidad en pescado zarandeado, aguachiles y ceviches de callo de hacha.",
    hours: "Lun a Dom · 12:00 PM – 11:00 PM",
    accent: "teal",
    phone: "+52 661 100 2001",
  },
  {
    name: "Marisquería Quiroa",
    subtitle: "Marisquería & Bar",
    address: "Av. del Mar 880, Rosarito, Baja California",
    description:
      "Nuestra segunda ubicación, con ambiente más contemporáneo y carta de mariscos al carbón, ostras frescas y coctelería. Terraza frente al malecón con vista al Pacífico.",
    hours: "Mar a Dom · 1:00 PM – 12:00 AM",
    accent: "amber",
    phone: "+52 661 100 2002",
  },
] as const;

// ============================================================
//  PREGUNTAS FRECUENTES
// ============================================================

export const faqs = [
  {
    question: "¿Con qué frecuencia reciben producto fresco?",
    answer:
      "Recibimos producto del puerto todos los días antes de las 6:00 AM. El inventario de mariscos frescos se renueva diariamente; lo que ves disponible hoy salió del mar esa misma madrugada.",
  },
  {
    question: "¿Hacen entregas a domicilio?",
    answer:
      "Sí. En zona metropolitana de Rosarito y Tijuana entregamos el mismo día si el pedido se realiza antes de las 11:00 AM. Para Ensenada, Mexicali y otras ciudades enviamos por paquetería refrigerada con llegada de 24 a 48 horas.",
  },
  {
    question: "¿Cuál es el mínimo de compra para mayoreo?",
    answer:
      "El mínimo para precios de mayoreo es de 5 kilogramos por producto o un ticket equivalente. Ofrecemos precios escalonados: mayor volumen, mejor precio unitario.",
  },
  {
    question: "¿Aceptan tarjeta o solo efectivo?",
    answer:
      "Aceptamos efectivo, transferencia bancaria, tarjetas de débito y crédito, y wallets móviles. Para clientes de mayoreo recurrente abrimos línea de crédito a 30 días.",
  },
  {
    question: "¿Cómo garantizan la cadena de frío?",
    answer:
      "Trabajamos con cuartos fríos a -2°C para frescos y -18°C para congelados. Las entregas se hacen en vehículos con hieleras industriales y monitoreo de temperatura en todo el trayecto.",
  },
];

// ============================================================
//  CARACTERÍSTICAS / DIFERENCIADORES
// ============================================================

export const differentiators = [
  {
    icon: "Waves",
    title: "Captura del día",
    description:
      "Relación directa con cooperativas de puerto. El producto llega a tu cocina en menos de 12 horas desde su captura.",
  },
  {
    icon: "ShieldCheck",
    title: "Trazabilidad certificada",
    description:
      "Cada lote tiene registro de embarcación, fecha de captura y certificado sanitario COFEPRIS disponible.",
  },
  {
    icon: "Truck",
    title: "Cadena de frío sin cortes",
    description:
      "Vehículos refrigerados y monitoreo continuo de temperatura. La frescura no se rompe desde el mar hasta tu puerta.",
  },
  {
    icon: "Handshake",
    title: "Trato directo de dueños",
    description:
      "Atención personalizada del dueño y su equipo. Sin call centers, sin intermediarios. Tú hablas, nosotros resolvemos.",
  },
];
