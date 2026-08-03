export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Sky Way";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Jobs", href: "/jobs" },
  { label: "Team", href: "/team" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Hero Section", href: "/dashboard/hero", icon: "Image" },
  { label: "Services", href: "/dashboard/services", icon: "Briefcase" },
  { label: "Projects", href: "/dashboard/projects", icon: "FolderKanban" },
  { label: "Jobs", href: "/dashboard/jobs", icon: "BadgeCheck" },
  { label: "Team", href: "/dashboard/team", icon: "Users" },
  { label: "Applications", href: "/dashboard/applications", icon: "FileText" },
  { label: "Messages", href: "/dashboard/messages", icon: "Mail" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
];

export const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Remote",
];

export const PAGE_SIZE = 9;
