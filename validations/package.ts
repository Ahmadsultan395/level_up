import { z } from 'zod';

export const packageSchema = z.object({
  name: z.string().min(2, 'Name is required').max(150),
  description: z.string().min(10, 'Description should be at least 10 characters'),
  services: z.array(z.string()).min(1, 'Select at least one service'),
  price: z.number().min(0),
  discountPrice: z.number().min(0).optional(),
  durationMinutes: z.number().min(5),
  imageUrl: z.string().url().optional(),
  imagePublicId: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  featured: z.boolean().default(false),
  order: z.number().default(0),
});

export type PackageFormInput = z.infer<typeof packageSchema>;
