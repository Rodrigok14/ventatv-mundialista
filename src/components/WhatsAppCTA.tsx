"use client";

type Props = {
  text?: string;
  className?: string;
  children?: React.ReactNode;
};

export default function WhatsAppCTA({ text, className, children }: Props) {
  const msg = text ?? "Hola Rodrigo, quiero comprar una TV para el Mundial. ¿Qué modelos tenés disponibles hoy?";
  const href = `https://wa.me/5493816590235?text=${encodeURIComponent(msg)}`;
  return (
    <a
      className={
        className ??
        "inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-emerald-950 shadow hover:bg-emerald-400"
      }
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {children ?? "Atención por WhatsApp"}
    </a>
  );
}

