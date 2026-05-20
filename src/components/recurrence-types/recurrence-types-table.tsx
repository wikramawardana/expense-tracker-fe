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
import type { RecurrenceType } from "@/types/recurrence-type.types";
import { RecurrenceTypeActionDialog } from "./recurrence-type-action-dialog";

interface RecurrenceTypesTableProps {
  recurrenceTypes: RecurrenceType[];
  isLoading?: boolean;
  onRecurrenceTypeUpdated?: () => void;
  onRecurrenceTypeDeleted?: () => void;
}

export function RecurrenceTypesTable({
  recurrenceTypes,
  isLoading,
  onRecurrenceTypeUpdated,
  onRecurrenceTypeDeleted,
}: RecurrenceTypesTableProps) {
  const columns = React.useMemo<ColumnDef<RecurrenceType>[]>(
    () => [
      {
        accessorKey: "name",
        header: () => <div className="text-left">Name</div>,
        cell: ({ row }) => (
          <div className="font-medium text-foreground">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "description",
        header: () => <div className="text-left">Description</div>,
        cell: ({ row }) => (
          <div className="max-w-[320px] truncate text-muted-foreground">
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
            <RecurrenceTypeActionDialog
              recurrenceType={row.original}
              onRecurrenceTypeUpdated={onRecurrenceTypeUpdated}
              onRecurrenceTypeDeleted={onRecurrenceTypeDeleted}
            />
          </div>
        ),
      },
    ],
    [onRecurrenceTypeUpdated, onRecurrenceTypeDeleted],
  );

  const table = useReactTable({
    data: recurrenceTypes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataTableShell
      table={table}
      isLoading={isLoading}
      emptyTitle="No recurrence types found"
      emptyDescription="Add your first recurrence type to get started."
      loadingLabel="Loading recurrence types…"
    />
  );
}
