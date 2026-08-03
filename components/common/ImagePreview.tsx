"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  src: string;
  alt: string;
}

export default function ImagePreview({ src, alt }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="relative h-24 w-24 cursor-pointer overflow-hidden rounded-2xl"
        onClick={() => setOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover hover:scale-105 transition"
        />
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div
            className="relative h-[80vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}
