const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = 'public/logo.png';
const outputDir = 'download/redes-sociales';
const logoBase64 = fs.readFileSync(logoPath).toString('base64');

const C = {
  navy: '#0a1929',
  ocean950: '#082f49',
  ocean900: '#0c4a6e',
  ocean800: '#155e75',
  ocean700: '#0e7490',
  ocean600: '#0891b2',
  ocean300: '#67e8f9',
  gold: '#c8a951',
  goldLight: '#e6c870',
  goldDark: '#9a7e3b',
  cream: '#f5f0e1',
  white: '#ffffff',
};

async function createFacebookCover() {
  const w = 1640, h = 856;
  // Zona segura: Facebook recorta los lados en móvil
  // Safe zone: del 25% al 75% del ancho (410px a 1230px)
  const safeLeft = 410;
  const safeRight = 1230;
  const safeCenter = (safeLeft + safeRight) / 2; // 820
  
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
      <filter id="shadow">
        <feGaussianBlur in="SourceAlpha" stdDeviation="8"/>
        <feOffset dx="0" dy="4" result="offsetblur"/>
        <feFlood flood-color="${C.navy}" flood-opacity="0.5"/>
        <feComposite in2="offsetblur" operator="in"/>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <clipPath id="circleClip">
        <circle cx="${safeCenter}" cy="300" r="90"/>
      </clipPath>
    </defs>
    
    <!-- Fondo -->
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    
    <!-- Patrón de líneas diagonales sutiles -->
    <g opacity="0.04">
      ${Array.from({length: 20}, (_, i) => {
        const x = i * 100;
        return `<line x1="${x}" y1="0" x2="${x - 200}" y2="${h}" stroke="${C.gold}" stroke-width="0.5"/>`;
      }).join('')}
    </g>
    
    <!-- Viñeta -->
    <rect width="${w}" height="${h}" fill="url(#vignette)"/>
    
    <!-- ====== TODO EL CONTENIDO CENTRADO EN ZONA SEGURA ====== -->
    
    <!-- Sombra del círculo del logo -->
    <circle cx="${safeCenter}" cy="303" r="93" fill="${C.navy}" opacity="0.4" filter="url(#shadow)"/>
    
    <!-- Anillo dorado -->
    <circle cx="${safeCenter}" cy="300" r="93" fill="none" stroke="${C.gold}" stroke-width="1.5" opacity="0.6"/>
    <circle cx="${safeCenter}" cy="300" r="88" fill="none" stroke="${C.gold}" stroke-width="0.5" opacity="0.3"/>
    
    <!-- Círculo con logo -->
    <circle cx="${safeCenter}" cy="300" r="85" fill="${C.ocean950}"/>
    <image href="data:image/png;base64,${logoBase64}" 
           x="${safeCenter - 68}" y="232" width="136" height="136" 
           clip-path="url(#circleClip)"/>
    
    <!-- Línea dorada divisoria -->
    <rect x="${safeCenter - 200}" y="430" width="400" height="1" fill="url(#goldLine)"/>
    
    <!-- Nombre -->
    <g filter="url(#shadow)">
      <text x="${safeCenter}" y="510" text-anchor="middle" 
            font-family="Georgia, serif" font-size="48" font-weight="bold" fill="${C.white}" letter-spacing="1">
        Mariscos Quiroa
      </text>
    </g>
    
    <!-- Eslogan -->
    <text x="${safeCenter}" y="555" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="22" fill="${C.gold}" font-style="italic" letter-spacing="2">
      El sabor del Pacífico en cada pedido
    </text>
    
    <!-- Línea ámbar -->
    <rect x="${safeCenter - 150}" y="580" width="300" height="1" fill="url(#goldLine)"/>
    
    <!-- Info de contacto -->
    <text x="${safeCenter}" y="625" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="18" fill="${C.white}" opacity="0.7">
      Pescados y mariscos frescos · Mayoreo y menudeo
    </text>
    
    <text x="${safeCenter}" y="665" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="16" fill="${C.ocean300}" opacity="0.6">
      📍 Carretera Tijuana-Ensenada, Popotla, Rosarito, BC
    </text>
    
    <text x="${safeCenter}" y="695" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="16" fill="${C.ocean300}" opacity="0.6">
      📲 (663) 699-9689  ·  mariscosquiroa.com
    </text>
    
    <!-- Horarios -->
    <text x="${safeCenter}" y="730" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="14" fill="${C.gold}" opacity="0.8" letter-spacing="1">
      LUN-VIE 9-6  ·  SÁB-DOM 8-6  ·  JUEVES CERRADO
    </text>
  </svg>`;
  
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toFile(path.join(outputDir, 'portada-facebook.png'));
  
  const size = fs.statSync(path.join(outputDir, 'portada-facebook.png')).size;
  console.log(`✓ Portada Facebook rediseñada (${(size/1024).toFixed(0)} KB) — contenido centrado en zona segura`);
}

createFacebookCover().catch(console.error);
