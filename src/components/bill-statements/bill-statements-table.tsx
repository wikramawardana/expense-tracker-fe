"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { ActiveBadge } from "@/components/categories/categories-table";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BillStatement } from "@/types/bill-statement.types";
import { BillStatementActionDialog } from "./bill-statement-action-dialog";
import { BillStatementBulkActions } from "./bill-statement-bulk-actions";

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
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    () => new Set(),
  );
  const selectAllRef = React.useRef<HTMLInputElement>(null);

  const visibleIds = React.useMemo(
    () => billStatements.map((bs) => bs.id),
    [billStatements],
  );
  const selectedBillStatements = React.useMemo(
    () => billStatements.filter((bs) => selectedIds.has(bs.id)),
    [billStatements, selectedIds],
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

  const toggleBillStatement = React.useCallback(
    (id: string, checked: boolean) => {
      setSelectedIds((current) => {
        const next = new Set(current);
        if (checked) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
    },
    [],
  );

  const clearSelection = React.useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleBulkActionComplete = React.useCallback(() => {
    clearSelection();
    onBillStatementUpdated?.();
  }, [clearSelection, onBillStatementUpdated]);

  const columns = React.useMemo<ColumnDef<BillStatement>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <input
            ref={selectAllRef}
            type="checkbox"
            aria-label="Select all visible bill statements"
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
              toggleBillStatement(row.original.id, event.target.checked)
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
        accessorKey: "statement_date",
        header: () => <div className="text-left">Statement Date</div>,
        cell: ({ row }) => {
          const date = row.getValue("statement_date") as string | null;
          return (
            <div className="text-muted-foreground tabular-nums">
              {date ? formatDate(date) : "\u2014"}
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
              {date ? formatDate(date) : "\u2014"}
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: () => <div className="text-left">Description</div>,
        cell: ({ row }) => (
          <div className="max-w-[220px] truncate text-muted-foreground">
            {row.getValue("description") || "\u2014"}
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
    [
      allVisibleSelected,
      onBillStatementUpdated,
      onBillStatementDeleted,
      toggleAllVisible,
      toggleBillStatement,
      selectedIds,
    ],
  );

  const table = useReactTable({
    data: billStatements,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="rounded-sm border-2 border-foreground/20 bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:border-foreground/15 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.08)]">
        <div className="p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin border-4 border-solid border-foreground border-r-transparent" />
          <p className="mt-3 text-sm font-black uppercase text-muted-foreground">
            Loading bill statements...
          </p>
        </div>
      </div>
    );
  }

  if (billStatements.length === 0) {
    return (
      <div className="rounded-sm border-2 border-foreground/20 bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:border-foreground/15 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.08)]">
        <div className="p-12 text-center">
          <p className="text-base font-black uppercase text-foreground">
            No bill statements found
          </p>
          <p className="mt-1 text-sm font-bold text-muted-foreground">
            Add your first bill statement to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <BillStatementBulkActions
        selectedBillStatements={selectedBillStatements}
        onClearSelection={clearSelection}
        onBulkActionComplete={handleBulkActionComplete}
      />

      <div className="overflow-hidden rounded-sm border-2 border-foreground/20 bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:border-foreground/15 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.08)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b-2 border-foreground/20 bg-secondary">
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
              {table.getRowModel().rows.map((row) => {
                const isSelected = selectedIds.has(row.original.id);

                return (
                  <tr
                    key={row.id}
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
