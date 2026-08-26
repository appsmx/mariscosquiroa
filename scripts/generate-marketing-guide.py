#!/usr/bin/env python3
"""
Guía de Configuración del Stack de Marketing - Mariscos El Jona
Documento PDF profesional con instrucciones paso a paso para las 10 herramientas.
"""

import sys
import os

PDF_SKILL_DIR = "/home/z/my-project/skills/pdf"
_scripts = os.path.join(PDF_SKILL_DIR, "scripts")
if _scripts not in sys.path:
    sys.path.insert(0, _scripts)

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    Image, KeepTogether, ListFlowable, ListItem
)
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

# ============ PALETA (Mariscos El Jona) ============
PRIMARY = HexColor('#0d9488')  # Ocean teal
PRIMARY_DARK = HexColor('#082f49')
PRIMARY_LIGHT = HexColor('#cffafe')
ACCENT = HexColor('#d97706')  # Amber
ACCENT_LIGHT = HexColor('#fef3c7')
TEXT_PRIMARY = HexColor('#0f172a')
TEXT_MUTED = HexColor('#64748b')
BG_LIGHT = HexColor('#f8fafc')
BG_CARD = HexColor('#ffffff')
BORDER = HexColor('#e2e8f0')
SUCCESS = HexColor('#10b981')
WARNING = HexColor('#f59e0b')
ERROR = HexColor('#ef4444')

# ============ ESTILOS ============
styles = getSampleStyleSheet()

style_title = ParagraphStyle(
    'CustomTitle', parent=styles['Title'],
    fontName='Helvetica-Bold', fontSize=24, leading=28,
    textColor=PRIMARY_DARK, alignment=TA_LEFT, spaceAfter=8
)
style_h1 = ParagraphStyle(
    'H1', parent=styles['Heading1'],
    fontName='Helvetica-Bold', fontSize=18, leading=22,
    textColor=PRIMARY_DARK, spaceBefore=20, spaceAfter=10
)
style_h2 = ParagraphStyle(
    'H2', parent=styles['Heading2'],
    fontName='Helvetica-Bold', fontSize=14, leading=18,
    textColor=PRIMARY, spaceBefore=14, spaceAfter=6
)
style_h3 = ParagraphStyle(
    'H3', parent=styles['Heading3'],
    fontName='Helvetica-Bold', fontSize=12, leading=16,
    textColor=ACCENT, spaceBefore=10, spaceAfter=4
)
style_body = ParagraphStyle(
    'Body', parent=styles['Normal'],
    fontName='Helvetica', fontSize=10.5, leading=15,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceAfter=6
)
style_body_muted = ParagraphStyle(
    'BodyMuted', parent=style_body,
    textColor=TEXT_MUTED, fontSize=9.5, leading=13
)
style_step = ParagraphStyle(
    'Step', parent=style_body,
    leftIndent=20, fontSize=10.5, leading=15, spaceAfter=4
)
style_code = ParagraphStyle(
    'Code', parent=styles['Code'],
    fontName='Courier', fontSize=9, leading=12,
    textColor=PRIMARY_DARK, backColor=BG_LIGHT,
    leftIndent=10, rightIndent=10, spaceAfter=6, spaceBefore=6
)
style_tip = ParagraphStyle(
    'Tip', parent=style_body,
    fontSize=10, leading=14, textColor=TEXT_PRIMARY,
    leftIndent=10, backColor=ACCENT_LIGHT,
    borderColor=ACCENT, borderWidth=1, borderPadding=8,
    spaceBefore=6, spaceAfter=8
)
style_warning = ParagraphStyle(
    'Warning', parent=style_body,
    fontSize=10, leading=14, textColor=TEXT_PRIMARY,
    leftIndent=10, backColor=HexColor('#fee2e2'),
    borderColor=ERROR, borderWidth=1, borderPadding=8,
    spaceBefore=6, spaceAfter=8
)

# ============ DOCUMENTO ============
output_path = "/home/z/my-project/download/guia-configuracion-marketing-mariscos-el-jona.pdf"

