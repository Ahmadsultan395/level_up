import { Category } from '@/models/Category';
import { Service } from '@/models/Service';
import { createBulkHandler } from '@/lib/bulk-actions';

export const POST = createBulkHandler(Category, {
  entityLabel: 'category',
  getDeleteBlockers: async (ids) => {
    const inUse = await Service.distinct('category', { category: { $in: ids } });
    return inUse.map(String);
  },
});
