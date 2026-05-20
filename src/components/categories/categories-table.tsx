"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category.types";
import { CategoryActionDialog } from "./category-action-dialog";

interface CategoriesTableProps {
  categories: Category[];
  isLoading?: boolean;
  onCategoryUpdated?: () => void;
  onCategoryDeleted?: () => void;
}

/* shared helpers --------------------------------------------------- */

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        active
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900"
          : "bg-muted text-muted-foreground ring-border",
      )}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

interface DataTableShellProps<T> {
  // biome-ignore lint/suspicious/noExplicitAny: generic table type
  table: ReturnType<typeof useReactTable<any>>;
  isLoading?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  loadingLabel: string;
}

export function DataTableShell<T>({
  table,
  isLoading,
  emptyTitle,
  emptyDescription,
  loadingLabel,
}: DataTableShellProps<T>) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <p className="mt-3 text-sm text-muted-foreground">{loadingLabel}</p>
        </div>
      </div>
    );
  }

  if (table.getRowModel().rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="p-12 text-center">
          <p className="text-base font-semibold text-foreground">{emptyTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-11 px-4 text-left align-middle text-xs font-medium text-muted-foreground"
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
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-muted/40">
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

/* CategoriesTable ------------------------------------------------- */

export function CategoriesTable({
  categories,
  isLoading,
  onCategoryUpdated,
  onCategoryDeleted,
}: CategoriesTableProps) {
  const columns = React.useMemo<ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: "icon",
        header: () => <div className="text-center">Icon</div>,
        cell: ({ row }) => (
          <div className="text-center text-xl">{row.getValue("icon") || "📁"}</div>
        ),
      },
      {
        accessorKey: "name",
        header: () => <div className="text-left">Name</div>,
        cell: ({ row }) => (
          <div className="font-medium text-foreground">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "color",
        header: () => <div className="text-left">Color</div>,
        cell: ({ row }) => {
          const color = row.getValue("color") as string | null;
          return color ? (
            <div className="flex items-center gap-2">
              <div
                className="h-5 w-5 rounded ring-1 ring-inset ring-border"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground tabular-nums">{color}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
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
            <CategoryActionDialog
              category={row.original}
              onCategoryUpdated={onCategoryUpdated}
              onCategoryDeleted={onCategoryDeleted}
            />
          </div>
        ),
      },
    ],
    [onCategoryUpdated, onCategoryDeleted],
  );

  const table = useReactTable({
    data: categories,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataTableShell
      table={table}
      isLoading={isLoading}
      emptyTitle="No categories found"
      emptyDescription="Start by adding your first category."
      loadingLabel="Loading categories…"
    />
  );
}