doc = SimpleDocTemplate(
    output_path,
    pagesize=A4,
    leftMargin=20*mm, rightMargin=20*mm,
    topMargin=20*mm, bottomMargin=20*mm,
    title="Guía de Configuración del Stack de Marketing - Mariscos El Jona",
    author="Mariscos El Jona",
    subject="Configuración de herramientas de marketing digital",
    creator="Logan"
)

story = []

# ============ PORTADA ============
story.append(Spacer(1, 60*mm))

# Logo placeholder (text-based)
story.append(Paragraph(
    '<font color="#0d9488" size="48">🦐</font>',
    ParagraphStyle('Logo', alignment=TA_CENTER, fontSize=48)
))
story.append(Spacer(1, 10*mm))

story.append(Paragraph(
    'Guía de Configuración<br/>del Stack de Marketing',
    ParagraphStyle('CoverTitle', fontName='Helvetica-Bold', fontSize=28, leading=34,
                   textColor=PRIMARY_DARK, alignment=TA_CENTER)
))
story.append(Spacer(1, 5*mm))
story.append(Paragraph(
    'Mariscos El Jona',
    ParagraphStyle('CoverSubtitle', fontName='Helvetica', fontSize=16, leading=20,
                   textColor=ACCENT, alignment=TA_CENTER)
))
story.append(Spacer(1, 8*mm))
story.append(Paragraph(
    'Instrucciones paso a paso para configurar las 10 herramientas<br/>'
    'de marketing digital profesionales',
    ParagraphStyle('CoverDesc', fontName='Helvetica', fontSize=11, leading=16,
                   textColor=TEXT_MUTED, alignment=TA_CENTER)
))

story.append(Spacer(1, 30*mm))

