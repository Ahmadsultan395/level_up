import { connectDB } from '@/lib/db';
import { Appointment } from '@/models/Appointment';
import { Invoice } from '@/models/Invoice';
import { User } from '@/models/User';
import { Barber } from '@/models/Barber';
import { Review } from '@/models/Review';
import { Testimonial } from '@/models/Testimonial';
import { GalleryImage } from '@/models/GalleryImage';
import { ContactMessage } from '@/models/ContactMessage';

export async function getAdminDashboardStats() {
  await connectDB();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    appointmentsToday,
    pendingAppointments,
    monthlyRevenueAgg,
    totalCustomers,
    activeBarbers,
    pendingReviews,
    pendingTestimonials,
    pendingGalleryImages,
    newMessages,
  ] = await Promise.all([
    Appointment.countDocuments({ date: { $gte: startOfToday, $lt: endOfToday } }),
    Appointment.countDocuments({ status: 'pending' }),
    Invoice.aggregate([
      { $match: { issuedAt: { $gte: startOfMonth }, status: { $in: ['paid', 'issued'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    User.countDocuments({ role: 'customer' }),
    Barber.countDocuments({ status: 'active' }),
    Review.countDocuments({ moderationStatus: 'pending' }),
    Testimonial.countDocuments({ moderationStatus: 'pending' }),
    GalleryImage.countDocuments({ moderationStatus: 'pending' }),
    ContactMessage.countDocuments({ status: 'new' }),
  ]);

  return {
    appointmentsToday,
    pendingAppointments,
    monthlyRevenue: monthlyRevenueAgg[0]?.total || 0,
    totalCustomers,
    activeBarbers,
    pendingModeration: pendingReviews + pendingTestimonials + pendingGalleryImages,
    pendingReviews,
    pendingTestimonials,
    pendingGalleryImages,
    newMessages,
  };
}

export async function getTodayAppointments() {
  await connectDB();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  return Appointment.find({ date: { $gte: startOfToday, $lt: endOfToday }, status: { $ne: 'cancelled' } })
    .sort({ startTime: 1 })
    .populate('customer', 'name')
    .populate('barber', 'name')
    .lean();
}
