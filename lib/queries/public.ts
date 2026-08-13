import { connectDB } from '@/lib/db';
import { Banner } from '@/models/Banner';
import { Service } from '@/models/Service';
import { Barber } from '@/models/Barber';
import { Testimonial } from '@/models/Testimonial';
import { getSiteSettings } from '@/models/SiteSettings';
import type { IBanner } from '@/models/Banner';
import type { IService } from '@/models/Service';
import type { IBarber } from '@/models/Barber';
import type { ITestimonial } from '@/models/Testimonial';

/** Active banners for a given slot, ordered, respecting optional scheduling window. */
export async function getActiveBanners(position: IBanner['position']): Promise<IBanner[]> {
  await connectDB();
  const now = new Date();
  return Banner.find({
    position,
    status: 'active',
    $and: [
      { $or: [{ startsAt: { $exists: false } }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: { $exists: false } }, { endsAt: { $gte: now } }] },
    ],
  })
    .sort({ order: 1 })
    .lean<IBanner[]>();
}

export async function getFeaturedServices(limit = 6): Promise<IService[]> {
  await connectDB();
  return Service.find({ status: 'active', featured: true })
    .sort({ order: 1 })
    .limit(limit)
    .populate('category')
    .lean<IService[]>();
}

export async function getFeaturedBarbers(limit = 4): Promise<IBarber[]> {
  await connectDB();
  return Barber.find({ status: 'active' })
    .sort({ order: 1, ratingAvg: -1 })
    .limit(limit)
    .lean<IBarber[]>();
}

export async function getApprovedTestimonials(limit = 6): Promise<ITestimonial[]> {
  await connectDB();
  return Testimonial.find({ status: 'active', moderationStatus: 'approved' })
    .sort({ featured: -1, order: 1, createdAt: -1 })
    .limit(limit)
    .lean<ITestimonial[]>();
}

export async function getPublicSiteSettings() {
  await connectDB();
  const settings = await getSiteSettings();
  return settings;
}
