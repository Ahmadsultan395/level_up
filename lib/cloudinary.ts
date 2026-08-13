import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Cloudinary folders — one per media area (spec section 11). Always upload
 * through one of these folders so the media library filter (by folder)
 * works correctly in the admin panel.
 */
export const CLOUDINARY_FOLDERS = {
  hero: 'barbershop/hero',
  services: 'barbershop/services',
  packages: 'barbershop/packages',
  gallery: 'barbershop/gallery',
  beforeAfter: 'barbershop/before-after',
  barbers: 'barbershop/barbers',
  customers: 'barbershop/customers',
  blogs: 'barbershop/blogs',
  banners: 'barbershop/banners',
  testimonials: 'barbershop/testimonials',
  payments: 'barbershop/payment-proofs',
} as const;

export type CloudinaryFolder = keyof typeof CLOUDINARY_FOLDERS;

export async function uploadImage(fileBase64: string, folder: CloudinaryFolder) {
  const result = await cloudinary.uploader.upload(fileBase64, {
    folder: CLOUDINARY_FOLDERS[folder],
    resource_type: 'auto',
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  };
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
