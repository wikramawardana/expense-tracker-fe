"use client";

import { Receipt } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";

export default function DashboardPage() {
  useSession();

  return (
    <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4">
      <Card>
        <CardHeader className="flex flex-col gap-4 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl sm:text-3xl">
              Welcome back!
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Manage your expenses and track your spending.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-3 sm:space-y-6 sm:px-6">
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
        </CardContent>
      </Card>
    </div>
  );
}
