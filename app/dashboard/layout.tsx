import { getSettings } from "@/lib/getSettings";
import DashboardClient from "./DashboardClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return <DashboardClient settings={settings}>{children}</DashboardClient>;
}
