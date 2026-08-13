import { Banner } from '@/models/Banner';
import { createBulkHandler } from '@/lib/bulk-actions';

export const POST = createBulkHandler(Banner, { entityLabel: 'banner' });
