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
import type { PaidBy } from "@/types/paid-by.types";
import { PaidByActionDialog } from "./paid-by-action-dialog";

interface PaidByTableProps {
  paidByList: PaidBy[];
  isLoading?: boolean;
  onPaidByUpdated?: () => void;
  onPaidByDeleted?: () => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

export function PaidByTable({
  paidByList,
  isLoading,
  onPaidByUpdated,
  onPaidByDeleted,
  selectedIds,
  onSelectionChange,
}: PaidByTableProps) {
  const selectAllRef = React.useRef<HTMLInputElement>(null);

  const visibleIds = React.useMemo(
    () => paidByList.map((pb) => pb.id),
    [paidByList],
  );
  const hasVisibleRows = visibleIds.length > 0;
  const allVisibleSelected =
    hasVisibleRows && visibleIds.every((id) => selectedIds.has(id));
  const someVisibleSelected =
    hasVisibleRows && visibleIds.some((id) => selectedIds.has(id));

  React.useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate =
      someVisibleSelected && !allVisibleSelected;
  }, [allVisibleSelected, someVisibleSelected]);

  const toggleAllVisible = React.useCallback(
    (checked: boolean) => {
      const next = new Set(selectedIds);
      for (const id of visibleIds) {
        if (checked) {
          next.add(id);
        } else {
          next.delete(id);
        }
      }
      onSelectionChange(next);
    },
    [visibleIds, selectedIds, onSelectionChange],
  );

  const toggleItem = React.useCallback(
    (id: string, checked: boolean) => {
      const next = new Set(selectedIds);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      onSelectionChange(next);
    },
    [selectedIds, onSelectionChange],
  );

  const columns = React.useMemo<ColumnDef<PaidBy>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <input
            ref={selectAllRef}
            type="checkbox"
            aria-label="Select all"
            checked={allVisibleSelected}
            onChange={(event) => toggleAllVisible(event.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-2 border-foreground/30 accent-primary"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select ${row.original.name}`}
            checked={selectedIds.has(row.original.id)}
            onChange={(event) =>
              toggleItem(row.original.id, event.target.checked)
            }
            className="h-4 w-4 cursor-pointer rounded border-2 border-foreground/30 accent-primary"
          />
        ),
      },
      {
        accessorKey: "name",
        header: () => <div className="text-left">Name</div>,
        cell: ({ row }) => (
          <div className="font-medium text-foreground">
            {row.getValue("name")}
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
            <PaidByActionDialog
              paidBy={row.original}
              onPaidByUpdated={onPaidByUpdated}
              onPaidByDeleted={onPaidByDeleted}
            />
          </div>
        ),
      },
    ],
    [
      allVisibleSelected,
      onPaidByUpdated,
      onPaidByDeleted,
      toggleAllVisible,
      toggleItem,
      selectedIds,
    ],
  );

  const table = useReactTable({
    data: paidByList,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataTableShell
      table={table}
      isLoading={isLoading}
      emptyTitle="No paid-by entries found"
      emptyDescription="Start by adding your first paid-by entry."
      loadingLabel="Loading paid-by entries..."
    />
  );
}
