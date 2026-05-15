"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  title: string;
  subtitle?: string;
  priceArs: number;
  previousPriceArs?: number;
  imageUrl?: string;
  galleryImages?: string[];
  featured?: boolean;
  active?: boolean;
  stockNote?: string;
};

type Catalog = {
  version: 1;
  updatedAt: string;
  products: Product[];
};

const emptyProduct: Product = {
  id: "",
  title: "",
  subtitle: "",
  priceArs: 0,
  previousPriceArs: undefined,
  imageUrl: "",
  galleryImages: [],
  featured: false,
  active: true,
  stockNote: "Stock limitado",
};

function formatArs(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
}

export default function AdminClient() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("rodrigo");
  const [password, setPassword] = useState("");
  const [editing, setEditing] = useState<Product>(emptyProduct);

  async function refresh() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/catalog", { cache: "no-store" });
    if (res.status === 401) {
      setLoggedIn(false);
      setCatalog(null);
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { ok: boolean; catalog?: Catalog };
    if (!data.ok || !data.catalog) {
      setError("No se pudo cargar el catálogo.");
      setLoading(false);
      return;
    }
    setCatalog(data.catalog);
    setLoggedIn(true);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const products = useMemo(() => catalog?.products ?? [], [catalog]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      setError("Usuario o clave inválidos.");
      setLoading(false);
      return;
    }
    setPassword("");
    await refresh();
  }

  async function onLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setLoggedIn(false);
    setCatalog(null);
  }

  async function uploadImage(file: File) {
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
    const data = (await res.json()) as { ok: boolean; url?: string };
    if (!res.ok || !data.ok || !data.url) throw new Error("upload_failed");
    return data.url;
  }

  async function onUpload(file: File, slot: "main" | 0 | 1) {
    const url = await uploadImage(file);
    setEditing((current) => {
      if (slot === "main") return { ...current, imageUrl: url };
      const next = [...(current.galleryImages ?? [])];
      next[slot] = url;
      return { ...current, galleryImages: next.filter(Boolean).slice(0, 2) };
    });
  }

  async function onRemoveImage(slot: "main" | 0 | 1) {
    const url = slot === "main" ? editing.imageUrl : editing.galleryImages?.[slot];
    if (!url) return;
    if (confirm("¿Borrar esta imagen del producto y del storage si corresponde?")) {
      await fetch("/api/admin/image/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      }).catch(() => null);
      setEditing((current) => {
        if (slot === "main") return { ...current, imageUrl: "" };
        const next = [...(current.galleryImages ?? [])];
        next.splice(slot, 1);
        return { ...current, galleryImages: next };
      });
    }
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const previousPriceArs = Number(editing.previousPriceArs || 0);
    const payload = {
      ...editing,
      id: editing.id.trim(),
      title: editing.title.trim(),
      subtitle: (editing.subtitle ?? "").trim(),
      imageUrl: (editing.imageUrl ?? "").trim(),
      galleryImages: (editing.galleryImages ?? []).filter(Boolean).slice(0, 2),
      stockNote: (editing.stockNote ?? "").trim(),
      priceArs: Number(editing.priceArs),
      previousPriceArs: previousPriceArs > 0 ? previousPriceArs : undefined,
    };
    const res = await fetch("/api/admin/product/upsert", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { ok: boolean; catalog?: Catalog };
    if (!res.ok || !data.ok || !data.catalog) {
      setError("No se pudo guardar. Revisá los campos.");
      return;
    }
    setCatalog(data.catalog);
    setEditing(emptyProduct);
  }

  async function onDelete(id: string) {
    if (!confirm(`Eliminar producto "${id}"?`)) return;
    const res = await fetch("/api/admin/product/delete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = (await res.json().catch(() => ({ ok: false }))) as { ok: boolean; catalog?: Catalog };
    if (!res.ok || !data.ok || !data.catalog) {
      setError("No se pudo eliminar.");
      return;
    }
    setCatalog(data.catalog);
  }

  function imageUploader(label: string, slot: "main" | 0 | 1, url?: string) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
        <span className="text-sm text-slate-200/80">{label}</span>
        <input
          className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-2 file:py-1 file:text-white"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            void onUpload(f, slot).catch(() => setError("No se pudo subir la imagen."));
          }}
        />
        {url ? (
          <div className="mt-2">
            <p className="break-all text-xs text-slate-200/65">{url}</p>
            <button type="button" className="mt-2 rounded-lg border border-rose-400/30 px-3 py-1 text-xs text-rose-200" onClick={() => void onRemoveImage(slot)}>
              Borrar imagen
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  if (loading && !catalog) return <p className="text-slate-200/80">Cargando...</p>;

  if (!loggedIn) {
    return (
      <section className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold">Admin</h1>
        <p className="mt-2 text-sm text-slate-200/80">Entrá para subir imágenes, definir precios y activar productos.</p>
        <form className="mt-6 space-y-3" onSubmit={onLogin}>
          <input className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button className="w-full rounded-xl bg-sky-400 px-4 py-3 font-semibold text-sky-950" disabled={!password || !username}>
            Entrar
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Panel Admin</h1>
          <p className="text-sm text-slate-200/80">Catálogo: {catalog ? new Date(catalog.updatedAt).toLocaleString() : "-"}</p>
        </div>
        <button className="rounded-xl border border-white/15 px-4 py-2 font-semibold hover:bg-white/5" onClick={onLogout}>
          Salir
        </button>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Crear / Editar</h2>
          <form className="mt-4 space-y-3" onSubmit={onSave}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-200/80">ID (slug)</span>
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" value={editing.id} onChange={(e) => setEditing((p) => ({ ...p, id: e.target.value }))} />
              </label>
              <label className="block">
                <span className="text-sm text-slate-200/80">Precio actual (ARS)</span>
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" value={editing.priceArs || ""} onChange={(e) => setEditing((p) => ({ ...p, priceArs: Number(e.target.value) }))} inputMode="numeric" />
              </label>
              <label className="block">
                <span className="text-sm text-slate-200/80">Precio de antes (ARS)</span>
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" value={editing.previousPriceArs || ""} onChange={(e) => setEditing((p) => ({ ...p, previousPriceArs: Number(e.target.value) || undefined }))} inputMode="numeric" />
              </label>
              <label className="block">
                <span className="text-sm text-slate-200/80">Nota de stock</span>
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" value={editing.stockNote ?? ""} onChange={(e) => setEditing((p) => ({ ...p, stockNote: e.target.value }))} />
              </label>
            </div>
            <label className="block">
              <span className="text-sm text-slate-200/80">Título</span>
              <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" value={editing.title} onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))} />
            </label>
            <label className="block">
              <span className="text-sm text-slate-200/80">Subtítulo</span>
              <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" value={editing.subtitle ?? ""} onChange={(e) => setEditing((p) => ({ ...p, subtitle: e.target.value }))} />
            </label>
            <div className="grid gap-3">
              {imageUploader("Imagen principal", "main", editing.imageUrl)}
              <div className="grid gap-3 sm:grid-cols-2">
                {imageUploader("Imagen extra 1", 0, editing.galleryImages?.[0])}
                {imageUploader("Imagen extra 2", 1, editing.galleryImages?.[1])}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!editing.active} onChange={(e) => setEditing((p) => ({ ...p, active: e.target.checked }))} />
                Activo
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing((p) => ({ ...p, featured: e.target.checked }))} />
                Destacado
              </label>
            </div>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <button className="w-full rounded-xl bg-sky-400 px-4 py-3 font-semibold text-sky-950">Guardar producto</button>
          </form>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Productos</h2>
            <button className="rounded-xl border border-white/15 px-4 py-2 font-semibold hover:bg-white/5" onClick={refresh}>
              Refrescar
            </button>
          </div>
          <ul className="mt-4 space-y-3">
            {products.map((p) => (
              <li key={p.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-sm text-slate-200/80">
                      {p.previousPriceArs ? <span className="mr-2 line-through">{formatArs(p.previousPriceArs)}</span> : null}
                      {formatArs(p.priceArs)}
                    </p>
                    <p className="text-xs text-slate-200/60">{(p.galleryImages ?? []).length + (p.imageUrl ? 1 : 0)} imágenes</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/5" onClick={() => setEditing({ ...emptyProduct, ...p, galleryImages: p.galleryImages ?? [] })}>
                      Editar
                    </button>
                    <button className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200" onClick={() => void onDelete(p.id)}>
                      Borrar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
