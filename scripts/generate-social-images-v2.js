const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = 'public/logo.png';
const outputDir = 'download/redes-sociales';
const logoBase64 = fs.readFileSync(logoPath).toString('base64');

// Colores de la marca
const C = {
  ocean950: '#082f49',
  ocean900: '#0c4a6e',
  ocean800: '#155e75',
  ocean700: '#0e7490',
  ocean600: '#0891b2',
  ocean500: '#06b6d4',
  ocean300: '#67e8f9',
  ocean100: '#cffafe',
  amber600: '#d97706',
  amber500: '#f59e0b',
  amber400: '#fbbf24',
  amber300: '#fcd34d',
  amber200: '#fde68a',
  amber100: '#fef3c7',
  cream: '#fef9e7',
  white: '#ffffff',
  slate900: '#0f172a',
  slate700: '#334155',
  slate500: '#64748b',
  slate300: '#cbd5e1',
  slate100: '#f1f5f9',
};

// ============ 1. PORTADA DE FACEBOOK (1640x856) ============
async function createFacebookCover() {
  const w = 1640, h = 856;
  
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${C.ocean950}"/>
        <stop offset="40%" style="stop-color:${C.ocean900}"/>
        <stop offset="100%" style="stop-color:${C.ocean800}"/>
      </linearGradient>
      <linearGradient id="amberLine" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${C.amber500};stop-opacity:0"/>
        <stop offset="50%" style="stop-color:${C.amber500};stop-opacity:0.6"/>
        <stop offset="100%" style="stop-color:${C.amber500};stop-opacity:0"/>
      </linearGradient>
      <radialGradient id="logoGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:${C.ocean500};stop-opacity:0.2"/>
        <stop offset="60%" style="stop-color:${C.ocean500};stop-opacity:0.05"/>
        <stop offset="100%" style="stop-color:${C.ocean500};stop-opacity:0"/>
      </radialGradient>
      <clipPath id="circleClip">
        <circle cx="${w*0.25}" cy="${h/2}" r="120"/>
      </clipPath>
    </defs>
    
    <!-- Fondo -->
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    
    <!-- Patrón de ondas sutiles -->
    <path d="M0,200 Q410,160 820,200 T1640,200" stroke="${C.ocean700}" stroke-width="1" fill="none" opacity="0.3"/>
    <path d="M0,250 Q410,210 820,250 T1640,250" stroke="${C.ocean700}" stroke-width="1" fill="none" opacity="0.2"/>
    <path d="M0,650 Q410,690 820,650 T1640,650" stroke="${C.ocean700}" stroke-width="1" fill="none" opacity="0.3"/>
    <path d="M0,700 Q410,740 820,700 T1640,700" stroke="${C.ocean700}" stroke-width="1" fill="none" opacity="0.2"/>
    
    <!-- Glow detrás del logo -->
    <circle cx="${w*0.25}" cy="${h/2}" r="200" fill="url(#logoGlow)"/>
    
    <!-- Logo en círculo -->
    <circle cx="${w*0.25}" cy="${h/2}" r="125" fill="${C.ocean950}" stroke="${C.amber500}" stroke-width="3" opacity="0.95"/>
    <image href="data:image/png;base64,${logoBase64}" 
           x="${w*0.25 - 100}" y="${h/2 - 100}" width="200" height="200" 
           clip-path="url(#circleClip)"/>
    
    <!-- Línea divisoria sutil -->
    <rect x="${w*0.25 + 160}" y="${h/2 - 60}" width="2" height="120" fill="${C.amber500}" opacity="0.4"/>
    
    <!-- Texto lado derecho -->
    <text x="${w*0.25 + 200}" y="${h/2 - 80}" 
          font-family="Georgia, serif" font-size="56" font-weight="bold" fill="${C.white}">
      Mariscos Quiroa
    </text>
    
    <text x="${w*0.25 + 200}" y="${h/2 - 20}" 
          font-family="Arial, sans-serif" font-size="26" fill="${C.amber400}" font-style="italic">
      El sabor del Pacífico en cada pedido
    </text>
    
    <!-- Línea ámbar decorativa -->
    <rect x="${w*0.25 + 200}" y="${h/2 + 5}" width="400" height="2" fill="url(#amberLine)"/>
    
    <!-- Info de contacto -->
    <text x="${w*0.25 + 200}" y="${h/2 + 50}" 
          font-family="Arial, sans-serif" font-size="20" fill="${C.white}" opacity="0.85">
      Pescados y mariscos frescos · Mayoreo y menudeo
    </text>
    
    <text x="${w*0.25 + 200}" y="${h/2 + 90}" 
          font-family="Arial, sans-serif" font-size="18" fill="${C.ocean300}" opacity="0.8">
      📍 Carretera Tijuana-Ensenada, Popotla, Rosarito, BC
    </text>
    
    <text x="${w*0.25 + 200}" y="${h/2 + 125}" 
          font-family="Arial, sans-serif" font-size="18" fill="${C.ocean300}" opacity="0.8">
      📲 (663) 699-9689  ·  mariscosquiroa.com
    </text>
    
    <!-- Badge horario -->
    <rect x="${w*0.25 + 200}" y="${h/2 + 155}" width="360" height="36" rx="18" 
          fill="${C.amber500}" opacity="0.15"/>
    <text x="${w*0.25 + 380}" y="${h/2 + 179}" text-anchor="middle"
          font-family="Arial, sans-serif" font-size="16" fill="${C.amber400}">
      Lun-Vie 9-6 · Sáb-Dom 8-6 · Jueves cerrado
    </text>
  </svg>`;
  
  await sharp(Buffer.from(svg)).png().toFile(path.join(outputDir, 'portada-facebook.png'));
  console.log('✓ Portada Facebook (1640x856) — rediseñada');
}

// ============ 2. POST BIENVENIDA (1080x1080) ============
async function createPostBienvenida() {
  const w = 1080, h = 1080;
  const cx = w/2;
  
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${C.ocean950}"/>
        <stop offset="60%" style="stop-color:${C.ocean900}"/>
        <stop offset="100%" style="stop-color:${C.ocean950}"/>
      </linearGradient>
      <radialGradient id="centerGlow" cx="50%" cy="35%" r="40%">
        <stop offset="0%" style="stop-color:${C.ocean600};stop-opacity:0.25"/>
        <stop offset="100%" style="stop-color:${C.ocean600};stop-opacity:0"/>
      </radialGradient>
      <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${C.amber500};stop-opacity:0"/>
        <stop offset="50%" style="stop-color:${C.amber500};stop-opacity:0.6"/>
        <stop offset="100%" style="stop-color:${C.amber500};stop-opacity:0"/>
      </linearGradient>
      <clipPath id="circleClip1">
        <circle cx="${cx}" cy="320" r="110"/>
      </clipPath>
    </defs>
    
    <rect width="${w}" height="${h}" fill="url(#bg1)"/>
    
    <!-- Ondas sutiles de fondo -->
    <g opacity="0.15">
      <path d="M0,150 Q270,110 540,150 T1080,150" stroke="${C.ocean500}" stroke-width="1" fill="none"/>
      <path d="M0,950 Q270,990 540,950 T1080,950" stroke="${C.ocean500}" stroke-width="1" fill="none"/>
      <path d="M0,200 Q270,160 540,200 T1080,200" stroke="${C.ocean500}" stroke-width="1" fill="none"/>
      <path d="M0,900 Q270,940 540,900 T1080,900" stroke="${C.ocean500}" stroke-width="1" fill="none"/>
    </g>
    
    <!-- Glow central -->
    <rect width="${w}" height="${h}" fill="url(#centerGlow)"/>
    
    <!-- Círculo decorativo exterior -->
    <circle cx="${cx}" cy="320" r="150" fill="none" stroke="${C.ocean600}" stroke-width="1" opacity="0.3"/>
    <circle cx="${cx}" cy="320" r="135" fill="none" stroke="${C.ocean600}" stroke-width="1" opacity="0.2"/>
    
    <!-- Logo en círculo -->
    <circle cx="${cx}" cy="320" r="115" fill="${C.ocean950}" stroke="${C.amber500}" stroke-width="2.5" opacity="0.95"/>
    <image href="data:image/png;base64,${logoBase64}" 
           x="${cx - 92}" y="228" width="184" height="184" 
           clip-path="url(#circleClip1)"/>
    
    <!-- Línea ámbar -->
    <rect x="290" y="490" width="500" height="2" fill="url(#amberGrad)"/>
    
    <!-- Texto -->
    <text x="${cx}" y="570" text-anchor="middle" 
          font-family="Georgia, serif" font-size="52" font-weight="bold" fill="${C.white}">
      Mariscos Quiroa
    </text>
    
    <text x="${cx}" y="625" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="28" fill="${C.amber400}" font-style="italic">
      El sabor del Pacífico en cada pedido
    </text>
    
    <!-- Separador -->
    <line x1="380" y1="670" x2="700" y2="670" stroke="${C.ocean600}" stroke-width="1" opacity="0.5"/>
    
    <!-- Info -->
    <text x="${cx}" y="730" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="26" fill="${C.white}" opacity="0.9">
      Pescados y mariscos frescos
    </text>
    <text x="${cx}" y="770" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="26" fill="${C.white}" opacity="0.9">
      en Playas de Rosarito, BC
    </text>
    
    <!-- Badges -->
    <rect x="300" y="820" width="190" height="42" rx="21" fill="${C.ocean700}" opacity="0.6"/>
    <text x="395" y="848" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="${C.white}">📦 Mayoreo</text>
    
    <rect x="590" y="820" width="190" height="42" rx="21" fill="${C.amber600}" opacity="0.6"/>
    <text x="685" y="848" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="${C.white}">🏠 Menudeo</text>
    
    <!-- CTA -->
    <rect x="340" y="910" width="400" height="2" fill="url(#amberGrad)"/>
    
    <text x="${cx}" y="965" text-anchor="middle" 
          font-family="Georgia, serif" font-size="30" font-weight="bold" fill="${C.amber500}">
      mariscosquiroa.com
    </text>
    
    <text x="${cx}" y="1010" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="22" fill="${C.white}" opacity="0.7">
      📲 (663) 699-9689
    </text>
  </svg>`;
  
  await sharp(Buffer.from(svg)).png().toFile(path.join(outputDir, 'post-1-bienvenida.png'));
  console.log('✓ Post 1: Bienvenida — rediseñado');
}

