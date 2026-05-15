"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search, Moon, Sun, Shield } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/candidates", label: "Check a Candidate" },
  { href: "/compare", label: "Compare" },
  { href: "/elections", label: "How to Vote" },
  { href: "/about", label: "About" },
];

const categories = [
  { href: "/news?category=politics", label: "Politics" },
  { href: "/news?category=business", label: "Business" },
  { href: "/news?category=technology", label: "Technology" },
  { href: "/news?category=sports", label: "Sports" },
  { href: "/news?category=entertainment", label: "Entertainment" },
  { href: "/news?category=education", label: "Education" },
  { href: "/news?category=health", label: "Health" },
  { href: "/news?category=opinion", label: "Opinion" },
  { href: "/news?category=regional", label: "Regional" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-[var(--header-bg)] text-[var(--header-fg)] shadow-lg">
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
            <Shield className="h-7 w-7 text-accent" aria-hidden />
            <span>
              Bayan<span className="text-accent">Check</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/search" className="p-2 rounded-md hover:bg-white/10" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
            <button
              type="button"
              onClick={toggle}
              className="p-2 rounded-md hover:bg-white/10"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              className="lg:hidden p-2 rounded-md hover:bg-white/10"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <nav className="hidden md:flex border-t border-white/10 overflow-x-auto" aria-label="Categories">
        <div className="mx-auto max-w-7xl flex gap-1 px-4 py-2">
          {categories.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="whitespace-nowrap px-3 py-1 text-xs uppercase tracking-wide text-white/80 hover:text-accent transition-colors"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </nav>

      {open && (
        <nav className="lg:hidden border-t border-white/10 px-4 py-4 space-y-1" aria-label="Mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm hover:text-accent"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <p className="pt-3 text-xs uppercase text-white/50">Categories</p>
          {categories.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="block py-1.5 text-sm text-white/80"
              onClick={() => setOpen(false)}
            >
              {c.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
