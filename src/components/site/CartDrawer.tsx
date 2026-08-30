"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  ShoppingCart,
  Loader2,
  MessageCircle,
  X,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useSiteConfig } from "@/hooks/use-site-config";
import { siteConfig as fallbackConfig } from "@/lib/site-data";
import { useI18n } from "@/i18n/I18nProvider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const mxn = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    remove,
    updateQuantity,
    clear,
    channel,
    getSubtotal,
  } = useCart();
  const { data: siteConfig } = useSiteConfig();
  const { t, locale } = useI18n();
  const config = siteConfig || fallbackConfig;

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    deliveryAddress: "",
    deliveryCity: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ code: string; total: number; waLink: string } | null>(null);

  const update = (k: string, v: string) => setForm({ ...form, [k]: v });

  const subtotal = getSubtotal();

  const buildWhatsAppMessage = (code: string, total: number) => {
    const lines = [
      `*Nueva cotización ${code}*`,
      `Cliente: ${form.customerName}`,
      `Teléfono: ${form.customerPhone}`,
      form.customerEmail ? `Email: ${form.customerEmail}` : null,
      ``,
      `*Productos:*`,
      ...items.map(
        (it, i) =>
          `${i + 1}. ${it.productName} — ${it.presentation || "standard"} · ${it.quantity} ${it.unit} × ${mxn(it.unitPrice)} = ${mxn(it.quantity * it.unitPrice)}`
      ),
      ``,
      `*Subtotal: ${mxn(subtotal)}*`,
      form.deliveryAddress ? `Dirección: ${form.deliveryAddress}` : null,
      form.deliveryCity ? `Ciudad: ${form.deliveryCity}` : null,
      form.notes ? `Notas: ${form.notes}` : null,
      ``,
      `Enviado desde mariscosquiroa.com`,
    ].filter(Boolean);
    return encodeURIComponent(lines.join("\n"));
  };

  const handleSubmit = async () => {
    if (!form.customerName || !form.customerPhone) {
      toast.error(
        locale === "es"
          ? "Completa tu nombre y teléfono para enviar la cotización"
          : "Please complete your name and phone to send the quote"
      );
      return;
    }
    if (items.length === 0) {
      toast.error(t.cart.empty);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          customerEmail: form.customerEmail || undefined,
          channel,
          deliveryAddress: form.deliveryAddress || undefined,
          deliveryCity: form.deliveryCity || undefined,
          notes: form.notes || undefined,
          items: items.map((it) => ({
            productId: it.productId,
            productName: it.productName,
            presentation: it.presentation,
            quantity: it.quantity,
            unit: it.unit,
            unitPrice: it.unitPrice,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");

      const waLink = `https://wa.me/${config.contact.whatsapp}?text=${buildWhatsAppMessage(data.order.code, data.order.total)}`;
      setSuccess({
        code: data.order.code,
        total: data.order.total,
        waLink,
      });
      clear();
    } catch (e: any) {
      toast.error(
        locale === "es"
          ? "Error al enviar la cotización. Intenta por WhatsApp directo."
          : "Error sending the quote. Try direct WhatsApp."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    closeCart();
    setTimeout(() => {
      setSuccess(null);
      setForm({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        deliveryAddress: "",
        deliveryCity: "",
        notes: "",
      });
    }, 300);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 py-5 border-b border-border bg-ocean-50">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <ShoppingCart className="h-5 w-5 text-ocean-600" />
            {t.cart.title}
            <Badge variant="secondary" className="ml-auto capitalize">
              {channel === "mayoreo" ? t.catalog.mayoreo : t.catalog.menudeo}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        {success ? (
          /* Pantalla de éxito */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
              <CheckCircle2 className="h-9 w-9 text-emerald-600" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              {locale === "es" ? "¡Cotización enviada!" : "Quote sent!"}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              {locale === "es" ? "Tu código de seguimiento es:" : "Your tracking code is:"}
            </p>
            <p className="font-mono text-lg font-bold text-ocean-700 mt-1">{success.code}</p>
            <p className="text-sm text-muted-foreground mt-4 max-w-xs">
              {locale === "es"
                ? "Nosotros recibimos tu solicitud y te contactaremos en breve. Para acelerar la respuesta, envía el detalle también por WhatsApp:"
                : "We received your request and will contact you shortly. To speed up the response, also send the details via WhatsApp:"}
            </p>
            <Button asChild className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white">
              <a href={success.waLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                {locale === "es" ? "Enviar por WhatsApp" : "Send on WhatsApp"}
              </a>
            </Button>
            <Button variant="ghost" onClick={handleClose} className="mt-2">
              {locale === "es" ? "Cerrar" : "Close"}
            </Button>
          </div>
        ) : items.length === 0 ? (
          /* Carrito vacío */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              {t.cart.empty}
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              {t.cart.emptyDesc}
            </p>
            <Button onClick={handleClose} className="mt-6 bg-ocean-600 hover:bg-ocean-700">
              {t.cart.continueShopping}
            </Button>
          </div>
        ) : (
          /* Lista de items + formulario */
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {/* Items */}
              {items.map((it, i) => (
                <div key={i} className="flex gap-3 rounded-lg border border-border p-3">
                  {it.image && (
                    <img
                      src={it.image}
                      alt={it.productName}
                      className="h-16 w-16 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {it.productName}
                      </p>
                      <button
                        onClick={() => remove(i)}
                        className="text-muted-foreground hover:text-rose-600"
                        aria-label={t.cart.remove}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {it.presentation && (
                      <p className="text-xs text-muted-foreground">{it.presentation}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center rounded-md border border-border overflow-hidden">
                        <button
                          onClick={() => updateQuantity(i, Math.max(0.5, it.quantity - 1))}
                          className="px-2 py-0.5 text-sm hover:bg-muted"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={it.quantity}
                          onChange={(e) => updateQuantity(i, Math.max(0.5, Number(e.target.value) || 0.5))}
                          className="w-12 text-center text-xs py-0.5 border-x border-border focus:outline-none"
                          step={0.5}
                        />
                        <button
                          onClick={() => updateQuantity(i, it.quantity + 1)}
                          className="px-2 py-0.5 text-sm hover:bg-muted"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-muted-foreground">{it.unit}</span>
                      <span className="ml-auto text-sm font-semibold text-foreground">
                        {mxn(it.quantity * it.unitPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Subtotal */}
              <div className="rounded-lg bg-ocean-50 border border-ocean-100 p-3 flex items-center justify-between">
                <span className="text-sm font-medium text-ocean-700">{t.cart.subtotal}</span>
                <span className="font-display text-xl font-bold text-foreground">
                  {mxn(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {locale === "es"
                  ? "* Precio final sujeto a disponibilidad del día. Te confirmamos al contactarte."
                  : "* Final price subject to daily availability. We confirm when contacting you."}
              </p>

              {/* Formulario cliente */}
              <div className="pt-4 border-t border-border space-y-3">
                <h4 className="font-semibold text-sm text-foreground">
                  {locale === "es" ? "Tus datos" : "Your details"}
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{locale === "es" ? "Nombre *" : "Name *"}</Label>
                    <Input
                      value={form.customerName}
                      onChange={(e) => update("customerName", e.target.value)}
                      placeholder={locale === "es" ? "Tu nombre o del negocio" : "Your name or business"}
                      className="h-9"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{locale === "es" ? "Teléfono *" : "Phone *"}</Label>
                      <Input
                        value={form.customerPhone}
                        onChange={(e) => update("customerPhone", e.target.value)}
                        placeholder="(663) 699-9689"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        {locale === "es" ? "Email (opcional)" : "Email (optional)"}
                      </Label>
                      <Input
                        type="email"
                        value={form.customerEmail}
                        onChange={(e) => update("customerEmail", e.target.value)}
                        placeholder="tu@email.com"
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      {locale === "es" ? "Dirección de entrega (opcional)" : "Delivery address (optional)"}
                    </Label>
                    <Input
                      value={form.deliveryAddress}
                      onChange={(e) => update("deliveryAddress", e.target.value)}
                      placeholder={locale === "es" ? "Calle, número, colonia" : "Street, number, neighborhood"}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{locale === "es" ? "Ciudad (opcional)" : "City (optional)"}</Label>
                    <Input
                      value={form.deliveryCity}
                      onChange={(e) => update("deliveryCity", e.target.value)}
                      placeholder={locale === "es" ? "Rosarito, Tijuana..." : "Rosarito, Tijuana..."}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{locale === "es" ? "Notas (opcional)" : "Notes (optional)"}</Label>
                    <Textarea
                      value={form.notes}
                      onChange={(e) => update("notes", e.target.value)}
                      placeholder={locale === "es" ? "Algún detalle del pedido, horario preferido..." : "Any order detail, preferred time..."}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer con acciones */}
            <SheetFooter className="px-6 py-4 border-t border-border bg-card">
              <div className="flex flex-col gap-2 w-full">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-ocean-600 hover:bg-ocean-700 text-white h-11"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {locale === "es" ? "Enviando..." : "Sending..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {t.cart.sendQuote} ({mxn(subtotal)})
                    </>
                  )}
                </Button>
                <Button
                  onClick={clear}
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                  {t.cart.clear}
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
