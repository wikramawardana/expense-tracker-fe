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
import type { Expense } from "@/types/expense.types";
import { ExpenseActionDialog } from "./expense-action-dialog";
import { ExpenseBulkActions } from "./expense-bulk-actions";
import { CategoryBadge, PaymentMethodBadge, StatusBadge } from "./status-badge";

interface ExpensesTableProps {
  expenses: Expense[];
  categories?: Category[];
  isLoading?: boolean;
  onExpenseUpdated?: () => void;
  onExpenseDeleted?: () => void;
}

interface ExpenseGroup {
  paymentMethod: string;
  expenses: Expense[];
  total: number;
  earliestDate: number;
}

function isInstallment(expense: Expense) {
  return expense.recurrence_type?.trim().toLowerCase() === "installment";
}

function paymentMethodLabel(expense: Expense) {
  return expense.payment_method?.trim() || "Unknown payment";
}

function dateValue(expense: Expense) {
  const parsed = Date.parse(expense.expense_date);
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
}

function groupByPaymentMethod(expenses: Expense[]): ExpenseGroup[] {
  const map = new Map<string, Expense[]>();

  for (const expense of expenses) {
    const key = paymentMethodLabel(expense);
    map.set(key, [...(map.get(key) ?? []), expense]);
  }

  return Array.from(map.entries())
    .map(([paymentMethod, groupExpenses]) => {
      const sortedExpenses = [...groupExpenses].sort((a, b) => {
        const dateDiff = dateValue(a) - dateValue(b);
        if (dateDiff !== 0) return dateDiff;
        return a.title.localeCompare(b.title);
      });

      return {
        paymentMethod,
        expenses: sortedExpenses,
        total: sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0),
        earliestDate: Math.min(...sortedExpenses.map(dateValue)),
      };
    })
    .sort((a, b) => {
      const dateDiff = a.earliestDate - b.earliestDate;
      if (dateDiff !== 0) return dateDiff;
      return a.paymentMethod.localeCompare(b.paymentMethod);
    });
}

function flattenGroups(groups: ExpenseGroup[]) {
  return groups.flatMap((group) => group.expenses);
}

export function ExpensesTable({
  expenses,
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

  const installmentGroups = React.useMemo(
    () => groupByPaymentMethod(expenses.filter(isInstallment)),
    [expenses],
  );
  const normalGroups = React.useMemo(
    () =>
      groupByPaymentMethod(
        expenses.filter((expense) => !isInstallment(expense)),
      ),
    [expenses],
  );
  const installmentExpenses = React.useMemo(
    () => flattenGroups(installmentGroups),
    [installmentGroups],
  );
  const normalExpenses = React.useMemo(
    () => flattenGroups(normalGroups),
    [normalGroups],
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
        header: () => <div className="text-left">Title</div>,
        cell: ({ row }) => (
          <div className="font-medium text-foreground">
            {row.getValue("title")}
          </div>
        ),
      },
      {
        accessorKey: "expense_date",
        header: () => <div className="text-left">Date</div>,
        cell: ({ row }) => (
          <div className="text-muted-foreground tabular-nums">
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
        accessorKey: "description",
        header: () => <div className="text-left">Description</div>,
        cell: ({ row }) => (
          <div className="text-muted-foreground max-w-[220px] truncate">
            {row.getValue("description") || "—"}
          </div>
        ),
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
        header: () => <div className="text-left">Paid By</div>,
        cell: ({ row }) => (
          <div className="text-muted-foreground">
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

  const installmentTable = useReactTable({
    data: installmentExpenses,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const normalTable = useReactTable({
    data: normalExpenses,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const renderGroupedTable = (
    table: typeof installmentTable,
    groups: ExpenseGroup[],
    emptyMessage: string,
  ) => {
    const rowByExpenseId = new Map(
      table.getRowModel().rows.map((row) => [row.original.id, row]),
    );

    if (groups.length === 0) {
      return (
        <div className="p-6 text-center text-sm font-semibold text-muted-foreground">
          {emptyMessage}
        </div>
      );
    }

    return (
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 border-b-2 border-foreground/20 bg-secondary">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="h-11 px-4 text-left align-middle text-xs font-black uppercase text-secondary-foreground"
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
          {groups.map((group) => (
            <React.Fragment key={group.paymentMethod}>
              <tr className="bg-muted/60">
                <td colSpan={columns.length} className="px-4 py-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <PaymentMethodBadge paymentMethod={group.paymentMethod} />
                      <span className="text-xs font-bold text-muted-foreground">
                        {group.expenses.length} expense
                        {group.expenses.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                      <span>
                        Earliest {formatDate(group.expenses[0].expense_date)}
                      </span>
                      <span>{formatCurrency(group.total)}</span>
                    </div>
                  </div>
                </td>
              </tr>
              {group.expenses.map((expense) => {
                const row = rowByExpenseId.get(expense.id);
                if (!row) return null;

                const isSelected = selectedIds.has(row.original.id);

                return (
                  <tr
                    key={row.original.id}
                    className={`transition-colors hover:bg-secondary/70 ${
                      isSelected ? "bg-primary/5" : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-sm border-2 border-foreground/20 bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:border-foreground/15 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.08)]">
        <div className="p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin border-4 border-solid border-foreground border-r-transparent" />
          <p className="mt-3 text-sm font-black uppercase text-muted-foreground">
            Loading expenses…
          </p>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-sm border-2 border-foreground/20 bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:border-foreground/15 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.08)]">
        <div className="p-12 text-center">
          <p className="text-base font-black uppercase text-foreground">
            No expenses found
          </p>
          <p className="mt-1 text-sm font-bold text-muted-foreground">
            Adjust filters or add your first expense to get started.
          </p>
        </div>
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

      <div className="overflow-hidden rounded-sm border-2 border-foreground/20 bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:border-foreground/15 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.08)]">
        {installmentGroups.length > 0 && (
          <div className="sticky top-0 z-20 border-b-2 border-foreground/20 bg-card">
            <div className="flex items-center justify-between gap-3 bg-amber-50 px-4 py-2 text-xs font-black uppercase text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <span>Sticky Installments</span>
              <span>{installmentExpenses.length} pinned</span>
            </div>
            <div className="overflow-x-auto">
              {renderGroupedTable(
                installmentTable,
                installmentGroups,
                "No installment expenses",
              )}
            </div>
          </div>
        )}

        <div className="max-h-[62vh] overflow-auto">
          <div className="min-w-full overflow-x-auto">
            {renderGroupedTable(
              normalTable,
              normalGroups,
              "No non-installment expenses",
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
