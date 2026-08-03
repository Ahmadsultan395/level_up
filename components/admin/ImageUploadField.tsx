"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ImageUploadField({
  value,
  onChange,
  label = "Image"
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "image");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onChange(data.data.url);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-dark">{label}</label>
      {value ? (
        <div className="relative h-36 w-36 overflow-hidden rounded-xl border border-dark-100">
          <Image src={value} alt="Uploaded" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-1.5 top-1.5 rounded-full bg-dark/70 p-1 text-white hover:bg-red-600"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <label className="flex h-36 w-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-dark-100 text-dark-300 hover:border-primary">
          {uploading ? <Loader2 size={20} className="animate-spin text-primary" /> : <UploadCloud size={20} />}
          <span className="text-xs">{uploading ? "Uploading..." : "Upload"}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </label>
      )}
    </div>
  );
}
