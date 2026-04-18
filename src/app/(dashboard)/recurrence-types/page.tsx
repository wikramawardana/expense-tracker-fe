"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import {
  CreateRecurrenceTypeDialog,
  RecurrenceTypesTable,
} from "@/components/recurrence-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { getRecurrenceTypes } from "@/services/recurrence-types.service";
import type { RecurrenceType } from "@/types/recurrence-type.types";

export default function RecurrenceTypesPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();

  const [recurrenceTypes, setRecurrenceTypes] = React.useState<
    RecurrenceType[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Track if user is authenticated
  const isAuthenticated = !!session?.user;

  // Check authentication and redirect if not logged in
  React.useEffect(() => {
    if (!isSessionLoading && !session?.user) {
      router.replace(
        `/login?callbackUrl=${encodeURIComponent("/recurrence-types")}`,
      );
    }
  }, [session, isSessionLoading, router]);

  const fetchRecurrenceTypes = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getRecurrenceTypes();
      setRecurrenceTypes(response.data);
    } catch (error) {
      // Don't show toast for auth errors - let the redirect handle it
      if (error instanceof Error && error.message.includes("401")) {
        return;
      }
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch recurrence types",
      );
      setRecurrenceTypes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data when authenticated
  React.useEffect(() => {
    if (!isAuthenticated) return;
    fetchRecurrenceTypes();
  }, [isAuthenticated, fetchRecurrenceTypes]);

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
                Recurrence Types
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage your expense recurrence types
              </CardDescription>
            </div>
            <CreateRecurrenceTypeDialog
              onRecurrenceTypeCreated={fetchRecurrenceTypes}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-3 sm:space-y-6 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-bold text-muted-foreground uppercase">
                  Total Types
                </div>
                <div className="text-2xl font-black">
                  {isLoading ? "-" : recurrenceTypes.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-bold text-muted-foreground uppercase">
                  Active
                </div>
                <div className="text-2xl font-black text-green-600">
                  {isLoading
                    ? "-"
                    : recurrenceTypes.filter((r) => r.is_active).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-bold text-muted-foreground uppercase">
                  Inactive
                </div>
                <div className="text-2xl font-black text-gray-500">
                  {isLoading
                    ? "-"
                    : recurrenceTypes.filter((r) => !r.is_active).length}
                </div>
              </CardContent>
            </Card>
          </div>
          <RecurrenceTypesTable
            recurrenceTypes={recurrenceTypes}
            isLoading={isLoading}
            onRecurrenceTypeUpdated={fetchRecurrenceTypes}
            onRecurrenceTypeDeleted={fetchRecurrenceTypes}
          />
        </CardContent>
      </Card>
    </div>
  );
}
