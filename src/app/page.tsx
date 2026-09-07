"use client";

import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Differentiators } from "@/components/site/Differentiators";
import { ProductCatalog } from "@/components/site/ProductCatalog";
import { SalesChannels } from "@/components/site/SalesChannels";
import { About } from "@/components/site/About";
import { Coverage } from "@/components/site/Coverage";
import { Testimonials } from "@/components/site/Testimonials";
import { BrandEcosystem } from "@/components/site/BrandEcosystem";
import { Faq } from "@/components/site/Faq";
import { Location } from "@/components/site/Location";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { CartButton } from "@/components/site/CartButton";
import { CartDrawer } from "@/components/site/CartDrawer";
import { ChatWidget } from "@/components/site/ChatWidget";
import { OceanCanvas } from "@/components/site/OceanCanvas";
import { OceanPreloader } from "@/components/site/OceanPreloader";
import { OceanCursor } from "@/components/site/OceanCursor";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Pantalla de carga "Sumergiéndote…" */}
      <OceanPreloader />
      {/* Cursor personalizado "gota del océano" (solo puntero fino) */}
      <OceanCursor />
      {/* Fondo interactivo del océano (canvas fijo detrás de todo) */}
      <OceanCanvas />
      <Navbar />
      <main className="relative z-10 flex-1">
        {/* Hero inmersivo: transparente para dejar ver el canvas del océano */}
        <Hero />
        {/* Tema oscuro "Océano Interactivo": las secciones son translúcidas y
            dejan ver el canvas del océano detrás. */}
        <div className="relative z-10">
          <Differentiators />
          <ProductCatalog />
          <SalesChannels />
          <About />
          <Coverage />
          <Testimonials />
          <BrandEcosystem />
          <Faq />
          <Location />
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
      <CartButton />
      <CartDrawer />
      <ChatWidget />
    </div>
  );
}
