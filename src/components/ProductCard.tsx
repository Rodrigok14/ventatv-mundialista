import Image from "next/image";
import BuyButton from "@/components/BuyButton";
import ShareButtons from "@/components/ShareButtons";

type Props = {
  baseUrl: string;
  product: {
    id: string;
    title: string;
    subtitle?: string;
    priceArs: number;
    imageUrl?: string;
    featured?: boolean;
    stockNote?: string;
  };
};

function formatArs(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
}

export default function ProductCard({ product, baseUrl }: Props) {
  const shareUrl = `${baseUrl}/#producto-${encodeURIComponent(product.id)}`;

  return (
    <article
      id={`producto-${product.id}`}
      className={`product-card-3d group rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur ${
        product.featured ? "ring-1 ring-amber-400/60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{product.title}</h3>
          {product.subtitle ? <p className="mt-1 text-sm text-slate-200/80">{product.subtitle}</p> : null}
        </div>
        {product.stockNote ? (
          <span className="shrink-0 rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-amber-950">
            {product.stockNote}
          </span>
        ) : null}
      </div>

      <div className="product-image-shell mt-4 overflow-hidden rounded-lg border border-white/10 bg-black/20">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            width={1200}
            height={800}
            className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            unoptimized
          />
        ) : (
          <div className="flex h-52 items-center justify-center text-sm text-slate-200/60">Subí una imagen desde Admin</div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase text-sky-200/80">Precio publicado</p>
        <p className="text-2xl font-extrabold">{formatArs(product.priceArs)}</p>
        <p className="mt-1 text-xs text-slate-200/70">Envíos a todo el país • Tucumán 24 hs</p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-100/80">
        <span className="rounded-lg bg-white/5 px-2 py-2">4K listo</span>
        <span className="rounded-lg bg-white/5 px-2 py-2">MP seguro</span>
        <span className="rounded-lg bg-white/5 px-2 py-2">WhatsApp</span>
      </div>

      <div className="mt-4 grid gap-3">
        <BuyButton productId={product.id} />
        <ShareButtons title={product.title} url={shareUrl} />
      </div>
    </article>
  );
}

