import { z } from 'zod';

export const blogSchema = z.object({
  title: z.string().min(2, 'Title is required').max(200),
  excerpt: z.string().min(10, 'Excerpt should be at least 10 characters').max(300),
  content: z.string().min(20, 'Content should be at least 20 characters'),
  coverImageUrl: z.string().url().optional(),
  coverImagePublicId: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive']).default('active'),
  publishedAt: z.string().optional(), // ISO date string; empty = draft
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
});

export type BlogInput = z.infer<typeof blogSchema>;
