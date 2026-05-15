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
      className={`group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur ${
        product.featured ? "ring-1 ring-amber-400/40" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{product.title}</h3>
          {product.subtitle ? <p className="mt-1 text-sm text-slate-200/80">{product.subtitle}</p> : null}
        </div>
        {product.stockNote ? (
          <span className="shrink-0 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-200">
            {product.stockNote}
          </span>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/20">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            width={1200}
            height={800}
            className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            unoptimized
          />
        ) : (
          <div className="flex h-52 items-center justify-center text-sm text-slate-200/60">
            Subí una imagen desde Admin
          </div>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-200/80">Precio</p>
          <p className="text-2xl font-extrabold tracking-tight">{formatArs(product.priceArs)}</p>
          <p className="mt-1 text-xs text-slate-200/70">Envíos a todo el país • Tucumán 24 hs</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <BuyButton productId={product.id} />
        <ShareButtons title={product.title} url={shareUrl} />
      </div>
    </article>
  );
}

