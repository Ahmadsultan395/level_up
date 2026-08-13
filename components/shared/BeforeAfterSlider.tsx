'use client';

import { useState } from 'react';
import Image from 'next/image';

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  title?: string;
}

/** Drag-to-reveal before/after comparison slider used on the Before & After page. */
export function BeforeAfterSlider({ beforeUrl, afterUrl, title }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);

  return (
    <div className="w-full">
      <div className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-lg bg-bg-secondary">
        <Image
          src={afterUrl}
          alt={title ? `${title} — after` : 'After'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image
            src={beforeUrl}
            alt={title ? `${title} — before` : 'Before'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div
          className="absolute top-0 h-full w-0.5 bg-gold"
          style={{ left: `${position}%` }}
          aria-hidden="true"
        >
          <div className="absolute top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-md" />
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          aria-label="Drag to compare before and after"
          className="absolute inset-0 h-full w-full cursor-ew-resize appearance-none bg-transparent opacity-0"
        />

        <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-bg-overlay px-2 py-0.5 text-xs text-text-primary">
          Before
        </span>
        <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-bg-overlay px-2 py-0.5 text-xs text-text-primary">
          After
        </span>
      </div>
      {title && <p className="mt-2 text-center text-sm text-text-muted">{title}</p>}
    </div>
  );
}
