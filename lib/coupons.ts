import { connectDB } from '@/lib/db';
import { Coupon } from '@/models/Coupon';
import { Invoice } from '@/models/Invoice';

interface CouponValidationResult {
  valid: boolean;
  error?: string;
  discountAmount?: number;
  couponId?: string;
}

/**
 * Validates a coupon code against subtotal, expiry, total usage limit, and
 * per-customer usage limit (checked against past Invoices), then computes
 * the discount amount. Used both by the pre-checkout "apply coupon" step
 * and again at payment-finalization time so a coupon can't be reused past
 * its limit via a race condition.
 */
export async function validateCoupon(code: string, subtotal: number, customerId: string): Promise<CouponValidationResult> {
  await connectDB();

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: 'active' });
  if (!coupon) {
    return { valid: false, error: 'Invalid or inactive coupon code.' };
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, error: 'This coupon has expired.' };
  }

  if (subtotal < coupon.minSpend) {
    return { valid: false, error: `This coupon requires a minimum spend of ${coupon.minSpend}.` };
  }

  if (coupon.usageLimit !== undefined && coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, error: 'This coupon has reached its usage limit.' };
  }

  const customerUsageCount = await Invoice.countDocuments({ customer: customerId, couponCode: coupon.code });
  if (customerUsageCount >= coupon.perUserLimit) {
    return { valid: false, error: 'You have already used this coupon the maximum number of times.' };
  }

  let discountAmount = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value;
  if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
  discountAmount = Math.min(discountAmount, subtotal);

  return { valid: true, discountAmount: Math.round(discountAmount * 100) / 100, couponId: coupon._id.toString() };
}
