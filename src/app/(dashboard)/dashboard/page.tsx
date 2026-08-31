"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth-client";
import { formatCurrency, formatDate } from "@/lib/format";
import { getBillStatements } from "@/services/bill-statements.service";
import { getCategories } from "@/services/categories.service";
import { getExpenseSummary, getExpenses } from "@/services/expenses.service";
import type { BillStatement } from "@/types/bill-statement.types";
import type { Category } from "@/types/category.types";
import type {
  Expense,
  ExpenseFilters,
  ExpenseMethodSummary,
  ExpenseTotals,
} from "@/types/expense.types";

const TRANSACTION_PAGE_SIZE = 100;

const emptyTotals: ExpenseTotals = {
  total_count: 0,
  total_amount: 0,
  paid_amount: 0,
  pending_amount: 0,
  unpaid_amount: 0,
  outstanding_amount: 0,
  completion_rate: 0,
};

async function getAllTransactions(
  scope: Pick<ExpenseFilters, "bill_statement_id">,
) {
  const filters: ExpenseFilters = {
    ...scope,
    expense_type: "transaction",
    page: 1,
    page_size: TRANSACTION_PAGE_SIZE,
    sort_by: "date",
    sort_order: "desc",
  };
  const firstPage = await getExpenses(filters);
  const { total_pages: totalPages } = firstPage.data.pagination;

  if (totalPages <= 1) return firstPage.data.data;

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getExpenses({ ...filters, page: index + 2 }),
    ),
  );

  return [
    ...firstPage.data.data,
    ...remainingPages.flatMap((response) => response.data.data),
  ];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statements, setStatements] = React.useState<BillStatement[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [selectedStatement, setSelectedStatement] = React.useState(
    searchParams.get("bill_statement_id") || "all",
  );
  const [totals, setTotals] = React.useState<ExpenseTotals>(emptyTotals);
  const [methods, setMethods] = React.useState<ExpenseMethodSummary[]>([]);
  const [recent, setRecent] = React.useState<Expense[]>([]);
  const [attention, setAttention] = React.useState<Expense[]>([]);
  const [transactions, setTransactions] = React.useState<Expense[]>([]);
  const [loading, setLoading] = React.useState(true);
  const requestIdRef = React.useRef(0);
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  React.useEffect(() => {
    Promise.all([getBillStatements(), getCategories()])
      .then(([statementResponse, categoryResponse]) => {
        setStatements(statementResponse.data);
        setCategories(categoryResponse.data);
        if (!searchParams.get("bill_statement_id")) {
          const currentName = format(new Date(), "MMMM yyyy");
          const current = statementResponse.data.find(
            (item) => item.name === currentName,
          );
          if (current) setSelectedStatement(current.id);
        }
      })
      .catch((error) => console.error("Failed to load statements", error));
  }, [searchParams]);

  const loadDashboard = React.useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const scope =
      selectedStatement === "all"
        ? {}
        : { bill_statement_id: selectedStatement };
    setLoading(true);

    try {
      const [
        summary,
        recentResponse,
        unpaidResponse,
        pendingResponse,
        transactionResponse,
      ] = await Promise.all([
        getExpenseSummary(scope),
        getExpenses({
          ...scope,
          page: 1,
          page_size: 5,
          sort_by: "date",
          sort_order: "desc",
        }),
        getExpenses({
          ...scope,
          status: "unpaid",
          page: 1,
          page_size: 5,
          sort_by: "date",
          sort_order: "asc",
        }),
        getExpenses({
          ...scope,
          status: "pending",
          page: 1,
          page_size: 5,
          sort_by: "date",
          sort_order: "asc",
        }),
        getAllTransactions(scope),
      ]);

      if (requestId !== requestIdRef.current) return;
      setTotals(summary.data.totals);
      setMethods(summary.data.payment_methods);
      setRecent(recentResponse.data.data);
      setTransactions(transactionResponse);
      setAttention(
        [...unpaidResponse.data.data, ...pendingResponse.data.data]
          .sort(
            (a, b) =>
              new Date(a.expense_date).getTime() -
              new Date(b.expense_date).getTime(),
          )
          .slice(0, 5),
      );
    } catch (error) {
      console.error("Failed to load dashboard", error);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [selectedStatement]);

  React.useEffect(() => {
    loadDashboard();
    return () => {
      requestIdRef.current += 1;
    };
  }, [loadDashboard]);

  const refreshDashboard = React.useCallback(() => {
    loadDashboard();
    window.dispatchEvent(new Event("expense-navigation-updated"));
  }, [loadDashboard]);

  const changeStatement = (value: string) => {
    setSelectedStatement(value);
    router.replace(
      value === "all" ? "/dashboard" : `/dashboard?bill_statement_id=${value}`,
      { scroll: false },
    );
  };

  const summary = [
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
      detail: "Waiting to be settled",
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
      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-7">
        <div>
          <p className="text-sm text-muted-foreground">
            Welcome back, {firstName}
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Your financial overview
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Transactions, installments, and subscriptions in one calm view.
          </p>
        </div>
        <Select value={selectedStatement} onValueChange={changeStatement}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            {statements.map((statement) => (
              <SelectItem key={statement.id} value={statement.id}>
                {statement.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <p className="text-sm font-medium">{item.label}</p>
              <item.icon className="size-4" />
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight">
              {loading ? "—" : formatCurrency(item.value)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-semibold">Payment methods</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Paid and outstanding across all activity.
            </p>
          </div>
          {methods.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">
              No activity in this period.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {methods.map((method) => {
                const params = new URLSearchParams();
                if (method.payment_method_id) {
                  params.set("payment_method_id", method.payment_method_id);
                }
                params.set("payment_method", method.name);
                return (
                  <Link
                    key={method.payment_method_id || method.name}
                    href={`/expenses?${params.toString()}`}
                    className="group grid gap-3 px-5 py-4 hover:bg-muted/60 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                  >
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {method.totals.total_count} entries
                      </p>
                    </div>
                    <div className="text-sm sm:text-right">
                      <p className="text-muted-foreground">Paid</p>
                      <p className="font-medium">
                        {formatCurrency(method.totals.paid_amount)}
                      </p>
                    </div>
                    <ArrowUpRight className="hidden size-4 text-muted-foreground sm:block" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <ActivityPanel
          title="Needs attention"
          items={attention}
          empty="Nothing needs attention."
        />
      </section>

      <ActivityPanel
        title="Recent activity"
        items={recent}
        empty="No recent activity."
        horizontal
      />

      <section className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Transactions</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading
                ? "Loading all transactions…"
                : `${transactions.length} transaction${transactions.length === 1 ? "" : "s"} in this view`}
            </p>
          </div>
          <Link
            href="/expenses"
            className="text-sm font-medium text-primary hover:underline"
          >
            Open transactions
          </Link>
        </div>
        <ExpensesTable
          expenses={transactions}
          expenseType="transaction"
          categories={categories}
          isLoading={loading}
          onExpenseUpdated={refreshDashboard}
          onExpenseDeleted={refreshDashboard}
        />
      </section>
    </div>
  );
}

function ActivityPanel({
  title,
  items,
  empty,
  horizontal = false,
}: {
  title: string;
  items: Expense[];
  empty: string;
  horizontal?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h3 className="font-semibold">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="p-10 text-center text-sm text-muted-foreground">
          {empty}
        </p>
      ) : (
        <div
          className={
            horizontal
              ? "grid divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-5"
              : "divide-y divide-border"
          }
        >
          {items.map((expense) => (
            <div key={expense.id} className="flex justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{expense.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {expense.payment_method || "Unknown"} ·{" "}
                  {formatDate(expense.expense_date)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(expense.amount)}</p>
                <p className="mt-1 text-xs capitalize text-muted-foreground">
                  {expense.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
