import { Coupon } from '@/models/Coupon';
import { createBulkHandler } from '@/lib/bulk-actions';

export const POST = createBulkHandler(Coupon, { entityLabel: 'coupon' });
