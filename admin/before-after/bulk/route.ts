import { BeforeAfter } from '@/models/BeforeAfter';
import { createBulkHandler } from '@/lib/bulk-actions';

export const POST = createBulkHandler(BeforeAfter, { entityLabel: 'entry' });
