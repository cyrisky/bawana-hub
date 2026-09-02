"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Dashboard", icon: "◆" },
  { href: "/finance", label: "Finance", icon: "$" },
  { href: "/gym", label: "Gym", icon: "⚡" },
  { href: "/profile", label: "Profile", icon: "●" },
  { href: "/plan", label: "Plan", icon: "▸" },
  { href: "/qa", label: "QA", icon: "✓" },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-row items-center justify-between gap-2 border-b border-edge bg-surface px-4 py-3 md:min-h-screen md:w-56 md:flex-col md:items-stretch md:justify-start md:border-b-0 md:border-r md:px-4 md:py-6">
      <div className="font-semibold tracking-tight">
        Bawana <span className="text-signal">Hub</span>
      </div>
      <nav className="flex flex-row gap-1 md:mt-6 md:flex-1 md:flex-col">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-signal/10 text-signal"
                  : "text-ink-muted hover:bg-ground"
              }`}
            >
              <span className="hidden w-4 text-center text-xs md:inline">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <form action="/auth/signout" method="post" className="hidden md:block">
        <div className="mb-2 truncate text-xs text-ink-muted">{email}</div>
        <button className="text-xs text-ink-muted hover:text-ink">
          Sign out
        </button>
      </form>
    </aside>
  );
}
