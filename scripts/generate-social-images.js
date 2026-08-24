const sharp = require('sharp');
const path = require('path');

const logoPath = 'public/logo.png';
const outputDir = 'download/redes-sociales';

// Colores de la marca
const OCEAN_DARK = '#082f49';
const OCEAN_700 = '#0e7490';
const OCEAN_600 = '#0891b2';
const AMBER_500 = '#f59e0b';
const AMBER_600 = '#d97706';
const CREAM = '#fef3c7';
const WHITE = '#ffffff';

// ============ 1. PORTADA DE FACEBOOK (1640x856) ============
async function createFacebookCover() {
  const width = 1640;
  const height = 856;
  
  const svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${OCEAN_DARK}"/>
        <stop offset="50%" style="stop-color:${OCEAN_700}"/>
        <stop offset="100%" style="stop-color:${OCEAN_600}"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:${AMBER_500};stop-opacity:0.15"/>
        <stop offset="100%" style="stop-color:${AMBER_500};stop-opacity:0"/>
      </radialGradient>
    </defs>
    
    <!-- Fondo -->
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    
    <!-- Glow decorativo -->
    <circle cx="${width/2}" cy="${height/2}" r="500" fill="url(#glow)"/>
    
    <!-- Onda decorativa superior -->
    <path d="M0,100 Q410,60 820,100 T1640,100 L1640,0 L0,0 Z" fill="${OCEAN_700}" opacity="0.3"/>
    <path d="M0,120 Q410,80 820,120 T1640,120 L1640,0 L0,0 Z" fill="${OCEAN_600}" opacity="0.2"/>
    
    <!-- Onda decorativa inferior -->
    <path d="M0,756 Q410,796 820,756 T1640,756 L1640,856 L0,856 Z" fill="${OCEAN_DARK}" opacity="0.5"/>
    
    <!-- Logo centrado -->
    <image href="data:image/png;base64,${require('fs').readFileSync(logoPath).toString('base64')}" 
           x="${width/2 - 90}" y="180" width="180" height="180" rx="20"/>
    
    <!-- Nombre -->
    <text x="${width/2}" y="450" text-anchor="middle" 
          font-family="Georgia, serif" font-size="64" font-weight="bold" fill="${WHITE}">
      Mariscos Quiroa
    </text>
    
    <!-- Eslogan -->
    <text x="${width/2}" y="510" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="28" fill="${CREAM}" font-style="italic">
      El sabor del Pacífico en cada pedido
    </text>
    
    <!-- Datos de contacto -->
    <text x="${width/2}" y="620" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="22" fill="${WHITE}" opacity="0.9">
      📍 Carretera Tijuana-Ensenada, Popotla, Rosarito, BC
    </text>
    <text x="${width/2}" y="660" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="22" fill="${WHITE}" opacity="0.9">
      📲 (663) 699-9689 · mariscosquiroa.com
    </text>
    
    <!-- Horarios -->
    <text x="${width/2}" y="710" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="20" fill="${AMBER_500}" opacity="0.9">
      Lun-Vie 9-6 · Sáb-Dom 8-6 · Jueves cerrado
    </text>
    
    <!-- Pez decorativo -->
    <path d="M100,700 Q130,690 150,700 Q170,710 200,700 Q230,690 250,700" 
          stroke="${AMBER_500}" stroke-width="2" fill="none" opacity="0.3"/>
    <path d="M1340,700 Q1370,690 1390,700 Q1410,710 1440,700 Q1470,690 1490,700" 
          stroke="${AMBER_500}" stroke-width="2" fill="none" opacity="0.3"/>
  </svg>`;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(outputDir, 'portada-facebook.png'));
  
  console.log('✓ Portada de Facebook creada (1640x856)');
}

// ============ 2. POST BIENVENIDA (1080x1080) ============
async function createPostBienvenida() {
  const size = 1080;
  
  const svg = `
  <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${OCEAN_DARK}"/>
        <stop offset="100%" style="stop-color:${OCEAN_700}"/>
      </linearGradient>
    </defs>
    
    <rect width="${size}" height="${size}" fill="url(#bg1)"/>
    
    <!-- Ondas decorativas -->
    <path d="M0,80 Q270,40 540,80 T1080,80 L1080,0 L0,0 Z" fill="${OCEAN_700}" opacity="0.4"/>
    <path d="M0,1000 Q270,1040 540,1000 T1080,1000 L1080,1080 L0,1080 Z" fill="${OCEAN_DARK}" opacity="0.6"/>
    
    <!-- Logo centrado -->
    <image href="data:image/png;base64,${require('fs').readFileSync(logoPath).toString('base64')}" 
           x="${size/2 - 100}" y="180" width="200" height="200" rx="24"/>
    
    <!-- Texto principal -->
    <text x="${size/2}" y="490" text-anchor="middle" 
          font-family="Georgia, serif" font-size="56" font-weight="bold" fill="${WHITE}">
      ¡Ya estamos aquí!
    </text>
    
    <text x="${size/2}" y="560" text-anchor="middle" 
          font-family="Georgia, serif" font-size="48" font-weight="bold" fill="${CREAM}">
      Mariscos Quiroa 🦐
    </text>
    
    <!-- Eslogan -->
    <text x="${size/2}" y="630" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="28" fill="${AMBER_500}" font-style="italic">
      El sabor del Pacífico en cada pedido
    </text>
    
    <!-- Separador -->
    <line x1="340" y1="680" x2="740" y2="680" stroke="${AMBER_500}" stroke-width="2" opacity="0.5"/>
    
    <!-- Info -->
    <text x="${size/2}" y="740" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="26" fill="${WHITE}" opacity="0.9">
      Pescados y mariscos frescos
    </text>
    <text x="${size/2}" y="780" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="26" fill="${WHITE}" opacity="0.9">
      en Playas de Rosarito, BC
    </text>
    
    <!-- CTA -->
    <text x="${size/2}" y="860" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="24" fill="${AMBER_500}">
      mariscosquiroa.com
    </text>
    <text x="${size/2}" y="895" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="22" fill="${WHITE}" opacity="0.7">
      📲 (663) 699-9689
    </text>
    
    <!-- Mayoreo y menudeo -->
    <rect x="290" y="930" width="200" height="40" rx="20" fill="${OCEAN_600}" opacity="0.8"/>
    <text x="390" y="957" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="${WHITE}">Mayoreo</text>
    
    <rect x="590" y="930" width="200" height="40" rx="20" fill="${AMBER_600}" opacity="0.8"/>
    <text x="690" y="957" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="${WHITE}">Menudeo</text>
  </svg>`;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(outputDir, 'post-1-bienvenida.png'));
  
  console.log('✓ Post 1: Bienvenida (1080x1080)');
}

// ============ 3. POST CATÁLOGO (1080x1080) ============
async function createPostCatalogo() {
  const size = 1080;
  
  const svg = `
  <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${OCEAN_DARK}"/>
        <stop offset="100%" style="stop-color:${OCEAN_600}"/>
      </linearGradient>
    </defs>
    
    <rect width="${size}" height="${size}" fill="url(#bg2)"/>
    
    <!-- Ondas -->
    <path d="M0,60 Q270,20 540,60 T1080,60 L1080,0 L0,0 Z" fill="${OCEAN_600}" opacity="0.3"/>
    
    <!-- Título -->
    <text x="${size/2}" y="120" text-anchor="middle" 
          font-family="Georgia, serif" font-size="42" font-weight="bold" fill="${CREAM}">
      Nuestro catálogo 🦐
    </text>
    
    <!-- Productos -->
    <g font-family="Arial, sans-serif" font-size="28" fill="${WHITE}">
      <text x="100" y="220">🦐 Camarón</text>
      <text x="700" y="220" font-size="22" fill="${AMBER_500}">desde $220/kg</text>
      
      <text x="100" y="290">🐙 Pulpo</text>
      <text x="700" y="290" font-size="22" fill="${AMBER_500}">desde $380/kg</text>
      
      <text x="100" y="360">🦑 Calamar</text>
      <text x="700" y="360" font-size="22" fill="${AMBER_500}">desde $95/kg</text>
      
      <text x="100" y="430">🐚 Callo de Hacha</text>
      <text x="700" y="430" font-size="22" fill="${AMBER_500}">de temporada</text>
      
      <text x="100" y="500">🦪 Almeja</text>
      <text x="700" y="500" font-size="22" fill="${AMBER_500}">desde $140/kg</text>
      
      <text x="100" y="570">🦪 Ostiones</text>
      <text x="700" y="570" font-size="22" fill="${AMBER_500}">desde $180/doc</text>
      
      <text x="100" y="640">🐟 Pescados Frescos</text>
      <text x="700" y="640" font-size="22" fill="${AMBER_500}">desde $160/kg</text>
      
      <text x="100" y="710">🍣 Especialidades</text>
      <text x="700" y="710" font-size="22" fill="${AMBER_500}">bajo pedido</text>
    </g>
    
    <!-- Separador -->
    <line x1="100" y1="760" x2="980" y2="760" stroke="${AMBER_500}" stroke-width="2" opacity="0.4"/>
    
    <!-- CTA -->
    <text x="${size/2}" y="830" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="26" fill="${WHITE}">
      Cotiza por WhatsApp o en nuestra web
    </text>
    
    <text x="${size/2}" y="890" text-anchor="middle" 
          font-family="Georgia, serif" font-size="32" font-weight="bold" fill="${AMBER_500}">
      mariscosquiroa.com
    </text>
    
    <text x="${size/2}" y="940" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="24" fill="${WHITE}" opacity="0.8">
      📲 (663) 699-9689
    </text>
    
    <!-- Footer -->
    <rect x="0" y="1000" width="${size}" height="80" fill="${OCEAN_DARK}" opacity="0.8"/>
    <text x="${size/2}" y="1050" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="20" fill="${CREAM}">
      Mayoreo y menudeo · Playas de Rosarito, BC
    </text>
  </svg>`;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(outputDir, 'post-2-catalogo.png'));
  
  console.log('✓ Post 2: Catálogo (1080x1080)');
}

// ============ 4. POST HORARIOS (1080x1080) ============
async function createPostHorarios() {
  const size = 1080;
  
  const svg = `
  <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${OCEAN_700}"/>
        <stop offset="100%" style="stop-color:${OCEAN_DARK}"/>
      </linearGradient>
    </defs>
    
    <rect width="${size}" height="${size}" fill="url(#bg3)"/>
    
    <!-- Ondas decorativas -->
    <path d="M0,80 Q270,40 540,80 T1080,80 L1080,0 L0,0 Z" fill="${OCEAN_600}" opacity="0.3"/>
    <path d="M0,1000 Q270,1040 540,1000 T1080,1000 L1080,1080 L0,1080 Z" fill="${OCEAN_DARK}" opacity="0.6"/>
    
    <!-- Logo pequeño -->
    <image href="data:image/png;base64,${require('fs').readFileSync(logoPath).toString('base64')}" 
           x="${size/2 - 50}" y="130" width="100" height="100" rx="16"/>
    
    <!-- Título -->
    <text x="${size/2}" y="300" text-anchor="middle" 
          font-family="Georgia, serif" font-size="48" font-weight="bold" fill="${WHITE}">
      Horarios de atención 🕙
    </text>
    
    <!-- Horarios -->
    <g font-family="Arial, sans-serif" fill="${WHITE}">
      <rect x="200" y="360" width="680" height="60" rx="12" fill="${WHITE}" opacity="0.1"/>
      <text x="260" y="400" font-size="28">📅 Lunes a Viernes</text>
      <text x="820" y="400" font-size="28" text-anchor="end" fill="${AMBER_500}">9:00 AM - 6:00 PM</text>
      
      <rect x="200" y="440" width="680" height="60" rx="12" fill="${WHITE}" opacity="0.1"/>
      <text x="260" y="480" font-size="28">📅 Jueves</text>
      <text x="820" y="480" font-size="28" text-anchor="end" fill="${AMBER_500}">CERRADO</text>
      
      <rect x="200" y="520" width="680" height="60" rx="12" fill="${WHITE}" opacity="0.1"/>
      <text x="260" y="560" font-size="28">📅 Sábado y Domingo</text>
      <text x="820" y="560" font-size="28" text-anchor="end" fill="${AMBER_500}">8:00 AM - 6:00 PM</text>
    </g>
    
    <!-- Separador -->
    <line x1="200" y1="620" x2="880" y2="620" stroke="${AMBER_500}" stroke-width="2" opacity="0.4"/>
    
    <!-- Atención online -->
    <rect x="250" y="660" width="580" height="70" rx="16" fill="${AMBER_500}" opacity="0.15"/>
    <text x="${size/2}" y="705" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="26" fill="${AMBER_500}">
      🤖 Atención online (chat IA): 24/7
    </text>
    
    <!-- Ubicación -->
    <text x="${size/2}" y="800" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="24" fill="${WHITE}" opacity="0.9">
      📍 Carretera Tijuana-Ensenada, Popotla
    </text>
    <text x="${size/2}" y="840" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="24" fill="${WHITE}" opacity="0.9">
      Playas de Rosarito, Baja California
    </text>
    
    <!-- CTA -->
    <text x="${size/2}" y="910" text-anchor="middle" 
          font-family="Georgia, serif" font-size="30" font-weight="bold" fill="${AMBER_500}">
      mariscosquiroa.com
    </text>
    <text x="${size/2}" y="950" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="22" fill="${WHITE}" opacity="0.8">
      📲 (663) 699-9689
    </text>
  </svg>`;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(outputDir, 'post-3-horarios.png'));
  
  console.log('✓ Post 3: Horarios (1080x1080)');
}

// ============ EJECUTAR TODO ============
async function main() {
  await createFacebookCover();
  await createPostBienvenida();
  await createPostCatalogo();
  await createPostHorarios();
  console.log('\n✅ Todas las imágenes creadas en download/redes-sociales/');
}

main().catch(console.error);
