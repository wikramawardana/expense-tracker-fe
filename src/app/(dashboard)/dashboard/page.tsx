"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Receipt } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background">
      <PageHeader breadcrumbs={[{ label: "Dashboard" }]} />

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Welcome back!</h1>
          <p className="text-muted-foreground font-bold">
            Manage your expenses and track your spending.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/expenses" className="block">
            <div className="border-3 border-foreground p-6 bg-[#88AAEE] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
              <div className="w-12 h-12 bg-background border-3 border-foreground flex items-center justify-center mb-4 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                <Receipt className="h-6 w-6 text-foreground" />
              </div>
              <h2 className="text-lg font-black uppercase mb-2">Expenses</h2>
              <p className="text-sm font-bold text-foreground/70">
                View, create, and manage your expenses
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
