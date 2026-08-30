/**
 * Diccionarios de traducción ES/EN para Mariscos Quiroa.
 * Soporte multi-idioma para turistas en Rosarito.
 *
 * Estructura por secciones para mantener orden.
 * Cualquier texto hardcoded en español debe migrarse a una de estas claves.
 */

export type Locale = "es" | "en";

export const locales: Locale[] = ["es", "en"];
export const defaultLocale: Locale = "es";

export const localeNames: Record<Locale, { native: string; flag: string }> = {
  es: { native: "Español", flag: "🇲🇽" },
  en: { native: "English", flag: "🇺🇸" },
};

type Dict = {
  nav: {
    products: string;
    mayoreoMenudeo: string;
    about: string;
    coverage: string;
    ecosystem: string;
    location: string;
    catalog: string;
    quote: string;
  };
  hero: {
    badge: string;
    tagline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    stat1Label: string;
    stat2Label: string;
    stat3Label: string;
    stat4Label: string;
    scrollHint: string;
  };
  differentiators: {
    title: string;
    subtitle: string;
    items: Array<{ title: string; description: string }>;
  };
  catalog: {
    badge: string;
    title: string;
    subtitle: string;
    filterAll: string;
    filterPescado: string;
    filterMarisco: string;
    filterEspecialidad: string;
    addToCart: string;
    details: string;
    from: string;
    perKg: string;
    perUnit: string;
    perDozen: string;
    mayoreo: string;
    menudeo: string;
    minQty: string;
    seasonal: string;
    daily: string;
    onOrder: string;
    empty: string;
    star: string;
  };
  channels: {
    badge: string;
    title: string;
    subtitle: string;
    mayoreoTitle: string;
    mayoreoDesc: string;
    menudeoTitle: string;
    menudeoDesc: string;
    ctaMayoreo: string;
    ctaMenudeo: string;
  };
  about: {
    badge: string;
    title: string;
    body: string;
    point1: string;
    point2: string;
    point3: string;
    point4: string;
    signature: string;
  };
  coverage: {
    badge: string;
    title: string;
    body: string;
    primaryTitle: string;
    primaryDesc: string;
    extendedTitle: string;
    extendedDesc: string;
    scheduleTitle: string;
    scheduleDesc: string;
    vehiclesTitle: string;
    vehiclesDesc: string;
    cta: string;
  };
  testimonials: {
    badge: string;
    title: string;
    subtitle: string;
    verified: string;
  };
  ecosystem: {
    badge: string;
    title: string;
    subtitle: string;
    visit: string;
  };
  faq: {
    badge: string;
    title: string;
    subtitle: string;
    stillQuestions: string;
    ctaWhatsapp: string;
  };
  location: {
    badge: string;
    title: string;
    addressLabel: string;
    hoursLabel: string;
    phoneLabel: string;
    emailLabel: string;
    getDirections: string;
    days: {
      monday: string;
      tuesday: string;
      wednesday: string;
      thursday: string;
      friday: string;
      saturday: string;
      sunday: string;
    };
    closed: string;
  };
  footer: {
    tagline: string;
    colProductsTitle: string;
    colCompanyTitle: string;
    colContactTitle: string;
    rights: string;
    privacy: string;
    terms: string;
    follow: string;
    whatsappBtn: string;
  };
  cart: {
    title: string;
    empty: string;
    emptyDesc: string;
    continueShopping: string;
    item: string;
    items: string;
    subtotal: string;
    quantity: string;
    remove: string;
    sendQuote: string;
    clear: string;
    summary: string;
  };
  chat: {
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    greeting: string;
    openChat: string;
    closeChat: string;
    quickReplies: {
      catalog: string;
      hours: string;
      quote: string;
      human: string;
    };
    thinking: string;
    error: string;
  };
  whatsapp: {
    label: string;
    floatCta: string;
  };
  language: {
    switch: string;
    es: string;
    en: string;
  };
};

