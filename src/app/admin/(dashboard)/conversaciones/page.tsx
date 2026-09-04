"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquare, Search, Bot, User, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ConversationListItem = {
  id: string;
  channel: "whatsapp" | "messenger" | "instagram";
  customerName: string | null;
  displayId: string;
  status: string;
  lastMessageAt: string;
  lastPreview: string;
  messageCount: number;
};

type Message = {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  content: string;
  source: "AI" | "HUMAN" | "SYSTEM";
  type: string;
  createdAt: string;
};

type ConversationDetail = {
  id: string;
  channel: string;
  customerName: string | null;
  displayId: string;
  status: string;
  messages: Message[];
};

const CHANNEL_META: Record<string, { label: string; color: string; emoji: string }> = {
  whatsapp: { label: "WhatsApp", color: "bg-green-100 text-green-800", emoji: "🟢" },
  messenger: { label: "Messenger", color: "bg-blue-100 text-blue-800", emoji: "🔵" },
  instagram: { label: "Instagram", color: "bg-pink-100 text-pink-800", emoji: "🟣" },
};

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function ConversacionesPage() {
  const [list, setList] = useState<ConversationListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [channelFilter, setChannelFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  const loadList = useCallback(async () => {
    setLoadingList(true);
    try {
      const params = new URLSearchParams();
      if (channelFilter) params.set("channel", channelFilter);
      if (search.trim()) params.set("q", search.trim());
      const res = await fetch(`/api/admin/conversations?${params.toString()}`);
      const data = await res.json();
      setList(data.conversations || []);
    } catch {
      setList([]);
    } finally {
      setLoadingList(false);
    }
  }, [channelFilter, search]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingDetail(true);
    fetch(`/api/admin/conversations/${selectedId}`)
      .then((r) => r.json())
      .then((d) => setDetail(d))
      .catch(() => setDetail(null))
      .finally(() => setLoadingDetail(false));
  }, [selectedId]);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ocean-950 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-ocean-700" />
            Conversaciones
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mensajes de clientes por WhatsApp, Messenger e Instagram atendidos por el asistente IA.
          </p>
        </div>
        <button
          onClick={loadList}
          className="inline-flex items-center gap-2 text-sm text-ocean-700 hover:text-ocean-900"
        >
          <RefreshCw className="h-4 w-4" /> Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        {/* Lista de conversaciones */}
        <Card className="overflow-hidden">
          <div className="p-3 border-b space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {[
                { v: "", l: "Todos" },
                { v: "whatsapp", l: "WhatsApp" },
                { v: "messenger", l: "Messenger" },
                { v: "instagram", l: "Instagram" },
              ].map((f) => (
                <button
                  key={f.v}
                  onClick={() => setChannelFilter(f.v)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    channelFilter === f.v
                      ? "bg-ocean-700 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  )}
                >
                  {f.l}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
            {loadingList ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : list.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No hay conversaciones todavía. Cuando un cliente escriba por WhatsApp,
                Messenger o Instagram, aparecerá aquí.
              </div>
            ) : (
              list.map((c) => {
                const meta = CHANNEL_META[c.channel];
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b hover:bg-muted/40 transition-colors",
                      selectedId === c.id && "bg-ocean-50"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm truncate">
                        {c.customerName || c.displayId}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {fmtTime(c.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn("text-[10px] px-1.5 py-0", meta.color)}>
                        {meta.label}
                      </Badge>
                      {c.status === "ESCALATED_HUMAN" && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-800">
                          Requiere humano
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {c.lastPreview}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Detalle / hilo de mensajes */}
        <Card className="overflow-hidden flex flex-col min-h-[400px]">
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-8">
              Selecciona una conversación para ver los mensajes.
            </div>
          ) : loadingDetail ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-2/3" />
              ))}
            </div>
          ) : detail ? (
            <>
              <div className="px-5 py-3 border-b bg-muted/30">
                <p className="font-semibold text-sm">
                  {detail.customerName || detail.displayId}
                </p>
                <p className="text-xs text-muted-foreground">
                  {CHANNEL_META[detail.channel]?.label} · {detail.messages.length} mensajes
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3 max-h-[calc(100vh-320px)]">
                {detail.messages.map((m) => {
                  const isBot = m.direction === "OUTBOUND";
                  return (
                    <div
                      key={m.id}
                      className={cn("flex", isBot ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                          isBot
                            ? "bg-ocean-700 text-white rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        )}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          {isBot ? (
                            <>
                              <Bot className="h-3 w-3 opacity-70" />
                              <span className="text-[10px] opacity-70">
                                {m.source === "HUMAN" ? "Humano" : "Asistente IA"}
                              </span>
                            </>
                          ) : (
                            <>
                              <User className="h-3 w-3 opacity-70" />
                              <span className="text-[10px] opacity-70">Cliente</span>
                            </>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <p className={cn("text-[10px] mt-1", isBot ? "text-white/60" : "text-muted-foreground")}>
                          {fmtTime(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-8">
              No se pudo cargar la conversación.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
