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
  // Create a map of category_id to category for quick lookup
  const categoryMap = React.useMemo(() => {
    const map = new Map<string, Category>();
    for (const cat of categories) {
      map.set(cat.id, cat);
    }
    return map;
  }, [categories]);

  const columns = React.useMemo<ColumnDef<Expense>[]>(
    () => [
      {
        accessorKey: "title",
        header: () => <div className="text-left font-semibold">Title</div>,
        cell: ({ row }) => (
          <div className="text-left font-bold text-black dark:text-white">
            {row.getValue("title")}
          </div>
        ),
      },
      {
        accessorKey: "expense_date",
        header: () => <div className="text-left font-semibold">Date</div>,
        cell: ({ row }) => (
          <div className="text-left text-gray-600 dark:text-gray-400">
            {formatDate(row.getValue("expense_date"))}
          </div>
        ),
      },
      {
        accessorKey: "category_id",
        header: () => <div className="text-left font-semibold">Category</div>,
        cell: ({ row }) => {
          const categoryId = row.getValue("category_id") as string | null;
          const category = categoryId ? categoryMap.get(categoryId) : null;
          return (
            <div className="flex justify-left">
              <CategoryBadge category={category} />
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: () => (
          <div className="text-left font-semibold">Description</div>
        ),
        cell: ({ row }) => (
          <div className="text-left text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
            {row.getValue("description") || "-"}
          </div>
        ),
      },
      {
        accessorKey: "payment_method",
        header: () => <div className="text-left font-semibold">Payment</div>,
        cell: ({ row }) => (
          <div className="flex justify-left">
            <PaymentMethodBadge
              paymentMethod={row.getValue("payment_method")}
            />
          </div>
        ),
      },
      {
        accessorKey: "paid_by",
        header: () => <div className="text-left font-semibold">Paid By</div>,
        cell: ({ row }) => (
          <div className="text-left text-gray-600 dark:text-gray-400">
            {row.getValue("paid_by") || "-"}
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-left font-semibold">Amount</div>,
        cell: ({ row }) => (
          <div className="text-left font-bold text-green-600 dark:text-green-400">
            {formatCurrency(row.getValue("amount"))}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: () => <div className="text-left font-semibold">Status</div>,
        cell: ({ row }) => (
          <div className="flex justify-left">
            <StatusBadge status={row.getValue("status")} />
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-center font-semibold">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
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
      <div className="border-3 border-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,251,245,1)] bg-background">
        <div className="p-8 text-center">
          <div className="inline-block h-10 w-10 animate-spin border-4 border-solid border-foreground border-r-transparent" />
          <p className="mt-2 text-sm font-bold text-muted-foreground uppercase">
            Loading expenses...
          </p>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="border-3 border-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,251,245,1)] bg-background">
        <div className="p-8 text-center">
          <p className="text-lg font-black uppercase">No expenses found</p>
          <p className="text-sm font-bold text-muted-foreground">
            Start by adding your first expense
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-3 border-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,251,245,1)] overflow-x-auto bg-background">
      <table className="w-full">
        <thead className="bg-[#FFE156] border-b-3 border-foreground">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="h-14 px-4 text-left align-middle text-sm font-black uppercase tracking-wide text-foreground"
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
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b-2 border-foreground/20 transition-colors hover:bg-[#FFE156]/20"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="p-4 align-middle text-sm font-bold"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
