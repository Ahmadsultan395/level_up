import { Service } from '@/models/Service';
import { Package } from '@/models/Package';
import { createBulkHandler } from '@/lib/bulk-actions';

export const POST = createBulkHandler(Service, {
  entityLabel: 'service',
  getDeleteBlockers: async (ids) => {
    const inUse = await Package.distinct('services', { services: { $in: ids } });
    return inUse.map(String);
  },
});
