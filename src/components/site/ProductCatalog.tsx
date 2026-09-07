"use client";

import { useState, useRef } from "react";
import {
  MessageCircle,
  Snowflake,
  Sparkles,
  Clock,
  Loader2,
  Plus,
  Check,
} from "lucide-react";
import { products as fallbackProducts, siteConfig as fallbackConfig } from "@/lib/site-data";
import { useApi } from "@/hooks/use-api";
import { useSiteConfig } from "@/hooks/use-site-config";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/site-data";
import { useI18n } from "@/i18n/I18nProvider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const categoryKeys = ["todos", "marisco", "pescado", "especialidad"] as const;

const availabilityIcons: Record<string, { icon: typeof Clock; color: string }> = {
  Diaria: { icon: Clock, color: "text-emerald-300" },
  Temporada: { icon: Sparkles, color: "text-amber-300" },
  "Bajo pedido": { icon: Snowflake, color: "text-sky-300" },
};

const mxn = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

function ProductCard({ product, config }: { product: Product; config: any }) {
  const { t, locale } = useI18n();
  const cardRef = useRef<HTMLElement | null>(null);
  const tiltRef = useRef({ rx: 0, ry: 0, tx: 0, ty: 0, raf: 0 });

  const availLabel = (availability: string): string => {
    if (availability === "Diaria") return t.catalog.daily;
    if (availability === "Temporada") return t.catalog.seasonal;
    if (availability === "Bajo pedido") return t.catalog.onOrder;
    return availability;
  };

  const waLink = `https://wa.me/${config.contact.whatsapp}?text=${encodeURIComponent(
    locale === "es"
      ? `Hola ${config.brand.name}, me interesa cotizar ${product.name}. ¿Me pueden dar precio y disponibilidad?`
      : `Hi ${config.brand.name}, I'm interested in a quote for ${product.name}. Can you give me price and availability?`
  )}`;
  const avail = availabilityIcons[product.availability] || availabilityIcons["Diaria"];
  const AvailIcon = avail.icon;
  const { channel, add } = useCart();
  const [selectedPres, setSelectedPres] = useState<string>(product.presentation[0] || "");
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);

  const channelLower = (channel || "menudeo").toLowerCase();
  const selectedPrice = product.prices?.find((p) => {
    const priceChannel = (p.channel || "").toLowerCase();
    return priceChannel === channelLower && (!p.presentation || p.presentation === selectedPres);
  });
  const unitPrice = selectedPrice?.pricePerKg ?? selectedPrice?.priceUnit ?? 0;
  const unit = selectedPrice?.unit || "kg";
  const minQty = selectedPrice?.minQuantity ?? 1;

  const handleAdd = () => {
    if (unitPrice <= 0) {
      window.open(waLink, "_blank");
      return;
    }
    add({
      productId: product.dbId,
      productName: product.name,
      presentation: selectedPres,
      quantity,
      unit,
      unitPrice,
      image: product.image,
    });
    setAdded(true);
    toast.success(
      locale === "es"
        ? `${product.name} agregado a tu cotización`
        : `${product.name} added to your quote`
    );
    setTimeout(() => setAdded(false), 1500);
  };

  // --- Tilt 3D + resplandor que sigue al cursor ---
  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === "touch") return;
    const card = cardRef.current;
    if (!card) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const st = tiltRef.current;
    st.ty = (px - 0.5) * 12;
    st.tx = (0.5 - py) * 10;
    card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
    card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
    if (!st.raf) {
      const animate = () => {
        st.rx += (st.tx - st.rx) * 0.15;
        st.ry += (st.ty - st.ry) * 0.15;
        if (card) {
          card.style.transform = `perspective(1000px) rotateX(${st.rx.toFixed(2)}deg) rotateY(${st.ry.toFixed(2)}deg)`;
        }
        if (Math.abs(st.tx - st.rx) > 0.05 || Math.abs(st.ty - st.ry) > 0.05) {
          st.raf = requestAnimationFrame(animate);
        } else {
          st.raf = 0;
        }
      };
      st.raf = requestAnimationFrame(animate);
    }
  };

  const handlePointerLeave = () => {
    const card = cardRef.current;
    const st = tiltRef.current;
    st.tx = 0;
    st.ty = 0;
    if (card && !st.raf) {
      const animate = () => {
        st.rx += (0 - st.rx) * 0.15;
        st.ry += (0 - st.ry) * 0.15;
        card.style.transform = `perspective(1000px) rotateX(${st.rx.toFixed(2)}deg) rotateY(${st.ry.toFixed(2)}deg)`;
        if (Math.abs(st.rx) > 0.05 || Math.abs(st.ry) > 0.05) {
          st.raf = requestAnimationFrame(animate);
        } else {
          st.raf = 0;
          card.style.transform = "";
        }
      };
      st.raf = requestAnimationFrame(animate);
    }
  };

  return (
    <article
      ref={cardRef}
      className="oi-product-card flex flex-col"
      data-hover
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Imagen */}
      <div className="oi-card-visual aspect-[4/3]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-abyss/90 via-abyss/20 to-transparent" />
        <span className="oi-card-badge">
          <AvailIcon className={cn("h-3 w-3", avail.color)} />
          {availLabel(product.availability)}
        </span>
        <span className="oi-card-cat capitalize">{product.category}</span>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="oi-card-title drop-shadow-md">{product.name}</h3>
          {product.scientific && <p className="oi-card-sci mt-0.5">{product.scientific}</p>}
        </div>
        <div className="oi-card-shine" />
      </div>

      {/* Cuerpo */}
      <div className="relative z-[4] flex flex-1 flex-col gap-3 p-5">
        <p className="oi-card-desc line-clamp-3">{product.description}</p>

        {/* Precio */}
        {unitPrice > 0 ? (
          <div className="oi-price-box">
            <div className="flex items-baseline justify-between">
              <span className="oi-price-label">
                {locale === "es"
                  ? `Precio ${channelLower === "mayoreo" ? "mayoreo" : "menudeo"}`
                  : `${channelLower === "mayoreo" ? "Wholesale" : "Retail"} price`}
              </span>
              <span className="oi-price-num text-xl">
                {mxn(unitPrice)}
                <span className="text-xs font-normal text-slate-400">/{unit}</span>
              </span>
            </div>
            {minQty > 1 && (
              <p className="mt-1 text-[10px] text-slate-400">
                {locale === "es" ? `Mínimo: ${minQty} ${unit}` : `Min: ${minQty} ${unit}`}
              </p>
            )}
          </div>
        ) : (
          <div className="oi-price-quote">
            {locale === "es"
              ? "Precio bajo cotización · consulta por WhatsApp"
              : "Price on request · ask on WhatsApp"}
          </div>
        )}

        {/* Presentación */}
        {product.presentation.length > 0 && (
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {locale === "es" ? "Presentación" : "Presentation"}
            </label>
            <select
              value={selectedPres}
              onChange={(e) => setSelectedPres(e.target.value)}
              className="oi-field"
            >
              {product.presentation.map((p) => (
                <option key={p} value={p} className="bg-[#071927] text-foam">
                  {p}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Cantidad */}
        {unitPrice > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {t.cart.quantity}
            </label>
            <div className="oi-stepper">
              <button
                onClick={() => setQuantity(Math.max(minQty, quantity - 1))}
                aria-label={locale === "es" ? "Reducir" : "Decrease"}
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(minQty, Number(e.target.value) || minQty))}
                min={minQty}
                step={minQty < 1 ? 0.5 : 1}
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                aria-label={locale === "es" ? "Aumentar" : "Increase"}
              >
                +
              </button>
            </div>
            <span className="text-xs text-slate-400">{unit}</span>
          </div>
        )}

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <span key={tag} className="oi-chip-dark capitalize">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Acciones */}
        <div className="mt-auto flex flex-col gap-1.5 pt-1">
          <button onClick={handleAdd} className={cn("oi-btn-aqua", added && "added")}>
            {added ? (
              <>
                <Check className="h-4 w-4" />
                {locale === "es" ? "Agregado" : "Added"}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {unitPrice > 0 ? `${t.catalog.addToCart} · ${mxn(unitPrice * quantity)}` : t.nav.quote}
              </>
            )}
          </button>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="oi-link-wa">
            <MessageCircle className="h-3.5 w-3.5" />
            {locale === "es" ? "Preguntar por WhatsApp" : "Ask on WhatsApp"}
          </a>
        </div>
      </div>
    </article>
  );
}

export function ProductCatalog() {
  const [category, setCategory] = useState<string>("todos");
  const { data: apiProducts, loading } = useApi<Product[]>("/api/public/products");
  const { data: siteConfig } = useSiteConfig();
  const { channel, setChannel } = useCart();
  const { t, locale } = useI18n();

  const categoryLabel = (key: string): string => {
    switch (key) {
      case "todos": return t.catalog.filterAll;
      case "marisco": return t.catalog.filterMarisco;
      case "pescado": return t.catalog.filterPescado;
      case "especialidad": return t.catalog.filterEspecialidad;
      default: return key;
    }
  };

  const products = apiProducts && apiProducts.length > 0 ? apiProducts : fallbackProducts;
  const filtered = category === "todos" ? products : products.filter((p) => p.category === category);
  const activeConfig = siteConfig || fallbackConfig;
  const mode = channel === "MAYOREO" ? "mayoreo" : "menudeo";

  return (
    <section id="productos" className="relative py-20 text-foam sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="oi-eyebrow justify-center">{t.catalog.badge}</span>
          <h2 className="oi-section-title mt-4">
            {t.catalog.title}
          </h2>
          <p className="oi-lead mx-auto mt-4 max-w-2xl">{t.catalog.subtitle}</p>
        </div>

        {/* Switch de canal (píldora deslizante) */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="oi-mode-switch" data-mode={mode} role="group" aria-label={locale === "es" ? "Modo de compra" : "Purchase mode"}>
            <span className="oi-mode-ind" aria-hidden="true" />
            <button
              className={cn("oi-mode-btn", mode === "mayoreo" && "active")}
              onClick={() => setChannel("MAYOREO")}
              aria-pressed={mode === "mayoreo"}
            >
              {t.catalog.mayoreo} {locale === "es" ? "(negocio)" : "(business)"}
            </button>
            <button
              className={cn("oi-mode-btn", mode === "menudeo" && "active")}
              onClick={() => setChannel("MENUDEO")}
              aria-pressed={mode === "menudeo"}
            >
              {t.catalog.menudeo} {locale === "es" ? "(hogar)" : "(home)"}
            </button>
          </div>
        </div>

        {/* Filtros por categoría */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {categoryKeys.map((key) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={cn("oi-cat-pill", category === key && "active")}
              data-hover
            >
              {categoryLabel(key)}
            </button>
          ))}
        </div>

        {/* Grid de productos */}
        {loading ? (
          <div className="mt-10 flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-teal-light" />
            <span className="ml-2 text-slate-400">
              {locale === "es" ? "Cargando catálogo..." : "Loading catalog..."}
            </span>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} config={activeConfig} />
            ))}
          </div>
        )}

        {/* Aviso */}
        <p className="mt-10 text-center text-sm text-slate-400">
          {locale === "es" ? "¿Buscas un producto que no está listado?" : "Looking for a product not listed?"}{" "}
          <a
            href={`https://wa.me/${activeConfig.contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-teal-light underline underline-offset-2 hover:text-amber-light"
          >
            {locale === "es" ? "Consultanos directamente" : "Contact us directly"}
          </a>
          {locale === "es"
            ? ". Trabajamos con más de 40 especies de temporada."
            : ". We work with over 40 seasonal species."}
        </p>
      </div>
    </section>
  );
}
