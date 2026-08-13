import type { CloudinaryFolder } from '@/lib/cloudinary';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

/** Uploads an image file to Cloudinary via the authenticated /api/upload route. */
export async function uploadFile(file: File, folder: CloudinaryFolder): Promise<UploadResult> {
  const fileBase64 = await fileToBase64(file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileBase64, folder }),
  });

  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Upload failed');
  }

  return res.json();
}
