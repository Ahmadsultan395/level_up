"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Briefcase,
  FolderKanban,
  BadgeCheck,
  Users,
  FileText,
  Mail,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { SIDEBAR_LINKS, SITE_NAME } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getSettings } from "@/lib/getSettings";
import { useEffect, useState } from "react";

const icons: Record<string, any> = {
  LayoutDashboard,
  Image: ImageIcon,
  Briefcase,
  FolderKanban,
  BadgeCheck,
  Users,
  FileText,
  Mail,
  Settings,
};

export default function AdminSidebar({
  open,
  onClose,
  collapsed = false,
  logo,
}: {
  open: boolean;
  onClose: () => void;
  collapsed?: boolean;
  logo?: string;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-dark/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#141414] bg-dark text-white transition-transform lg:translate-x-0",
          collapsed ? "w-20" : "w-64",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <Link
            href="/dashboard"
            className="font-display text-lg font-extrabold text-primary"
          >
            {/* {!collapsed ? SITE_NAME : "D"} */}
            {logo && (
              <Image
                src={logo}
                alt={SITE_NAME}
                width={40}
                height={40}
                className={cn("h-9 w-9 rounded-lg object-cover", {
                  "h-7 w-7": collapsed,
                })}
              />
            )}
          </Link>
          <button onClick={onClose} className="lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {SIDEBAR_LINKS.map((link) => {
            const Icon = icons[link.icon];
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-dark-100 transition-colors hover:bg-white/5 hover:text-white",
                  active &&
                    "bg-primary text-dark hover:bg-primary hover:text-dark",
                  collapsed && "justify-center",
                )}
              >
                <Icon size={17} /> {!collapsed && link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-dark">
              {user?.name?.charAt(0) || "A"}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {user?.name || "Admin"}
                </p>
                <p className="truncate text-xs text-dark-200">
                  {user?.role || ""}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-dark-100 hover:bg-white/5 hover:text-white"
          >
            <LogOut size={17} /> {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
