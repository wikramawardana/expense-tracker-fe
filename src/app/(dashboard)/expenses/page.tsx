"use client";

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
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/lib/auth-client";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { getExpenses } from "@/services/expenses.service";
import { getCategories } from "@/services/categories.service";
import type {
  Expense,
  ExpenseFilters,
  PaginationInfo,
} from "@/types/expense.types";
import type { Category } from "@/types/category.types";

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
  // Default filters: sort by date descending, no date filters
  const [filters, setFilters] = React.useState<ExpenseFilters>({
    page: 1,
    page_size: 20,
    sort_by: "date",
    sort_order: "desc",
  });
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

  // Fetch data when authenticated and when filters change
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only react to filters changes, not callback identity changes
  React.useEffect(() => {
    if (!isAuthenticated) return;

    fetchCategories();
    fetchExpenses();
  }, [isAuthenticated, filters]);

  const handleFiltersChange = (newFilters: ExpenseFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handlePageSizeChange = (pageSize: number) => {
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

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        breadcrumbs={[
          { label: "Expenses" },
        ]}
      />

      <main className="p-4 sm:p-6 space-y-4">
        {/* Top Section: Title + Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Expense Tracker
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-bold">
              Track and manage all your expenses
            </p>
          </div>
          <CreateExpenseDialog
            onExpenseCreated={() => {
              fetchExpenses();
            }}
          />
        </div>

        {/* Filters Row */}
        <Card>
          <CardContent className="p-4">
            <ExpensesFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </CardContent>
        </Card>

        {/* Main Content: Table (70%) + Stats (30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          {/* Left: Table */}
          <div className="lg:col-span-7">
            <Card className="h-full">
              <CardContent className="p-4">
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
                  <div className="mt-4">
                    <ExpensesPagination
                      pagination={pagination}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Stats Cards */}
          <div className="lg:col-span-3">
            <ExpenseStatsCards
              stats={null}
              filters={filters}
              isLoading={false}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
