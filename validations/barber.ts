import { z } from 'zod';

const workingHourSchema = z.object({
  day: z.enum(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']),
  isOff: z.boolean(),
  startTime: z.string(),
  endTime: z.string(),
  breaks: z.array(z.object({ startTime: z.string(), endTime: z.string() })).default([]),
});

const vacationSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().optional(),
});

export const barberSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  bio: z.string().min(10, 'Bio should be at least 10 characters'),
  imageUrl: z.string().url().optional(),
  imagePublicId: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  experienceYears: z.number().min(0).default(0),
  services: z.array(z.string()).default([]),
  workingHours: z.array(workingHourSchema).length(7, 'All 7 days must be configured'),
  vacations: z.array(vacationSchema).default([]),
  socialLinks: z.array(z.object({ platform: z.string(), url: z.string() })).default([]),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type BarberInput = z.infer<typeof barberSchema>;

export const DEFAULT_WORKING_HOURS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
].map((day) => ({
  day: day as BarberInput['workingHours'][number]['day'],
  isOff: day === 'sunday',
  startTime: '09:00',
  endTime: '18:00',
  breaks: [] as { startTime: string; endTime: string }[],
}));
