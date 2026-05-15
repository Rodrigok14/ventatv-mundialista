import Link from "next/link";
import { headers } from "next/headers";
import HeroStage from "@/components/HeroStage";
import ProductCard from "@/components/ProductCard";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { getCatalog } from "@/lib/catalog";

function baseUrlFromHeaders(h: Headers) {
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

function formatArs(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
}

export default async function Home() {
  const catalog = await getCatalog();
  const active = catalog.products.filter((p) => p.active);
  const featured = active.filter((p) => p.featured);
  const rest = active.filter((p) => !p.featured);
  const lowestPrice = active.length ? Math.min(...active.map((p) => p.priceArs)) : null;
  const h = await headers();
  const baseUrl = process.env.SITE_URL ?? baseUrlFromHeaders(h);

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/35 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="font-extrabold">
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

      <main>
        <section className="hero-shell mx-auto grid max-w-6xl gap-9 px-6 pb-10 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:pt-14">
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-200/25 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-100">
              <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(250,204,21,0.9)]" />
              Stock limitado para el Mundial • Envíos a todo Argentina
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.02] sm:text-5xl lg:text-6xl">
              Smart TVs para ver el Mundial como si estuvieras en la cancha
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-100/85">
              Comprá con Mercado Pago, asegurá stock por WhatsApp y recibí en Tucumán en 24 hs. Para el resto del país,
              coordinamos envío directo.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a className="cta-primary rounded-xl bg-amber-400 px-5 py-3 font-extrabold text-amber-950 shadow hover:bg-amber-300" href="#productos">
                Ver TVs disponibles
              </a>
              <WhatsAppCTA text="Hola Rodrigo, quiero asegurar mi TV para el Mundial. ¿Qué modelos y precios tenés hoy?">
                Reservar por WhatsApp
              </WhatsAppCTA>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="proof-tile">
                <p className="text-2xl font-extrabold">24 hs</p>
                <p className="mt-1 text-sm text-slate-200/80">Entrega en Tucumán</p>
              </div>
              <div className="proof-tile">
                <p className="text-2xl font-extrabold">MP</p>
                <p className="mt-1 text-sm text-slate-200/80">Pago seguro</p>
              </div>
              <div className="proof-tile">
                <p className="text-2xl font-extrabold">{active.length || 2}</p>
                <p className="mt-1 text-sm text-slate-200/80">Modelos en catálogo</p>
              </div>
            </div>
          </div>

          <HeroStage />
        </section>

        <section className="border-y border-white/10 bg-white/[0.035]">
          <div className="mx-auto grid max-w-6xl gap-5 px-6 py-8 md:grid-cols-4">
            {[
              ["Menos fricción", "Comprás en 2 pasos: producto y Mercado Pago."],
              ["Cero dudas", "Atención directa con Rodrigo por WhatsApp."],
              ["Urgencia real", "Stock limitado por tanda mundialista."],
              ["Entrega clara", "Tucumán 24 hs y envíos nacionales."],
            ].map(([title, text]) => (
              <div key={title} className="benefit-line">
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm text-slate-200/75">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="productos" className="mx-auto mt-12 max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-3xl font-extrabold">Elegí tu TV mundialista</h2>
              <p className="mt-1 text-sm text-slate-200/80">
                Precios visibles, pago seguro y contacto directo. Si un modelo te sirve, asegurá stock hoy.
              </p>
            </div>
            <p className="text-xs text-slate-200/60">Actualizado: {new Date(catalog.updatedAt).toLocaleString("es-AR")}</p>
          </div>

          {active.length === 0 ? (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6 text-slate-200/80">
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

        <section className="mx-auto mt-14 max-w-6xl px-6">
          <div className="conversion-band">
            <div>
              <p className="text-xs font-semibold uppercase text-sky-100/70">Oferta activa</p>
              <h2 className="mt-1 text-2xl font-extrabold">No esperes al primer partido para buscar TV</h2>
              <p className="mt-2 text-sm text-slate-200/80">
                Cuando sube la demanda, suben las consultas y se achica el stock. Reservá ahora y coordiná entrega.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a className="cta-primary rounded-xl bg-amber-400 px-5 py-3 font-extrabold text-amber-950" href="#productos">
                Comprar ahora
              </a>
              <WhatsAppCTA text="Hola Rodrigo, quiero reservar una TV antes de que se agote el stock.">Consultar stock</WhatsAppCTA>
            </div>
          </div>
        </section>

        <section id="faqs" className="mx-auto mt-16 max-w-6xl px-6">
          <h2 className="text-2xl font-extrabold">Preguntas frecuentes</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {[
              {
                q: "¿Cómo compro?",
                a: "Elegís tu TV, tocás Comprar ahora, pagás con Mercado Pago y te contactamos por WhatsApp para coordinar entrega.",
              },
              {
                q: "¿Envían a todo el país?",
                a: "Sí. Hacemos envíos a todo Argentina. En Tucumán, la entrega es en 24 hs según disponibilidad y horario.",
              },
              {
                q: "¿El stock es real?",
                a: "Sí: trabajamos por tandas y puede agotarse. Si querés asegurar, escribinos por WhatsApp y te confirmamos unidades.",
              },
              {
                q: "¿Puedo compartir el producto con alguien?",
                a: "Sí: en cada producto tenés Compartir WhatsApp, Compartir y Copiar link.",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="font-semibold">{item.q}</p>
                <p className="mt-2 text-sm text-slate-200/85">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-slate-200/85">¿Querés que te asesore y te recomiende el mejor modelo por presupuesto?</p>
            <WhatsAppCTA text="Hola Rodrigo, decime cuál TV me conviene para el Mundial según mi presupuesto.">Quiero recomendación</WhatsAppCTA>
          </div>
        </section>

        <section id="politicas" className="mx-auto mt-16 max-w-6xl px-6 pb-24">
          <h2 className="text-2xl font-extrabold">Políticas</h2>
          <div className="mt-6 grid gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">Entrega y coordinación</p>
              <p className="mt-2 text-sm text-slate-200/85">
                Coordinamos por WhatsApp al <span className="font-semibold text-white">3816590235</span>. Envíos a todo el país. En Tucumán,
                entrega en 24 hs según disponibilidad y zona.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">Stock limitado</p>
              <p className="mt-2 text-sm text-slate-200/85">
                Los precios y unidades pueden cambiar por demanda. Recomendamos comprar apenas veas el modelo que querés.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
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

      <div className="conversion-dock">
        <div>
          <p className="text-xs text-slate-200/70">Desde {lowestPrice ? formatArs(lowestPrice) : "precio admin"}</p>
          <p className="text-sm font-bold">Stock mundialista limitado</p>
        </div>
        <a className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-extrabold text-amber-950" href="#productos">
          Ver TVs
        </a>
      </div>

      <footer className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8">
          <p className="text-sm text-slate-200/70">© {new Date().getFullYear()} Mundial TV - Atención WhatsApp: 3816590235</p>
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

