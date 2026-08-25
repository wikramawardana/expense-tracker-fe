"use client";

import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Receipt,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
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
  ExpenseMonthSummary,
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
  const [months, setMonths] = React.useState<ExpenseMonthSummary[]>([]);
  const [recent, setRecent] = React.useState<Expense[]>([]);
  const [attention, setAttention] = React.useState<Expense[]>([]);
  const [loading, setLoading] = React.useState(true);
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  React.useEffect(() => {
    getBillStatements()
      .then((response) => {
        setStatements(response.data);
        if (!searchParams.get("bill_statement_id")) {
          const currentName = format(new Date(), "MMMM yyyy");
          const current = response.data.find(
            (statement) => statement.name === currentName,
          );
          if (current) setSelectedStatement(current.id);
        }
      })
      .catch((error) => console.error("Failed to load statements", error));
  }, [searchParams]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const scope =
      selectedStatement === "all"
        ? {}
        : { bill_statement_id: selectedStatement };

    Promise.all([
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
        page_size: 4,
        sort_by: "date",
        sort_order: "asc",
      }),
      getExpenses({
        ...scope,
        status: "pending",
        page: 1,
        page_size: 4,
        sort_by: "date",
        sort_order: "asc",
      }),
    ])
      .then(([summary, recentResponse, unpaidResponse, pendingResponse]) => {
        if (cancelled) return;
        setTotals(summary.data.totals);
        setMethods(summary.data.payment_methods);
        setMonths(summary.data.months);
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
      })
      .catch((error) => console.error("Failed to load dashboard recap", error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedStatement]);

  const selectedStatementName =
    selectedStatement === "all"
      ? "All time"
      : statements.find((statement) => statement.id === selectedStatement)
          ?.name || "Selected month";

  const handleStatementChange = (value: string) => {
    setSelectedStatement(value);
    if (value === "all") {
      router.replace("/dashboard", { scroll: false });
    } else {
      router.replace(`/dashboard?bill_statement_id=${value}`, {
        scroll: false,
      });
    }
  };

  const summaryCards = [
    {
      label: "Total expenses",
      value: totals.total_amount,
      detail: `${totals.total_count} transactions`,
      color: "bg-secondary",
      icon: Receipt,
    },
    {
      label: "Paid",
      value: totals.paid_amount,
      detail: `${totals.completion_rate.toFixed(0)}% completed`,
      color: "bg-success",
      icon: CheckCircle2,
    },
    {
      label: "Pending",
      value: totals.pending_amount,
      detail: "Scheduled to pay",
      color: "bg-warning",
      icon: Clock3,
    },
    {
      label: "Unpaid",
      value: totals.unpaid_amount,
      detail: "Needs attention",
      color: "bg-destructive",
      icon: AlertTriangle,
    },
  ];

  const maxMonthTotal = Math.max(
    ...months.slice(0, 6).map((month) => month.totals.total_amount),
    1,
  );

  return (
    <div className="app-page gap-5">
      <section className="relative overflow-hidden border-3 border-foreground bg-primary p-5 text-primary-foreground shadow-[7px_7px_0_var(--foreground)] sm:p-8">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle,#fff_2px,transparent_2px)] [background-size:24px_24px]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="neo-label mb-5">Financial command center</span>
            <h2 className="text-5xl font-black uppercase leading-[0.83] tracking-[-0.075em] sm:text-7xl">
              Hey {firstName}
              <span className="text-accent">!</span>
              <br />
              Here&apos;s the
              <br />
              <span className="inline-block -rotate-1 border-3 border-foreground bg-card px-3 pb-2 text-foreground shadow-[6px_6px_0_var(--foreground)]">
                money recap.
              </span>
            </h2>
          </div>
          <div className="w-full border-3 border-foreground bg-card p-4 text-foreground shadow-[5px_5px_0_var(--foreground)] lg:w-80">
            <div className="mb-2 flex items-center gap-2 font-mono text-xs font-black uppercase">
              <CalendarDays className="size-4 text-primary" />
              Recap period
            </div>
            <Select
              value={selectedStatement}
              onValueChange={handleStatementChange}
            >
              <SelectTrigger className="w-full bg-background">
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
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-primary">
              {selectedStatementName}
            </p>
            <h3 className="text-3xl font-black uppercase tracking-[-0.055em] sm:text-4xl">
              Your financial pulse
            </h3>
          </div>
          <div className="mt-3 border-2 border-foreground bg-card px-4 py-2 font-mono text-sm font-black shadow-[3px_3px_0_var(--foreground)] sm:mt-0">
            Outstanding: {formatCurrency(totals.outstanding_amount)}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className={
                card.color +
                " border-3 border-foreground p-5 shadow-[5px_5px_0_var(--foreground)]"
              }
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-mono text-xs font-black uppercase tracking-wide">
                  {card.label}
                </p>
                <card.icon className="size-5" strokeWidth={2.6} />
              </div>
              <p className="mt-5 truncate text-2xl font-black tracking-[-0.05em] sm:text-3xl">
                {loading ? "—" : formatCurrency(card.value)}
              </p>
              <p className="mt-2 text-xs font-bold opacity-65">{card.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_.6fr]">
        <div className="border-3 border-foreground bg-card shadow-[6px_6px_0_var(--foreground)]">
          <div className="flex items-center justify-between border-b-3 border-foreground bg-secondary p-4 sm:p-5">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                Payment method recap
              </p>
              <h3 className="text-2xl font-black uppercase tracking-[-0.04em]">
                Where the money sits
              </h3>
            </div>
            <CreditCard className="size-7" />
          </div>
          <div className="divide-y-2 divide-foreground">
            {methods.length === 0 ? (
              <p className="p-8 text-center font-bold text-muted-foreground">
                No expenses in this period.
              </p>
            ) : (
              methods.map((method, index) => {
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
                    className="group grid gap-4 p-4 transition-colors hover:bg-muted sm:grid-cols-[2rem_1fr_auto] sm:items-center sm:p-5"
                  >
                    <span className="font-mono text-xs font-black text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-black uppercase">
                          {method.name}
                        </h4>
                        <span className="font-mono text-[10px] font-black uppercase text-muted-foreground">
                          {method.totals.total_count} transactions
                        </span>
                      </div>
                      <div className="mt-3 h-3 border-2 border-foreground bg-background">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width:
                              Math.min(method.totals.completion_rate, 100) +
                              "%",
                          }}
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-muted-foreground">
                        <span>
                          Paid {formatCurrency(method.totals.paid_amount)}
                        </span>
                        <span>
                          Pending {formatCurrency(method.totals.pending_amount)}
                        </span>
                        <span>
                          Unpaid {formatCurrency(method.totals.unpaid_amount)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="text-right">
                        <p className="text-lg font-black">
                          {formatCurrency(method.totals.total_amount)}
                        </p>
                        <p className="text-xs font-bold text-destructive">
                          {formatCurrency(method.totals.outstanding_amount)}{" "}
                          open
                        </p>
                      </div>
                      <ArrowUpRight className="size-5 transition-transform group-hover:-rotate-6" />
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div className="border-3 border-foreground bg-card p-5 shadow-[6px_6px_0_var(--foreground)]">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                Last six months
              </p>
              <h3 className="text-2xl font-black uppercase tracking-[-0.04em]">
                Spending trend
              </h3>
            </div>
            <TrendingUp className="size-6" />
          </div>
          <div className="space-y-4">
            {months.slice(0, 6).map((month) => (
              <div key={month.bill_statement_id}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-black">
                  <span className="uppercase">{month.name}</span>
                  <span>{formatCurrency(month.totals.total_amount)}</span>
                </div>
                <div className="h-5 border-2 border-foreground bg-muted">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${Math.max(
                        (month.totals.total_amount / maxMonthTotal) * 100,
                        2,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {months.length === 0 && (
              <p className="py-8 text-center font-bold text-muted-foreground">
                No monthly history yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <ActivityPanel
          title="Attention needed"
          eyebrow="Pending + unpaid"
          icon={AlertTriangle}
          items={attention}
          empty="Nothing needs attention in this period."
        />
        <ActivityPanel
          title="Recent activity"
          eyebrow="Latest transactions"
          icon={WalletCards}
          items={recent}
          empty="No recent expenses in this period."
        />
      </section>
    </div>
  );
}

function ActivityPanel({
  title,
  eyebrow,
  icon: Icon,
  items,
  empty,
}: {
  title: string;
  eyebrow: string;
  icon: typeof Receipt;
  items: Expense[];
  empty: string;
}) {
  return (
    <div className="border-3 border-foreground bg-card shadow-[6px_6px_0_var(--foreground)]">
      <div className="flex items-center justify-between border-b-3 border-foreground p-4 sm:p-5">
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">
            {eyebrow}
          </p>
          <h3 className="text-2xl font-black uppercase tracking-[-0.04em]">
            {title}
          </h3>
        </div>
        <Icon className="size-6" />
      </div>
      <div className="divide-y-2 divide-foreground">
        {items.length === 0 ? (
          <p className="p-8 text-center font-bold text-muted-foreground">
            {empty}
          </p>
        ) : (
          items.map((expense) => (
            <div
              key={expense.id}
              className="grid grid-cols-[1fr_auto] gap-4 p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-black">{expense.title}</p>
                <p className="mt-1 text-xs font-bold text-muted-foreground">
                  {expense.payment_method || "Unknown method"} ·{" "}
                  {formatDate(expense.expense_date)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-black">{formatCurrency(expense.amount)}</p>
                <span className="font-mono text-[10px] font-black uppercase text-muted-foreground">
                  {expense.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
