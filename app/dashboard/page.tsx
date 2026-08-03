"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  FolderKanban,
  BadgeCheck,
  FileText,
  Mail,
  Users,
  Plus,
  ArrowRight,
  ArrowUpRight,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Clock,
  Download,
} from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Skeleton } from "@/components/common/Loader";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/utils/helpers";

const cards = [
  {
    key: "services",
    label: "Services",
    icon: Briefcase,
    href: "/dashboard/services",
    color: "bg-blue-50 text-blue-600",
  },
  {
    key: "projects",
    label: "Projects",
    icon: FolderKanban,
    href: "/dashboard/projects",
    color: "bg-violet-50 text-violet-600",
  },
  {
    key: "jobs",
    label: "Open Jobs",
    icon: BadgeCheck,
    href: "/dashboard/jobs",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    key: "team",
    label: "Team Members",
    icon: Users,
    href: "/dashboard/team",
    color: "bg-pink-50 text-pink-600",
  },
  {
    key: "applications",
    label: "Applications",
    icon: FileText,
    href: "/dashboard/applications",
    color: "bg-amber-50 text-amber-600",
  },
  {
    key: "messages",
    label: "Messages",
    icon: Mail,
    href: "/dashboard/messages",
    color: "bg-red-50 text-red-600",
  },
];

const quickActions = [
  { label: "Add Service", href: "/dashboard/services", icon: Briefcase },
  { label: "Add Project", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Post a Job", href: "/dashboard/jobs", icon: BadgeCheck },
  { label: "Add Team Member", href: "/dashboard/team", icon: Users },
  { label: "Edit Hero Section", href: "/dashboard/hero", icon: ImageIcon },
  {
    label: "Website Settings",
    href: "/dashboard/settings",
    icon: SettingsIcon,
  },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    Promise.all(
      cards.map(async (c) => {
        const endpoint =
          c.key === "applications"
            ? "applications"
            : c.key === "messages"
              ? "contact"
              : c.key === "jobs"
                ? "jobs"
                : c.key;
        const res = await fetch(`/api/${endpoint}?limit=1`);
        const data = await res.json();
        return [c.key, data?.meta?.total ?? 0] as const;
      }),
    ).then((entries) => {
      setCounts(Object.fromEntries(entries));
      setLoading(false);
    });

    Promise.all([
      fetch("/api/contact?limit=5").then((r) => r.json()),
      fetch("/api/applications?limit=5").then((r) => r.json()),
    ]).then(([msgData, appData]) => {
      setMessages(msgData.success ? msgData.data : []);
      setApplications(appData.success ? appData.data : []);
      setLoadingActivity(false);
    });
  }, []);

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Overview of your website content"
      />

      {/* Welcome banner */}
      <div className="mb-8 flex flex-col justify-between gap-4 overflow-hidden rounded-2xl bg-dark px-7 py-8 text-white sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            {todayLabel}
          </p>
          <h2 className="mt-1 font-display text-2xl font-extrabold">
            {greeting()}
            {user?.name ? `, ${user.name}` : ""} 👋
          </h2>
          <p className="mt-1 text-sm text-dark-100">
            Here&apos;s what&apos;s happening with your website today.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-dark hover:bg-primary-400"
        >
          View Live Site <ArrowUpRight size={15} />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.key}
            href={c.href}
            className="group rounded-2xl border border-dark-100 bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.color}`}
              >
                <c.icon size={20} />
              </div>
              <ArrowUpRight
                size={16}
                className="text-dark-200 opacity-0 transition-opacity group-hover:opacity-100"
              />
            </div>
            {loading ? (
              <Skeleton className="mt-4 h-8 w-16" />
            ) : (
              <p className="mt-4 font-display text-3xl font-extrabold text-dark">
                {counts[c.key] ?? 0}
              </p>
            )}
            <p className="mt-1 text-sm text-dark-300">{c.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-10">
        <h3 className="mb-4 font-display text-base font-bold text-dark">
          Quick Actions
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="flex items-center gap-3 rounded-xl border border-dark-100 bg-white px-4 py-3.5 text-sm font-medium text-dark transition-colors hover:border-primary hover:bg-primary/5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary-700">
                <a.icon size={16} />
              </span>
              {a.label}
              <Plus size={14} className="ml-auto text-dark-200" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-dark-100 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-dark">
              Recent Messages
            </h3>
            <Link
              href="/dashboard/messages"
              className="flex items-center gap-1 text-xs font-semibold text-primary-700 hover:underline"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loadingActivity ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-dark-300">
              No messages yet
            </p>
          ) : (
            <ul className="divide-y divide-dark-100">
              {messages.map((m) => (
                <li
                  key={m._id}
                  className="flex items-start justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-dark">
                      {m.name}
                    </p>
                    <p className="truncate text-xs text-dark-300">
                      {m.message}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-dark-200">
                    <Clock size={11} /> {formatDate(m.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-dark-100 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-dark">
              Recent Applications
            </h3>
            <Link
              href="/dashboard/applications"
              className="flex items-center gap-1 text-xs font-semibold text-primary-700 hover:underline"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loadingActivity ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <p className="py-8 text-center text-sm text-dark-300">
              No applications yet
            </p>
          ) : (
            <ul className="divide-y divide-dark-100">
              {applications.map((a) => (
                <li
                  key={a._id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-dark">
                      {a.applicantName}
                    </p>
                    <p className="truncate text-xs text-dark-300">
                      {a.appliedJob?.jobTitle || "—"}
                    </p>
                  </div>
                  <a
                    href={a.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary/20"
                  >
                    <Download size={12} /> CV
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
