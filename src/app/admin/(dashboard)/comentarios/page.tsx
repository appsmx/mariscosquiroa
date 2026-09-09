"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquareText, Check, Undo2, Trash2, Mail, User, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Feedback = {
  id: string;
  type: "SUGERENCIA" | "ERROR" | "OTRO";
  message: string;
  name?: string | null;
  email?: string | null;
  status: "NUEVO" | "ATENDIDO";
  source: string;
  createdAt: string;
};

const typeConfig: Record<string, { label: string; color: string }> = {
  SUGERENCIA: { label: "Sugerencia", color: "bg-blue-100 text-blue-700 border-blue-200" },
  ERROR: { label: "Error", color: "bg-rose-100 text-rose-700 border-rose-200" },
  OTRO: { label: "Otro", color: "bg-slate-100 text-slate-700 border-slate-200" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  NUEVO: { label: "Nuevo", color: "bg-amber-100 text-amber-700 border-amber-200" },
  ATENDIDO: { label: "Atendido", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export default function AdminComentarios() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/admin/feedback${qs}`);
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch {
      toast.error("No se pudieron cargar los comentarios");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (item: Feedback, status: "NUEVO" | "ATENDIDO") => {
    try {
      const res = await fetch(`/api/admin/feedback/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(status === "ATENDIDO" ? "Marcado como atendido" : "Marcado como nuevo");
      load();
    } catch {
      toast.error("No se pudo actualizar el comentario");
    }
  };

  const remove = async (item: Feedback) => {
    if (!confirm("¿Eliminar este comentario? Esta acción no se puede deshacer.")) return;
    try {
      const res = await fetch(`/api/admin/feedback/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Comentario eliminado");
      load();
    } catch {
      toast.error("No se pudo eliminar el comentario");
    }
  };

  const nuevos = items.filter((i) => i.status === "NUEVO").length;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <MessageSquareText className="h-6 w-6" />
            Comentarios
          </h1>
          <p className="text-sm text-muted-foreground">
            Sugerencias y reportes que envían los visitantes desde el sitio.
            {nuevos > 0 && (
              <span className="ml-1 font-medium text-amber-600">
                {nuevos} sin atender.
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="NUEVO">Sin atender</SelectItem>
              <SelectItem value="ATENDIDO">Atendidos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <MessageSquareText className="h-10 w-10 opacity-40" />
            <p>No hay comentarios{statusFilter !== "all" ? " con este filtro" : " todavía"}.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const tc = typeConfig[item.type] ?? typeConfig.OTRO;
            const sc = statusConfig[item.status] ?? statusConfig.NUEVO;
            return (
              <Card key={item.id} className={cn(item.status === "NUEVO" && "border-amber-200")}>
                <CardContent className="space-y-3 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={tc.color}>{tc.label}</Badge>
                    <Badge variant="outline" className={sc.color}>{sc.label}</Badge>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {fmtDate(item.createdAt)}
                    </span>
                  </div>

                  <p className="whitespace-pre-wrap text-sm text-foreground">{item.message}</p>

                  {(item.name || item.email) && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {item.name && (
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {item.name}
                        </span>
                      )}
                      {item.email && (
                        <a
                          href={`mailto:${item.email}`}
                          className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          {item.email}
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    {item.status === "NUEVO" ? (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(item, "ATENDIDO")}>
                        <Check className="h-4 w-4" />
                        Marcar como atendido
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(item, "NUEVO")}>
                        <Undo2 className="h-4 w-4" />
                        Marcar como nuevo
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-600 hover:text-rose-700"
                      onClick={() => remove(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