# Info box
info_data = [
    ['Documento:', 'Guía de implementación'],
    ['Proyecto:', 'Mariscos El Jona - Plataforma Digital'],
    ['Herramientas:', '10 herramientas de marketing'],
    ['Tiempo estimado:', '8 horas con IA guiando'],
    ['Costo:', '$0 (todas las herramientas son gratuitas)'],
]
info_table = Table(info_data, colWidths=[45*mm, 100*mm])
info_table.setStyle(TableStyle([
    ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
    ('FONTSIZE', (0,0), (-1,-1), 9.5),
    ('TEXTCOLOR', (0,0), (0,-1), TEXT_MUTED),
    ('TEXTCOLOR', (1,0), (1,-1), TEXT_PRIMARY),
    ('ALIGN', (0,0), (0,-1), 'RIGHT'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING', (0,0), (-1,-1), 4),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ('LEFTPADDING', (0,0), (-1,-1), 8),
    ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ('LINEBELOW', (0,0), (-1,-2), 0.5, BORDER),
]))
story.append(info_table)

story.append(Spacer(1, 20*mm))
story.append(Paragraph(
    'Creado con Logan · Sistema operativo multi-agente para negocios',
    ParagraphStyle('Footer', fontName='Helvetica-Oblique', fontSize=8,
                   textColor=TEXT_MUTED, alignment=TA_CENTER)
))

story.append(PageBreak())

# ============ ÍNDICE ============
story.append(Paragraph('Índice', style_h1))
story.append(Spacer(1, 5*mm))

toc_items = [
    ['1.', 'Google Business Profile', '3'],
    ['2.', 'Google Analytics 4 (GA4)', '4'],
    ['3.', 'Google Tag Manager (GTM)', '5'],
    ['4.', 'Google Search Console', '6'],
    ['5.', 'Google Ads + PLA', '7'],
    ['6.', 'Merchant Center', '8'],
    ['7.', 'Meta Ads + Píxel', '9'],
    ['8.', 'WhatsApp Business API', '10'],
    ['9.', 'Looker Studio (Dashboard)', '11'],
    ['10.', 'Calendario Editorial', '12'],
    ['', 'Resumen y tiempos estimados', '13'],
]

toc_table = Table(toc_items, colWidths=[15*mm, 130*mm, 20*mm])
toc_table.setStyle(TableStyle([
    ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
    ('FONTSIZE', (0,0), (-1,-1), 10.5),
    ('TEXTCOLOR', (0,0), (0,-1), ACCENT),
    ('TEXTCOLOR', (1,0), (1,-1), TEXT_PRIMARY),
    ('TEXTCOLOR', (2,0), (2,-1), TEXT_MUTED),
    ('ALIGN', (0,0), (0,-1), 'RIGHT'),
    ('ALIGN', (2,0), (2,-1), 'RIGHT'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('LINEBELOW', (0,0), (-1,-2), 0.5, BORDER),
    ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
]))
story.append(toc_table)

story.append(PageBreak())

# ============ INTRODUCCIÓN ============
story.append(Paragraph('Introducción', style_h1))
story.append(Paragraph(
    'Esta guía contiene las instrucciones paso a paso para configurar las 10 herramientas '
    'de marketing digital que componen el stack profesional de Mariscos El Jona. '
    'Cada herramienta cumple una función específica dentro del ecosistema de marketing: '
    'atracción, medición, conversión y fidelización.',
    style_body
))
story.append(Paragraph(
    'Todas las herramientas son gratuitas o cobran únicamente por uso (publicidad pagada). '
    'No hay costos fijos de licencias. El tiempo total estimado de configuración es de '
    'aproximadamente 8 horas con asistencia de IA guiando cada paso.',
    style_body
))

story.append(Paragraph('Requisitos previos', style_h2))
story.append(Paragraph(
    'Antes de comenzar, necesitás tener:',
    style_body
))
prereqs = [
    'Acceso al email del negocio (ej: ventas@mariscoseljona.mx)',
    'Acceso al panel admin del sitio (mariscoseljona.mx/admin)',
    'El número de teléfono del negocio verificado',
    'Fotos del local y productos (mínimo 10)',
    'Una cuenta de Google (Gmail del negocio)',
    'Una cuenta de Facebook Business',
]
for p in prereqs:
    story.append(Paragraph(f'• {p}', style_step))

story.append(Spacer(1, 5*mm))
story.append(Paragraph(
    '<b>Importante:</b> Crear todas las cuentas con el email del negocio, no con emails personales. '
    'Esto asegura que el cliente mantenga control total sobre sus activos digitales.',
    style_tip
))

story.append(PageBreak())

# ============ HERRAMIENTAS ============

def add_tool(title, icon, purpose, time, difficulty, steps, tip=None, warning=None):
    """Agrega una herramienta al documento."""
    story.append(Spacer(1, 5*mm))
    story.append(Paragraph(f'{icon} {title}', style_h1))

    # Info bar
    info = [
        ['Propósito:', purpose],
        ['Tiempo:', time],
        ['Dificultad:', difficulty],
    ]
    info_table = Table(info, colWidths=[30*mm, 130*mm])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('TEXTCOLOR', (0,0), (0,-1), TEXT_MUTED),
        ('TEXTCOLOR', (1,0), (1,-1), TEXT_PRIMARY),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 4*mm))

    # Steps
    story.append(Paragraph('Pasos de configuración', style_h2))
    for i, step in enumerate(steps, 1):
        story.append(Paragraph(f'<b>{i}.</b> {step}', style_step))

    if tip:
        story.append(Paragraph(f'<b>Tip:</b> {tip}', style_tip))
    if warning:
        story.append(Paragraph(f'<b>Atención:</b> {warning}', style_warning))

    story.append(PageBreak())

