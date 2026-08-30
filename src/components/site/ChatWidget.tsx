"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2, ShoppingCart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useSiteConfig } from "@/hooks/use-site-config";
import { siteConfig as fallbackConfig } from "@/lib/site-data";
import { useI18n } from "@/i18n/I18nProvider";

type Message = {
  role: "user" | "assistant";
  content: string;
  actions?: Array<{
    type: "open_whatsapp" | "open_cart" | "suggest_product";
    message?: string;
    productName?: string;
    productId?: string;
  }>;
  timestamp: number;
};

type ChatAction = {
  type: "open_whatsapp" | "open_cart" | "suggest_product";
  message?: string;
  productName?: string;
  productId?: string;
};

const SUGGESTIONS_ES = [
  "¿Qué productos tienen hoy?",
  "¿Cuál es el precio del camarón?",
  "¿Hacen entregas a domicilio?",
  "Necesito 10 kg de pulpo para un evento",
];

const SUGGESTIONS_EN = [
  "What products do you have today?",
  "What's the price of shrimp?",
  "Do you offer home delivery?",
  "I need 10 kg of octopus for an event",
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasGreeted, setHasGreeted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { openCart } = useCart();
  const { data: siteConfig } = useSiteConfig();
  const { t, locale } = useI18n();
  const config = siteConfig || fallbackConfig;
  const SUGGESTIONS = locale === "es" ? SUGGESTIONS_ES : SUGGESTIONS_EN;

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
      // Saludo inicial al abrir por primera vez
      if (!hasGreeted) {
        setHasGreeted(true);
        setMessages([
          {
            role: "assistant",
            content: t.chat.greeting,
            timestamp: Date.now(),
          },
        ]);
      }
      // Focus en input después de abrir
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, scrollToBottom, hasGreeted, t]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();

      const assistantMsg: Message = {
        role: "assistant",
        content: data.content,
        actions: data.actions,
        timestamp: Date.now(),
      };
      setMessages([...newMessages, assistantMsg]);

      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    } catch (e) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: t.chat.error,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (s: string) => {
    sendMessage(s);
  };

  const handleAction = (action: ChatAction) => {
    if (action.type === "open_cart") {
      openCart();
      setIsOpen(false);
    } else if (action.type === "open_whatsapp") {
      const waLink = `https://wa.me/${config.contact.whatsapp}?text=${encodeURIComponent(
        action.message ||
          (locale === "es"
            ? "Hola Mariscos Quiroa, vengo desde el chat de la web."
            : "Hi Mariscos Quiroa, I'm coming from the website chat.")
      )}`;
      window.open(waLink, "_blank");
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-5 left-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all hover:scale-105",
          isOpen
            ? "bg-foreground text-background rotate-90"
            : "bg-gradient-to-br from-ocean-500 to-ocean-700 text-white shadow-ocean-900/30"
        )}
        aria-label={isOpen ? t.chat.closeChat : t.chat.openChat}
      >
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-ocean-500 animate-ping opacity-20" />
        )}
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}

        {/* Badge de no leídos */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 text-white text-xs font-bold ring-2 ring-background px-1">
            {unreadCount}
          </span>
        )}

        {/* Indicador "online" */}
        {!isOpen && (
          <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-white">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-700" />
          </span>
        )}
      </button>

      {/* Ventana de chat */}
      {isOpen && (
        <div className="fixed bottom-24 left-5 z-40 w-[calc(100vw-2.5rem)] sm:w-96 max-h-[70vh] sm:max-h-[600px] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white">
            <div className="relative">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-3 w-3 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-ocean-700">
                <span className="h-1 w-1 rounded-full bg-emerald-900" />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">{t.chat.title}</p>
              <p className="text-[10px] text-white/80 flex items-center gap-1 mt-0.5">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {locale === "es" ? "En línea · responde en segundos" : "Online · replies in seconds"}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white"
              aria-label={locale === "es" ? "Cerrar" : "Close"}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-muted/30"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col gap-1.5",
                  m.role === "user" ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-ocean-600 text-white rounded-br-md"
                      : "bg-card border border-border text-foreground rounded-bl-md shadow-sm"
                  )}
                >
                  {m.content}
                </div>

                {/* Acciones */}
                {m.actions && m.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 max-w-[85%]">
                    {m.actions.map((a, j) => {
                      if (a.type === "open_cart") {
                        return (
                          <button
                            key={j}
                            onClick={() => handleAction(a)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-ocean-50 border border-ocean-200 px-3 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-ocean-100 transition-colors"
                          >
                            <ShoppingCart className="h-3 w-3" />
                            {locale === "es" ? "Ver carrito" : "View cart"}
                          </button>
                        );
                      }
                      if (a.type === "open_whatsapp") {
                        return (
                          <button
                            key={j}
                            onClick={() => handleAction(a)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            <MessageCircle className="h-3 w-3" />
                            WhatsApp
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}

                <span className="text-[10px] text-muted-foreground px-1">
                  {new Date(m.timestamp).toLocaleTimeString(
                    locale === "es" ? "es-MX" : "en-US",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
              </div>
            ))}

            {/* Indicador de escritura */}
            {loading && (
              <div className="flex items-start">
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-ocean-400 animate-bounce [animation-delay:0ms]" />
                    <span className="h-2 w-2 rounded-full bg-ocean-400 animate-bounce [animation-delay:150ms]" />
                    <span className="h-2 w-2 rounded-full bg-ocean-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            {/* Sugerencias (solo si hay pocos mensajes) */}
            {messages.length <= 1 && !loading && (
              <div className="pt-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2 px-1">
                  {locale === "es" ? "Preguntas frecuentes" : "Frequent questions"}
                </p>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="text-left text-xs rounded-lg bg-card border border-border px-3 py-2 text-foreground/80 hover:bg-ocean-50 hover:border-ocean-200 hover:text-ocean-700 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 border-t border-border bg-card">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.chat.placeholder}
              disabled={loading}
              className="flex-1 h-10 rounded-full bg-muted px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/30 disabled:opacity-50"
              maxLength={500}
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="h-10 w-10 rounded-full bg-ocean-600 hover:bg-ocean-700 text-white shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="px-3 py-2 bg-muted/50 border-t border-border">
            <p className="text-[10px] text-center text-muted-foreground">
              {locale === "es"
                ? "Asistente IA de Mariscos Quiroa · Para consultas complejas,"
                : "Mariscos Quiroa AI assistant · For complex queries,"}{" "}
              <a
                href={`https://wa.me/${config.contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-600 hover:underline inline-flex items-center gap-0.5"
              >
                {locale === "es" ? "escríbenos por WhatsApp" : "message us on WhatsApp"}
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
