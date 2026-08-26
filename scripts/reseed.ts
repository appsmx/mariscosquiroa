/**
 * Reseed de Mariscos Quiroa — limpia la BD y vuelve a sembrar
 * con los datos actualizados a Rosarito, Baja California.
 * Ejecutar con: bun run scripts/reseed.ts
 */
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";

async function main() {
  console.log("🧹 Limpiando base de datos...");

  // Limpiar en orden (respetando foreign keys)
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.customer.deleteMany();
  await db.productPrice.deleteMany();
  await db.productPresentation.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.testimonial.deleteMany();
  await db.faq.deleteMany();
  await db.brandEcosystemEntry.deleteMany();
  await db.differentiator.deleteMany();
  await db.stat.deleteMany();
  await db.coverageZone.deleteMany();
  await db.businessHour.deleteMany();
  await db.activityLog.deleteMany();
  await db.siteConfig.deleteMany();
  await db.user.deleteMany();
  console.log("  ✓ Base de datos limpia");

  console.log("🌱 Iniciando reseed con datos de Rosarito, Baja California...");

  // 1. Usuario admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  await db.user.create({
    data: {
      email: "admin@mariscosquiroa.com",
      name: "Administrador",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("  ✓ Usuario admin: admin@mariscosquiroa.com / admin123");

  // 2. Configuración del sitio — Rosarito, Baja California
  await db.siteConfig.create({
    data: {
      id: "singleton",
      brandName: "Mariscos Quiroa",
      tagline: "El sabor del Pacífico en cada pedido",
      slogan:
        "Pescados y mariscos frescos seleccionados cada mañana, listos para mayoreo y menudeo en toda la región.",
      description:
        "Distribuidora de pescados y mariscos frescos con más de una década y media de trayectoria abasteciendo a restaurantes, pescaderías y hogares de la región. Trabajamos directamente con cooperativas de puerto para garantizar frescura, trazabilidad y precio justo en cada entrega.",
      foundedYear: 2009,
      phone: "+52 663 699 9689",
      phoneDisplay: "(663) 699-9689",
      whatsapp: "526636999689",
      whatsappMessage:
        "Hola Mariscos Quiroa, me gustaría cotizar productos de mariscos.",
      email: "ventas@mariscosquiroa.com",
      streetAddress: "Carretera Tijuana-Ensenada (Libre), Terrazas del Pacífico, Popotla",
      city: "Playas de Rosarito",
      state: "Baja California",
      zipCode: "22716",
      country: "México",
      facebookUrl: "https://www.facebook.com/profile.php?id=61594028451624",
      instagramUrl: "https://www.instagram.com/mariscos.quiroa/",
      tiktokUrl: "https://tiktok.com/@mariscosquiroa",
      heroImage: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/198b130d5c30.jpg",
      storyImage: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/dbc81f24f53e.jpg",
    },
  });
  console.log("  ✓ Configuración del sitio (Rosarito, BC)");

  // 3. Horarios
  const hours = [
    { day: "Lunes a Viernes", timeOpen: "9:00 AM", timeClose: "6:00 PM", sortOrder: 1 },
    { day: "Jueves", timeOpen: "Cerrado", timeClose: "Cerrado", sortOrder: 2 },
    { day: "Sábado y Domingo", timeOpen: "8:00 AM", timeClose: "6:00 PM", sortOrder: 3 },
  ];
  for (const h of hours) {
    await db.businessHour.create({ data: h });
  }
  console.log(`  ✓ ${hours.length} horarios`);

  // 4. Categorías
  const categories = [
    { slug: "marisco", name: "Mariscos", sortOrder: 1 },
    { slug: "pescado", name: "Pescados", sortOrder: 2 },
    { slug: "especialidad", name: "Especialidades", sortOrder: 3 },
  ];
  const categoryMap: Record<string, string> = {};
  for (const c of categories) {
    const cat = await db.category.create({ data: c });
    categoryMap[c.slug] = cat.id;
  }
  console.log(`  ✓ ${categories.length} categorías`);

  // 5. Productos
  const products = [
    {
      slug: "camaron",
      name: "Camarón",
      scientific: "Litopenaeus vannamei",
      categoryId: categoryMap["marisco"],
      image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/7e5a94b57e1b.jpg",
      description:
        "Camarón blanco y café del Pacífico mexicano, recién capturado y clasificado por tamaño. Disponible entero, pelado, limpio o precocido. Nuestro producto estrella por su textura firme y sabor dulce.",
      availability: "DIARIA",
      featured: true,
      sortOrder: 1,
      presentations: ["Entero U-15", "Pelado 16/20", "Pelado 21/25", "Precocido"],
      prices: [
        { channel: "MAYOREO", presentation: "Entero U-15", pricePerKg: 220, unit: "kg", minQuantity: 5, notes: "precio de lista" },
        { channel: "MAYOREO", presentation: "Pelado 16/20", pricePerKg: 280, unit: "kg", minQuantity: 5 },
        { channel: "MENUDEO", presentation: "Entero U-15", pricePerKg: 280, unit: "kg", minQuantity: 0.5 },
        { channel: "MENUDEO", presentation: "Pelado 16/20", pricePerKg: 340, unit: "kg", minQuantity: 0.5 },
      ],
    },
    {
      slug: "pulpo",
      name: "Pulpo",
      scientific: "Octopus maya / vulgaris",
      categoryId: categoryMap["marisco"],
      image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d59b02deb53e.jpg",
      description:
        "Pulpo rojo del Pacífico y caribeño, seleccionado por peso y calidad de tentáculo. Ideal para parrilla, carpaccios y tacos gourmet. Limpio y listo para cocción.",
      availability: "DIARIA",
      featured: true,
      sortOrder: 2,
      presentations: ["Tentáculo 1-2 kg", "Entero 2-4 kg", "Precocido"],
      prices: [
        { channel: "MAYOREO", presentation: "Entero 2-4 kg", pricePerKg: 380, unit: "kg", minQuantity: 5 },
        { channel: "MENUDEO", presentation: "Tentáculo 1-2 kg", pricePerKg: 450, unit: "kg", minQuantity: 1 },
      ],
    },
    {
      slug: "calamar",
      name: "Calamar",
      scientific: "Dosidicus gigas",
      categoryId: categoryMap["marisco"],
      image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3c4315c890f8.jpeg",
      description:
        "Calamar gigante del Pacífico en tubo, anillos o entero. Textura firme perfecta para empanizados, ceviches y frituras. Fresco del día congelado en sitio.",
      availability: "DIARIA",
      sortOrder: 3,
      presentations: ["Tubo limpio", "Anillos", "Entero", "Aletas"],
      prices: [
        { channel: "MAYOREO", presentation: "Tubo limpio", pricePerKg: 95, unit: "kg", minQuantity: 5 },
        { channel: "MENUDEO", presentation: "Tubo limpio", pricePerKg: 130, unit: "kg", minQuantity: 0.5 },
      ],
    },
    {
      slug: "callo-de-hacha",
      name: "Callo de Hacha",
      scientific: "Atrina maura",
      categoryId: categoryMap["marisco"],
      image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/8ad617fdb5f6.jpg",
      description:
        "El auténtico callo de hacha bajacaliforniano, desvalvado a mano y empacado en su propio jugo. Joya de las costas del Pacífico para ceviches y cócteles premium.",
      availability: "TEMPORADA",
      featured: true,
      sortOrder: 4,
      presentations: ["Medio litro", "Litro", "Bandeja 500 g"],
      prices: [
        { channel: "MAYOREO", presentation: "Litro", priceUnit: 320, unit: "litro", minQuantity: 2 },
        { channel: "MENUDEO", presentation: "Medio litro", priceUnit: 200, unit: "litro", minQuantity: 1 },
      ],
    },
    {
      slug: "almeja",
      name: "Almeja",
      scientific: "Megapitaria squalida",
      categoryId: categoryMap["marisco"],
      image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/250e30c16398.jpg",
      description:
        "Almeja chocolata y pata de mula vivas, recibidas cada madrugada. Perfectas para prepararse al vapor, a la talla o crudas con limón. Sello de frescura en cada valva.",
      availability: "DIARIA",
      sortOrder: 5,
      presentations: ["Viva por kilo", "Desvalvada", "Media concha"],
      prices: [
        { channel: "MAYOREO", presentation: "Viva por kilo", pricePerKg: 140, unit: "kg", minQuantity: 5 },
        { channel: "MENUDEO", presentation: "Viva por kilo", pricePerKg: 180, unit: "kg", minQuantity: 1 },
      ],
    },
    {
      slug: "ostiones",
      name: "Ostiones",
      scientific: "Crassostrea gigas / corteziensis",
      categoryId: categoryMap["marisco"],
      image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/670e74545aac.jpg",
      description:
        "Ostiones cultivados en aguas certificadas de Baja California, entregados vivos en concha o desvalvados al momento. Sabor salino intenso y textura cremosa.",
      availability: "DIARIA",
      featured: true,
      sortOrder: 6,
      presentations: ["En concha por docena", "Desvalvados", "Frasco litro"],
      prices: [
        { channel: "MAYOREO", presentation: "En concha por docena", priceUnit: 180, unit: "docena", minQuantity: 5 },
        { channel: "MENUDEO", presentation: "En concha por docena", priceUnit: 220, unit: "docena", minQuantity: 1 },
      ],
    },
    {
      slug: "pescados-frescos",
      name: "Pescados Frescos",
      categoryId: categoryMap["pescado"],
      image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9518189e3f08.jpg",
      description:
        "Variedad de pescados del día: sierra, lisa, robalo, huachinango, currina, mojarra y pargo. Fileteado profesionalmente bajo pedido. Trazabilidad de embarcación certificada.",
      availability: "DIARIA",
      sortOrder: 7,
      presentations: ["Entero fresco", "Filete", "Posta", "Por kilo"],
      prices: [
        { channel: "MAYOREO", presentation: "Filete", pricePerKg: 160, unit: "kg", minQuantity: 5 },
        { channel: "MENUDEO", presentation: "Filete", pricePerKg: 200, unit: "kg", minQuantity: 0.5 },
      ],
    },
    {
      slug: "especialidades",
      name: "Especialidades",
      categoryId: categoryMap["especialidad"],
      image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3a02cf2cdb77.jpg",
      description:
        "Ceviches preparados al momento, aguachiles, cócteles y mariscadas listas para evento. Atendemos restaurantes, banquetes y reuniones privadas con pedido anticipado de 24 h.",
      availability: "BAJO_PEDIDO",
      sortOrder: 8,
      presentations: ["Ceviche 1 kg", "Cóctel individual", "Mariscada para 4-8 p"],
      prices: [
        { channel: "MENUDEO", presentation: "Ceviche 1 kg", priceUnit: 380, unit: "pieza", minQuantity: 1 },
        { channel: "MENUDEO", presentation: "Mariscada para 4-8 p", priceUnit: 1200, unit: "pieza", minQuantity: 1 },
      ],
    },
  ];

  for (const p of products) {
    const { presentations, prices, ...productData } = p;
    const product = await db.product.create({ data: productData });
    for (const [i, pres] of presentations.entries()) {
      await db.productPresentation.create({
        data: { productId: product.id, name: pres, sortOrder: i },
      });
    }
    for (const price of prices) {
      await db.productPrice.create({
        data: { ...price, productId: product.id },
      });
    }
  }
  console.log(`  ✓ ${products.length} productos con presentaciones y precios`);

  // 6. Testimonios
  const testimonials = [
    { name: "Chef Ricardo Belmonte", role: "Restaurante Marea Alta", location: "Rosarito", rating: 5, quote: "Llevo seis años comprándoles el pulpo y el callo de hacha. La consistencia en frescura es lo que mantiene nuestro menú en el nivel que exigimos. Nunca me han fallado en un servicio.", sortOrder: 1 },
    { name: "Laura Quintero", role: "Pescadería La Sirena", location: "Tijuana", rating: 5, quote: "Como pescadería dependemos totalmente de un proveedor confiable. Quiroa nos entrega tres veces por semana puntual, con producto bien clasificado y precios justos. El trato directo del dueño hace la diferencia.", sortOrder: 2 },
    { name: "Familia Ríos", role: "Cliente menudeo", location: "Rosarito", rating: 5, quote: "Cada quinceañero y cumpleaños pido la mariscada para la familia. Llega impecable, fresca y bien empacada. Las recomendaciones de preparación del equipo son oro. Ya no compro en otro lado.", sortOrder: 3 },
  ];
  for (const t of testimonials) {
    await db.testimonial.create({ data: t });
  }
  console.log(`  ✓ ${testimonials.length} testimonios`);

  // 7. FAQs
  const faqs = [
    { question: "¿Con qué frecuencia reciben producto fresco?", answer: "Recibimos producto del puerto todos los días antes de las 6:00 AM. El inventario de mariscos frescos se renueva diariamente; lo que ves disponible hoy salió del mar esa misma madrugada.", sortOrder: 1 },
    { question: "¿Hacen entregas a domicilio?", answer: "Sí. En zona metropolitana de Rosarito y Tijuana entregamos el mismo día si el pedido se realiza antes de las 11:00 AM. Para Ensenada, Mexicali y otras ciudades enviamos por paquetería refrigerada con llegada de 24 a 48 horas.", sortOrder: 2 },
    { question: "¿Cuál es el mínimo de compra para mayoreo?", answer: "El mínimo para precios de mayoreo es de 5 kilogramos por producto o un ticket equivalente. Ofrecemos precios escalonados: mayor volumen, mejor precio unitario.", sortOrder: 3 },
    { question: "¿Aceptan tarjeta o solo efectivo?", answer: "Aceptamos efectivo, transferencia bancaria, tarjetas de débito y crédito, y wallets móviles. Para clientes de mayoreo recurrente abrimos línea de crédito a 30 días.", sortOrder: 4 },
    { question: "¿Cómo garantizan la cadena de frío?", answer: "Trabajamos con cuartos fríos a -2°C para frescos y -18°C para congelados. Las entregas se hacen en vehículos con hieleras industriales y monitoreo de temperatura en todo el trayecto.", sortOrder: 5 },
  ];
  for (const f of faqs) {
    await db.faq.create({ data: f });
  }
  console.log(`  ✓ ${faqs.length} FAQs`);

  // 8. Diferenciadores
  const diffs = [
    { icon: "Waves", title: "Captura del día", description: "Relación directa con cooperativas de puerto. El producto llega a tu cocina en menos de 12 horas desde su captura.", sortOrder: 1 },
    { icon: "ShieldCheck", title: "Trazabilidad certificada", description: "Cada lote tiene registro de embarcación, fecha de captura y certificado sanitario COFEPRIS disponible.", sortOrder: 2 },
    { icon: "Truck", title: "Cadena de frío sin cortes", description: "Vehículos refrigerados y monitoreo continuo de temperatura. La frescura no se rompe desde el mar hasta tu puerta.", sortOrder: 3 },
    { icon: "Handshake", title: "Trato directo de dueños", description: "Atención personalizada del dueño y su equipo. Sin call centers, sin intermediarios. Tú hablas, nosotros resolvemos.", sortOrder: 4 },
  ];
  for (const d of diffs) {
    await db.differentiator.create({ data: d });
  }
  console.log(`  ✓ ${diffs.length} diferenciadores`);

  // 9. Stats
  const stats = [
    { value: "+17", label: "Años de trayectoria", sortOrder: 1 },
    { value: "+40", label: "Productos del mar", sortOrder: 2 },
    { value: "+800", label: "Clientes activos", sortOrder: 3 },
    { value: "100%", label: "Frescura garantizada", sortOrder: 4 },
  ];
  for (const s of stats) {
    await db.stat.create({ data: s });
  }
  console.log(`  ✓ ${stats.length} estadísticas`);

  // 10. Ecosistema de marcas — Rosarito, BC
  const brands = [
    { name: "Restaurante Quiroa 1", subtitle: "Mariscos & Pescados", address: "Blvd. Benito Juárez 1452, Rosarito, Baja California", description: "Nuestra casa matriz. Cocina bajacaliforniana tradicional con productos traídos directamente de la distribuidora. Especialidad en pescado zarandeado, aguachiles y ceviches de callo de hacha.", hours: "Lun a Dom · 12:00 PM – 11:00 PM", phone: "+52 661 100 2001", accent: "teal", logoPath: "/jona-1-logo.svg", sortOrder: 1 },
    { name: "Restaurante Quiroa 2", subtitle: "Marisquería & Bar", address: "Av. del Mar 880, Rosarito, Baja California", description: "Nuestra segunda ubicación, con ambiente más contemporáneo y carta de mariscos al carbón, ostras frescas y coctelería. Terraza frente al malecón con vista al Pacífico.", hours: "Mar a Dom · 1:00 PM – 12:00 AM", phone: "+52 661 100 2002", accent: "amber", logoPath: "/jona-2-logo.svg", sortOrder: 2 },
  ];
  for (const b of brands) {
    await db.brandEcosystemEntry.create({ data: b });
  }
  console.log(`  ✓ ${brands.length} marcas del ecosistema`);

  // 11. Cobertura — Baja California
  const zones = [
    { name: "Rosarito", type: "primary", sortOrder: 1 },
    { name: "Tijuana", type: "primary", sortOrder: 2 },
    { name: "Ensenada", type: "primary", sortOrder: 3 },
    { name: "Mexicali", type: "primary", sortOrder: 4 },
    { name: "San Quintín", type: "primary", sortOrder: 5 },
    { name: "Tijuana a Tecate", type: "extended", sortOrder: 6 },
    { name: "Rosarito y costa de Baja California", type: "extended", sortOrder: 7 },
    { name: "Valle de Guadalupe", type: "extended", sortOrder: 8 },
    { name: "Envíos foráneos por paquetería refrigerada", type: "extended", sortOrder: 9 },
  ];
  for (const z of zones) {
    await db.coverageZone.create({ data: z });
  }
  console.log(`  ✓ ${zones.length} zonas de cobertura`);

  console.log("\n✅ Reseed completado con éxito.");
  console.log("   Ubicación: Rosarito, Baja California");
  console.log("   Login admin: admin@mariscosquiroa.com / admin123");
}

main()
  .catch((e) => {
    console.error("❌ Error en reseed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