# 1. Google Business Profile
add_tool(
    'Google Business Profile', '📍',
    'Aparecer en Google Maps y búsquedas locales cuando alguien busca "mariscos cerca de mí"',
    '15-20 minutos', 'Fácil',
    [
        'Andá a https://business.google.com e iniciá sesión con el email del negocio.',
        'Click en "Agregar tu empresa" o "Añadir negocio".',
        'Completá el nombre: "Mariscos El Jona".',
        'Seleccioná la categoría: "Pescadería" o "Mariscos" (escribí y elegí la sugerencia de Google).',
        'Ingresá la dirección física del negocio (Blvd. Benito Juárez 1452, Rosarito, BC).',
        'Marcá la casilla de "Atiendo a clientes en su ubicación" si hacés entregas a domicilio.',
        'Especificá el área de servicio: Rosarito, Tijuana, Ensenada, Mexicali, San Quintín.',
        'Ingresá el teléfono: (661) 612-3456 y el sitio web: mariscoseljona.mx.',
        'Google te pedirá verificar el negocio. Elegí la opción por video (más rápida) o por correo postal.',
        'Mientras se aprueba la verificación, completá el perfil: horarios, fotos, descripción, servicios.',
        'Subí mínimo 10 fotos: fachada, interior, productos, equipo.',
        'Escribí una descripción de 750 caracteres que incluya: productos, trayectoria, zona de cobertura.',
    ],
    tip='Mantené las fotos actualizadas. Los negocios con fotos recientes reciben 42% más solicitudes de indicaciones en Google Maps.',
    warning='La verificación puede tardar de 24 horas (video) a 14 días (correo postal). Planificá con tiempo.'
)

# 2. Google Analytics 4
add_tool(
    'Google Analytics 4 (GA4)', '📊',
    'Medir cuánta gente entra al sitio, qué miran, desde dónde vienen y qué acciones hacen',
    '30-40 minutos', 'Media',
    [
        'Andá a https://analytics.google.com e iniciá sesión con el email del negocio.',
        'Click en "Comenzar a medir" o "Crear cuenta".',
        'Nombre de la cuenta: "Mariscos El Jona".',
        'Nombre de la propiedad: "Sitio web Mariscos El Jona".',
        'Zona horaria: México (GMT-8). Moneda: Peso mexicano (MXN).',
        'Detalles del negocio: Tamaño "Pequeña empresa", Categoría "Comercio minorista".',
        'Objetivos: "Generar ventas" y "Ver el rendimiento del sitio".',
        'Elegí "Web" como plataforma e ingresá la URL: mariscoseljona.mx.',
        'Ingresá el nombre del stream: "Mariscos El Jona - Web".',
        'Google te dará un "ID de medición" (formato: G-XXXXXXXXXX). Anotalo.',
        'Este ID se usará en Google Tag Manager (paso 3) para instalar GA4 sin tocar código.',
        'Activá el "Enhanced Measurement" (medición mejorada) que viene por defecto.',
    ],
    tip='No necesitas instalar código manualmente. GA4 se instala a través de Google Tag Manager (siguiente paso).',
    warning='Los datos tardan 24-48 horas en aparecer después de la instalación. No te asustes si ves "0" el primer día.'
)

# 3. Google Tag Manager
add_tool(
    'Google Tag Manager (GTM)', '🏷️',
    'Conectar todas las etiquetas de tracking (GA4, Meta Pixel, Google Ads) sin tocar código',
    '30-40 minutos', 'Media',
    [
        'Andá a https://tagmanager.google.com e iniciá sesión.',
        'Click en "Crear cuenta".',
        'Nombre de la cuenta: "Mariscos El Jona".',
        'Tipo de empresa: "Comercio minorista".',
        'País: México. Zona horaria: México.',
        'Nombre del contenedor: "mariscoseljona.mx".',
        'Elegí "Web" como plataforma objetivo.',
        'Google te dará dos fragmentos de código (head y body). Copialos.',
        'Enviá estos códigos al desarrollador para que los pegue en el sitio, O instalá el código en Vercel directamente.',
        'Una vez instalado, volvé a GTM y click en "Agregar etiqueta nueva".',
        'Configurá la etiqueta de GA4: tipo "Google Analytics: evento de GA4", ID de medición = el del paso anterior.',
        'Activador: "Todas las páginas". Guardá y publicá el contenedor.',
    ],
    tip='GTM es el "centro de control" de todo el tracking. Una vez configurado, podés agregar o quitar etiquetas sin pedirle al desarrollador.',
    warning='Si no instalás los códigos de GTM en el sitio, ninguna herramienta de medición va a funcionar. Es el paso más crítico.'
)

