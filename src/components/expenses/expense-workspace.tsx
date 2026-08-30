"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { CreateExpenseDialog } from "@/components/expenses/create-expense-dialog";
import { ExpenseMethodOverview } from "@/components/expenses/expense-method-overview";
import { ExpensesFilters } from "@/components/expenses/expenses-filters";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import { ImportExpensesCsvDialog } from "@/components/expenses/import-expenses-csv-dialog";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { getBillStatements } from "@/services/bill-statements.service";
import { getCategories } from "@/services/categories.service";
import { getExpenseSummary, getExpenses } from "@/services/expenses.service";
import type { Category } from "@/types/category.types";
import type {
  Expense,
  ExpenseFilters,
  ExpenseMethodSummary,
  ExpenseTotals,
  ExpenseType,
  ScheduleType,
} from "@/types/expense.types";

const PAGE_SIZE = 50;

const emptyTotals: ExpenseTotals = {
  total_count: 0,
  total_amount: 0,
  paid_amount: 0,
  pending_amount: 0,
  unpaid_amount: 0,
  outstanding_amount: 0,
  completion_rate: 0,
};

interface ExpenseWorkspaceProps {
  expenseType: ExpenseType;
  title: string;
  singularTitle: string;
  description: string;
  emptyMessage: string;
  basePath: string;
  defaultScheduleType: ScheduleType;
}

