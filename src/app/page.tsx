import Link from "next/link";
import { headers } from "next/headers";
import ProductCard from "@/components/ProductCard";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { getCatalog } from "@/lib/catalog";

function baseUrlFromHeaders(h: Headers) {
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export default async function Home() {
  const catalog = await getCatalog();
  const active = catalog.products.filter((p) => p.active);
  const featured = active.filter((p) => p.featured);
  const rest = active.filter((p) => !p.featured);
  const h = await headers();
  const baseUrl = process.env.SITE_URL ?? baseUrlFromHeaders(h);

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="font-extrabold tracking-tight">
            <span className="text-sky-300">Mundial</span> <span className="text-white">TV</span>{" "}
            <span className="text-amber-300">AR</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-100/90 sm:flex">
            <Link className="hover:text-white" href="#productos">
              Productos
            </Link>
            <Link className="hover:text-white" href="#faqs">
              FAQs
            </Link>
            <Link className="hover:text-white" href="#politicas">
              Políticas
            </Link>
          </nav>
          <WhatsAppCTA className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-extrabold text-emerald-950 shadow hover:bg-emerald-400">
            WhatsApp directo
          </WhatsAppCTA>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-100/80">
              <span className="h-2 w-2 rounded-full bg-amber-300" /> Stock limitado • Envíos a todo Argentina
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Tu Mundial se ve <span className="text-sky-300">mejor</span> en una{" "}
              <span className="text-amber-300">Smart TV</span>
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-200/85">
              Elegí tu modelo, pagá con Mercado Pago y coordinamos entrega por WhatsApp. En Tucumán:{" "}
              <span className="font-semibold text-white">24 hs</span>.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                className="rounded-xl bg-amber-400 px-5 py-3 font-extrabold tracking-tight text-amber-950 shadow hover:bg-amber-300"
                href="#productos"
              >
                Ver precios y comprar
              </a>
              <WhatsAppCTA text="Hola Rodrigo, quiero asegurar mi TV para el Mundial. ¿Qué opciones y precios tenés hoy?">
                Asesoría 1 a 1 (WhatsApp)
              </WhatsAppCTA>
              <Link className="rounded-xl border border-white/15 px-5 py-3 font-semibold hover:bg-white/5" href="#faqs">
                Ver FAQs
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold">Confianza</p>
                <p className="mt-1 text-sm text-slate-200/80">Atención directa por WhatsApp (sin vueltas).</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold">Urgencia</p>
                <p className="mt-1 text-sm text-slate-200/80">Stock limitado por tanda “Mundial”.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold">Entrega</p>
                <p className="mt-1 text-sm text-slate-200/80">Envíos a todo el país • Tucumán 24 hs.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/20 via-white/5 to-amber-400/10 p-6">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
              <h2 className="text-xl font-extrabold tracking-tight">Checklist “Mundial Ready”</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-200/85">
                <li>• 4K para ver cada detalle.</li>
                <li>• Apps listas para streaming y cable.</li>
                <li>• Sonido potente para gritar el gol.</li>
                <li>• Pagás con Mercado Pago y coordinamos entrega.</li>
              </ul>
              <p className="mt-4 text-xs text-slate-200/65">
                Tip: si querés asegurar stock, escribinos por WhatsApp antes de que se agoten.
              </p>
              <div className="mt-5">
                <WhatsAppCTA text="Hola Rodrigo, quiero asegurar stock hoy. ¿Me pasás los modelos disponibles y entrega a mi ciudad?">
                  Asegurar stock por WhatsApp
                </WhatsAppCTA>
              </div>
            </div>
          </div>
        </section>

        <section id="productos" className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">Productos y precios</h2>
              <p className="mt-1 text-sm text-slate-200/80">
                Pagás en Mercado Pago. Compartí el link y coordinamos todo por WhatsApp.
              </p>
            </div>
            <p className="text-xs text-slate-200/60">Actualizado: {new Date(catalog.updatedAt).toLocaleString("es-AR")}</p>
          </div>

          {active.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-200/80">
              Todavía no hay productos activos. Entrá a <span className="font-semibold">/admin</span> para cargar precios e imágenes.
            </div>
          ) : (
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {featured.map((p) => (
                <ProductCard key={p.id} baseUrl={baseUrl} product={p} />
              ))}
              {rest.map((p) => (
                <ProductCard key={p.id} baseUrl={baseUrl} product={p} />
              ))}
            </div>
          )}
        </section>

        <section id="faqs" className="mt-16">
          <h2 className="text-2xl font-extrabold tracking-tight">FAQs</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {[
              {
                q: "¿Cómo compro?",
                a: "Elegís tu TV, tocás “Comprar ahora”, pagás con Mercado Pago y te contactamos por WhatsApp para coordinar entrega.",
              },
              {
                q: "¿Envían a todo el país?",
                a: "Sí. Hacemos envíos a todo Argentina. En Tucumán, la entrega es en 24 hs (según disponibilidad y horario).",
              },
              {
                q: "¿El stock es real?",
                a: "Sí: trabajamos por tandas y puede agotarse. Si querés asegurar, escribinos por WhatsApp y te confirmamos unidades.",
              },
              {
                q: "¿Puedo compartir el producto con alguien?",
                a: "Sí: en cada producto tenés “Compartir WhatsApp”, “Compartir” y “Copiar link”.",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="font-semibold">{item.q}</p>
                <p className="mt-2 text-sm text-slate-200/85">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-slate-200/85">
              ¿Querés que te asesore y te recomiende el mejor modelo por presupuesto?
            </p>
            <WhatsAppCTA text="Hola Rodrigo, decime cuál TV me conviene para el Mundial según mi presupuesto.">
              Quiero recomendación
            </WhatsAppCTA>
          </div>
        </section>

        <section id="politicas" className="mt-16">
          <h2 className="text-2xl font-extrabold tracking-tight">Políticas</h2>
          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">Entrega y coordinación</p>
              <p className="mt-2 text-sm text-slate-200/85">
                Coordinamos por WhatsApp al <span className="font-semibold text-white">3816590235</span>. Envíos a todo el país. En Tucumán,
                entrega en 24 hs (según disponibilidad y zona).
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">Stock limitado</p>
              <p className="mt-2 text-sm text-slate-200/85">
                Los precios y unidades pueden cambiar por demanda. Recomendamos comprar apenas veas el modelo que querés.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">Pagos</p>
              <p className="mt-2 text-sm text-slate-200/85">
                El pago se realiza por Mercado Pago (Checkout Pro). Una vez aprobado, te contactamos para coordinar entrega.
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-200/60">
            Nota: este sitio no guarda tus datos de pago; el proceso ocurre dentro de Mercado Pago.
          </p>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8">
          <p className="text-sm text-slate-200/70">
            © {new Date().getFullYear()} Mundial TV — Atención WhatsApp: 3816590235
          </p>
          <div className="flex gap-4 text-sm font-semibold">
            <Link className="text-slate-200/70 hover:text-white" href="/admin">
              Admin
            </Link>
            <Link className="text-slate-200/70 hover:text-white" href="/faqs">
              FAQs
            </Link>
            <Link className="text-slate-200/70 hover:text-white" href="/politicas">
              Políticas
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
