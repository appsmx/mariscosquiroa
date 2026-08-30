"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  Snowflake,
  Sparkles,
  Clock,
  ChevronRight,
  Loader2,
  Plus,
  ShoppingCart,
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

const tagClassNames: Record<string, string> = {
  mayoreo: "bg-ocean-100 text-ocean-700 border-ocean-200",
  menudeo: "bg-amber-brand-100 text-amber-brand-700 border-amber-brand-200",
  fresco: "bg-emerald-100 text-emerald-700 border-emerald-200",
  congelado: "bg-sky-100 text-sky-700 border-sky-200",
  premium: "bg-rose-100 text-rose-700 border-rose-200",
};

const availabilityIcons: Record<string, { icon: typeof Clock; color: string }> = {
  Diaria: { icon: Clock, color: "text-emerald-600" },
  Temporada: { icon: Sparkles, color: "text-amber-600" },
  "Bajo pedido": { icon: Snowflake, color: "text-sky-600" },
};

const mxn = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

function ProductCard({ product, config }: { product: Product; config: any }) {
  const { t, locale } = useI18n();

  const tagLabel = (tag: string): string => {
    switch (tag) {
      case "mayoreo": return t.catalog.mayoreo;
      case "menudeo": return t.catalog.menudeo;
      case "fresco": return locale === "es" ? "Fresco" : "Fresh";
      case "congelado": return locale === "es" ? "Congelado" : "Frozen";
      case "premium": return "Premium";
      default: return tag;
    }
  };

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
  const avail = availabilityIcons[product.availability];
  const AvailIcon = avail.icon;
  const { channel, add } = useCart();
  const [selectedPres, setSelectedPres] = useState<string>(product.presentation[0] || "");
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);

  // Buscar precio para la presentación seleccionada según el canal
  // Normalizamos channel a minúsculas para comparar con la API
  const channelLower = (channel || "menudeo").toLowerCase();
  const selectedPrice = product.prices?.find(
    (p) => {
      const priceChannel = (p.channel || "").toLowerCase();
      return priceChannel === channelLower &&
             (!p.presentation || p.presentation === selectedPres);
    }
  );
  const unitPrice = selectedPrice?.pricePerKg ?? selectedPrice?.priceUnit ?? 0;
  const unit = selectedPrice?.unit || "kg";
  const minQty = selectedPrice?.minQuantity ?? 1;

  const handleAdd = () => {
    if (unitPrice <= 0) {
      // Sin precio configurado → abrir WhatsApp directo
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

  return (
    <Card className="group relative overflow-hidden border-border/60 bg-card hover:shadow-xl hover:shadow-ocean-900/10 transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Imagen */}
      <div className="relative aspect-[4/3] overflow-hidden bg-ocean-50">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/70 via-transparent to-transparent" />

        <div className="absolute top-3 left-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 text-xs font-semibold shadow-md">
            <AvailIcon className={cn("h-3.5 w-3.5", avail.color)} />
            <span className="text-foreground">{availLabel(product.availability)}</span>
          </div>
        </div>

        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-ocean-600/90 text-white border-0 backdrop-blur-sm capitalize text-[10px] uppercase tracking-wide">
            {product.category}
          </Badge>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-2xl font-bold text-white leading-tight drop-shadow-md">
            {product.name}
          </h3>
          {product.scientific && (
            <p className="text-xs text-white/80 italic mt-0.5">{product.scientific}</p>
          )}
        </div>
      </div>

      <CardContent className="p-5 flex-1">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {product.description}
        </p>

        {/* Precio visible */}
        {unitPrice > 0 ? (
          <div className="mt-4 rounded-lg bg-ocean-50 border border-ocean-100 p-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ocean-700">
                {locale === "es"
                  ? `Precio ${channelLower === "mayoreo" ? "mayoreo" : "menudeo"}`
                  : `${channelLower === "mayoreo" ? "Wholesale" : "Retail"} price`}
              </span>
              <span className="font-display text-xl font-bold text-foreground">
                {mxn(unitPrice)}
                <span className="text-xs font-normal text-muted-foreground">/{unit}</span>
              </span>
            </div>
            {minQty > 1 && (
              <p className="text-[10px] text-muted-foreground mt-1">
                {locale === "es" ? `Mínimo: ${minQty} ${unit}` : `Min: ${minQty} ${unit}`}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-lg bg-amber-brand-50 border border-amber-brand-200 p-3">
            <p className="text-xs text-amber-brand-700 font-medium">
              {locale === "es"
                ? "Precio bajo cotización · consulta por WhatsApp"
                : "Price on request · ask on WhatsApp"}
            </p>
          </div>
        )}

        {/* Selector de presentación */}
        {product.presentation.length > 0 && (
          <div className="mt-3">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 block">
              {locale === "es" ? "Presentación" : "Presentation"}
            </label>
            <Select value={selectedPres} onValueChange={setSelectedPres}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {product.presentation.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Selector de cantidad */}
        {unitPrice > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t.cart.quantity}
            </label>
            <div className="flex items-center rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(minQty, quantity - 1))}
                className="px-2.5 py-1.5 text-sm hover:bg-muted transition-colors"
                aria-label={locale === "es" ? "Reducir" : "Decrease"}
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(minQty, Number(e.target.value) || minQty))}
                className="w-14 text-center text-sm py-1.5 border-x border-border focus:outline-none"
                min={minQty}
                step={minQty < 1 ? 0.5 : 1}
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-2.5 py-1.5 text-sm hover:bg-muted transition-colors"
                aria-label={locale === "es" ? "Aumentar" : "Increase"}
              >
                +
              </button>
            </div>
            <span className="text-xs text-muted-foreground">{unit}</span>
          </div>
        )}

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {product.tags.map((tag) => {
            const className = tagClassNames[tag];
            return (
              <Badge key={tag} variant="outline" className={cn("text-[10px] font-semibold", className)}>
                {tagLabel(tag)}
              </Badge>
            );
          })}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 flex-col gap-2">
        <Button
          onClick={handleAdd}
          className={cn(
            "w-full text-white group/btn transition-all",
            added ? "bg-emerald-600 hover:bg-emerald-600" : "bg-ocean-600 hover:bg-ocean-700"
          )}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" />
              {locale === "es" ? "Agregado" : "Added"}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              {unitPrice > 0
                ? `${t.catalog.addToCart} · ${mxn(unitPrice * quantity)}`
                : t.nav.quote}
            </>
          )}
        </Button>
        <Button asChild variant="ghost" size="sm" className="w-full text-muted-foreground">
          <a href={waLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-3.5 w-3.5" />
            {locale === "es" ? "Preguntar por WhatsApp" : "Ask on WhatsApp"}
          </a>
        </Button>
      </CardFooter>
    </Card>
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

  const filtered =
    category === "todos"
      ? products
      : products.filter((p) => p.category === category);

  const activeConfig = siteConfig || fallbackConfig;

  return (
    <section id="productos" className="relative py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-ocean-50 border border-ocean-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ocean-700">
            {t.catalog.badge}
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {t.catalog.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t.catalog.subtitle}
          </p>
        </div>

        {/* Switch de canal */}
        <div className="mt-6 inline-flex items-center gap-1 rounded-xl bg-muted p-1 border border-border">
          <button
            onClick={() => setChannel("MENUDEO")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              channel === "MENUDEO" ? "bg-amber-brand-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.catalog.menudeo} {locale === "es" ? "(hogar)" : "(home)"}
          </button>
          <button
            onClick={() => setChannel("MAYOREO")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              channel === "MAYOREO" ? "bg-ocean-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.catalog.mayoreo} {locale === "es" ? "(negocio)" : "(business)"}
          </button>
        </div>

        {/* Filtros por categoría */}
        <div className="mt-6">
          <Tabs value={category} onValueChange={setCategory}>
            <TabsList className="bg-muted/60 h-auto p-1 flex flex-wrap gap-1">
              {categoryKeys.map((key) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="data-[state=active]:bg-ocean-600 data-[state=active]:text-white rounded-md px-4 py-2 text-sm font-medium"
                >
                  {categoryLabel(key)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Grid de productos */}
        {loading ? (
          <div className="mt-10 flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-ocean-600" />
            <span className="ml-2 text-muted-foreground">
              {locale === "es" ? "Cargando catálogo..." : "Loading catalog..."}
            </span>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} config={activeConfig} />
            ))}
          </div>
        )}

        {/* Aviso */}
        <p className="mt-10 text-center text-sm text-muted-foreground">
          {locale === "es" ? "¿Buscas un producto que no está listado?" : "Looking for a product not listed?"}{" "}
          <a
            href={`https://wa.me/${activeConfig.contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-ocean-700 hover:text-ocean-800 underline underline-offset-2"
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
