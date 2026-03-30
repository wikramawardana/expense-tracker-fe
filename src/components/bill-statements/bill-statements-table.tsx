"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { formatDate } from "@/lib/format";
import type { BillStatement } from "@/types/bill-statement.types";
import { BillStatementActionDialog } from "./bill-statement-action-dialog";

interface BillStatementsTableProps {
  billStatements: BillStatement[];
  isLoading?: boolean;
  onBillStatementUpdated?: () => void;
  onBillStatementDeleted?: () => void;
}

export function BillStatementsTable({
  billStatements,
  isLoading,
  onBillStatementUpdated,
  onBillStatementDeleted,
}: BillStatementsTableProps) {
  const columns = React.useMemo<ColumnDef<BillStatement>[]>(
    () => [
      {
        accessorKey: "name",
        header: () => <div className="text-left font-semibold">Name</div>,
        cell: ({ row }) => (
          <div className="text-left font-bold text-black dark:text-white">
            {row.getValue("name")}
          </div>
        ),
      },
      {
        accessorKey: "statement_date",
        header: () => (
          <div className="text-left font-semibold">Statement Date</div>
        ),
        cell: ({ row }) => {
          const date = row.getValue("statement_date") as string | null;
          return (
            <div className="text-left text-gray-600 dark:text-gray-400">
              {date ? formatDate(date) : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "due_date",
        header: () => <div className="text-left font-semibold">Due Date</div>,
        cell: ({ row }) => {
          const date = row.getValue("due_date") as string | null;
          const isOverdue = date && new Date(date) < new Date();
          return (
            <div
              className={`text-left ${isOverdue ? "text-red-600 font-bold" : "text-gray-600 dark:text-gray-400"}`}
            >
              {date ? formatDate(date) : "-"}
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
        accessorKey: "is_active",
        header: () => <div className="text-center font-semibold">Status</div>,
        cell: ({ row }) => {
          const isActive = row.getValue("is_active") as boolean;
          return (
            <div className="flex justify-center">
              <span
                className={`px-2 py-1 text-xs font-bold rounded border-2 ${
                  isActive
                    ? "bg-green-100 text-green-700 border-green-500 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-700 border-gray-500 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: () => <div className="text-left font-semibold">Created</div>,
        cell: ({ row }) => (
          <div className="text-left text-gray-600 dark:text-gray-400">
            {formatDate(row.getValue("created_at"))}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-center font-semibold">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <BillStatementActionDialog
              billStatement={row.original}
              onBillStatementUpdated={onBillStatementUpdated}
              onBillStatementDeleted={onBillStatementDeleted}
            />
          </div>
        ),
      },
    ],
    [onBillStatementUpdated, onBillStatementDeleted],
  );

  const table = useReactTable({
    data: billStatements,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="border-3 border-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,251,245,1)] bg-background">
        <div className="p-8 text-center">
          <div className="inline-block h-10 w-10 animate-spin border-4 border-solid border-foreground border-r-transparent" />
          <p className="mt-2 text-sm font-bold text-muted-foreground uppercase">
            Loading bill statements...
          </p>
        </div>
      </div>
    );
  }

  if (billStatements.length === 0) {
    return (
      <div className="border-3 border-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,251,245,1)] bg-background">
        <div className="p-8 text-center">
          <p className="text-lg font-black uppercase">
            No bill statements found
          </p>
          <p className="text-sm font-bold text-muted-foreground">
            Start by adding your first bill statement
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
