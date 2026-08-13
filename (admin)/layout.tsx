import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=/admin');
  }
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary md:flex-row">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
