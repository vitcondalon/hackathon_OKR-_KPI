"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getToken } from "@/lib/auth";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token && pathname !== "/login") {
      router.replace("/login");
      return;
    }
    if (token && pathname === "/login") {
      router.replace("/dashboard");
      return;
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading workspace...
      </div>
    );
  }

  return <>{children}</>;
}