# 4. Google Search Console
add_tool(
    'Google Search Console', '🔍',
    'Saber qué búsquedas en Google llevan gente a tu web y en qué posición aparecés',
    '15-20 minutos', 'Fácil',
    [
        'Andá a https://search.google.com/search-console e iniciá sesión.',
        'Click en "Agregar propiedad".',
        'Elegí "Prefijo de URL" e ingresá: https://mariscoseljona.mx.',
        'Método de verificación: elegí "Etiqueta HTML" o "Registro DNS".',
        'Si elegiste etiqueta HTML: copiá el código que te da Google (formato: <meta name="google-site-verification" content="...">).',
        'Enviá este código al desarrollador para que lo pegue en el <head> del sitio, O agregalo en Vercel como variable de entorno.',
        'Si elegiste registro DNS: agregá el registro TXT en el panel donde compraste el dominio.',
        'Una vez verificado (puede tardar hasta 48 horas), enviá el sitemap: https://mariscoseljona.mx/sitemap.xml.',
        'En la sección "Rendimiento" vas a ver qué búsquedas llevan tráfico al sitio.',
        'En "Cobertura" vas a ver si Google indexó todas las páginas correctamente.',
    ],
    tip='El sitemap ya está configurado en el sitio (mariscoseljona.mx/sitemap.xml). Solo tenés que enviar la URL en Search Console.',
)

# 5. Google Ads + PLA
add_tool(
    'Google Ads + PLA', '🎯',
    'Anuncios pagados cuando alguien busca "comprar pulpo" o "mariscos Rosarito" en Google',
    '45-60 minutos', 'Alta',
    [
        'Andá a https://ads.google.com e iniciá sesión con el email del negocio.',
        'Click en "Nueva campaña".',
        'Objetivo: "Ventas". Tipo de campaña: "Búsqueda".',
        'Nombre de la campaña: "Mariscos El Jona - Búsqueda".',
        'Redes: solo "Red de Búsqueda" (desactivá Display Partners).',
        'Ubicaciones: México → Baja California (o las zonas donde hacés entregas).',
        'Idiomas: Español.',
        'Presupuesto: empezá con $100-$200 MXN/día. Podés ajustar después.',
        'Estrategia de oferta: "Maximizar clics" para arrancar.',
        'Palabras clave (mínimo 15-20): "mariscos frescos Rosarito", "comprar pulpo Tijuana", "camarón mayoreo Baja California", "pescadería Rosarito", "ostiones frescos", etc.',
        'Anuncio: escribí 3 títulos (30 caracteres cada uno) y 2 descripciones (90 caracteres).',
        'Ejemplo de título: "Mariscos El Jona | Frescos del Pacífico", "Camarón y Pulpo Fresco", "Entrega a Domicilio BC".',
        'URL final: https://mariscoseljona.mx',
        'Para PLA (Product Listing Ads): necesitás Merchant Center (siguiente paso) conectado.',
        'Revisá y lanzá la campaña. Google la aprueba en 24 horas.',
    ],
    tip='Empezá con presupuesto bajo ($100-$200/día) y subí gradualmente según lo que funcione. No inviertas mucho sin ver resultados primero.',
    warning='Google Ads cobra por clic. Si configurás mal las palabras clave, podés gastar dinero rápido sin resultados. Empezá conservador.'
)

# 6. Merchant Center
add_tool(
    'Merchant Center', '🛒',
    'Catálogo de productos visible en Google Shopping, como en Mercado Libre pero en Google',
    '30-45 minutos', 'Media',
    [
        'Andá a https://merchants.google.com e iniciá sesión.',
        'Click en "Empezar" o "Crear cuenta".',
        'Nombre del negocio: "Mariscos El Jona".',
        'País: México. Zona horaria: México.',
        'Verificá el sitio web: usá Search Console (ya verificado en paso 4) o etiqueta HTML.',
        'Una vez verificado, andá a "Productos" → "Fuentes".',
        'Creá un feed de productos: nombre "Mariscos El Jona - Feed".',
        'País objetivo: México. Idioma: Español.',
        'Método de carga: "Carga programada" con URL del feed (un archivo CSV/XML que el desarrollador genera).',
        'Cada producto necesita: ID, título, descripción, precio, imagen, disponibilidad, categoría Google.',
        'Ejemplo: ID=campaign001, Título="Camarón Blanco Entero U-15", Precio=280 MXN, Disponibilidad=En stock.',
        'Conectá Merchant Center con Google Ads (paso 5) para activar PLA.',
        'Creá una campaña de Shopping en Google Ads conectada al feed de Merchant Center.',
    ],
    tip='El feed de productos se puede generar automáticamente desde el panel admin del sitio. Pedile al desarrollador que cree un endpoint /api/feed.xml.',
    warning='Google tiene reglas estrictas sobre productos de alimentos. Revisá las políticas de Merchant Center para productos perecederos.'
)

