import Link from "next/link";
import WhatsAppCTA from "@/components/WhatsAppCTA";

export const dynamic = "force-dynamic";

export default function FaqsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">FAQs</h1>
        <Link className="rounded-xl border border-white/15 px-4 py-2 font-semibold hover:bg-white/5" href="/">
          Volver
        </Link>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {[
          {
            q: "¿Cómo compro?",
            a: "Elegís tu TV, tocás “Comprar ahora”, pagás con Mercado Pago y te contactamos por WhatsApp para coordinar entrega.",
          },
          {
            q: "¿Envían a todo el país?",
            a: "Sí. Envíos a todo Argentina. En Tucumán la entrega es en 24 hs (según disponibilidad y horario).",
          },
          {
            q: "¿El stock es limitado?",
            a: "Sí, trabajamos por tandas. Si querés asegurar unidades, escribinos por WhatsApp y te confirmamos disponibilidad.",
          },
          {
            q: "¿Puedo compartir con alguien?",
            a: "Sí: cada producto tiene botón de compartir por WhatsApp, Web Share y copiar link.",
          },
        ].map((item) => (
          <section key={item.q} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="font-semibold">{item.q}</h2>
            <p className="mt-2 text-sm text-slate-200/85">{item.a}</p>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-5">
        <p className="text-sm text-slate-200/85">¿Querés recomendación según tu presupuesto?</p>
        <WhatsAppCTA text="Hola Rodrigo, quiero recomendación de TV para el Mundial según mi presupuesto.">
          Hablar por WhatsApp
        </WhatsAppCTA>
      </div>
    </main>
  );
}