// ============ 3. POST CATÁLOGO (1080x1080) ============
async function createPostCatalogo() {
  const w = 1080, h = 1080;
  
  const products = [
    { emoji: '🦐', name: 'Camarón', price: 'desde $220/kg' },
    { emoji: '🐙', name: 'Pulpo', price: 'desde $380/kg' },
    { emoji: '🦑', name: 'Calamar', price: 'desde $95/kg' },
    { emoji: '🐚', name: 'Callo de Hacha', price: 'de temporada' },
    { emoji: '🦪', name: 'Almeja', price: 'desde $140/kg' },
    { emoji: '🦪', name: 'Ostiones', price: 'desde $180/doc' },
    { emoji: '🐟', name: 'Pescados Frescos', price: 'desde $160/kg' },
    { emoji: '🍣', name: 'Especialidades', price: 'bajo pedido' },
  ];
  
  let productRows = '';
  products.forEach((p, i) => {
    const y = 260 + i * 72;
    const bgOpacity = i % 2 === 0 ? '0.06' : '0.03';
    productRows += `
      <rect x="80" y="${y - 30}" width="920" height="60" rx="8" fill="${C.white}" opacity="${bgOpacity}"/>
      <text x="120" y="${y + 10}" font-family="Arial, sans-serif" font-size="28" fill="${C.white}">${p.emoji}  ${p.name}</text>
      <text x="920" y="${y + 10}" text-anchor="end" font-family="Arial, sans-serif" font-size="22" fill="${C.amber400}">${p.price}</text>
    `;
  });
  
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${C.ocean950}"/>
        <stop offset="100%" style="stop-color:${C.ocean900}"/>
      </linearGradient>
      <linearGradient id="amberGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${C.amber500};stop-opacity:0"/>
        <stop offset="50%" style="stop-color:${C.amber500};stop-opacity:0.6"/>
        <stop offset="100%" style="stop-color:${C.amber500};stop-opacity:0"/>
      </linearGradient>
    </defs>
    
    <rect width="${w}" height="${h}" fill="url(#bg2)"/>
    
    <!-- Header con franja ámbar sutil -->
    <rect x="0" y="0" width="${w}" height="120" fill="${C.ocean900}" opacity="0.5"/>
    <rect x="0" y="120" width="${w}" height="2" fill="url(#amberGrad2)"/>
    
    <!-- Título -->
    <text x="${w/2}" y="75" text-anchor="middle" 
          font-family="Georgia, serif" font-size="42" font-weight="bold" fill="${C.cream}">
      Nuestro Catálogo
    </text>
    
    <text x="${w/2}" y="110" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="20" fill="${C.amber500}" opacity="0.9">
      Productos frescos del Pacífico mexicano
    </text>
    
    <!-- Productos -->
    ${productRows}
    
    <!-- Separador -->
    <rect x="80" y="870" width="920" height="2" fill="url(#amberGrad2)"/>
    
    <!-- Footer -->
    <rect x="0" y="900" width="${w}" height="180" fill="${C.ocean950}" opacity="0.6"/>
    
    <text x="${w/2}" y="955" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="26" fill="${C.white}">
      Mayoreo y menudeo · Entrega a domicilio
    </text>
    
    <text x="${w/2}" y="1010" text-anchor="middle" 
          font-family="Georgia, serif" font-size="30" font-weight="bold" fill="${C.amber500}">
      mariscosquiroa.com · (663) 699-9689
    </text>
    
    <text x="${w/2}" y="1055" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="18" fill="${C.ocean300}" opacity="0.7">
      Playas de Rosarito, Baja California
    </text>
  </svg>`;
  
  await sharp(Buffer.from(svg)).png().toFile(path.join(outputDir, 'post-2-catalogo.png'));
  console.log('✓ Post 2: Catálogo — rediseñado');
}

// ============ 4. POST HORARIOS (1080x1080) ============
async function createPostHorarios() {
  const w = 1080, h = 1080;
  const cx = w/2;
  
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg3" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${C.ocean900}"/>
        <stop offset="50%" style="stop-color:${C.ocean950}"/>
        <stop offset="100%" style="stop-color:${C.ocean900}"/>
      </linearGradient>
      <linearGradient id="amberGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${C.amber500};stop-opacity:0"/>
        <stop offset="50%" style="stop-color:${C.amber500};stop-opacity:0.6"/>
        <stop offset="100%" style="stop-color:${C.amber500};stop-opacity:0"/>
      </linearGradient>
      <radialGradient id="centerGlow3" cx="50%" cy="50%" r="40%">
        <stop offset="0%" style="stop-color:${C.ocean600};stop-opacity:0.15"/>
        <stop offset="100%" style="stop-color:${C.ocean600};stop-opacity:0"/>
      </radialGradient>
    </defs>
    
    <rect width="${w}" height="${h}" fill="url(#bg3)"/>
    <rect width="${w}" height="${h}" fill="url(#centerGlow3)"/>
    
    <!-- Ondas decorativas -->
    <g opacity="0.1">
      <path d="M0,100 Q270,60 540,100 T1080,100" stroke="${C.ocean500}" stroke-width="1" fill="none"/>
      <path d="M0,980 Q270,1020 540,980 T1080,980" stroke="${C.ocean500}" stroke-width="1" fill="none"/>
    </g>
    
    <!-- Línea ámbar superior -->
    <rect x="200" y="130" width="680" height="2" fill="url(#amberGrad3)"/>
    
    <!-- Título -->
    <text x="${cx}" y="200" text-anchor="middle" 
          font-family="Georgia, serif" font-size="44" font-weight="bold" fill="${C.cream}">
      Horarios de Atención
    </text>
    
    <text x="${cx}" y="245" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="22" fill="${C.amber500}" opacity="0.8">
      Mariscos Quiroa · Playas de Rosarito
    </text>
    
    <!-- Cards de horarios -->
    <g font-family="Arial, sans-serif">
      <!-- Lun-Vie -->
      <rect x="140" y="300" width="800" height="90" rx="16" fill="${C.white}" opacity="0.08"/>
      <rect x="140" y="300" width="6" height="90" rx="3" fill="${C.ocean500}"/>
      <text x="180" y="355" font-size="30" fill="${C.white}">📅  Lunes a Viernes</text>
      <text x="900" y="355" text-anchor="end" font-size="32" font-weight="bold" fill="${C.amber400}">9:00 - 6:00</text>
      
      <!-- Jueves -->
      <rect x="140" y="410" width="800" height="90" rx="16" fill="${C.white}" opacity="0.08"/>
      <rect x="140" y="410" width="6" height="90" rx="3" fill="${C.amber600}"/>
      <text x="180" y="465" font-size="30" fill="${C.white}">📅  Jueves</text>
      <text x="900" y="465" text-anchor="end" font-size="32" font-weight="bold" fill="${C.amber400}">CERRADO</text>
      
      <!-- Sáb-Dom -->
      <rect x="140" y="520" width="800" height="90" rx="16" fill="${C.white}" opacity="0.08"/>
      <rect x="140" y="520" width="6" height="90" rx="3" fill="${C.ocean500}"/>
      <text x="180" y="575" font-size="30" fill="${C.white}">📅  Sábado y Domingo</text>
      <text x="900" y="575" text-anchor="end" font-size="32" font-weight="bold" fill="${C.amber400}">8:00 - 6:00</text>
    </g>
    
    <!-- Separador -->
    <rect x="200" y="650" width="680" height="2" fill="url(#amberGrad3)"/>
    
    <!-- Badge 24/7 -->
    <rect x="290" y="690" width="500" height="65" rx="32" fill="${C.amber500}" opacity="0.12"/>
    <circle cx="340" cy="722" r="8" fill="${C.amber400}">
      <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
    </circle>
    <text x="${cx}" y="730" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="24" fill="${C.amber400}">
      🤖  Atención online con IA: 24/7
    </text>
    
    <!-- Ubicación -->
    <text x="${cx}" y="830" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="24" fill="${C.white}" opacity="0.85">
      📍 Carretera Tijuana-Ensenada, Popotla
    </text>
    <text x="${cx}" y="870" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="24" fill="${C.white}" opacity="0.85">
      Playas de Rosarito, Baja California
    </text>
    
    <!-- CTA -->
    <rect x="200" y="920" width="680" height="2" fill="url(#amberGrad3)"/>
    
    <text x="${cx}" y="975" text-anchor="middle" 
          font-family="Georgia, serif" font-size="28" font-weight="bold" fill="${C.amber500}">
      mariscosquiroa.com
    </text>
    
    <text x="${cx}" y="1020" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="22" fill="${C.white}" opacity="0.7">
      📲 (663) 699-9689
    </text>
  </svg>`;
  
  await sharp(Buffer.from(svg)).png().toFile(path.join(outputDir, 'post-3-horarios.png'));
  console.log('✓ Post 3: Horarios — rediseñado');
}

// ============ EJECUTAR ============
async function main() {
  await createFacebookCover();
  await createPostBienvenida();
  await createPostCatalogo();
  await createPostHorarios();
  console.log('\n✅ Las 4 imágenes rediseñadas en download/redes-sociales/');
}

main().catch(console.error);