# 7. Meta Ads + Píxel
add_tool(
    'Meta Ads + Píxel', '📱',
    'Anuncios en Facebook e Instagram con seguimiento de conversiones para optimizar el presupuesto',
    '40-50 minutos', 'Media',
    [
        'Andá a https://business.facebook.com e iniciá sesión con la cuenta de Facebook Business.',
        'Entrá a "Administrador comercial" → "Configuración".',
        'En "Orígenes de datos" → "Píxeles" → click en "Agregar".',
        'Nombre del píxel: "Mariscos El Jona - Web".',
        'Copiá el ID del píxel (formato: 123456789012345).',
        'Instalá el píxel a través de Google Tag Manager (paso 3): agregá etiqueta "Píxel de Meta" con el ID.',
        'Configurá eventos: "PageView" (todas las páginas), "Lead" (cuando envían cotización), "Contact" (cuando clickean WhatsApp).',
        'Verificá que el píxel funciona con la extensión "Meta Pixel Helper" de Chrome.',
        'Para crear anuncios: andá a https://adsmanager.facebook.com.',
        'Creá una campaña: objetivo "Tráfico" o "Clientes potenciales".',
        'Nombre: "Mariscos El Jona - FB/IG".',
        'Presupuesto: $100-$200 MXN/día para arrancar.',
        'Ubicaciones: Facebook Feed, Instagram Feed, Instagram Stories.',
        'Público: personas en Baja California, 25-65 años, intereses en "mariscos", "cocina", "restaurantes".',
        'Anuncio: usá fotos reales del negocio + copy corto + CTA "Cotizar por WhatsApp".',
    ],
    tip='Los anuncios con fotos reales del negocio funcionan 3x mejor que los de banco de imágenes. Pedile fotos al cliente.',
    warning='El píxel debe estar instalado ANTES de lanzar anuncios. Si lanzás sin píxel, no podés medir qué anuncios traen clientes.'
)

# 8. WhatsApp Business API
add_tool(
    'WhatsApp Business API', '💬',
    'Mensajes automatizados: confirmaciones de pedido, recordatorios, seguimientos post-venta',
    '60-90 minutos', 'Alta',
    [
        'Necesitás una cuenta de Meta Business verificada (pasos en business.facebook.com).',
        'Andá a https://business.facebook.com/settings → "WhatsApp Business API".',
        'Click en "Configurar WhatsApp Business".',
        'Completá los datos del negocio: nombre, categoría, descripción, dirección.',
        'Verificá el número de teléfono: (661) 612-3456. No puede estar usado en otra cuenta de WhatsApp.',
        'Recibí un código de verificación por SMS o llamada.',
        'Una vez verificado, Meta aprueba la cuenta en 1-7 días hábiles.',
        'Mientras esperás, configurá los mensajes de plantilla:',
        '  - "Pedido recibido": "Hola {nombre}, recibimos tu pedido {codigo}. Te confirmamos precio y disponibilidad en breve."',
        '  - "Pedido confirmado": "Tu pedido {codigo} está confirmado. Lo preparamos y te avisamos cuando sale."',
        '  - "Pedido en ruta": "Tu pedido {codigo} va en camino. Llega en aproximadamente {tiempo}."',
        '  - "Satisfacción": "¿Cómo te fue con tu pedido {codigo}? Tu opinión nos ayuda a mejorar."',
        'Conectá WhatsApp Business API con el sitio: el desarrollador integra el envío automático de mensajes.',
        'Configurá horarios de atención: fuera de horario, mensaje automático "Te respondemos a primera hora mañana".',
    ],
    tip='La API oficial de WhatsApp Business cobra por mensaje iniciado por el negocio. Las respuestas dentro de 24h son gratuitas.',
    warning='La verificación de Meta puede tardar hasta 2 semanas. Es el paso que más tiempo lleva del stack completo.'
)

