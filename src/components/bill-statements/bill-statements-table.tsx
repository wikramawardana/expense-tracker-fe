"use client";

import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import {
  ActiveBadge,
  DataTableShell,
} from "@/components/categories/categories-table";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
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
        header: () => <div className="text-left">Name</div>,
        cell: ({ row }) => (
          <div className="font-medium text-foreground">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "statement_date",
        header: () => <div className="text-left">Statement Date</div>,
        cell: ({ row }) => {
          const date = row.getValue("statement_date") as string | null;
          return (
            <div className="text-muted-foreground tabular-nums">
              {date ? formatDate(date) : "—"}
            </div>
          );
        },
      },
      {
        accessorKey: "due_date",
        header: () => <div className="text-left">Due Date</div>,
        cell: ({ row }) => {
          const date = row.getValue("due_date") as string | null;
          const isOverdue = date ? new Date(date) < new Date() : false;
          return (
            <div
              className={cn(
                "tabular-nums",
                isOverdue
                  ? "font-medium text-rose-600 dark:text-rose-400"
                  : "text-muted-foreground",
              )}
            >
              {date ? formatDate(date) : "—"}
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: () => <div className="text-left">Description</div>,
        cell: ({ row }) => (
          <div className="max-w-[220px] truncate text-muted-foreground">
            {row.getValue("description") || "—"}
          </div>
        ),
      },
      {
        accessorKey: "is_active",
        header: () => <div className="text-left">Status</div>,
        cell: ({ row }) => <ActiveBadge active={row.getValue("is_active")} />,
      },
      {
        accessorKey: "created_at",
        header: () => <div className="text-left">Created</div>,
        cell: ({ row }) => (
          <div className="text-muted-foreground tabular-nums">
            {formatDate(row.getValue("created_at"))}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
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

  return (
    <DataTableShell
      table={table}
      isLoading={isLoading}
      emptyTitle="No bill statements found"
      emptyDescription="Add your first bill statement to get started."
      loadingLabel="Loading bill statements…"
    />
  );
}
