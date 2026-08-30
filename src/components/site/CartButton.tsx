"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useI18n } from "@/i18n/I18nProvider";

export function CartButton() {
  const { items, openCart } = useCart();
  const { t } = useI18n();
  const count = items.length;
  if (count === 0) return null;

  return (
    <button
      onClick={openCart}
      className="fixed bottom-5 right-20 sm:right-24 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-ocean-600 hover:bg-ocean-700 text-white shadow-xl shadow-ocean-900/30 transition-all hover:scale-105"
      aria-label={t.cart.title}
    >
      <span className="absolute inset-0 rounded-full bg-ocean-600 animate-ping opacity-20" />
      <ShoppingCart className="h-6 w-6" />
      <span className="absolute -top-1 -right-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-brand-500 text-white text-xs font-bold ring-2 ring-background px-1">
        {count}
      </span>
    </button>
  );
}
