"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  title: string;
  subtitle?: string;
  priceArs: number;
  imageUrl?: string;
  featured?: boolean;
  active?: boolean;
  stockNote?: string;
};

type Catalog = {
  version: 1;
  updatedAt: string;
  products: Product[];
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

  const [editing, setEditing] = useState<Product>({
    id: "",
    title: "",
    subtitle: "",
    priceArs: 0,
    imageUrl: "",
    featured: false,
    active: true,
    stockNote: "Stock limitado",
  });

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

  async function onUpload(file: File) {
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
    const data = (await res.json()) as { ok: boolean; url?: string };
    if (!res.ok || !data.ok || !data.url) throw new Error("upload_failed");
    setEditing((p) => ({ ...p, imageUrl: data.url }));
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      ...editing,
      id: editing.id.trim(),
      title: editing.title.trim(),
      subtitle: (editing.subtitle ?? "").trim(),
      imageUrl: (editing.imageUrl ?? "").trim(),
      stockNote: (editing.stockNote ?? "").trim(),
      priceArs: Number(editing.priceArs),
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
    setEditing({
      id: "",
      title: "",
      subtitle: "",
      priceArs: 0,
      imageUrl: "",
      featured: false,
      active: true,
      stockNote: "Stock limitado",
    });
  }

  async function onDelete(id: string) {
    if (!confirm(`Eliminar producto "${id}"?`)) return;
    const res = await fetch("/api/admin/product/delete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = (await res.json()) as { ok: boolean; catalog?: Catalog };
    if (!res.ok || !data.ok || !data.catalog) {
      setError("No se pudo eliminar.");
      return;
    }
    setCatalog(data.catalog);
  }

  if (loading && !catalog) {
    return <p className="text-slate-200/80">Cargando…</p>;
  }

  if (!loggedIn) {
    return (
      <section className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Admin</h1>
          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-200">
            Acceso privado
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-200/80">Entrá para subir imágenes, definir precios y activar productos.</p>
        <form className="mt-6 space-y-3" onSubmit={onLogin}>
          <label className="block">
            <span className="text-sm text-slate-200/80">Usuario</span>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-sky-400/60"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-200/80">Clave</span>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-sky-400/60"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </label>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button
            className="w-full rounded-xl bg-sky-400 px-4 py-3 font-semibold text-sky-950 shadow hover:bg-sky-300 disabled:opacity-60"
            disabled={!password || !username}
          >
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
          <h1 className="text-2xl font-semibold tracking-tight">Panel Admin</h1>
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
                <input
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-sky-400/60"
                  value={editing.id}
                  onChange={(e) => setEditing((p) => ({ ...p, id: e.target.value }))}
                  placeholder="tv-55-4k"
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-200/80">Precio (ARS)</span>
                <input
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-sky-400/60"
                  value={editing.priceArs || ""}
                  onChange={(e) => setEditing((p) => ({ ...p, priceArs: Number(e.target.value) }))}
                  inputMode="numeric"
                  placeholder="799999"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-sm text-slate-200/80">Título</span>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-sky-400/60"
                value={editing.title}
                onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))}
                placeholder="Smart TV 55” 4K Mundialista"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-200/80">Subtítulo</span>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-sky-400/60"
                value={editing.subtitle ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, subtitle: e.target.value }))}
                placeholder="Edición Argentina — stock limitado"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-200/80">Imagen</span>
                <input
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/15"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    void onUpload(f).catch(() => setError("No se pudo subir la imagen."));
                  }}
                />
                {editing.imageUrl ? (
                  <p className="mt-2 break-all text-xs text-slate-200/70">OK: {editing.imageUrl}</p>
                ) : (
                  <p className="mt-2 text-xs text-slate-200/60">Subí una imagen para la landing.</p>
                )}
              </label>
              <label className="block">
                <span className="text-sm text-slate-200/80">Nota de stock</span>
                <input
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-sky-400/60"
                  value={editing.stockNote ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, stockNote: e.target.value }))}
                  placeholder="Últimas unidades"
                />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!editing.active}
                  onChange={(e) => setEditing((p) => ({ ...p, active: e.target.checked }))}
                />
                Activo
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!editing.featured}
                  onChange={(e) => setEditing((p) => ({ ...p, featured: e.target.checked }))}
                />
                Destacado
              </label>
            </div>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <button className="w-full rounded-xl bg-sky-400 px-4 py-3 font-semibold text-sky-950 shadow hover:bg-sky-300">
              Guardar producto
            </button>
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
            {products.length === 0 ? (
              <li className="text-sm text-slate-200/70">Todavía no hay productos.</li>
            ) : (
              products.map((p) => (
                <li key={p.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {p.title}{" "}
                        {!p.active ? (
                          <span className="ml-2 rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-semibold text-rose-200">
                            Inactivo
                          </span>
                        ) : null}
                        {p.featured ? (
                          <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-200">
                            Destacado
                          </span>
                        ) : null}
                      </p>
                      <p className="text-sm text-slate-200/80">{formatArs(p.priceArs)}</p>
                      {p.stockNote ? <p className="text-xs text-slate-200/60">{p.stockNote}</p> : null}
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/5"
                        onClick={() => setEditing({ ...p, subtitle: p.subtitle ?? "", imageUrl: p.imageUrl ?? "" })}
                      >
                        Editar
                      </button>
                      <button
                        className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-500/15"
                        onClick={() => void onDelete(p.id)}
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
