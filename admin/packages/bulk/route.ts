import { Package } from '@/models/Package';
import { Appointment } from '@/models/Appointment';
import { createBulkHandler } from '@/lib/bulk-actions';

export const POST = createBulkHandler(Package, {
  entityLabel: 'package',
  getDeleteBlockers: async (ids) => {
    const inUse = await Appointment.distinct('package', {
      package: { $in: ids },
      status: { $in: ['pending', 'confirmed'] },
    });
    return inUse.map(String);
  },
});
