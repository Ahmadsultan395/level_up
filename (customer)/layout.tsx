import { DashboardSidebar } from '@/components/customer/DashboardSidebar';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg-primary md:flex-row flex-col">
      <DashboardSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
