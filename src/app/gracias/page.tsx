import Link from "next/link";

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const s = status ?? "success";

  const title =
    s === "success"
      ? "¡Listo! Tu pago fue registrado"
      : s === "pending"
        ? "Pago pendiente"
        : "No se pudo completar el pago";

  const msg =
    s === "success"
      ? "Te contactamos por WhatsApp para coordinar entrega. Si querés acelerar, escribinos ahora."
      : s === "pending"
        ? "Mercado Pago está procesando el pago. Si querés, escribinos y te ayudamos."
        : "No pasa nada: intentá de nuevo o escribinos y lo resolvemos en 1 minuto.";

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 text-slate-200/90">{msg}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-emerald-950 shadow hover:bg-emerald-400"
          href="https://wa.me/5493816590235?text=Hola%20Rodrigo%2C%20acabo%20de%20comprar%20y%20quiero%20coordinar%20entrega."
          target="_blank"
          rel="noreferrer"
        >
          Hablar por WhatsApp
        </a>
        <Link className="rounded-xl border border-white/15 px-5 py-3 font-semibold hover:bg-white/5" href="/">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}

