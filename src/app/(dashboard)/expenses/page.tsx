"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import {
  CreateExpenseDialog,
  ExpenseStatsCards,
  ExpensesFilters,
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
import { getBillStatements } from "@/services/bill-statements.service";
import { getCategories } from "@/services/categories.service";
import { getExpenses } from "@/services/expenses.service";
import type { Category } from "@/types/category.types";
import type {
  Expense,
  ExpenseFilters,
  ExpenseStats,
} from "@/types/expense.types";

const PAGE_SIZE = 50;
const STATS_PAGE_SIZE = 10_000;
const emptyCategoryBreakdown: ExpenseStats["category_breakdown"] = {
  food: 0,
  transport: 0,
  entertainment: 0,
  shopping: 0,
  bills: 0,
  health: 0,
  education: 0,
  other: 0,
};

function buildExpenseStats(
  expenses: Expense[],
  totalCount: number,
): ExpenseStats {
  return {
    total_count: totalCount,
    total_amount: expenses.reduce(
      (total, expense) => total + expense.amount,
      0,
    ),
    approved_amount: expenses.reduce(
      (total, expense) =>
        expense.status === "paid" ? total + expense.amount : total,
      0,
    ),
    pending_amount: expenses.reduce(
      (total, expense) =>
        expense.status === "pending" ? total + expense.amount : total,
      0,
    ),
    rejected_amount: expenses.reduce(
      (total, expense) =>
        expense.status === "unpaid" ? total + expense.amount : total,
      0,
    ),
    category_breakdown: emptyCategoryBreakdown,
  };
}

export default function ExpensesPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();

  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [filters, setFilters] = React.useState<ExpenseFilters | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [stats, setStats] = React.useState<ExpenseStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = React.useState(true);

  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const isAuthenticated = !!session?.user;

  // Auth redirect
  React.useEffect(() => {
    if (!isSessionLoading && !session?.user) {
      router.replace(`/login?callbackUrl=${encodeURIComponent("/expenses")}`);
    }
  }, [session, isSessionLoading, router]);

  // Fetch categories once
  const fetchCategories = React.useCallback(async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  const fetchStats = React.useCallback(
    async (activeFilters: ExpenseFilters) => {
      setIsStatsLoading(true);
      try {
        const response = await getExpenses({
          ...activeFilters,
          page: 1,
          page_size: STATS_PAGE_SIZE,
        });
        setStats(
          buildExpenseStats(
            response.data.data,
            response.data.pagination.total_items,
          ),
        );
      } catch (error) {
        if (error instanceof Error && error.message.includes("401")) return;
        console.error("Failed to fetch expense stats:", error);
        setStats(null);
      } finally {
        setIsStatsLoading(false);
      }
    },
    [],
  );

  // Resolve default filters (current month bill statement)
  React.useEffect(() => {
    if (!isAuthenticated || filters !== null) return;
    let cancelled = false;
    (async () => {
      const baseFilters: ExpenseFilters = {
        page: 1,
        page_size: PAGE_SIZE,
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

  // Initial fetch + reset when filters change
  React.useEffect(() => {
    if (!isAuthenticated || !filters) return;

    fetchCategories();
    fetchStats(filters);

    // Reset state for new filter
    setExpenses([]);
    setCurrentPage(1);
    setHasMore(true);
    setIsLoading(true);

    (async () => {
      try {
        const response = await getExpenses({
          ...filters,
          page: 1,
          page_size: PAGE_SIZE,
        });
        setExpenses(response.data.data);
        setTotalItems(response.data.pagination.total_items);
        const totalPages = response.data.pagination.total_pages;
        setHasMore(totalPages > 1);
        setCurrentPage(1);
      } catch (error) {
        if (error instanceof Error && error.message.includes("401")) return;
        toast.error(
          error instanceof Error ? error.message : "Failed to fetch expenses",
        );
        setExpenses([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isAuthenticated, filters, fetchCategories, fetchStats]);

  // Load more (next page)
  const loadMore = React.useCallback(async () => {
    if (!filters || isLoadingMore || !hasMore) return;
    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    try {
      const response = await getExpenses({
        ...filters,
        page: nextPage,
        page_size: PAGE_SIZE,
      });
      setExpenses((prev) => [...prev, ...response.data.data]);
      setTotalItems(response.data.pagination.total_items);
      const totalPages = response.data.pagination.total_pages;
      setHasMore(nextPage < totalPages);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Failed to load more expenses:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [filters, isLoadingMore, hasMore, currentPage]);

  // IntersectionObserver for infinite scroll
  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoading &&
          !isLoadingMore
        ) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, loadMore]);

  const handleFiltersChange = (newFilters: ExpenseFilters) => {
    setFilters(newFilters);
  };

  // Refresh helper (after create/update/delete)
  const refreshExpenses = React.useCallback(async () => {
    if (!filters) return;
    setIsLoading(true);
    fetchStats(filters);
    try {
      const response = await getExpenses({
        ...filters,
        page: 1,
        page_size: PAGE_SIZE,
      });
      setExpenses(response.data.data);
      setTotalItems(response.data.pagination.total_items);
      const totalPages = response.data.pagination.total_pages;
      setHasMore(totalPages > 1);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, fetchStats]);

  if (isSessionLoading || !session?.user || !filters) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="inline-block h-10 w-10 animate-spin border-4 border-solid border-foreground border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4">
      <Card className="rounded-lg border-2 border-primary/35 shadow-[5px_5px_0px_0px_rgba(79,70,229,0.16)] dark:border-primary/45 dark:shadow-[5px_5px_0px_0px_rgba(129,140,248,0.22)]">
        <CardHeader className="flex flex-col gap-4 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl">
                Expense Tracker
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Track and manage all your expenses
                {totalItems > 0 && (
                  <span className="ml-2 text-foreground font-bold">
                    ({expenses.length} of {totalItems})
                  </span>
                )}
              </CardDescription>
            </div>
            <CreateExpenseDialog onExpenseCreated={refreshExpenses} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-3 sm:space-y-5 sm:px-6">
          <ExpenseStatsCards
            stats={stats}
            filters={filters}
            isLoading={isStatsLoading}
          />
          <ExpensesFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
          <div className="space-y-4">
            <ExpensesTable
              expenses={expenses}
              categories={categories}
              isLoading={isLoading}
              onExpenseUpdated={refreshExpenses}
              onExpenseDeleted={refreshExpenses}
            />
            <div ref={sentinelRef} className="h-4" />
            {isLoadingMore && (
              <div className="flex justify-center py-4">
                <div className="inline-block h-6 w-6 animate-spin border border-solid border-foreground border-r-transparent" />
                <span className="ml-2 text-sm font-bold text-muted-foreground">
                  Loading more...
                </span>
              </div>
            )}
            {!hasMore && expenses.length > 0 && !isLoading && (
              <p className="text-center text-sm text-muted-foreground font-bold py-2">
                All {totalItems} expenses loaded
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
