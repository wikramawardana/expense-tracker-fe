"use client";

import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/format";
import { deletePaymentMethod, updatePaymentMethod } from "@/services/payment-methods.service";
import type { PaymentMethod, PaymentMethodType } from "@/types/payment-method.types";
import { PAYMENT_METHOD_TYPES } from "@/types/payment-method.types";

interface PaymentMethodActionDialogProps {
  paymentMethod: PaymentMethod;
  onPaymentMethodUpdated?: () => void;
  onPaymentMethodDeleted?: () => void;
}

function getMethodTypeDisplay(methodType: string) {
  const type = PAYMENT_METHOD_TYPES.find((t) => t.value === methodType);
  return type ? `${type.emoji} ${type.label}` : methodType;
}

export function PaymentMethodActionDialog({
  paymentMethod,
  onPaymentMethodUpdated,
  onPaymentMethodDeleted,
}: PaymentMethodActionDialogProps) {
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Edit form state
  const [name, setName] = React.useState(paymentMethod.name);
  const [methodType, setMethodType] = React.useState<PaymentMethodType>(paymentMethod.method_type);
  const [description, setDescription] = React.useState(paymentMethod.description || "");
  const [isActive, setIsActive] = React.useState(paymentMethod.is_active);

  // Reset form when paymentMethod changes
  React.useEffect(() => {
    setName(paymentMethod.name);
    setMethodType(paymentMethod.method_type);
    setDescription(paymentMethod.description || "");
    setIsActive(paymentMethod.is_active);
  }, [paymentMethod]);

  const handleEdit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a payment method name");
      return;
    }

    setIsLoading(true);
    try {
      await updatePaymentMethod(paymentMethod.id, {
        name: name.trim(),
        method_type: methodType,
        description: description.trim() || undefined,
        is_active: isActive,
      });
      toast.success("Payment method updated successfully");
      setIsEditOpen(false);
      onPaymentMethodUpdated?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update payment method",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deletePaymentMethod(paymentMethod.id);
      toast.success("Payment method deleted successfully");
      setIsDeleteOpen(false);
      onPaymentMethodDeleted?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete payment method",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsViewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteOpen(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payment Method Details</DialogTitle>
            <DialogDescription>
              View detailed information about this payment method
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{paymentMethod.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Type</Label>
                <p className="font-medium">{getMethodTypeDisplay(paymentMethod.method_type)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <p className={`font-medium ${paymentMethod.is_active ? "text-green-600" : "text-gray-500"}`}>
                  {paymentMethod.is_active ? "Active" : "Inactive"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p className="font-medium">{formatDate(paymentMethod.created_at)}</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Updated</Label>
              <p className="font-medium">{formatDate(paymentMethod.updated_at)}</p>
            </div>
            {paymentMethod.description && (
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm">{paymentMethod.description}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
            <DialogDescription>
              Make changes to the payment method details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Payment method name"
              />
            </div>

            <div className="space-y-2">
              <Label>
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={methodType}
                onValueChange={(v) => setMethodType(v as PaymentMethodType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHOD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.emoji} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Payment method description"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="edit-active">Active</Label>
              <Switch
                id="edit-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Payment Method</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{paymentMethod.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
