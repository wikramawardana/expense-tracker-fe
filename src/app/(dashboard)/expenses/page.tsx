"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import {
  CreateExpenseDialog,
  ExpenseStatsCards,
  ExpensesFilters,
  ExpensesPagination,
  ExpensesTable,
} from "@/components/expenses";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { getBillStatements } from "@/services/bill-statements.service";
import { getCategories } from "@/services/categories.service";
import { getExpenses } from "@/services/expenses.service";
import type { Category } from "@/types/category.types";
import type {
  Expense,
  ExpenseFilters,
  PaginationInfo,
} from "@/types/expense.types";

export default function ExpensesPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();

  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [pagination, setPagination] = React.useState<PaginationInfo>({
    page: 1,
    page_size: DEFAULT_PAGE_SIZE,
    total_items: 0,
    total_pages: 0,
  });
  // Filters are initialized as null until we resolve the default bill
  // statement (the current month). This avoids an "all expenses" flash
  // before the month-scoped fetch lands.
  const [filters, setFilters] = React.useState<ExpenseFilters | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Track if user is authenticated
  const isAuthenticated = !!session?.user;

  // Check authentication and redirect if not logged in
  React.useEffect(() => {
    if (!isSessionLoading && !session?.user) {
      router.replace(`/login?callbackUrl=${encodeURIComponent("/expenses")}`);
    }
  }, [session, isSessionLoading, router]);

  // Fetch categories once on mount
  const fetchCategories = React.useCallback(async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  const fetchExpenses = React.useCallback(async () => {
    if (!filters) return;
    setIsLoading(true);
    try {
      const response = await getExpenses(filters);
      setExpenses(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      // Don't show toast for auth errors - let the redirect handle it
      if (error instanceof Error && error.message.includes("401")) {
        return;
      }
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch expenses",
      );
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Resolve default filters once authenticated. Default the bill statement
  // filter to the current month (e.g. "May 2026") if a matching bill
  // statement exists; otherwise fall back to no bill-statement filter.
  React.useEffect(() => {
    if (!isAuthenticated || filters !== null) return;
    let cancelled = false;
    (async () => {
      const baseFilters: ExpenseFilters = {
        page: 1,
        page_size: 20,
        sort_by: "date",
        sort_order: "desc",
      };
      try {
        const response = await getBillStatements();
        if (cancelled) return;
        const currentMonthName = format(new Date(), "MMMM yyyy");
        const match = response.data.find((bs) => bs.name === currentMonthName);
        if (match) {
          baseFilters.bill_statement_id = match.id;
        }
      } catch (error) {
        // If we can't load bill statements, just fall back to no filter.
        console.error("Failed to load bill statements for default:", error);
      }
      if (!cancelled) {
        setFilters(baseFilters);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, filters]);

  // Fetch data when authenticated and when filters change
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only react to filters changes, not callback identity changes
  React.useEffect(() => {
    if (!isAuthenticated || !filters) return;

    fetchCategories();
    fetchExpenses();
  }, [isAuthenticated, filters]);

  const handleFiltersChange = (newFilters: ExpenseFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    if (!filters) return;
    setFilters({ ...filters, page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    if (!filters) return;
    setFilters({ ...filters, page_size: pageSize, page: 1 });
  };

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

  // Wait for default filters (current-month bill statement) before rendering
  // the filter bar / table — keeps the first paint scoped to the current
  // month instead of flashing "all expenses" first.
  if (!filters) {
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
                Expense Tracker
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Track and manage all your expenses
              </CardDescription>
            </div>
            <CreateExpenseDialog
              onExpenseCreated={() => {
                fetchExpenses();
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-3 sm:space-y-6 sm:px-6">
          <ExpensesFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            <div className="lg:col-span-7 space-y-4">
              <ExpensesTable
                expenses={expenses}
                categories={categories}
                isLoading={isLoading}
                onExpenseUpdated={() => {
                  fetchExpenses();
                }}
                onExpenseDeleted={() => {
                  fetchExpenses();
                }}
              />
              {!isLoading && expenses.length > 0 && (
                <ExpensesPagination
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </div>
            <div className="lg:col-span-3">
              <ExpenseStatsCards
                stats={null}
                filters={filters}
                isLoading={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
