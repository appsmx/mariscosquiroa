"use client";

import { useState } from "react";
import { MessageSquarePlus, Send, CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * FeedbackModal — Enlace en el footer que abre un modal para enviar
 * comentarios, sugerencias o reportes de error. Guarda el mensaje vía
 * POST /api/public/feedback (se lee luego en /admin/comentarios).
 *
 * El estado de éxito/error se muestra DENTRO del modal (no depende de un
 * toaster global). Incluye un honeypot anti-spam (campo oculto "website").
 */
export function FeedbackModal() {
  const { locale } = useI18n();
  const es = locale === "es";

  const [open, setOpen] = useState(false);
  const [type, setType] = useState("SUGERENCIA");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const t = {
    trigger: es ? "Enviar comentarios" : "Send feedback",
    title: es ? "Enviar comentarios" : "Send feedback",
    desc: es
      ? "¿Una sugerencia o encontraste un error? Cuéntanos, nos ayuda a mejorar."
      : "Have a suggestion or found a bug? Let us know, it helps us improve.",
    typeLabel: es ? "Tipo" : "Type",
    suggestion: es ? "Sugerencia" : "Suggestion",
    error: es ? "Reportar un error" : "Report a bug",
    other: es ? "Otro" : "Other",
    messageLabel: es ? "Comentario" : "Comment",
    messagePlaceholder: es
      ? "Escribe tu comentario aquí..."
      : "Write your comment here...",
    nameLabel: es ? "Nombre (opcional)" : "Name (optional)",
    emailLabel: es ? "Correo (opcional)" : "Email (optional)",
    emailHint: es
      ? "Déjalo si quieres que te respondamos."
      : "Leave it if you'd like a reply.",
    send: es ? "Enviar" : "Send",
    sending: es ? "Enviando..." : "Sending...",
    successTitle: es ? "¡Gracias por tu comentario!" : "Thanks for your feedback!",
    successBody: es
      ? "Lo hemos recibido y lo revisaremos pronto."
      : "We received it and will review it soon.",
    close: es ? "Cerrar" : "Close",
    emptyError: es
      ? "Por favor escribe tu comentario."
      : "Please write your comment.",
    genericError: es
      ? "No se pudo enviar. Inténtalo de nuevo."
      : "Couldn't send. Please try again.",
  };

  const resetForm = () => {
    setType("SUGERENCIA");
    setMessage("");
    setName("");
    setEmail("");
    setWebsite("");
    setErrorMsg("");
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    // Al cerrar, limpiar para la próxima apertura.
    if (!v) {
      setSent(false);
      resetForm();
    }
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    if (!message.trim()) {
      setErrorMsg(t.emptyError);
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/public/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message, name, email, website }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || t.genericError);
      }
      setSent(true);
      resetForm();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : t.genericError);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-white/50 transition-colors hover:text-white"
      >
        <MessageSquarePlus className="h-3.5 w-3.5" />
        {t.trigger}
      </button>

      <DialogContent className="max-w-md">
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <DialogHeader>
              <DialogTitle className="text-center">{t.successTitle}</DialogTitle>
              <DialogDescription className="text-center">
                {t.successBody}
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => handleOpenChange(false)} className="mt-2">
              {t.close}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t.title}</DialogTitle>
              <DialogDescription>{t.desc}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>{t.typeLabel}</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUGERENCIA">{t.suggestion}</SelectItem>
                    <SelectItem value="ERROR">{t.error}</SelectItem>
                    <SelectItem value="OTRO">{t.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t.messageLabel} *</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder={t.messagePlaceholder}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t.nameLabel}</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t.emailLabel}</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{t.emailHint}</p>

              {/* Honeypot anti-spam: oculto para humanos, atractivo para bots. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="hidden"
                aria-hidden="true"
              />

              {errorMsg && (
                <p className="text-sm text-rose-500">{errorMsg}</p>
              )}
            </div>

            <Button onClick={handleSubmit} disabled={sending} className="w-full">
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.sending}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t.send}
                </>
              )}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
