import { Blog } from '@/models/Blog';
import { createBulkHandler } from '@/lib/bulk-actions';

export const POST = createBulkHandler(Blog, { entityLabel: 'post' });
