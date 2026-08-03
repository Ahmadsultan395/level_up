"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

export default function AppShell({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: any;
}) {
  const pathname = usePathname();

  const isDashboard =
    pathname.startsWith("/dashboard") || pathname.startsWith("/login");

  return (
    <>
      {!isDashboard && <Navbar logo={settings?.logo} />}
      <main className="min-h-[60vh]">{children}</main>
      {!isDashboard && <Footer settings={settings} />}
    </>
  );
}
