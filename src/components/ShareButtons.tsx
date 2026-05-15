"use client";

import { useMemo, useState } from "react";

type Props = {
  title: string;
  url: string;
};

function safeEncode(text: string) {
  return encodeURIComponent(text);
}

export default function ShareButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false);

  const shareText = useMemo(() => `${title}\n\nMirá acá: ${url}`, [title, url]);
  const waUrl = useMemo(() => `https://wa.me/?text=${safeEncode(shareText)}`, [shareText]);

  async function onWebShare() {
    const nav = navigator as unknown as { share?: (data: { title: string; text: string; url: string }) => Promise<void> };
    if (!nav.share) return;
    await nav.share({ title, text: title, url });
  }

  async function onCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  const canWebShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10"
        href={waUrl}
        target="_blank"
        rel="noreferrer"
      >
        Compartir WhatsApp
      </a>
      <button
        className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10 disabled:opacity-50"
        onClick={() => void onWebShare()}
        disabled={!canWebShare}
        title={canWebShare ? "Compartir" : "Tu navegador no soporta Web Share"}
      >
        Compartir
      </button>
      <button
        className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10"
        onClick={() => void onCopy()}
      >
        {copied ? "Copiado" : "Copiar link"}
      </button>
    </div>
  );
}

