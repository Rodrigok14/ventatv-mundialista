"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  orderId: string;
  paymentId?: string;
};

type CompleteResponse = {
  ok: boolean;
  error?: string;
  whatsappUrl?: string;
  warrantyUrl?: string;
};

export default function GraciasClient({ orderId, paymentId }: Props) {
  const [state, setState] = useState<"loading" | "done" | "error">("loading");
  const [data, setData] = useState<CompleteResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const res = await fetch("/api/order/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId, paymentId }),
      });
      const json = (await res.json()) as CompleteResponse;
      if (cancelled) return;
      setData(json);
      setState(res.ok && json.ok ? "done" : "error");
      if (res.ok && json.ok && json.whatsappUrl) {
        window.setTimeout(() => {
          window.location.href = json.whatsappUrl!;
        }, 1800);
      }
    }
    void run().catch(() => {
      if (!cancelled) setState("error");
    });
    return () => {
      cancelled = true;
    };
  }, [orderId, paymentId]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Compra registrada</h1>
      {state === "loading" ? (
        <p className="mt-4 text-slate-200/90">Generando garantía PDF, enviando email y preparando WhatsApp...</p>
      ) : state === "done" ? (
        <p className="mt-4 text-slate-200/90">
          Garantía enviada al email del cliente. Te estamos llevando a WhatsApp con comprobante, dirección y horario de entrega.
        </p>
      ) : (
        <p className="mt-4 text-rose-200">
          No se pudo completar el envío automático. Error: {data?.error ?? "desconocido"}. Escribinos por WhatsApp para resolverlo.
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {data?.whatsappUrl ? (
          <a className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-emerald-950 shadow hover:bg-emerald-400" href={data.whatsappUrl}>
            Abrir WhatsApp
          </a>
        ) : null}
        {data?.warrantyUrl ? (
          <a className="rounded-xl border border-white/15 px-5 py-3 font-semibold hover:bg-white/5" href={data.warrantyUrl} target="_blank" rel="noreferrer">
            Ver garantía PDF
          </a>
        ) : null}
        <Link className="rounded-xl border border-white/15 px-5 py-3 font-semibold hover:bg-white/5" href="/">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}

