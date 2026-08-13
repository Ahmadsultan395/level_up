import { EmailTemplate } from '@/models/EmailTemplate';
import { createBulkHandler } from '@/lib/bulk-actions';

export const POST = createBulkHandler(EmailTemplate, { entityLabel: 'template' });
