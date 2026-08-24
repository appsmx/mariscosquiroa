const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = 'public/logo.png';
const outputDir = 'download/redes-sociales';
const logoBase64 = fs.readFileSync(logoPath).toString('base64');

// Paleta refinada — más sobria y profesional
const C = {
  navy: '#0a1929',
  ocean950: '#082f49',
  ocean900: '#0c4a6e',
  ocean800: '#155e75',
  ocean700: '#0e7490',
  ocean600: '#0891b2',
  ocean500: '#06b6d4',
  ocean300: '#67e8f9',
  ocean100: '#cffafe',
  gold: '#c8a951',       // Dorado más sobrio (no amarillo brillante)
  goldLight: '#e6c870',
  goldDark: '#9a7e3b',
  amber600: '#d97706',
  amber500: '#f59e0b',
  amber400: '#fbbf24',
  cream: '#f5f0e1',
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
        <stop offset="0%" style="stop-color:${C.navy}"/>
        <stop offset="50%" style="stop-color:${C.ocean950}"/>
        <stop offset="100%" style="stop-color:${C.ocean900}"/>
      </linearGradient>
      <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${C.gold};stop-opacity:0"/>
        <stop offset="30%" style="stop-color:${C.gold};stop-opacity:0.5"/>
        <stop offset="70%" style="stop-color:${C.gold};stop-opacity:0.5"/>
        <stop offset="100%" style="stop-color:${C.gold};stop-opacity:0"/>
      </linearGradient>
      <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
        <stop offset="60%" style="stop-color:${C.ocean950};stop-opacity:0"/>
        <stop offset="100%" style="stop-color:${C.navy};stop-opacity:0.6"/>
      </radialGradient>
      <linearGradient id="circleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${C.ocean900}"/>
        <stop offset="100%" style="stop-color:${C.ocean950}"/>
      </linearGradient>
      <filter id="shadow">
        <feGaussianBlur in="SourceAlpha" stdDeviation="8"/>
        <feOffset dx="0" dy="4" result="offsetblur"/>
        <feFlood flood-color="${C.navy}" flood-opacity="0.5"/>
        <feComposite in2="offsetblur" operator="in"/>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <clipPath id="circleClip">
        <circle cx="${w*0.22}" cy="${h/2}" r="110"/>
      </clipPath>
    </defs>
    
    <!-- Fondo -->
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    
    <!-- Patrón de líneas sutiles diagonales -->
    <g opacity="0.04">
      ${Array.from({length: 20}, (_, i) => {
        const x = i * 100;
        return `<line x1="${x}" y1="0" x2="${x - 200}" y2="${h}" stroke="${C.gold}" stroke-width="0.5"/>`;
      }).join('')}
    </g>
    
    <!-- Ondas muy sutiles -->
    <g opacity="0.06">
      <path d="M0,180 Q410,140 820,180 T1640,180" stroke="${C.ocean500}" stroke-width="1" fill="none"/>
      <path d="M0,680 Q410,720 820,680 T1640,680" stroke="${C.ocean500}" stroke-width="1" fill="none"/>
    </g>
    
    <!-- Viñeta -->
    <rect width="${w}" height="${h}" fill="url(#vignette)"/>
    
    <!-- Sombra del círculo del logo -->
    <circle cx="${w*0.22}" cy="${h/2}" r="115" fill="${C.navy}" opacity="0.4" filter="url(#shadow)"/>
    
    <!-- Anillo dorado exterior -->
    <circle cx="${w*0.22}" cy="${h/2}" r="118" fill="none" stroke="${C.gold}" stroke-width="1.5" opacity="0.6"/>
    <circle cx="${w*0.22}" cy="${h/2}" r="113" fill="none" stroke="${C.gold}" stroke-width="0.5" opacity="0.3"/>
    
    <!-- Círculo interior -->
    <circle cx="${w*0.22}" cy="${h/2}" r="110" fill="url(#circleGrad)"/>
    <image href="data:image/png;base64,${logoBase64}" 
           x="${w*0.22 - 88}" y="${h/2 - 88}" width="176" height="176" 
           clip-path="url(#circleClip)"/>
    
    <!-- Línea vertical divisoria -->
    <line x1="${w*0.22 + 155}" y1="${h/2 - 100}" x2="${w*0.22 + 155}" y2="${h/2 + 100}" 
          stroke="${C.gold}" stroke-width="1" opacity="0.3"/>
    
    <!-- Contenido textual -->
    <g filter="url(#shadow)">
      <text x="${w*0.22 + 185}" y="${h/2 - 70}" 
            font-family="Georgia, serif" font-size="52" font-weight="bold" fill="${C.white}">
        Mariscos Quiroa
      </text>
    </g>
    
    <text x="${w*0.22 + 185}" y="${h/2 - 15}" 
          font-family="Arial, sans-serif" font-size="22" fill="${C.gold}" font-style="italic" letter-spacing="2">
      El sabor del Pacífico en cada pedido
    </text>
    
    <!-- Línea ámbar -->
    <rect x="${w*0.22 + 185}" y="${h/2 + 8}" width="380" height="1" fill="url(#goldLine)"/>
    
    <text x="${w*0.22 + 185}" y="${h/2 + 45}" 
          font-family="Arial, sans-serif" font-size="18" fill="${C.white}" opacity="0.7">
      Pescados y mariscos frescos · Mayoreo y menudeo
    </text>
    
    <text x="${w*0.22 + 185}" y="${h/2 + 80}" 
          font-family="Arial, sans-serif" font-size="16" fill="${C.ocean300}" opacity="0.6">
      Carretera Tijuana-Ensenada, Popotla, Rosarito, BC
    </text>
    
    <text x="${w*0.22 + 185}" y="${h/2 + 112}" 
          font-family="Arial, sans-serif" font-size="16" fill="${C.ocean300}" opacity="0.6">
      (663) 699-9689  ·  mariscosquiroa.com
    </text>
    
    <!-- Badge de horario minimalista -->
    <text x="${w*0.22 + 185}" y="${h/2 + 152}" 
          font-family="Arial, sans-serif" font-size="14" fill="${C.gold}" opacity="0.8" letter-spacing="1">
      LUN-VIE 9-6  ·  SÁB-DOM 8-6  ·  JUEVES CERRADO
    </text>
  </svg>`;
  
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toFile(path.join(outputDir, 'portada-facebook.png'));
  
  const size = fs.statSync(path.join(outputDir, 'portada-facebook.png')).size;
  console.log(`✓ Portada Facebook (${(size/1024).toFixed(0)} KB)`);
}

// ============ 2. POST BIENVENIDA (1080x1080) ============
async function createPostBienvenida() {
  const w = 1080, h = 1080;
  const cx = w/2;
  
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${C.navy}"/>
        <stop offset="50%" style="stop-color:${C.ocean950}"/>
        <stop offset="100%" style="stop-color:${C.navy}"/>
      </linearGradient>
      <radialGradient id="glow1" cx="50%" cy="30%" r="50%">
        <stop offset="0%" style="stop-color:${C.ocean700};stop-opacity:0.15"/>
        <stop offset="100%" style="stop-color:${C.ocean700};stop-opacity:0"/>
      </radialGradient>
      <linearGradient id="goldLine1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${C.gold};stop-opacity:0"/>
        <stop offset="50%" style="stop-color:${C.gold};stop-opacity:0.4"/>
        <stop offset="100%" style="stop-color:${C.gold};stop-opacity:0"/>
      </linearGradient>
      <filter id="shadow1">
        <feGaussianBlur in="SourceAlpha" stdDeviation="6"/>
        <feOffset dx="0" dy="3" result="offsetblur"/>
        <feFlood flood-color="${C.navy}" flood-opacity="0.4"/>
        <feComposite in2="offsetblur" operator="in"/>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <clipPath id="circleClip1">
        <circle cx="${cx}" cy="300" r="100"/>
      </clipPath>
    </defs>
    
    <rect width="${w}" height="${h}" fill="url(#bg1)"/>
    <rect width="${w}" height="${h}" fill="url(#glow1)"/>
    
    <!-- Líneas diagonales sutiles -->
    <g opacity="0.03">
      ${Array.from({length: 15}, (_, i) => {
        const x = i * 80;
        return `<line x1="${x}" y1="0" x2="${x - 150}" y2="${h}" stroke="${C.gold}" stroke-width="0.5"/>`;
      }).join('')}
    </g>
    
    <!-- Anillos concéntricos del logo -->
    <circle cx="${cx}" cy="300" r="140" fill="none" stroke="${C.ocean700}" stroke-width="0.5" opacity="0.3"/>
    <circle cx="${cx}" cy="300" r="125" fill="none" stroke="${C.ocean700}" stroke-width="0.5" opacity="0.2"/>
    
    <!-- Sombra del círculo -->
    <circle cx="${cx}" cy="303" r="103" fill="${C.navy}" opacity="0.3" filter="url(#shadow1)"/>
    
    <!-- Anillo dorado -->
    <circle cx="${cx}" cy="300" r="103" fill="none" stroke="${C.gold}" stroke-width="1.5" opacity="0.5"/>
    
    <!-- Círculo interior con logo -->
    <circle cx="${cx}" cy="300" r="100" fill="${C.ocean950}"/>
    <image href="data:image/png;base64,${logoBase64}" 
           x="${cx - 80}" y="220" width="160" height="160" 
           clip-path="url(#circleClip1)"/>
    
    <!-- Línea dorada -->
    <rect x="320" y="470" width="440" height="1" fill="url(#goldLine1)"/>
    
    <!-- Nombre con sombra -->
    <g filter="url(#shadow1)">
      <text x="${cx}" y="550" text-anchor="middle" 
            font-family="Georgia, serif" font-size="48" font-weight="bold" fill="${C.white}" letter-spacing="1">
        Mariscos Quiroa
      </text>
    </g>
    
    <text x="${cx}" y="600" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="24" fill="${C.gold}" font-style="italic" letter-spacing="3">
      El sabor del Pacífico en cada pedido
    </text>
    
    <!-- Separador -->
    <line x1="400" y1="645" x2="680" y2="645" stroke="${C.ocean700}" stroke-width="0.5" opacity="0.5"/>
    
    <!-- Info -->
    <text x="${cx}" y="700" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="22" fill="${C.white}" opacity="0.75">
      Pescados y mariscos frescos
    </text>
    <text x="${cx}" y="735" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="22" fill="${C.white}" opacity="0.75">
      Playas de Rosarito, Baja California
    </text>
    
    <!-- Badges minimalistas -->
    <text x="395" y="815" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="16" fill="${C.ocean300}" letter-spacing="2" opacity="0.7">
      MAYOREO
    </text>
    <line x1="470" y1="810" x2="470" y2="820" stroke="${C.gold}" stroke-width="1" opacity="0.3"/>
    <text x="685" y="815" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="16" fill="${C.gold}" letter-spacing="2" opacity="0.7">
      MENUDEO
    </text>
    
    <!-- CTA -->
    <rect x="340" y="880" width="400" height="1" fill="url(#goldLine1)"/>
    
    <text x="${cx}" y="945" text-anchor="middle" 
          font-family="Georgia, serif" font-size="28" font-weight="bold" fill="${C.gold}">
      mariscosquiroa.com
    </text>
    
    <text x="${cx}" y="985" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="20" fill="${C.white}" opacity="0.5" letter-spacing="1">
      (663) 699-9689
    </text>
  </svg>`;
  
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toFile(path.join(outputDir, 'post-1-bienvenida.png'));
  
  const size = fs.statSync(path.join(outputDir, 'post-1-bienvenida.png')).size;
  console.log(`✓ Post 1: Bienvenida (${(size/1024).toFixed(0)} KB)`);
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
    const y = 250 + i * 70;
    productRows += `
      <text x="100" y="${y}" font-family="Arial, sans-serif" font-size="26" fill="${C.white}" opacity="0.9">${p.emoji}  ${p.name}</text>
      <text x="940" y="${y}" text-anchor="end" font-family="Arial, sans-serif" font-size="22" fill="${C.gold}" opacity="0.8">${p.price}</text>
      <line x1="100" y1="${y + 15}" x2="940" y2="${y + 15}" stroke="${C.ocean700}" stroke-width="0.5" opacity="0.2"/>
    `;
  });
  
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${C.navy}"/>
        <stop offset="100%" style="stop-color:${C.ocean950}"/>
      </linearGradient>
      <linearGradient id="goldLine2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${C.gold};stop-opacity:0"/>
        <stop offset="50%" style="stop-color:${C.gold};stop-opacity:0.4"/>
        <stop offset="100%" style="stop-color:${C.gold};stop-opacity:0"/>
      </linearGradient>
      <filter id="shadow2">
        <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
        <feOffset dx="0" dy="2" result="offsetblur"/>
        <feFlood flood-color="${C.navy}" flood-opacity="0.3"/>
        <feComposite in2="offsetblur" operator="in"/>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    
    <rect width="${w}" height="${h}" fill="url(#bg2)"/>
    
    <!-- Líneas diagonales sutiles -->
    <g opacity="0.03">
      ${Array.from({length: 15}, (_, i) => {
        const x = i * 80;
        return `<line x1="${x}" y1="0" x2="${x - 150}" y2="${h}" stroke="${C.gold}" stroke-width="0.5"/>`;
      }).join('')}
    </g>
    
    <!-- Header -->
    <rect x="0" y="0" width="${w}" height="130" fill="${C.ocean950}" opacity="0.5"/>
    <rect x="100" y="130" width="${w-200}" height="1" fill="url(#goldLine2)"/>
    
    <g filter="url(#shadow2)">
      <text x="${w/2}" y="65" text-anchor="middle" 
            font-family="Georgia, serif" font-size="38" font-weight="bold" fill="${C.cream}" letter-spacing="1">
        Nuestro Catálogo
      </text>
    </g>
    
    <text x="${w/2}" y="105" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="18" fill="${C.gold}" opacity="0.7" letter-spacing="3">
      PRODUCTOS FRESCOS DEL PACÍFICO
    </text>
    
    <!-- Productos -->
    ${productRows}
    
    <!-- Separador -->
    <rect x="100" y="835" width="${w-200}" height="1" fill="url(#goldLine2)"/>
    
    <!-- Footer -->
    <text x="${w/2}" y="895" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="22" fill="${C.white}" opacity="0.6" letter-spacing="1">
      MAYOREO Y MENUDEO · ENTREGA A DOMICILIO
    </text>
    
    <text x="${w/2}" y="955" text-anchor="middle" 
          font-family="Georgia, serif" font-size="28" font-weight="bold" fill="${C.gold}">
      mariscosquiroa.com
    </text>
    
    <text x="${w/2}" y="995" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="18" fill="${C.white}" opacity="0.4" letter-spacing="2">
      (663) 699-9689  ·  PLAYAS DE ROSARITO, BC
    </text>
  </svg>`;
  
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toFile(path.join(outputDir, 'post-2-catalogo.png'));
  
  const size = fs.statSync(path.join(outputDir, 'post-2-catalogo.png')).size;
  console.log(`✓ Post 2: Catálogo (${(size/1024).toFixed(0)} KB)`);
}

// ============ 4. POST HORARIOS (1080x1080) ============
async function createPostHorarios() {
  const w = 1080, h = 1080;
  const cx = w/2;
  
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg3" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${C.ocean950}"/>
        <stop offset="50%" style="stop-color:${C.navy}"/>
        <stop offset="100%" style="stop-color:${C.ocean950}"/>
      </linearGradient>
      <linearGradient id="goldLine3" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${C.gold};stop-opacity:0"/>
        <stop offset="50%" style="stop-color:${C.gold};stop-opacity:0.4"/>
        <stop offset="100%" style="stop-color:${C.gold};stop-opacity:0"/>
      </linearGradient>
      <radialGradient id="glow3" cx="50%" cy="50%" r="40%">
        <stop offset="0%" style="stop-color:${C.ocean700};stop-opacity:0.1"/>
        <stop offset="100%" style="stop-color:${C.ocean700};stop-opacity:0"/>
      </radialGradient>
      <filter id="shadow3">
        <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
        <feOffset dx="0" dy="2" result="offsetblur"/>
        <feFlood flood-color="${C.navy}" flood-opacity="0.3"/>
        <feComposite in2="offsetblur" operator="in"/>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    
    <rect width="${w}" height="${h}" fill="url(#bg3)"/>
    <rect width="${w}" height="${h}" fill="url(#glow3)"/>
    
    <!-- Líneas diagonales sutiles -->
    <g opacity="0.03">
      ${Array.from({length: 15}, (_, i) => {
        const x = i * 80;
        return `<line x1="${x}" y1="0" x2="${x - 150}" y2="${h}" stroke="${C.gold}" stroke-width="0.5"/>`;
      }).join('')}
    </g>
    
    <!-- Línea superior -->
    <rect x="200" y="120" width="680" height="1" fill="url(#goldLine3)"/>
    
    <!-- Título -->
    <g filter="url(#shadow3)">
      <text x="${cx}" y="190" text-anchor="middle" 
            font-family="Georgia, serif" font-size="40" font-weight="bold" fill="${C.cream}" letter-spacing="1">
        Horarios de Atención
      </text>
    </g>
    
    <text x="${cx}" y="230" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="18" fill="${C.gold}" opacity="0.6" letter-spacing="3">
      MARISCOS QUIROA · PLAYAS DE ROSARITO
    </text>
    
    <!-- Cards de horarios minimalistas -->
    <g font-family="Arial, sans-serif">
      <!-- Lun-Vie -->
      <text x="160" y="340" font-size="26" fill="${C.white}" opacity="0.9" letter-spacing="1">Lunes a Viernes</text>
      <text x="920" y="340" text-anchor="end" font-size="30" font-weight="bold" fill="${C.gold}">9:00 — 6:00</text>
      <line x1="160" y1="360" x2="920" y2="360" stroke="${C.ocean700}" stroke-width="0.5" opacity="0.3"/>
      
      <!-- Jueves -->
      <text x="160" y="430" font-size="26" fill="${C.white}" opacity="0.9" letter-spacing="1">Jueves</text>
      <text x="920" y="430" text-anchor="end" font-size="30" font-weight="bold" fill="${C.goldDark}" opacity="0.8">CERRADO</text>
      <line x1="160" y1="450" x2="920" y2="450" stroke="${C.ocean700}" stroke-width="0.5" opacity="0.3"/>
      
      <!-- Sáb-Dom -->
      <text x="160" y="520" font-size="26" fill="${C.white}" opacity="0.9" letter-spacing="1">Sábado y Domingo</text>
      <text x="920" y="520" text-anchor="end" font-size="30" font-weight="bold" fill="${C.gold}">8:00 — 6:00</text>
      <line x1="160" y1="540" x2="920" y2="540" stroke="${C.ocean700}" stroke-width="0.5" opacity="0.3"/>
    </g>
    
    <!-- Separador -->
    <rect x="200" y="600" width="680" height="1" fill="url(#goldLine3)"/>
    
    <!-- Badge 24/7 minimalista -->
    <text x="${cx}" y="680" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="20" fill="${C.gold}" opacity="0.7" letter-spacing="2">
      ATENCIÓN ONLINE CON IA
    </text>
    <text x="${cx}" y="730" text-anchor="middle" 
          font-family="Georgia, serif" font-size="48" font-weight="bold" fill="${C.white}" letter-spacing="4">
      24/7
    </text>
    
    <!-- Separador -->
    <rect x="200" y="780" width="680" height="1" fill="url(#goldLine3)"/>
    
    <!-- Ubicación -->
    <text x="${cx}" y="840" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="20" fill="${C.white}" opacity="0.6" letter-spacing="1">
      Carretera Tijuana-Ensenada, Popotla
    </text>
    <text x="${cx}" y="875" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="20" fill="${C.white}" opacity="0.6" letter-spacing="1">
      Playas de Rosarito, Baja California
    </text>
    
    <!-- CTA -->
    <text x="${cx}" y="950" text-anchor="middle" 
          font-family="Georgia, serif" font-size="28" font-weight="bold" fill="${C.gold}">
      mariscosquiroa.com
    </text>
    
    <text x="${cx}" y="990" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="18" fill="${C.white}" opacity="0.4" letter-spacing="2">
      (663) 699-9689
    </text>
  </svg>`;
  
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toFile(path.join(outputDir, 'post-3-horarios.png'));
  
  const size = fs.statSync(path.join(outputDir, 'post-3-horarios.png')).size;
  console.log(`✓ Post 3: Horarios (${(size/1024).toFixed(0)} KB)`);
}

// ============ EJECUTAR ============
async function main() {
  await createFacebookCover();
  await createPostBienvenida();
  await createPostCatalogo();
  await createPostHorarios();
  console.log('\n✅ Las 4 imágenes rediseñadas (v3 — profesional)');
}

main().catch(console.error);
