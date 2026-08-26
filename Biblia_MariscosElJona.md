# Biblia_MariscosElJona.md

**Versión:** 0.1
**Estado:** En construcción
**Propósito:** Capturar el conocimiento específico del producto Mariscos El Jona — distribuidora de pescados y mariscos en Rosarito, Baja California. Autoridad del producto (Nivel Proyecto bajo [LOGAN]).
**Fecha:** 2026-08-08

---

## 1. Visión del producto

**Mariscos El Jona** es una distribuidora de pescados y mariscos frescos en Rosarito, Baja California. Su plataforma digital integral incluye sitio web, panel administrativo, agente de IA conversacional y sistema de cotizaciones.

**Primer piloto de LOGAN** — declarado en el README del repositorio.

## 2. Usuarios objetivo

| Atributo | Descripción |
|---|---|
| Ubicación | Rosarito, Baja California |
| Tipo | Restaurantes, comercios de mariscos, cocinas industriales |
| Modalidad | Mayoreo y menudeo (switch dinámico en la plataforma) |
| Canal de contacto | WhatsApp, formulario web |

## 3. Catálogo de productos

8 productos filtrables con precios dinámicos (mayoreo/menudeo). Pendiente de documentar el catálogo específico.

## 4. Stack tecnológico

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript 5
- **Estilos:** Tailwind CSS 4 + shadcn/ui (New York)
- **Base de datos:** Prisma ORM + SQLite
- **Autenticación:** NextAuth.js v4 (Credentials Provider)
- **IA:** Z.ai SDK (GLM-4.6 agentico)
- **Iconos:** Lucide React
- **State:** Zustand (carrito) + TanStack Query
- **Fonts:** Playfair Display (display) + Geist (sans)

## 5. Características principales

### Sitio público (`/`)
- Hero con stats del negocio
- Catálogo interactivo con 8 productos filtrables
- Switch mayoreo/menudeo con precios dinámicos
- Sistema de carrito de cotización (persistente en localStorage)
- Botón flotante de WhatsApp con mensaje pre-armado
- Sección "Nosotros" con timeline (2008 → 2024)
- Mapa de cobertura de Baja California
- Testimonios
- Ecosistema de marcas (El Jona 1 + El Jona 2)
- FAQ acordeón
- Ubicación con mapa OpenStreetMap embebido
- SEO técnico: schema.org LocalBusiness + FAQPage, sitemap.xml, robots.txt
- PWA instalable como app

### Agente IA conversacional
- Chat widget flotante (esquina inferior izquierda)
- Contexto dinámico desde la base de datos (catálogo, precios, horarios)
- Prompt especializado en mariscos y tono mexicano
- Escalamiento a humano cuando no puede responder
- Acciones inline: "Ver carrito", "WhatsApp"

### Sistema de cotizaciones
- Cliente arma pedido en el sitio
- Genera código único (MEJ-2026-XXXX)
- Se guarda en base de datos
- Se envía por WhatsApp con mensaje pre-armado
- Auto-creación de clientes

### Panel admin (`/admin`)
- Login con NextAuth (email + contraseña)
- **Dashboard**: KPIs, pedidos por estado, pedidos recientes, top productos
- **Productos**: CRUD completo
- (más features pendientes de documentar)

## 6. Decisiones aprobadas

(Primeras decisiones pendientes de importar del README o registrar nuevas.)

## 7. Metodología

Este proyecto sigue **LOGAN** (Learning, Organization, Governance, Architecture & Navigation) — metodología para desarrollo de productos digitales asistidos por IA.

- Repo de LOGAN: https://github.com/appsmx/logan
- La Biblia es el documento de Nivel Proyecto bajo `[LOGAN]`.

## 8. Estado del MVP

| Componente | Estado |
|---|---|
| Sitio público (PWA) | ✅ Completo |
| Catálogo interactivo | ✅ Completo |
| Sistema de cotizaciones | ✅ Completo |
| Agente IA conversacional | ✅ Completo |
| Panel admin | ✅ Completo |
| SEO técnico | ✅ Completo |
| Biblia del proyecto | ⏠ Inicial (este documento) |

---

*Biblia_MariscosElJona.md v0.1 — creada por LOGAN OS el 2026-08-08*
*Generada automáticamente por LOGAN Core como primer paso de conexión con el producto.*
