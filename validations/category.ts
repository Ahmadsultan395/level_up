import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  imagePublicId: z.string().optional(),
  type: z.enum(['service', 'blog', 'gallery']).default('service'),
  status: z.enum(['active', 'inactive']).default('active'),
  order: z.number().default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;
