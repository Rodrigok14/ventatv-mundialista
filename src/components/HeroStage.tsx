"use client";

import type { CSSProperties } from "react";
import { useState } from "react";

export default function HeroStage() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  return (
    <div
      className="hero-stage"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: x * 10, y: y * -8 });
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{ "--tilt-x": `${tilt.y}deg`, "--tilt-y": `${tilt.x}deg` } as CSSProperties}
      aria-hidden="true"
    >
      <svg className="stadium-lines" viewBox="0 0 760 520" role="img">
        <defs>
          <linearGradient id="netGlow" x1="0" x2="1">
            <stop offset="0" stopColor="#7dd3fc" stopOpacity="0.2" />
            <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#facc15" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path d="M68 428 C180 320 574 320 692 428" fill="none" stroke="url(#netGlow)" strokeWidth="2" />
        <path d="M118 456 C230 376 530 376 642 456" fill="none" stroke="url(#netGlow)" strokeWidth="2" />
        <path d="M174 486 C276 430 484 430 586 486" fill="none" stroke="url(#netGlow)" strokeWidth="2" />
        {Array.from({ length: 13 }).map((_, index) => (
          <path
            key={index}
            d={`M${90 + index * 48} 516 C${170 + index * 18} 390 ${590 - index * 18} 390 ${670 - index * 48} 516`}
            fill="none"
            stroke="url(#netGlow)"
            strokeWidth="1"
            opacity="0.55"
          />
        ))}
      </svg>

      <div className="tv-3d">
        <div className="tv-top-light" />
        <div className="tv-screen">
          <div className="screen-glare" />
          <div className="flag-band flag-band-top" />
          <div className="flag-band flag-band-bottom" />
          <div className="match-ui">
            <span>ARG</span>
            <strong>4K</strong>
            <span>LIVE</span>
          </div>
          <div className="ball-dot" />
        </div>
        <div className="tv-base" />
      </div>

      <div className="floating-chip chip-one">Entrega Tucumán 24 hs</div>
      <div className="floating-chip chip-two">Mercado Pago</div>
      <div className="floating-chip chip-three">Stock por tanda</div>
    </div>
  );
}

