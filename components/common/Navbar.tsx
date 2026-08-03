"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, SITE_NAME } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navbar({ logo }: { logo?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-dark-100/70 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-extrabold text-dark"
          onClick={() => setOpen(false)}
        >
          {logo ? (
            <Image
              src={logo}
              alt={SITE_NAME}
              width={40}
              height={40}
              className="h-9 w-9 rounded-lg object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-dark">
              {SITE_NAME.charAt(0)}
            </span>
          )}
          {SITE_NAME}
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "relative text-sm font-medium text-dark-300 transition-colors hover:text-dark",
                  pathname === link.href && "text-dark",
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full bg-primary" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Link href="/contact">
            <Button size="sm">Let&apos;s Talk</Button>
          </Link>
        </div>

        <button
          className="lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-dark-100 bg-white px-5 py-4 lg:hidden">
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-dark-300"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/contact" onClick={() => setOpen(false)}>
            <Button size="sm" className="mt-4 w-full">
              Let&apos;s Talk
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