const es: Dict = {
  nav: {
    products: "Productos",
    mayoreoMenudeo: "Mayoreo & Menudeo",
    about: "Nosotros",
    coverage: "Cobertura",
    ecosystem: "Ecosistema",
    location: "Ubicación",
    catalog: "Ver catálogo",
    quote: "Cotizar por WhatsApp",
  },
  hero: {
    badge: "Frescura diaria del Pacífico mexicano · Playas de Rosarito, Baja California",
    tagline: "El sabor del Pacífico en cada pedido",
    ctaPrimary: "Ver catálogo",
    ctaSecondary: "Cotizar por WhatsApp",
    stat1Label: "Años de trayectoria",
    stat2Label: "Productos frescos",
    stat3Label: "Clientes activos",
    stat4Label: "Frescura garantizada",
    scrollHint: "Desliza para explorar",
  },
  differentiators: {
    title: "¿Por qué elegirnos?",
    subtitle: "Cuatro pilares que garantizan calidad en cada entrega",
    items: [
      {
        title: "Captura del día",
        description:
          "Relación directa con cooperativas de puerto. El producto llega a tu cocina en menos de 12 horas desde su captura.",
      },
      {
        title: "Trazabilidad certificada",
        description:
          "Cada lote trae registro de embarcación, fecha de captura y certificado sanitario visible para nuestros clientes.",
      },
      {
        title: "Cadena de frío sin cortes",
        description:
          "Vehículos refrigerados con monitoreo continuo de temperatura. El producto nunca pierde la cadena de frío.",
      },
      {
        title: "Trato directo de dueños",
        description:
          "Atención personalizada del dueño y su equipo. Sin filas, sin intermediarios, sin sorpresas en el precio.",
      },
    ],
  },
  catalog: {
    badge: "Catálogo",
    title: "Lo mejor del Pacífico mexicano",
    subtitle:
      "Productos frescos con precios de mayoreo y menudeo. Toca cualquier producto para ver presentaciones y precios.",
    filterAll: "Todos",
    filterPescado: "Pescados",
    filterMarisco: "Mariscos",
    filterEspecialidad: "Especialidades",
    addToCart: "Agregar",
    details: "Ver detalle",
    from: "Desde",
    perKg: "/ kg",
    perUnit: "/ pieza",
    perDozen: "/ docena",
    mayoreo: "Mayoreo",
    menudeo: "Menudeo",
    minQty: "mín",
    seasonal: "De temporada",
    daily: "Disponible diario",
    onOrder: "Bajo pedido",
    empty: "No hay productos en esta categoría",
    star: "Estrella",
  },
  channels: {
    badge: "Mayoreo & Menudeo",
    title: "Precios para cada tipo de cliente",
    subtitle:
      "Ya seas restaurante, pescadería o cliente hogar, tenemos un precio y un mínimo pensado para ti.",
    mayoreoTitle: "Mayoreo",
    mayoreoDesc:
      "Para restaurantes, pescaderías y distribuidores. Pedido mínimo desde 5 kg. Precios especiales por volumen.",
    menudeoTitle: "Menudeo",
    menudeoDesc:
      "Para clientes hogar y eventos pequeños. Sin mínimo de compra. Producto fresco al mismo nivel de calidad.",
    ctaMayoreo: "Solicitar precio mayoreo",
    ctaMenudeo: "Ver precios menudeo",
  },
  about: {
    badge: "Nosotros",
    title: "Más de 15 años abasteciendo a Baja California",
    body: "Mariscos Quiroa nació en 2009 en Playas de Rosarito, Baja California. Somos distribuidora de pescados y mariscos frescos con relación directa con cooperativas de puerto. Trabajamos con restaurantes, pescaderías y hogares de toda la región, garantizando frescura, trazabilidad y precio justo en cada entrega.",
    point1: "Relación directa con cooperativas de puerto",
    point2: "Vehículos refrigerados propios",
    point3: "Trazabilidad y certificado sanitario",
    point4: "Atención personalizada del dueño",
    signature: "Familia Quiroa",
  },
  coverage: {
    badge: "Zona de cobertura",
    title: "Llevamos frescura a toda la región",
    body: "Trabajamos con vehículos refrigerados que mantienen la temperatura en todo el trayecto, garantizando que el producto llegue con la misma frescura con la que salió del mar.",
    primaryTitle: "Zona primaria (entrega misma día)",
    primaryDesc: "Pedidos antes de las 11:00 AM se entregan el mismo día.",
    extendedTitle: "Zona extendida (24-48 horas)",
    extendedDesc: "Entrega al siguiente día o en 48 horas según la zona.",
    scheduleTitle: "Horarios de entrega",
    scheduleDesc: "Lunes a sábado, 9:00 AM a 6:00 PM. Domingo solo entregas acordadas.",
    vehiclesTitle: "Flota refrigerada propia",
    vehiclesDesc: "Unidades con monitoreo continuo de temperatura entre 0°C y 4°C.",
    cta: "Cotiza la entrega a tu zona",
  },
  testimonials: {
    badge: "Testimonios",
    title: "Lo que dicen nuestros clientes",
    subtitle: "Restaurantes, pescaderías y hogares que confían en Mariscos Quiroa.",
    verified: "Cliente verificado",
  },
  ecosystem: {
    badge: "Ecosistema Quiroa",
    title: "Más que una distribuidora",
    subtitle: "Una red de marcas que cubre toda la cadena: del puerto a tu mesa.",
    visit: "Visitar",
  },
  faq: {
    badge: "Preguntas frecuentes",
    title: "Resolvemos tus dudas",
    subtitle: "Las preguntas que más nos hacen. Si falta alguna, escríbenos por WhatsApp.",
    stillQuestions: "¿Aún tienes preguntas?",
    ctaWhatsapp: "Escríbenos por WhatsApp",
  },
  location: {
    badge: "Ubicación",
    title: "Ven a vernos a Rosarito",
    addressLabel: "Dirección",
    hoursLabel: "Horarios",
    phoneLabel: "Teléfono",
    emailLabel: "Email",
    getDirections: "Cómo llegar",
    days: {
      monday: "Lunes",
      tuesday: "Martes",
      wednesday: "Miércoles",
      thursday: "Jueves",
      friday: "Viernes",
      saturday: "Sábado",
      sunday: "Domingo",
    },
    closed: "Cerrado",
  },
  footer: {
    tagline: "Distribuidora de pescados y mariscos frescos en Baja California. Mayoreo, menudeo y entrega a domicilio.",
    colProductsTitle: "Productos",
    colCompanyTitle: "Empresa",
    colContactTitle: "Contacto",
    rights: "Todos los derechos reservados.",
    privacy: "Aviso de privacidad",
    terms: "Términos y condiciones",
    follow: "Síguenos",
    whatsappBtn: "Escríbenos por WhatsApp",
  },
  cart: {
    title: "Tu cotización",
    empty: "Tu cotización está vacía",
    emptyDesc: "Agrega productos del catálogo para armar tu pedido.",
    continueShopping: "Continuar comprando",
    item: "producto",
    items: "productos",
    subtotal: "Subtotal estimado",
    quantity: "Cantidad",
    remove: "Quitar",
    sendQuote: "Enviar cotización por WhatsApp",
    clear: "Vaciar",
    summary: "Resumen",
  },
  chat: {
    title: "Asistente Mariscos Quiroa",
    subtitle: "Te respondo en segundos",
    placeholder: "Escribe tu mensaje...",
    send: "Enviar",
    greeting:
      "¡Hola! 👋 Soy el asistente virtual de Mariscos Quiroa. ¿Quieres ver el catálogo, cotizar un producto o hablar con un asesor?",
    openChat: "Abrir chat",
    closeChat: "Cerrar chat",
    quickReplies: {
      catalog: "Ver catálogo",
      hours: "Horarios y cobertura",
      quote: "Cotizar por WhatsApp",
      human: "Hablar con un humano",
    },
    thinking: "Pensando...",
    error: "Disculpa, tuve un problema. Inténtalo de nuevo.",
  },
  whatsapp: {
    label: "WhatsApp",
    floatCta: "¿Necesitas ayuda? Escríbenos",
  },
  language: {
    switch: "Cambiar idioma",
    es: "Español",
    en: "English",
  },
};

