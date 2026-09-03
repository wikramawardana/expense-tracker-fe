"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Category } from "@/types/category.types";
import type { Expense, ExpenseType } from "@/types/expense.types";
import { ExpenseActionDialog } from "./expense-action-dialog";
import { ExpenseBulkActions } from "./expense-bulk-actions";
import { CategoryBadge, PaymentMethodBadge, StatusBadge } from "./status-badge";

const SPECIAL_DESC_MAP: Record<string, string> = {
  "waroeng ss": "Waroeng SS",
  "mcd puncak": "McD Puncak",
  "dcreps": "D'Crepes",
  "zegavit": "Zegavit",
  "squishy": "Squishy",
  "saos & tepung": "Saos & Tepung",
  "tempat makan": "Tempat Makan",
  "tempat makan & sendok": "Tempat Makan & Sendok",
  "pisang goreng bu nanik": "Pisang Goreng Bu Nanik",
  "millie plastik": "Millie Plastik",
  "kaos kaki": "Kaos Kaki",
  "frozen": "Frozen",
  "nasgor": "Nasgor",
};

export function formatDisplayDescription(desc: string | null | undefined): string | null {
  if (!desc) return null;
  const trimmed = desc.trim();
  if (!trimmed) return null;

  // Clean up BNI legal disclaimers if present
  if (trimmed.includes("BNI Credit Card (") && trimmed.includes("Jika transaksi")) {
    const cardMatch = trimmed.match(/MASTERCARDXX([0-9]{4})/i);
    const last4 = cardMatch ? cardMatch[1] : "9103";
    const merchMatch = trimmed.match(/at (QRIS-[^\)]+|$)/i);
    const merch = merchMatch ? merchMatch[1].trim() : "BNI Transaction";
    return `BNI Credit Card (..${last4}) at ${merch}`;
  }

  // Check special casing map
  const low = trimmed.toLowerCase();
  if (SPECIAL_DESC_MAP[low]) {
    return SPECIAL_DESC_MAP[low];
  }

  // If short lowercase note, capitalize words
  if (trimmed === trimmed.toLowerCase() && trimmed.length < 60) {
    return trimmed
      .split(/\s+/)
      .map((w) =>
        w.length <= 2 && /^[a-zA-Z]+$/.test(w) && !["di", "ke"].includes(w)
          ? w.toUpperCase()
          : ["&", "dan", "di", "ke", "dari", "untuk"].includes(w)
          ? w
          : w.charAt(0).toUpperCase() + w.slice(1)
      )
      .join(" ");
  }

  return trimmed;
}

interface ExpensesTableProps {
  expenses: Expense[];
  expenseType?: ExpenseType;
  categories?: Category[];
  isLoading?: boolean;
  onExpenseUpdated?: () => void;
  onExpenseDeleted?: () => void;
}