# 9. Looker Studio
add_tool(
    'Looker Studio (Dashboard)', '📈',
    'Dashboard único que une datos de Google, Meta y tu web en un solo reporte visual',
    '45-60 minutos', 'Media',
    [
        'Andá a https://lookerstudio.google.com e iniciá sesión.',
        'Click en "Crear" → "Informe" → "Fuente de datos en blanco".',
        'Conectá las fuentes:',
        '  - Google Analytics 4: para datos del sitio web (visitas, páginas, comportamiento).',
        '  - Google Ads: para rendimiento de anuncios (gasto, clics, conversiones).',
        '  - Google Search Console: para búsquedas orgánicas y posiciones.',
        '  - Facebook Ads (via conector): para rendimiento de Meta Ads.',
        'Creá las páginas del dashboard:',
        '  Página 1 - Resumen general: KPIs principales (visitas, conversiones, gasto, ROI).',
        '  Página 2 - Tráfico web: de dónde vienen los visitantes, qué páginas miran.',
        '  Página 3 - Anuncios: rendimiento de Google Ads y Meta Ads lado a lado.',
        '  Página 4 - SEO: búsquedas que traen tráfico, posiciones, oportunidades.',
        'Agregá gráficos: barras, líneas, tablas, mapas geográficos.',
        'Configurá filtros: por fecha, por canal, por producto.',
        'Compartí el dashboard con el cliente (permiso de lectura).',
        'Programá envío automático del reporte por email: semanal o mensual.',
    ],
    tip='Looker Studio es gratuito y se conecta a todas las herramientas de Google sin código. Es el diferencial que justifica el mantenimiento mensual.',
    warning='La conexión con Facebook Ads requiere un conector de terceros (algunos son pagos). Si no querés gastar, omití esa fuente y reportá Meta Ads manualmente.'
)

# 10. Calendario Editorial
add_tool(
    'Calendario Editorial', '🗓️',
    'Planeación mensual de contenido para Facebook e Instagram con propósito, no improvisado',
    '20-30 minutos', 'Fácil',
    [
        'Elegí una herramienta para el calendario:',
        '  - Opción A (gratis): Google Sheets — creá una hoja con columnas: Fecha, Red, Tipo, Contenido, Imagen, Estado, Hashtags.',
        '  - Opción B (gratis): Notion — creá una base de datos con vistas por semana/mes.',
        '  - Opción C (gratis): Trello — creá un tablero con columnas: Ideas, Borrador, Aprobado, Programado, Publicado.',
        'Definí la frecuencia: 8-12 posts al mes para Facebook + Instagram (2-3 por semana).',
        'Definí los pilares de contenido (tipos de post):',
        '  - Producto (30%): foto + descripción + precio de un producto específico.',
        '  - Educación (20%): tip de preparación, diferencia entre mayoreo/menudeo, frescura.',
        '  - Historia (15%): trayectoria, equipo, día en el puerto, detrás de escena.',
        '  - Promoción (20%): oferta, producto de temporada, combo especial.',
        '  - Interacción (15%): encuesta, pregunta, trivia, contenido generado por usuario.',
        'Planificá el primer mes con 8-12 posts específicos (fecha, contenido, imagen).',
        'Programá los posts en Meta Business Suite: https://business.facebook.com/content.',
        'Meta Business Suite permite programar para FB e Instagram al mismo tiempo.',
        'Revisá resultados cada semana: qué posts tuvieron más engagement, ajustar.',
    ],
    tip='Usá la IA para generar ideas de contenido. Pedile: "Generame 12 ideas de posts para una marisquería en Rosarito BC" y te da el mes completo.',
)

