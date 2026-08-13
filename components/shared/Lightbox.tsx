'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
  images: { url: string; title?: string }[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

/** Full-screen image viewer with keyboard navigation, used by the public Gallery. */
export function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const current = images[index];

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate((index + 1) % images.length);
      if (e.key === 'ArrowLeft') onNavigate((index - 1 + images.length) % images.length);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index, images.length, onClose, onNavigate]);

  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay p-4"
      onClick={onClose}
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 text-text-primary/80 hover:text-text-primary"
      >
        <X className="h-7 w-7" />
      </button>

      {images.length > 1 && (
        <button
          aria-label="Previous image"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((index - 1 + images.length) % images.length);
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-primary/80 hover:text-text-primary"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}

      <div
        className="relative aspect-[4/3] w-full max-w-3xl overflow-hidden rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Image src={current.url} alt={current.title || 'Gallery image'} fill className="object-contain" sizes="100vw" />
      </div>

      {images.length > 1 && (
        <button
          aria-label="Next image"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((index + 1) % images.length);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-primary/80 hover:text-text-primary"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}

      {current.title && (
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-text-primary/80">{current.title}</p>
      )}
    </div>
  );
}
