"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import {
  CreatePaidByDialog,
  PaidByBulkActions,
  PaidByTable,
} from "@/components/paid-by";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { getPaidByList } from "@/services/paid-by.service";
import type { PaidBy } from "@/types/paid-by.types";

export default function PaidByPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();

  const [paidByList, setPaidByList] = React.useState<PaidBy[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    () => new Set(),
  );

  // Track if user is authenticated
  const isAuthenticated = !!session?.user;

  // Check authentication and redirect if not logged in
  React.useEffect(() => {
    if (!isSessionLoading && !session?.user) {
      router.replace(`/login?callbackUrl=${encodeURIComponent("/paid-by")}`);
    }
  }, [session, isSessionLoading, router]);

  const fetchPaidBy = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getPaidByList();
      setPaidByList(response.data);
    } catch (error) {
      if (error instanceof Error && error.message.includes("401")) {
        return;
      }
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch paid-by entries",
      );
      setPaidByList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data when authenticated
  React.useEffect(() => {
    if (!isAuthenticated) return;
    fetchPaidBy();
  }, [isAuthenticated, fetchPaidBy]);

  // Clean up selection when data changes
  React.useEffect(() => {
    setSelectedIds((current) => {
      const validIds = new Set(paidByList.map((pb) => pb.id));
      const next = new Set([...current].filter((id) => validIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [paidByList]);

  const selectedPaidByList = React.useMemo(
    () => paidByList.filter((pb) => selectedIds.has(pb.id)),
    [paidByList, selectedIds],
  );

  const clearSelection = React.useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleBulkActionComplete = React.useCallback(() => {
    clearSelection();
    fetchPaidBy();
  }, [clearSelection, fetchPaidBy]);

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
              <CardTitle className="text-xl sm:text-2xl">Paid By</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage who pays for expenses
              </CardDescription>
            </div>
            <CreatePaidByDialog onPaidByCreated={fetchPaidBy} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-3 sm:space-y-6 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-bold text-muted-foreground uppercase">
                  Total
                </div>
                <div className="text-2xl font-semibold">
                  {isLoading ? "-" : paidByList.length}
                </div>
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
                    : paidByList.filter((pb) => pb.is_active).length}
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
                    : paidByList.filter((pb) => !pb.is_active).length}
                </div>
              </CardContent>
            </Card>
          </div>

          <PaidByBulkActions
            selectedPaidByList={selectedPaidByList}
            onClearSelection={clearSelection}
            onBulkActionComplete={handleBulkActionComplete}
          />

          <PaidByTable
            paidByList={paidByList}
            isLoading={isLoading}
            onPaidByUpdated={fetchPaidBy}
            onPaidByDeleted={fetchPaidBy}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </CardContent>
      </Card>
    </div>
  );
}
