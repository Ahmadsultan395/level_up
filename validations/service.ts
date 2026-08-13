import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(2, 'Name is required').max(150),
  description: z.string().min(10, 'Description should be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0),
  discountPrice: z.number().min(0).optional(),
  durationMinutes: z.number().min(5),
  imageUrl: z.string().url().optional(),
  imagePublicId: z.string().optional(),
  gallery: z.array(z.object({ url: z.string(), publicId: z.string() })).default([]),
  status: z.enum(['active', 'inactive']).default('active'),
  featured: z.boolean().default(false),
  order: z.number().default(0),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
