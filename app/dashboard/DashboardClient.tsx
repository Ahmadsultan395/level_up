"use client";

import { SettingsProvider } from "@/context/SettingsContext";
import { useState } from "react";
import { Menu } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function DashboardClient({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: any;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SettingsProvider value={settings}>
      <div className="min-h-screen flex bg-dark-50/40">
        {/* Sidebar */}
        <AdminSidebar
          logo={settings?.logo}
          open={sidebarOpen}
          collapsed={collapsed}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main */}
        <div
          className={`flex-1 transition-all ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}
        >
          <header className="flex items-center justify-between border-b text-white border-[#141414] bg-[#141414] px-5 py-4">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu />
            </button>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg border bg-white text-black"
            >
              {collapsed ? "›" : "‹"}
            </button>

            <h1 className="text-white font-bold">Dashboard</h1>
          </header>

          <main className="p-5 lg:p-8">{children}</main>
        </div>
      </div>
    </SettingsProvider>
  );
}
