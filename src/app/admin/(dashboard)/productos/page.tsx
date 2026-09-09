"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Package, X, Loader2, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Price = {
  id?: string;
  channel: "MAYOREO" | "MENUDEO";
  presentation?: string | null;
  pricePerKg?: number | null;
  priceUnit?: number | null;
  unit: string;
  minQuantity: number;
  notes?: string | null;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  scientific?: string | null;
  categoryId: string;
  image: string;
  description: string;
  availability: "DIARIA" | "TEMPORADA" | "BAJO_PEDIDO";
  featured: boolean;
  active: boolean;
  sortOrder: number;
  category: { id: string; slug: string; name: string };
  presentations: { id: string; name: string; sortOrder: number }[];
  prices: Price[];
};

const availabilityLabels = {
  DIARIA: "Diaria",
  TEMPORADA: "Temporada",
  BAJO_PEDIDO: "Bajo pedido",
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const prods = await res.json();
    setProducts(prods);
    const cats = Array.from(
      new Map(prods.map((p: Product) => [p.category.id, p.category])).values()
    ) as any[];
    setCategories(cats);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetch("/api/admin/products");
      const prods = await res.json();
      if (cancelled) return;
      setProducts(prods);
      const cats = Array.from(
        new Map(prods.map((p: Product) => [p.category.id, p.category])).values()
      ) as any[];
      setCategories(cats);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.scientific?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (p: Product) => {
    setEditing(p);
    setOpen(true);
  };

  const handleNew = () => {
    setEditing({
      id: "",
      slug: "",
      name: "",
      scientific: "",
      categoryId: categories[0]?.id || "",
      image: "",
      description: "",
      availability: "DIARIA",
      featured: false,
      active: true,
      sortOrder: products.length + 1,
      category: categories[0] || { id: "", slug: "", name: "" },
      presentations: [],
      prices: [],
    });
    setOpen(true);
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Producto eliminado");
      load();
    } else {
      toast.error("Error al eliminar");
    }
  };

  const toggleActive = async (p: Product) => {
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    });
    if (res.ok) {
      toast.success(p.active ? "Producto desactivado" : "Producto activado");
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground mt-1">
            {products.length} productos · {products.filter((p) => p.active).length} activos
          </p>
        </div>
        <Button onClick={handleNew} className="bg-ocean-600 hover:bg-ocean-700">
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      {/* Buscador */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Card key={p.id} className={cn("overflow-hidden", !p.active && "opacity-60")}>
              <div className="relative aspect-video bg-ocean-50">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-10 w-10 text-ocean-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {p.featured && (
                    <Badge className="bg-amber-brand-500 text-white border-0 text-[10px]">
                      ★ Destacado
                    </Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-bold text-foreground truncate">
                      {p.name}
                    </h3>
                    {p.scientific && (
                      <p className="text-xs text-muted-foreground italic truncate">
                        {p.scientific}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                    {p.category.slug}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {p.description}
                </p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Badge variant="secondary" className="text-[10px]">
                    {availabilityLabels[p.availability]}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {p.presentations.length} present.
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {p.prices.length} precios
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(p)}
                    className="flex-1"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(p)}
                    title={p.active ? "Desactivar" : "Activar"}
                  >
                    {p.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(p)}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No se encontraron productos.</p>
        </div>
      )}

      {/* Modal de edición */}
      {editing && (
        <ProductEditor
          // key por producto: fuerza a React a re-montar el editor (y por
          // tanto a re-inicializar su estado interno `form`) al cambiar de
          // producto. Sin esto, useState(product) conservaría el producto
          // abierto anteriormente. "new" para el alta de producto.
          key={editing.id || "new"}
          product={editing}
          categories={categories}
          open={open}
          onOpenChange={setOpen}
          onSaved={() => {
            setOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

// ============================================================
//  EDITOR DE PRODUCTO
// ============================================================

function ProductEditor({
  product,
  categories,
  open,
  onOpenChange,
  onSaved,
}: {
  product: Product;
  categories: { id: string; slug: string; name: string }[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(product);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (k: keyof Product, v: any) => setForm({ ...form, [k]: v });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Permitir volver a elegir el mismo archivo después.
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "No se pudo subir la imagen");
      update("image", json.url);
      toast.success("Imagen subida");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const updatePresentation = (i: number, v: string) => {
    const list = [...form.presentations];
    list[i] = { ...list[i], name: v };
    update("presentations", list);
  };

  const addPresentation = () =>
    update("presentations", [
      ...form.presentations,
      { id: "", name: "", sortOrder: form.presentations.length },
    ]);

  const removePresentation = (i: number) =>
    update(
      "presentations",
      form.presentations.filter((_, idx) => idx !== i)
    );

  const updatePrice = (i: number, k: keyof Price, v: any) => {
    const list = [...form.prices];
    list[i] = { ...list[i], [k]: v };
    update("prices", list);
  };

  const addPrice = () =>
    update("prices", [
      ...form.prices,
      {
        channel: "MENUDEO",
        presentation: "",
        pricePerKg: null,
        priceUnit: null,
        unit: "kg",
        minQuantity: 1,
        notes: "",
      },
    ]);

  const removePrice = (i: number) =>
    update("prices", form.prices.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      const isEdit = !!form.id;
      const url = isEdit
        ? `/api/admin/products/${form.id}`
        : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";
      const body = {
        name: form.name,
        scientific: form.scientific || null,
        categoryId: form.categoryId,
        image: form.image,
        description: form.description,
        availability: form.availability,
        featured: form.featured,
        active: form.active,
        sortOrder: form.sortOrder,
        presentations: form.presentations.map((p) => p.name).filter(Boolean),
        prices: form.prices.filter((p) => p.pricePerKg || p.priceUnit),
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Error al guardar");
      toast.success(isEdit ? "Producto actualizado" : "Producto creado");
      onSaved();
    } catch (e) {
      toast.error("Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {form.id ? "Editar producto" : "Nuevo producto"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Datos básicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Camarón"
              />
            </div>
            <div className="space-y-2">
              <Label>Nombre científico</Label>
              <Input
                value={form.scientific || ""}
                onChange={(e) => update("scientific", e.target.value)}
                placeholder="Litopenaeus vannamei"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={form.categoryId || undefined}
                onValueChange={(v) => update("categoryId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Disponibilidad</Label>
              <Select
                value={form.availability || "DIARIA"}
                onValueChange={(v: any) => update("availability", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DIARIA">Diaria</SelectItem>
                  <SelectItem value="TEMPORADA">Temporada</SelectItem>
                  <SelectItem value="BAJO_PEDIDO">Bajo pedido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Imagen</Label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Subir imagen
                  </>
                )}
              </Button>
              <span className="text-xs text-muted-foreground">
                JPG, PNG, WebP, GIF o AVIF · máx. 8 MB
              </span>
            </div>
            <Input
              value={form.image}
              onChange={(e) => update("image", e.target.value)}
              placeholder="…o pega una URL: https://..."
            />
            {form.image && (
              <div className="mt-2 aspect-video rounded-lg overflow-hidden bg-muted max-w-xs">
                <img src={form.image} alt="preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              placeholder="Descripción del producto..."
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => update("active", v)}
              />
              <Label className="cursor-pointer">Activo</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.featured}
                onCheckedChange={(v) => update("featured", v)}
              />
              <Label className="cursor-pointer">Destacado</Label>
            </div>
          </div>

          {/* Presentaciones */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Presentaciones</Label>
              <Button type="button" size="sm" variant="outline" onClick={addPresentation}>
                <Plus className="h-3.5 w-3.5" />
                Agregar
              </Button>
            </div>
            <div className="space-y-2">
              {form.presentations.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={p.name}
                    onChange={(e) => updatePresentation(i, e.target.value)}
                    placeholder="Ej: Pelado 16/20"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removePresentation(i)}
                    className="text-rose-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Precios */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Precios por canal</Label>
              <Button type="button" size="sm" variant="outline" onClick={addPrice}>
                <Plus className="h-3.5 w-3.5" />
                Agregar precio
              </Button>
            </div>
            <div className="space-y-2">
              {form.prices.map((p, i) => (
                <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Select
                      value={p.channel || "MENUDEO"}
                      onValueChange={(v: any) => updatePrice(i, "channel", v)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MAYOREO">Mayoreo</SelectItem>
                        <SelectItem value="MENUDEO">Menudeo</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={p.presentation || ""}
                      onChange={(e) => updatePrice(i, "presentation", e.target.value)}
                      placeholder="Presentación"
                      className="h-9"
                    />
                    <Input
                      type="number"
                      value={p.pricePerKg ?? ""}
                      onChange={(e) => updatePrice(i, "pricePerKg", e.target.value ? Number(e.target.value) : null)}
                      placeholder="$/kg"
                      className="h-9"
                    />
                    <Input
                      type="number"
                      value={p.priceUnit ?? ""}
                      onChange={(e) => updatePrice(i, "priceUnit", e.target.value ? Number(e.target.value) : null)}
                      placeholder="$ por pieza"
                      className="h-9"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={p.unit}
                      onChange={(e) => updatePrice(i, "unit", e.target.value)}
                      placeholder="unidad (kg, docena, litro)"
                      className="h-9"
                    />
                    <Input
                      type="number"
                      value={p.minQuantity}
                      onChange={(e) => updatePrice(i, "minQuantity", Number(e.target.value))}
                      placeholder="Mínimo"
                      className="h-9"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removePrice(i)}
                      className="text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={saving || !form.name} className="bg-ocean-600 hover:bg-ocean-700">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