# ============ RESUMEN FINAL ============
story.append(Spacer(1, 5*mm))
story.append(Paragraph('📊 Resumen y tiempos estimados', style_h1))

story.append(Paragraph(
    'Tabla con el tiempo total de configuración del stack de marketing completo:',
    style_body
))

# Tabla de tiempos
time_data = [
    ['#', 'Herramienta', 'Tiempo', 'Dificultad'],
    ['1', 'Google Business Profile', '15-20 min', 'Fácil'],
    ['2', 'Google Analytics 4', '30-40 min', 'Media'],
    ['3', 'Google Tag Manager', '30-40 min', 'Media'],
    ['4', 'Google Search Console', '15-20 min', 'Fácil'],
    ['5', 'Google Ads + PLA', '45-60 min', 'Alta'],
    ['6', 'Merchant Center', '30-45 min', 'Media'],
    ['7', 'Meta Ads + Píxel', '40-50 min', 'Media'],
    ['8', 'WhatsApp Business API', '60-90 min', 'Alta'],
    ['9', 'Looker Studio', '45-60 min', 'Media'],
    ['10', 'Calendario Editorial', '20-30 min', 'Fácil'],
    ['', 'TOTAL', '~8 horas', ''],
]

time_table = Table(time_data, colWidths=[10*mm, 70*mm, 35*mm, 35*mm])
time_table.setStyle(TableStyle([
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 9),
    ('BACKGROUND', (0,0), (-1,0), PRIMARY_DARK),
    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
    ('FONTNAME', (0,1), (-1,-2), 'Helvetica'),
    ('FONTSIZE', (0,1), (-1,-1), 9),
    ('ALIGN', (0,0), (0,-1), 'CENTER'),
    ('ALIGN', (2,0), (3,-1), 'CENTER'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('ROWBACKGROUNDS', (0,1), (-1,-2), [colors.white, BG_LIGHT]),
    ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
    ('BACKGROUND', (0,-1), (-1,-1), ACCENT_LIGHT),
    ('TEXTCOLOR', (0,-1), (-1,-1), PRIMARY_DARK),
    ('LINEBELOW', (0,0), (-1,-1), 0.5, BORDER),
]))
story.append(time_table)

story.append(Spacer(1, 8*mm))
story.append(Paragraph('Orden recomendado de configuración', style_h2))

story.append(Paragraph(
    'Para optimizar el tiempo y evitar bloqueos, te recomiendo configurar en este orden:',
    style_body
))

order = [
    '<b>Sesión 1 (2 horas):</b> Google Business Profile + Google Analytics 4 + Google Tag Manager + Search Console. Son las bases, todas rápidas y necesarias para medir.',
    '<b>Sesión 2 (2 horas):</b> Google Ads + Merchant Center + Meta Ads + Píxel. Configuración de publicidad, necesita que GTM esté instalado primero.',
    '<b>Sesión 3 (2 horas):</b> WhatsApp Business API (arrancar la verificación que tarda semanas) + Looker Studio + Calendario Editorial.',
    '<b>Sesión 4 (1-2 horas):</b> Revisión final, primer reporte en Looker Studio, ajuste de campañas.',
]
for o in order:
    story.append(Paragraph(f'• {o}', style_step))

story.append(Spacer(1, 8*mm))
story.append(Paragraph(
    '<b>Resultado final:</b> Un sistema de marketing digital profesional, completo y conectado. '
    'Cada herramienta mide su parte, todas alimentan el dashboard de Looker Studio, '
    'y el cliente recibe un reporte mensual profesional que justifica el fee de mantenimiento.',
    style_tip
))

story.append(Spacer(1, 10*mm))
story.append(Paragraph(
    'Creado con Logan · Sistema operativo multi-agente para negocios · Mariscos El Jona 2026',
    ParagraphStyle('EndFooter', fontName='Helvetica-Oblique', fontSize=8,
                   textColor=TEXT_MUTED, alignment=TA_CENTER)
))

# ============ GENERAR ============
doc.build(story)
print(f"✅ PDF generado: {output_path}")
print(f"   Tamaño: {os.path.getsize(output_path) / 1024:.1f} KB")
