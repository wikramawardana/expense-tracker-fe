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
import { Button } from "@/components/ui/button";
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
import { getExpenseSummary, getExpenses } from "@/services/expenses.service";
import type { BillStatement } from "@/types/bill-statement.types";
import type {
  Expense,
  ExpenseMethodSummary,
  ExpenseTotals,
} from "@/types/expense.types";

const emptyTotals: ExpenseTotals = {
  total_count: 0,
  total_amount: 0,
  paid_amount: 0,
  pending_amount: 0,
  unpaid_amount: 0,
  outstanding_amount: 0,
  completion_rate: 0,
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statements, setStatements] = React.useState<BillStatement[]>([]);
  const [selectedStatement, setSelectedStatement] = React.useState(
    searchParams.get("bill_statement_id") || "all",
  );
  const [totals, setTotals] = React.useState<ExpenseTotals>(emptyTotals);
  const [methods, setMethods] = React.useState<ExpenseMethodSummary[]>([]);
  const [recent, setRecent] = React.useState<Expense[]>([]);
  const [attention, setAttention] = React.useState<Expense[]>([]);
  const [loading, setLoading] = React.useState(true);
  const requestIdRef = React.useRef(0);
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  React.useEffect(() => {
    getBillStatements()
      .then((statementResponse) => {
        setStatements(statementResponse.data);
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
      const [summary, recentResponse, unpaidResponse, pendingResponse] =
        await Promise.all([
          getExpenseSummary(scope),
          getExpenses({
            ...scope,
            page: 1,
            page_size: 6,
            sort_by: "date",
            sort_order: "desc",
          }),
          getExpenses({
            ...scope,
            status: "unpaid",
            page: 1,
            page_size: 6,
            sort_by: "date",
            sort_order: "asc",
          }),
          getExpenses({
            ...scope,
            status: "pending",
            page: 1,
            page_size: 6,
            sort_by: "date",
            sort_order: "asc",
          }),
        ]);

      if (requestId !== requestIdRef.current) return;
      setTotals(summary.data.totals);
      setMethods(summary.data.payment_methods);
      setRecent(recentResponse.data.data);
      setAttention(
        [...unpaidResponse.data.data, ...pendingResponse.data.data]
          .sort(
            (a, b) =>
              new Date(a.expense_date).getTime() -
              new Date(b.expense_date).getTime(),
          )
          .slice(0, 6),
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

  const expensesUrl =
    selectedStatement === "all"
      ? "/expenses"
      : `/expenses?bill_statement_id=${selectedStatement}`;

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
        <div className="flex flex-wrap items-center gap-3">
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
          <Button asChild variant="outline">
            <Link href={expensesUrl}>View all transactions →</Link>
          </Button>
        </div>
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
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h3 className="font-semibold">Payment methods</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Paid and outstanding across all activity.
              </p>
            </div>
            <Link
              href={expensesUrl}
              className="text-xs font-semibold text-primary hover:underline"
            >
              All expenses →
            </Link>
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
                if (selectedStatement !== "all") {
                  params.set("bill_statement_id", selectedStatement);
                }
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
          href={
            selectedStatement === "all"
              ? "/expenses?status=unpaid"
              : `/expenses?bill_statement_id=${selectedStatement}&status=unpaid`
          }
        />
      </section>

      <ActivityPanel
        title="Recent activity"
        items={recent}
        empty="No recent activity."
        horizontal
        href={expensesUrl}
      />
    </div>
  );
}

function ActivityPanel({
  title,
  items,
  empty,
  horizontal = false,
  href,
}: {
  title: string;
  items: Expense[];
  empty: string;
  horizontal?: boolean;
  href?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="font-semibold">{title}</h3>
        {href && (
          <Link
            href={href}
            className="text-xs font-semibold text-primary hover:underline"
          >
            View in expenses →
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <p className="p-10 text-center text-sm text-muted-foreground">
          {empty}
        </p>
      ) : (
        <div
          className={
            horizontal
              ? "grid divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-6"
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