const en: Dict = {
  nav: {
    products: "Products",
    mayoreoMenudeo: "Wholesale & Retail",
    about: "About Us",
    coverage: "Coverage",
    ecosystem: "Ecosystem",
    location: "Location",
    catalog: "View catalog",
    quote: "Get a quote on WhatsApp",
  },
  hero: {
    badge: "Daily fresh Pacific seafood · Playas de Rosarito, Baja California",
    tagline: "The taste of the Pacific in every order",
    ctaPrimary: "View catalog",
    ctaSecondary: "Get a quote on WhatsApp",
    stat1Label: "Years in business",
    stat2Label: "Fresh products",
    stat3Label: "Active customers",
    stat4Label: "Freshness guaranteed",
    scrollHint: "Scroll to explore",
  },
  differentiators: {
    title: "Why choose us",
    subtitle: "Four pillars that guarantee quality on every delivery",
    items: [
      {
        title: "Caught today",
        description:
          "Direct relationship with port cooperatives. Product reaches your kitchen in less than 12 hours from catch.",
      },
      {
        title: "Certified traceability",
        description:
          "Every batch comes with vessel record, catch date and health certificate visible to our customers.",
      },
      {
        title: "Unbroken cold chain",
        description:
          "Refrigerated vehicles with continuous temperature monitoring. Product never loses the cold chain.",
      },
      {
        title: "Direct owner attention",
        description:
          "Personalized attention from the owner and team. No lines, no middlemen, no surprises in price.",
      },
    ],
  },
  catalog: {
    badge: "Catalog",
    title: "The best of the Mexican Pacific",
    subtitle:
      "Fresh products with wholesale and retail prices. Tap any product to see presentations and prices.",
    filterAll: "All",
    filterPescado: "Fish",
    filterMarisco: "Seafood",
    filterEspecialidad: "Specialties",
    addToCart: "Add",
    details: "Details",
    from: "From",
    perKg: "/ kg",
    perUnit: "/ unit",
    perDozen: "/ dozen",
    mayoreo: "Wholesale",
    menudeo: "Retail",
    minQty: "min",
    seasonal: "Seasonal",
    daily: "Daily availability",
    onOrder: "On order",
    empty: "No products in this category",
    star: "Featured",
  },
  channels: {
    badge: "Wholesale & Retail",
    title: "Pricing for every type of customer",
    subtitle:
      "Whether you're a restaurant, fish market or home customer, we have a price and minimum designed for you.",
    mayoreoTitle: "Wholesale",
    mayoreoDesc:
      "For restaurants, fish markets and distributors. Minimum order from 5 kg. Special volume pricing.",
    menudeoTitle: "Retail",
    menudeoDesc:
      "For home customers and small events. No minimum order. Same quality fresh product.",
    ctaMayoreo: "Request wholesale pricing",
    ctaMenudeo: "See retail prices",
  },
  about: {
    badge: "About Us",
    title: "More than 15 years supplying Baja California",
    body: "Mariscos Quiroa was founded in 2009 in Playas de Rosarito, Baja California. We are distributors of fresh fish and seafood with direct relationships with port cooperatives. We serve restaurants, fish markets and homes across the region, guaranteeing freshness, traceability and fair pricing on every delivery.",
    point1: "Direct relationship with port cooperatives",
    point2: "Our own refrigerated fleet",
    point3: "Traceability and health certificate",
    point4: "Personalized attention from the owner",
    signature: "The Quiroa Family",
  },
  coverage: {
    badge: "Coverage area",
    title: "We bring freshness to the whole region",
    body: "We work with refrigerated vehicles that maintain temperature throughout the journey, ensuring the product arrives with the same freshness as when it left the sea.",
    primaryTitle: "Primary zone (same-day delivery)",
    primaryDesc: "Orders placed before 11:00 AM are delivered the same day.",
    extendedTitle: "Extended zone (24-48 hours)",
    extendedDesc: "Next-day or 48-hour delivery depending on the zone.",
    scheduleTitle: "Delivery hours",
    scheduleDesc: "Monday to Saturday, 9:00 AM to 6:00 PM. Sunday only by appointment.",
    vehiclesTitle: "Our own refrigerated fleet",
    vehiclesDesc: "Units with continuous temperature monitoring between 0°C and 4°C.",
    cta: "Get a quote for delivery to your area",
  },
  testimonials: {
    badge: "Testimonials",
    title: "What our customers say",
    subtitle: "Restaurants, fish markets and homes that trust Mariscos Quiroa.",
    verified: "Verified customer",
  },
  ecosystem: {
    badge: "Quiroa Ecosystem",
    title: "More than a distributor",
    subtitle: "A network of brands covering the entire chain: from port to your table.",
    visit: "Visit",
  },
  faq: {
    badge: "FAQ",
    title: "We answer your questions",
    subtitle: "The questions we get most often. If we missed any, message us on WhatsApp.",
    stillQuestions: "Still have questions?",
    ctaWhatsapp: "Message us on WhatsApp",
  },
  location: {
    badge: "Location",
    title: "Come see us in Rosarito",
    addressLabel: "Address",
    hoursLabel: "Hours",
    phoneLabel: "Phone",
    emailLabel: "Email",
    getDirections: "Get directions",
    days: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    },
    closed: "Closed",
  },
  footer: {
    tagline: "Fresh fish and seafood distributor in Baja California. Wholesale, retail and home delivery.",
    colProductsTitle: "Products",
    colCompanyTitle: "Company",
    colContactTitle: "Contact",
    rights: "All rights reserved.",
    privacy: "Privacy notice",
    terms: "Terms & conditions",
    follow: "Follow us",
    whatsappBtn: "Message us on WhatsApp",
  },
  cart: {
    title: "Your quote",
    empty: "Your quote is empty",
    emptyDesc: "Add products from the catalog to build your order.",
    continueShopping: "Continue shopping",
    item: "item",
    items: "items",
    subtotal: "Estimated subtotal",
    quantity: "Quantity",
    remove: "Remove",
    sendQuote: "Send quote on WhatsApp",
    clear: "Clear",
    summary: "Summary",
  },
  chat: {
    title: "Mariscos Quiroa Assistant",
    subtitle: "I reply in seconds",
    placeholder: "Type your message...",
    send: "Send",
    greeting:
      "Hi! 👋 I'm the Mariscos Quiroa virtual assistant. Want to see the catalog, get a quote or talk to a human?",
    openChat: "Open chat",
    closeChat: "Close chat",
    quickReplies: {
      catalog: "View catalog",
      hours: "Hours & coverage",
      quote: "Get a quote on WhatsApp",
      human: "Talk to a human",
    },
    thinking: "Thinking...",
    error: "Sorry, I had an issue. Please try again.",
  },
  whatsapp: {
    label: "WhatsApp",
    floatCta: "Need help? Message us",
  },
  language: {
    switch: "Change language",
    es: "Español",
    en: "English",
  },
};

export const dictionaries: Record<Locale, Dict> = { es, en };
export type DictType = Dict;