export function ExpenseWorkspace({
  expenseType,
  title,
  singularTitle,
  description,
  emptyMessage,
  basePath,
  defaultScheduleType,
}: ExpenseWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: isSessionLoading } = useSession();
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [filters, setFilters] = React.useState<ExpenseFilters | null>(null);
  const [methods, setMethods] = React.useState<ExpenseMethodSummary[]>([]);
  const [totals, setTotals] = React.useState<ExpenseTotals>(emptyTotals);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSummaryLoading, setIsSummaryLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(false);
  const [statementName, setStatementName] = React.useState<string | null>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  const selectedMethod =
    searchParams.get("payment_method_id") || searchParams.get("payment_method");
  const selectedMethodName = searchParams.get("payment_method");
  const selectedStatementId = searchParams.get("bill_statement_id");
  const isDetail = Boolean(selectedMethod || selectedStatementId);
  const isAuthenticated = Boolean(session?.user);

  React.useEffect(() => {
    if (!isSessionLoading && !session?.user) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(basePath)}`);
    }
  }, [basePath, isSessionLoading, router, session]);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    (async () => {
      const statementId = searchParams.get("bill_statement_id") || "";
      const baseFilters: ExpenseFilters = {
        page: 1,
        page_size: PAGE_SIZE,
        sort_by: "date",
        sort_order: "desc",
        expense_type: expenseType,
        payment_method_id: searchParams.get("payment_method_id") || "",
        payment_method: searchParams.get("payment_method") || "",
        bill_statement_id: statementId,
      };

      if (statementId) {
        try {
          const response = await getBillStatements();
          const statement = response.data.find(
            (item) => item.id === statementId,
          );
          if (!cancelled) setStatementName(statement?.name ?? null);
        } catch (error) {
          console.error("Failed to resolve statement", error);
        }
      } else {
        setStatementName(null);
      }

      if (!cancelled) setFilters(baseFilters);
    })();

    return () => {
      cancelled = true;
    };
  }, [expenseType, isAuthenticated, searchParams]);

  const fetchSummary = React.useCallback(
    async (activeFilters: ExpenseFilters) => {
      setIsSummaryLoading(true);
      try {
        const response = await getExpenseSummary(activeFilters);
        setTotals(response.data.totals);
        setMethods(response.data.payment_methods);
      } catch (error) {
        if (!(error instanceof Error && error.message.includes("401"))) {
          console.error("Failed to fetch summary", error);
        }
        setTotals(emptyTotals);
        setMethods([]);
      } finally {
        setIsSummaryLoading(false);
      }
    },
    [],
  );

  const fetchFirstPage = React.useCallback(
    async (activeFilters: ExpenseFilters) => {
      if (!isDetail) {
        setExpenses([]);
        setTotalItems(0);
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await getExpenses({
          ...activeFilters,
          page: 1,
          page_size: PAGE_SIZE,
        });
        setExpenses(response.data.data);
        setTotalItems(response.data.pagination.total_items);
        setCurrentPage(1);
        setHasMore(response.data.pagination.total_pages > 1);
      } catch (error) {
        if (!(error instanceof Error && error.message.includes("401"))) {
          toast.error(
            error instanceof Error ? error.message : `Failed to load ${title}`,
          );
        }
        setExpenses([]);
      } finally {
        setIsLoading(false);
      }
    },
    [isDetail, title],
  );

  React.useEffect(() => {
    if (!isAuthenticated || !filters) return;
    getCategories()
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Failed to load categories", error));
    fetchSummary(filters);
    fetchFirstPage(filters);
  }, [fetchFirstPage, fetchSummary, filters, isAuthenticated]);

  const loadMore = React.useCallback(async () => {
    if (!filters || isLoadingMore || !hasMore || !isDetail) return;
    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    try {
      const response = await getExpenses({
        ...filters,
        page: nextPage,
        page_size: PAGE_SIZE,
      });
      setExpenses((current) => [...current, ...response.data.data]);
      setTotalItems(response.data.pagination.total_items);
      setCurrentPage(nextPage);
      setHasMore(nextPage < response.data.pagination.total_pages);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, filters, hasMore, isDetail, isLoadingMore]);

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !isDetail) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isDetail, isLoading, isLoadingMore, loadMore]);

  const handleFiltersChange = (nextFilters: ExpenseFilters) => {
    const scopedFilters = { ...nextFilters, expense_type: expenseType };
    setFilters(scopedFilters);

    const params = new URLSearchParams(searchParams.toString());
    if (scopedFilters.bill_statement_id) {
      params.set("bill_statement_id", scopedFilters.bill_statement_id);
    } else {
      params.delete("bill_statement_id");
    }
    router.replace(`${basePath}${params.size ? `?${params.toString()}` : ""}`, {
      scroll: false,
    });
  };

  const refresh = React.useCallback(async () => {
    if (!filters) return;
    await Promise.all([fetchSummary(filters), fetchFirstPage(filters)]);
    window.dispatchEvent(new Event("expense-navigation-updated"));
  }, [fetchFirstPage, fetchSummary, filters]);

  if (isSessionLoading || !session?.user || !filters) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <header className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            {isDetail && (
              <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
                <Link href={basePath}>
                  <ArrowLeft /> All {title.toLowerCase()}
                </Link>
              </Button>
            )}
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {selectedMethodName || statementName || title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isDetail
                ? selectedMethodName
                  ? `${title} paid with ${selectedMethodName}${statementName ? ` · ${statementName}` : ""}`
                  : `All ${title.toLowerCase()}${statementName ? ` · ${statementName}` : ""}`
                : description}
              {isDetail && totalItems > 0 ? ` · ${totalItems} entries` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ImportExpensesCsvDialog onExpensesImported={refresh} />
            <CreateExpenseDialog
              defaultScheduleType={defaultScheduleType}
              fixedScheduleType={defaultScheduleType}
              entityLabel={singularTitle}
              onExpenseCreated={refresh}
            />
          </div>
        </header>

        <div className="space-y-5 p-4 sm:p-6">
          {isDetail ? (
            <>
              <ExpensesFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
              <ExpensesTable
                expenses={expenses}
                expenseType={expenseType}
                categories={categories}
                isLoading={isLoading}
                onExpenseUpdated={refresh}
                onExpenseDeleted={refresh}
              />
              <div ref={sentinelRef} className="h-2" />
              {isLoadingMore && (
                <p className="py-3 text-center text-sm text-muted-foreground">
                  Loading more…
                </p>
              )}
            </>
          ) : (
            <ExpenseMethodOverview
              basePath={basePath}
              methods={methods}
              totals={totals}
              isLoading={isSummaryLoading}
              emptyMessage={emptyMessage}
              billStatementId={filters.bill_statement_id || undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}
