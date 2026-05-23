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
import { CategoryBadge, PaymentMethodBadge, StatusBadge } from "./status-badge";

interface ExpensesTableProps {
  expenses: Expense[];
  categories?: Category[];
  isLoading?: boolean;
  onExpenseUpdated?: () => void;
  onExpenseDeleted?: () => void;
}

export function ExpensesTable({
  expenses,
  categories = [],
  isLoading,
  onExpenseUpdated,
  onExpenseDeleted,
}: ExpensesTableProps) {
  const categoryMap = React.useMemo(() => {
    const map = new Map<string, Category>();
    for (const cat of categories) map.set(cat.id, cat);
    return map;
  }, [categories]);

  const columns = React.useMemo<ColumnDef<Expense>[]>(
    () => [
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
    [onExpenseUpdated, onExpenseDeleted, categoryMap, categories],
  );

  const table = useReactTable({
    data: expenses,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="border-3 border-foreground bg-card shadow-[5px_5px_0px_0px_rgba(26,26,26,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,251,245,1)]">
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
      <div className="border-3 border-foreground bg-card shadow-[5px_5px_0px_0px_rgba(26,26,26,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,251,245,1)]">
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
    <div className="overflow-hidden border-3 border-foreground bg-card shadow-[5px_5px_0px_0px_rgba(26,26,26,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,251,245,1)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b-3 border-foreground bg-secondary">
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
          <tbody className="divide-y-2 divide-foreground/15">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="transition-colors hover:bg-secondary/70"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
