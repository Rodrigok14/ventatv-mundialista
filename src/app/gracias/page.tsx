import Link from "next/link";
import GraciasClient from "@/app/gracias/ui/GraciasClient";

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    order_id?: string;
    payment_id?: string;
    collection_id?: string;
  }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "success";
  const paymentId = params.payment_id ?? params.collection_id;

  if (status === "success" && params.order_id) {
    return <GraciasClient orderId={params.order_id} paymentId={paymentId} />;
  }

  const title = status === "pending" ? "Pago pendiente" : "No se pudo completar el pago";
  const msg =
    status === "pending"
      ? "Mercado Pago está procesando el pago. Si querés, escribinos y te ayudamos."
      : "No pasa nada: intentá de nuevo o escribinos y lo resolvemos en 1 minuto.";

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-4 text-slate-200/90">{msg}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-emerald-950 shadow hover:bg-emerald-400"
          href="https://wa.me/5493816590235?text=Hola%20Rodrigo%2C%20necesito%20ayuda%20con%20mi%20compra."
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

