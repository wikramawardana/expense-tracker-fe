"use client";

import { ArrowUpRight, CircleCheckBig, Clock3, CreditCard } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type {
  ExpenseMethodSummary,
  ExpenseTotals,
} from "@/types/expense.types";

interface ExpenseMethodOverviewProps {
  basePath: string;
  methods: ExpenseMethodSummary[];
  totals: ExpenseTotals;
  isLoading?: boolean;
  emptyMessage: string;
  billStatementId?: string;
}

export function ExpenseMethodOverview({
  basePath,
  methods,
  totals,
  isLoading,
  emptyMessage,
  billStatementId,
}: ExpenseMethodOverviewProps) {
  const outstanding = totals.pending_amount + totals.unpaid_amount;

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-3">
        {[
          {
            label: "Total",
            value: totals.total_amount,
            detail: `${totals.total_count} entries`,
            icon: CreditCard,
          },
          {
            label: "Paid",
            value: totals.paid_amount,
            detail: `${totals.completion_rate.toFixed(0)}% completed`,
            icon: CircleCheckBig,
          },
          {
            label: "Outstanding",
            value: outstanding,
            detail: "Pending and unpaid",
            icon: Clock3,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <p className="text-sm font-medium">{item.label}</p>
              <item.icon className="size-4" />
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {isLoading ? "—" : formatCurrency(item.value)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold">By payment method</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a payment method to see its detailed entries.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        ) : methods.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <div className="divide-y divide-border">
            {methods.map((method) => {
              const params = new URLSearchParams();
              if (method.payment_method_id) {
                params.set("payment_method_id", method.payment_method_id);
              }
              params.set("payment_method", method.name);
              if (billStatementId) {
                params.set("bill_statement_id", billStatementId);
              }

              const methodOutstanding =
                method.totals.pending_amount + method.totals.unpaid_amount;

              return (
                <Link
                  key={method.payment_method_id || method.name}
                  href={`${basePath}?${params.toString()}`}
                  className="group grid gap-4 px-5 py-4 transition-colors hover:bg-muted/60 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{method.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {method.totals.total_count} entries
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Paid</p>
                    <p className="mt-1 font-medium text-success-foreground">
                      {formatCurrency(method.totals.paid_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Outstanding</p>
                    <p className="mt-1 font-medium">
                      {formatCurrency(methodOutstanding)}
                    </p>
                  </div>
                  <ArrowUpRight className="hidden size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:block" />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
