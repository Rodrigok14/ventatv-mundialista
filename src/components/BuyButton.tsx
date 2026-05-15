"use client";

import { useState } from "react";

type Props = {
  productId: string;
  quantity?: number;
};

export default function BuyButton({ productId, quantity = 1 }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onBuy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = (await res.json()) as { ok: boolean; init_point?: string | null; sandbox_init_point?: string | null };
      if (!res.ok || !data.ok) throw new Error("checkout_failed");
      const url = data.init_point || data.sandbox_init_point;
      if (!url) throw new Error("missing_init_point");
      window.location.href = url;
    } catch {
      setError("No se pudo iniciar el pago. Probá de nuevo o escribinos por WhatsApp.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        className="w-full rounded-xl bg-amber-400 px-5 py-3 text-center font-extrabold tracking-tight text-amber-950 shadow hover:bg-amber-300 disabled:opacity-60"
        onClick={() => void onBuy()}
        disabled={loading}
      >
        {loading ? "Abriendo Mercado Pago…" : "Comprar ahora"}
      </button>
      {error ? <p className="text-sm text-rose-200">{error}</p> : null}
    </div>
  );
}

