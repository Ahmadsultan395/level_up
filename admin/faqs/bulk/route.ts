import { Faq } from '@/models/Faq';
import { createBulkHandler } from '@/lib/bulk-actions';

export const POST = createBulkHandler(Faq, { entityLabel: 'FAQ' });