export function ExpensesTable({
  expenses,
  expenseType: _expenseType,
  categories = [],
  isLoading,
  onExpenseUpdated,
  onExpenseDeleted,
}: ExpensesTableProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    () => new Set(),
  );
  const selectAllRef = React.useRef<HTMLInputElement>(null);

  const categoryMap = React.useMemo(() => {
    const map = new Map<string, Category>();
    for (const cat of categories) map.set(cat.id, cat);
    return map;
  }, [categories]);

  const visibleIds = React.useMemo(
    () => expenses.map((expense) => expense.id),
    [expenses],
  );
  const selectedExpenses = React.useMemo(
    () => expenses.filter((expense) => selectedIds.has(expense.id)),
    [expenses, selectedIds],
  );

  const hasVisibleRows = visibleIds.length > 0;
  const allVisibleSelected =
    hasVisibleRows && visibleIds.every((id) => selectedIds.has(id));
  const someVisibleSelected =
    hasVisibleRows && visibleIds.some((id) => selectedIds.has(id));

  React.useEffect(() => {
    setSelectedIds((current) => {
      const visibleIdSet = new Set(visibleIds);
      const next = new Set([...current].filter((id) => visibleIdSet.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [visibleIds]);

  React.useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate =
      someVisibleSelected && !allVisibleSelected;
  }, [allVisibleSelected, someVisibleSelected]);

  const toggleAllVisible = React.useCallback(
    (checked: boolean) => {
      setSelectedIds((current) => {
        const next = new Set(current);
        for (const id of visibleIds) {
          if (checked) {
            next.add(id);
          } else {
            next.delete(id);
          }
        }
        return next;
      });
    },
    [visibleIds],
  );

  const toggleExpense = React.useCallback((id: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const columns = React.useMemo<ColumnDef<Expense>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <input
            ref={selectAllRef}
            type="checkbox"
            aria-label="Select all visible expenses"
            checked={allVisibleSelected}
            onChange={(event) => toggleAllVisible(event.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-2 border-foreground/30 accent-primary"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select ${row.original.title}`}
            checked={selectedIds.has(row.original.id)}
            onChange={(event) =>
              toggleExpense(row.original.id, event.target.checked)
            }
            className="h-4 w-4 cursor-pointer rounded border-2 border-foreground/30 accent-primary"
          />
        ),
      },
      {
        accessorKey: "title",
        header: () => <div className="text-left">Expense</div>,
        cell: ({ row }) => {
          const expense = row.original;
          const hasInstallment =
            expense.recurrence_type?.trim().toLowerCase() === "installment" &&
            expense.recurrence_current &&
            expense.recurrence_count;
          return (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-foreground leading-tight">
                  {expense.title}
                </span>
                {hasInstallment && (
                  <span className="inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700">
                    {expense.recurrence_current}/{expense.recurrence_count}
                  </span>
                )}
                {expense.recurrence_type?.trim().toLowerCase() ===
                  "subscription" && (
                  <span className="inline-flex shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    Recurring
                  </span>
                )}
              </div>
              {expense.description && (
                <div className="mt-1 max-w-[240px] truncate text-[13px] font-medium text-muted-foreground">
                  {formatDisplayDescription(expense.description)}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "expense_date",
        header: () => <div className="text-left">Date</div>,
        cell: ({ row }) => (
          <div className="font-semibold text-muted-foreground tabular-nums">
            {formatDate(row.getValue("expense_date"))}
          </div>
        ),
      },
      {
        accessorKey: "category_id",
        header: () => <div className="text-left">Category</div>,
        cell: ({ row }) => {
          const categoryId = row.getValue("category_id") as string | null;
          const category = categoryId ? categoryMap.get(categoryId) : null;
          return (
            <div className="flex">
              <CategoryBadge category={category} />
            </div>
          );
        },
      },
      {
        accessorKey: "payment_method",
        header: () => <div className="text-left">Payment</div>,
        cell: ({ row }) => (
          <PaymentMethodBadge paymentMethod={row.getValue("payment_method")} />
        ),
      },
      {
        accessorKey: "paid_by",
        header: () => <div className="text-left">Who Paid</div>,
        cell: ({ row }) => (
          <div className="font-semibold text-muted-foreground">
            {row.getValue("paid_by") || "—"}
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => (
          <div className="text-right font-semibold text-foreground tabular-nums">
            {formatCurrency(row.getValue("amount"))}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: () => <div className="text-left">Status</div>,
        cell: ({ row }) => (
          <div className="flex">
            <StatusBadge status={row.getValue("status")} />
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <ExpenseActionDialog
              expense={row.original}
              categories={categories}
              onExpenseUpdated={onExpenseUpdated}
              onExpenseDeleted={onExpenseDeleted}
            />
          </div>
        ),
      },
    ],
    [
      allVisibleSelected,
      onExpenseUpdated,
      onExpenseDeleted,
      toggleAllVisible,
      toggleExpense,
      selectedIds,
      categoryMap,
      categories,
    ],
  );

  const table = useReactTable({
    data: expenses,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
        <div className="inline-block h-8 w-8 animate-spin border-4 border-solid border-primary border-r-transparent rounded-full" />
        <p className="mt-3 text-sm font-semibold text-muted-foreground">
          Loading expenses…
        </p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
        <p className="text-base font-semibold text-foreground">
          No expenses found
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust filters or add your first expense to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ExpenseBulkActions
        selectedExpenses={selectedExpenses}
        onClearSelection={clearSelection}
        onBulkActionComplete={onExpenseUpdated}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead className="border-b border-border bg-muted/60 text-[13px] font-semibold">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-11 px-4 text-left align-middle text-[13px] font-semibold text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.map((row) => {
                const isSelected = selectedIds.has(row.original.id);
                return (
                  <tr
                    key={row.original.id}
                    className={`transition-colors hover:bg-muted/50 ${
                      isSelected ? "bg-primary/5" : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3.5 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
