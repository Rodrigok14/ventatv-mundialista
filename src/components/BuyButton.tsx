"use client";

import { useState } from "react";

type Props = {
  productId: string;
  quantity?: number;
};

export default function BuyButton({ productId, quantity = 1 }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    deliveryWindow: "",
  });

  async function onBuy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, quantity, customer }),
      });
      const data = (await res.json()) as { ok: boolean; init_point?: string | null; sandbox_init_point?: string | null };
      if (!res.ok || !data.ok) throw new Error("checkout_failed");
      const url = data.init_point || data.sandbox_init_point;
      if (!url) throw new Error("missing_init_point");
      window.location.href = url;
    } catch {
      setError("No se pudo iniciar el pago. Revisá tus datos o escribinos por WhatsApp.");
      setLoading(false);
    }
  }

  const valid =
    customer.name.length > 1 &&
    customer.email.includes("@") &&
    customer.phone.length > 5 &&
    customer.address.length > 7 &&
    customer.deliveryWindow.length > 2;

  if (!open) {
    return (
      <button
        className="w-full rounded-xl bg-amber-400 px-5 py-3 text-center font-extrabold text-amber-950 shadow hover:bg-amber-300"
        onClick={() => setOpen(true)}
      >
        Comprar ahora
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
      <p className="text-sm font-bold">Datos para entrega y garantía</p>
      <div className="mt-3 grid gap-2">
        {[
          ["name", "Nombre y apellido"],
          ["email", "Email para garantía PDF"],
          ["phone", "WhatsApp"],
          ["address", "Dirección completa de entrega"],
          ["deliveryWindow", "Horario disponible para recibir"],
        ].map(([key, label]) => (
          <input
            key={key}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-sky-300"
            placeholder={label}
            value={customer[key as keyof typeof customer]}
            onChange={(event) => setCustomer((current) => ({ ...current, [key]: event.target.value }))}
          />
        ))}
      </div>
      {error ? <p className="mt-2 text-sm text-rose-200">{error}</p> : null}
      <button
        className="mt-3 w-full rounded-xl bg-amber-400 px-5 py-3 text-center font-extrabold text-amber-950 shadow hover:bg-amber-300 disabled:opacity-60"
        onClick={() => void onBuy()}
        disabled={!valid || loading}
      >
        {loading ? "Abriendo Mercado Pago..." : "Pagar con Mercado Pago"}
      </button>
      <button className="mt-2 w-full text-xs text-slate-300 hover:text-white" onClick={() => setOpen(false)}>
        Cancelar
      </button>
    </div>
  );
}

