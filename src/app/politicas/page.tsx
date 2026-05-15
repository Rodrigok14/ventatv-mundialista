import Link from "next/link";
import WhatsAppCTA from "@/components/WhatsAppCTA";

export const dynamic = "force-dynamic";

export default function PoliticasPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Políticas</h1>
        <Link className="rounded-xl border border-white/15 px-4 py-2 font-semibold hover:bg-white/5" href="/">
          Volver
        </Link>
      </div>

      <div className="mt-8 grid gap-4">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-semibold">Entrega y coordinación</h2>
          <p className="mt-2 text-sm text-slate-200/85">
            Coordinamos por WhatsApp al <span className="font-semibold text-white">3816590235</span>. Envíos a todo el país. En Tucumán, entrega
            en 24 hs (según disponibilidad y zona).
          </p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-semibold">Stock limitado</h2>
          <p className="mt-2 text-sm text-slate-200/85">
            Los precios y unidades pueden cambiar por demanda. Recomendamos comprar apenas veas el modelo que querés.
          </p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-semibold">Pagos</h2>
          <p className="mt-2 text-sm text-slate-200/85">
            El pago se realiza por Mercado Pago (Checkout Pro). Una vez aprobado, te contactamos para coordinar entrega.
          </p>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-5">
        <p className="text-sm text-slate-200/85">¿Dudas? Te atendemos directo.</p>
        <WhatsAppCTA text="Hola Rodrigo, tengo una consulta sobre entrega/pago.">WhatsApp</WhatsAppCTA>
      </div>

      <p className="mt-4 text-xs text-slate-200/60">Este sitio no procesa ni almacena datos de pago; el pago ocurre dentro de Mercado Pago.</p>
    </main>
  );
}

