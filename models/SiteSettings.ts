import { Schema, model, models, type Model, type Document } from 'mongoose';

export interface ISiteSettings extends Document {
  // General
  siteName: string;
  logoUrl?: string;
  faviconUrl?: string;
  tagline?: string;

  // Contact / footer
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialLinks: { platform: string; url: string }[];
  footerText?: string;

  // Homepage CMS content
  heroTitle?: string;
  heroSubtitle?: string;
  aboutContent?: string;

  // Legal / static CMS pages (spec section 1: Privacy Policy, Terms & Conditions, Refund Policy)
  privacyPolicyContent?: string;
  termsContent?: string;
  refundPolicyContent?: string;

  // Careers page CMS content
  careersIntro?: string;

  // Manual payment instructions (bank/EasyPaisa/JazzCash) — spec: cash/manual payment support
  bankAccountTitle?: string;
  bankAccountNumber?: string;
  bankName?: string;
  easypaisaNumber?: string;
  jazzcashNumber?: string;
  paymentInstructions?: string;

  // SEO defaults
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  ogImageUrl?: string;

  // Theme — admin can only pick *values* the design system already
  // exposes (see globals.css); this does NOT let admins inject arbitrary
  // hardcoded colors into the app.
  themePreset: 'premium_dark_gold';

  // Finance
  currency: string;
  taxRatePercent: number;

  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteName: { type: String, default: 'The Barber Co.' },
    logoUrl: String,
    faviconUrl: String,
    tagline: String,

    contactEmail: String,
    contactPhone: String,
    address: String,
    socialLinks: [{ platform: String, url: String }],
    footerText: String,

    heroTitle: String,
    heroSubtitle: String,
    aboutContent: String,

    privacyPolicyContent: String,
    termsContent: String,
    refundPolicyContent: String,

    careersIntro: String,

    bankAccountTitle: String,
    bankAccountNumber: String,
    bankName: String,
    easypaisaNumber: String,
    jazzcashNumber: String,
    paymentInstructions: String,

    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String],
    ogImageUrl: String,

    themePreset: { type: String, enum: ['premium_dark_gold'], default: 'premium_dark_gold' },

    currency: { type: String, default: 'PKR' },
    taxRatePercent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SiteSettings: Model<ISiteSettings> =
  models.SiteSettings || model<ISiteSettings>('SiteSettings', SiteSettingsSchema);

/** There is always exactly one settings document. Creates it on first access. */
export async function getSiteSettings() {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({});
  }
  return settings;
}
