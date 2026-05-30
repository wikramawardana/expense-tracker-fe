"use client";

import { parse } from "date-fns";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import {
  BillStatementsFilters,
  BillStatementsTable,
  CreateBillStatementDialog,
} from "@/components/bill-statements";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { getBillStatements } from "@/services/bill-statements.service";
import type { BillStatement } from "@/types/bill-statement.types";

export default function BillStatementsPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();

  const [billStatements, setBillStatements] = React.useState<BillStatement[]>(
    [],
  );
  const [filteredBillStatements, setFilteredBillStatements] = React.useState<
    BillStatement[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Track if user is authenticated
  const isAuthenticated = !!session?.user;

  // Check authentication and redirect if not logged in
  React.useEffect(() => {
    if (!isSessionLoading && !session?.user) {
      router.replace(
        `/login?callbackUrl=${encodeURIComponent("/bill-statements")}`,
      );
    }
  }, [session, isSessionLoading, router]);

  const fetchBillStatements = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getBillStatements();
      // Sort with current month first, then past months descending, then future months ascending
      const now = new Date();
      const nowTime = now.getTime();
      const sorted = [...response.data].sort((a, b) => {
        let dateA: Date;
        let dateB: Date;

        try {
          dateA = a.statement_date
            ? new Date(a.statement_date)
            : parse(a.name, "MMMM yyyy", new Date());
          dateB = b.statement_date
            ? new Date(b.statement_date)
            : parse(b.name, "MMMM yyyy", new Date());
        } catch {
          return 0;
        }

        const aIsFuture = dateA.getTime() > nowTime;
        const bIsFuture = dateB.getTime() > nowTime;

        // Past/current dates come before future dates
        if (!aIsFuture && bIsFuture) return -1;
        if (aIsFuture && !bIsFuture) return 1;

        // Within same group: past/current sorted descending (newest first), future sorted ascending
        if (!aIsFuture && !bIsFuture) {
          return dateB.getTime() - dateA.getTime();
        }
        return dateA.getTime() - dateB.getTime();
      });
      setBillStatements(sorted);
    } catch (error) {
      // Don't show toast for auth errors - let the redirect handle it
      if (error instanceof Error && error.message.includes("401")) {
        return;
      }
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch bill statements",
      );
      setBillStatements([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data when authenticated
  React.useEffect(() => {
    if (!isAuthenticated) return;
    fetchBillStatements();
  }, [isAuthenticated, fetchBillStatements]);

  // Sync filtered state when billStatements changes
  React.useEffect(() => {
    setFilteredBillStatements(billStatements);
  }, [billStatements]);

  // Calculate stats
  const overdueCount = React.useMemo(() => {
    const now = new Date();
    return filteredBillStatements.filter(
      (bs) => bs.due_date && new Date(bs.due_date) < now && bs.is_active,
    ).length;
  }, [filteredBillStatements]);

  // Show loading state while checking session
  if (isSessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="inline-block h-10 w-10 animate-spin border-4 border-solid border-foreground border-r-transparent" />
      </div>
    );
  }

  // Don't render content if not authenticated (redirect is happening)
  if (!session?.user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="inline-block h-10 w-10 animate-spin border-4 border-solid border-foreground border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4">
      <Card>
        <CardHeader className="flex flex-col gap-4 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl">
                Bill Statements
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage your bill statements and due dates
              </CardDescription>
            </div>
            <CreateBillStatementDialog
              onBillStatementCreated={fetchBillStatements}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-3 sm:space-y-6 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-bold text-muted-foreground uppercase">
                  Total Statements
                </div>
                <div className="text-2xl font-semibold">
                  {isLoading ? "-" : filteredBillStatements.length}
                </div>
                {!isLoading &&
                  filteredBillStatements.length !== billStatements.length && (
                    <div className="text-xs text-muted-foreground">
                      of {billStatements.length} total
                    </div>
                  )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-bold text-muted-foreground uppercase">
                  Active
                </div>
                <div className="text-2xl font-semibold text-green-600">
                  {isLoading
                    ? "-"
                    : filteredBillStatements.filter((bs) => bs.is_active)
                        .length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-bold text-muted-foreground uppercase">
                  Inactive
                </div>
                <div className="text-2xl font-semibold text-gray-500">
                  {isLoading
                    ? "-"
                    : filteredBillStatements.filter((bs) => !bs.is_active)
                        .length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-bold text-muted-foreground uppercase">
                  Overdue
                </div>
                <div className="text-2xl font-semibold text-red-600">
                  {isLoading ? "-" : overdueCount}
                </div>
              </CardContent>
            </Card>
          </div>
          <BillStatementsFilters
            billStatements={billStatements}
            onFilteredChange={setFilteredBillStatements}
          />
          <BillStatementsTable
            billStatements={filteredBillStatements}
            isLoading={isLoading}
            onBillStatementUpdated={fetchBillStatements}
            onBillStatementDeleted={fetchBillStatements}
          />
        </CardContent>
      </Card>
    </div>
  );
}
