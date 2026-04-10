"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/content";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/letters", label: "Read Letters" },
  { href: "/about", label: "About" },
  { href: "/resources", label: "Resources" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-warm-200">
      <nav className="max-w-5xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-lg text-ink-900 hover:text-accent transition-colors"
        >
          {siteConfig.name}
        </Link>

        <ul className="hidden sm:flex items-center gap-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-sm text-sm font-sans transition-colors",
                  pathname === item.href
                    ? "text-accent font-medium"
                    : "text-ink-500 hover:text-ink-800"
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          className="sm:hidden p-2 text-ink-500 hover:text-ink-800"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            {mobileOpen ? (
              <><line x1="4" y1="4" x2="16" y2="16" /><line x1="16" y1="4" x2="4" y2="16" /></>
            ) : (
              <><line x1="3" y1="6" x2="17" y2="6" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="14" x2="17" y2="14" /></>
            )}
          </svg>
        </button>
      </nav>

      {mobileOpen && (
        <div className="sm:hidden border-t border-warm-200 bg-cream">
          <ul className="px-6 py-4 space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2.5 rounded-sm text-sm font-sans transition-colors",
                    pathname === item.href
                      ? "text-accent font-medium bg-columbia-50"
                      : "text-ink-500 hover:text-ink-800"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
