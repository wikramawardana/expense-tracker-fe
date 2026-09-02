"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { CreateExpenseDialog } from "@/components/expenses/create-expense-dialog";
import { ExpensesFilters } from "@/components/expenses/expenses-filters";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import { ImportExpensesCsvDialog } from "@/components/expenses/import-expenses-csv-dialog";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { formatCurrency } from "@/lib/format";
import { getBillStatements } from "@/services/bill-statements.service";
import { getCategories } from "@/services/categories.service";
import { getExpenseSummary, getExpenses } from "@/services/expenses.service";
import type { Category } from "@/types/category.types";
import type {
  Expense,
  ExpenseFilters,
  ExpenseStatus,
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
  emptyMessage: _emptyMessage,
  basePath,
  defaultScheduleType,
}: ExpenseWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: isSessionLoading } = useSession();
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [filters, setFilters] = React.useState<ExpenseFilters | null>(null);
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
  const isFilteredByScope = Boolean(selectedMethod || selectedStatementId);
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
        sort_by: searchParams.get("sort_by") || "date",
        sort_order:
          (searchParams.get("sort_order") as "asc" | "desc") || "desc",
        expense_type: expenseType,
        payment_method_id: searchParams.get("payment_method_id") || "",
        payment_method: searchParams.get("payment_method") || "",
        category_id: searchParams.get("category_id") || "",
        category: searchParams.get("category") || "",
        status: (searchParams.get("status") as ExpenseStatus) || "",
        search: searchParams.get("search") || "",
        bill_statement_id: statementId,
        expense_date_from: searchParams.get("expense_date_from") || "",
        expense_date_to: searchParams.get("expense_date_to") || "",
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
      } catch (error) {
        if (!(error instanceof Error && error.message.includes("401"))) {
          console.error("Failed to fetch summary", error);
        }
        setTotals(emptyTotals);
      } finally {
        setIsSummaryLoading(false);
      }
    },
    [],
  );

  const fetchFirstPage = React.useCallback(
    async (activeFilters: ExpenseFilters) => {
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
    [title],
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
    if (!filters || isLoadingMore || !hasMore) return;
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
  }, [currentPage, filters, hasMore, isLoadingMore]);

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
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
  }, [hasMore, isLoading, isLoadingMore, loadMore]);

  const handleFiltersChange = (nextFilters: ExpenseFilters) => {
    const scopedFilters = { ...nextFilters, expense_type: expenseType };
    setFilters(scopedFilters);

    const params = new URLSearchParams();
    if (scopedFilters.bill_statement_id) {
      params.set("bill_statement_id", scopedFilters.bill_statement_id);
    }
    if (scopedFilters.payment_method_id) {
      params.set("payment_method_id", scopedFilters.payment_method_id);
    }
    if (scopedFilters.payment_method) {
      params.set("payment_method", scopedFilters.payment_method);
    }
    if (scopedFilters.category_id) {
      params.set("category_id", scopedFilters.category_id);
    }
    if (scopedFilters.status) {
      params.set("status", scopedFilters.status);
    }
    if (scopedFilters.search) {
      params.set("search", scopedFilters.search);
    }
    if (scopedFilters.expense_date_from) {
      params.set("expense_date_from", scopedFilters.expense_date_from);
    }
    if (scopedFilters.expense_date_to) {
      params.set("expense_date_to", scopedFilters.expense_date_to);
    }
    if (scopedFilters.sort_by && scopedFilters.sort_by !== "date") {
      params.set("sort_by", scopedFilters.sort_by);
    }
    if (scopedFilters.sort_order && scopedFilters.sort_order !== "desc") {
      params.set("sort_order", scopedFilters.sort_order);
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

  const statCards = [
    {
      label: "Total activity",
      value: totals.total_amount,
      detail: `${totals.total_count} entries`,
      icon: Receipt,
    },
    {
      label: "Paid",
      value: totals.paid_amount,
      detail: `${totals.completion_rate.toFixed(0)}% completed`,
      icon: CheckCircle2,
    },
    {
      label: "Pending",
      value: totals.pending_amount,
      detail: "Waiting to settle",
      icon: Clock3,
    },
    {
      label: "Unpaid",
      value: totals.unpaid_amount,
      detail: "Needs attention",
      icon: AlertCircle,
    },
  ];

  return (
    <div className="app-page gap-5">
      {/* Header */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          {isFilteredByScope && (
            <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
              <Link href={basePath}>
                <ArrowLeft /> All {title.toLowerCase()}
              </Link>
            </Button>
          )}
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {selectedMethodName || statementName || `All ${title}`}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isFilteredByScope
              ? selectedMethodName
                ? `${title} paid with ${selectedMethodName}${statementName ? ` · ${statementName}` : ""}`
                : `All ${title.toLowerCase()}${statementName ? ` · ${statementName}` : ""}`
              : description}
            {totalItems > 0 ? ` · ${totalItems} entries` : ""}
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
      </section>

      {/* Summary Stat Cards */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <p className="text-sm font-medium">{item.label}</p>
              <item.icon className="size-4" />
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {isSummaryLoading ? "—" : formatCurrency(item.value)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </section>

      {/* Filters */}
      <ExpensesFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Table */}
      <section className="space-y-4">
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
      </section>
    </div>
  );
}
