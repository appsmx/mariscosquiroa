"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Loader2, Building2, Phone, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { ChangePasswordCard } from "./ChangePasswordCard";

type Config = {
  brandName: string;
  tagline: string;
  slogan: string;
  description: string;
  foundedYear: number;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  whatsappMessage: string;
  email: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  heroImage: string;
  storyImage: string;
};

export default function AdminConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site-config")
      .then((r) => r.json())
      .then((c) => setConfig(c))
      .finally(() => setLoading(false));
  }, []);

  const update = (k: keyof Config, v: any) =>
    setConfig((c) => (c ? { ...c, [k]: v } : c));

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error();
      toast.success("Configuración guardada");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground mt-1">
            Datos generales del negocio. Se reflejan en todo el sitio público.
          </p>
        </div>
        <Button onClick={save} disabled={saving} className="bg-ocean-600 hover:bg-ocean-700">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identidad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-ocean-600" />
              Identidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Nombre del negocio</Label>
              <Input value={config.brandName} onChange={(e) => update("brandName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tagline (frase corta)</Label>
              <Input value={config.tagline} onChange={(e) => update("tagline", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Slogan (hero)</Label>
              <Textarea value={config.slogan} onChange={(e) => update("slogan", e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Descripción (sección nosotros)</Label>
              <Textarea value={config.description} onChange={(e) => update("description", e.target.value)} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Año de fundación</Label>
                <Input type="number" value={config.foundedYear} onChange={(e) => update("foundedYear", Number(e.target.value))} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5 text-amber-brand-600" />
              Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Teléfono (link)</Label>
                <Input value={config.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono (display)</Label>
                <Input value={config.phoneDisplay} onChange={(e) => update("phoneDisplay", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>WhatsApp (solo números, con código país)</Label>
              <Input value={config.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="526636999689" />
            </div>
            <div className="space-y-2">
              <Label>Mensaje default de WhatsApp</Label>
              <Textarea value={config.whatsappMessage} onChange={(e) => update("whatsappMessage", e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={config.email} onChange={(e) => update("email", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Dirección */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dirección</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Calle y número</Label>
              <Input value={config.streetAddress} onChange={(e) => update("streetAddress", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input value={config.city} onChange={(e) => update("city", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Input value={config.state} onChange={(e) => update("state", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Código postal</Label>
                <Input value={config.zipCode} onChange={(e) => update("zipCode", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>País</Label>
                <Input value={config.country} onChange={(e) => update("country", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Redes e imágenes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="h-5 w-5 text-emerald-600" />
              Redes e imágenes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Facebook URL</Label>
              <Input value={config.facebookUrl || ""} onChange={(e) => update("facebookUrl", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Instagram URL</Label>
              <Input value={config.instagramUrl || ""} onChange={(e) => update("instagramUrl", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>TikTok URL</Label>
              <Input value={config.tiktokUrl || ""} onChange={(e) => update("tiktokUrl", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Imagen hero (URL)</Label>
              <Input value={config.heroImage} onChange={(e) => update("heroImage", e.target.value)} />
              {config.heroImage && <img src={config.heroImage} alt="preview" className="mt-1 h-24 rounded-lg object-cover" />}
            </div>
            <div className="space-y-2">
              <Label>Imagen "nosotros" (URL)</Label>
              <Input value={config.storyImage} onChange={(e) => update("storyImage", e.target.value)} />
              {config.storyImage && <img src={config.storyImage} alt="preview" className="mt-1 h-24 rounded-lg object-cover" />}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} size="lg" className="bg-ocean-600 hover:bg-ocean-700">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar todos los cambios
            </>
          )}
        </Button>
      </div>

      {/* Seguridad — cambio de contraseña (independiente del guardado de config) */}
      <div className="border-t border-border pt-6">
        <div className="max-w-xl">
          <ChangePasswordCard />
        </div>
      </div>
    </div>
  );
}
