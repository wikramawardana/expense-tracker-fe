"use client";

import { Suspense } from "react";
import { Toaster } from "sonner";
import { DashboardShell } from "@/components/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense
        fallback={
          <div className="grid h-dvh place-items-center bg-background">
            <div className="size-10 animate-spin border-4 border-primary border-r-transparent" />
          </div>
        }
      >
        <DashboardShell>{children}</DashboardShell>
      </Suspense>
      <Toaster position="top-right" richColors />
    </>
  );
}
