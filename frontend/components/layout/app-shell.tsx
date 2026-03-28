"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { clearToken } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/objectives", label: "Objectives" },
  { href: "/key-results", label: "Key Results" },
  { href: "/checkins", label: "Check-ins" },
  { href: "/users", label: "Users" },
  { href: "/departments", label: "Departments" },
  { href: "/cycles", label: "Cycles" },
];

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <aside className="hidden w-72 shrink-0 rounded-[28px] bg-slate-950 p-6 text-white shadow-panel lg:block">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.35em] text-brand-100">Hackathon Demo</p>
            <h1 className="mt-3 text-2xl font-semibold">OKR / KPI HR System</h1>
            <p className="mt-2 text-sm text-slate-300">
              Practical management workspace for objectives, key results, check-ins, and quick dashboards.
            </p>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl px-4 py-3 text-sm ${
                    isActive
                      ? "bg-brand-500 text-white"
                      : "bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={() => {
              clearToken();
              router.replace("/login");
            }}
            className="mt-8 w-full rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-100 hover:bg-white/10"
          >
            Sign out
          </button>
        </aside>

        <main className="flex-1">
          <header className="mb-6 rounded-[28px] bg-white p-6 shadow-panel">
            <p className="text-sm uppercase tracking-[0.25em] text-brand-700">Workspace</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-slate-950">{title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Clean, demo-ready operations for OKR and KPI tracking.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 lg:hidden">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-2xl px-3 py-2 text-center text-sm ${
                      pathname === item.href
                        ? "bg-brand-500 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
