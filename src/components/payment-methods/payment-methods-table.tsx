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
import type { PaymentMethod } from "@/types/payment-method.types";
import { PAYMENT_METHOD_TYPES } from "@/types/payment-method.types";
import { PaymentMethodActionDialog } from "./payment-method-action-dialog";

interface PaymentMethodsTableProps {
  paymentMethods: PaymentMethod[];
  isLoading?: boolean;
  onPaymentMethodUpdated?: () => void;
  onPaymentMethodDeleted?: () => void;
}

function getMethodTypeDisplay(methodType: string) {
  const type = PAYMENT_METHOD_TYPES.find((t) => t.value === methodType);
  return type ? `${type.emoji} ${type.label}` : methodType;
}

export function PaymentMethodsTable({
  paymentMethods,
  isLoading,
  onPaymentMethodUpdated,
  onPaymentMethodDeleted,
}: PaymentMethodsTableProps) {
  const columns = React.useMemo<ColumnDef<PaymentMethod>[]>(
    () => [
      {
        accessorKey: "name",
        header: () => <div className="text-left">Name</div>,
        cell: ({ row }) => (
          <div className="font-medium text-foreground">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "method_type",
        header: () => <div className="text-left">Type</div>,
        cell: ({ row }) => (
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground ring-1 ring-inset ring-border">
            {getMethodTypeDisplay(row.getValue("method_type"))}
          </span>
        ),
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
            <PaymentMethodActionDialog
              paymentMethod={row.original}
              onPaymentMethodUpdated={onPaymentMethodUpdated}
              onPaymentMethodDeleted={onPaymentMethodDeleted}
            />
          </div>
        ),
      },
    ],
    [onPaymentMethodUpdated, onPaymentMethodDeleted],
  );

  const table = useReactTable({
    data: paymentMethods,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataTableShell
      table={table}
      isLoading={isLoading}
      emptyTitle="No payment methods found"
      emptyDescription="Add your first payment method to get started."
      loadingLabel="Loading payment methods…"
    />
  );
}
