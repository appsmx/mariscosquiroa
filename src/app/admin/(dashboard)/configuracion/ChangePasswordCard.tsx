"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

/**
 * Tarjeta de "Cambiar contraseña" del panel admin.
 * Permite al usuario autenticado cambiar su propia contraseña sin depender de
 * nadie: pide la actual, la nueva y su confirmación, y llama al endpoint seguro
 * POST /api/admin/change-password.
 */
export function ChangePasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones en el cliente (el servidor las repite por seguridad)
    if (!current || !next || !confirm) {
      toast.error("Completa los tres campos.");
      return;
    }
    if (next.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (next !== confirm) {
      toast.error("La nueva contraseña y su confirmación no coinciden.");
      return;
    }
    if (next === current) {
      toast.error("La nueva contraseña debe ser distinta de la actual.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "No se pudo cambiar la contraseña.");
        return;
      }
      toast.success("Contraseña actualizada. Úsala en tu próximo inicio de sesión.");
      reset();
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <KeyRound className="h-5 w-5 text-rose-600" />
          Seguridad · Cambiar contraseña
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="current-pw">Contraseña actual</Label>
            <Input
              id="current-pw"
              type={show ? "text" : "password"}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              placeholder="Tu contraseña actual"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-pw">Nueva contraseña</Label>
              <Input
                id="new-pw"
                type={show ? "text" : "password"}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw">Confirmar nueva</Label>
              <Input
                id="confirm-pw"
                type={show ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                placeholder="Repite la nueva contraseña"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {show ? "Ocultar contraseñas" : "Mostrar contraseñas"}
          </button>

          <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            Usa una contraseña larga y única. Nadie más puede verla; se guarda cifrada.
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="bg-ocean-600 hover:bg-ocean-700">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cambiando...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Cambiar contraseña
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
