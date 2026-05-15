"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  title: string;
  imageUrl?: string;
  galleryImages?: string[];
};

export default function ProductImages({ title, imageUrl, galleryImages = [] }: Props) {
  const images = [imageUrl, ...galleryImages].filter(Boolean) as string[];
  const [selected, setSelected] = useState(images[0] ?? "");

  if (!selected) {
    return <div className="flex h-52 items-center justify-center text-sm text-slate-200/60">Subí una imagen desde Admin</div>;
  }

  return (
    <div>
      <Image
        src={selected}
        alt={title}
        width={1200}
        height={800}
        className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        unoptimized
      />
      {images.length > 1 ? (
        <div className="grid grid-cols-3 gap-2 border-t border-white/10 bg-black/25 p-2">
          {images.map((url, index) => (
            <button
              key={url}
              className={`overflow-hidden rounded-md border ${selected === url ? "border-amber-300" : "border-white/10"}`}
              onClick={() => setSelected(url)}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <Image src={url} alt={`${title} ${index + 1}`} width={220} height={140} className="h-14 w-full object-cover" unoptimized />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

