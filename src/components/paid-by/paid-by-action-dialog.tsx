"use client";

import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { formatDate } from "@/lib/format";
import { deletePaidBy, updatePaidBy } from "@/services/paid-by.service";
import type { PaidBy } from "@/types/paid-by.types";

interface PaidByActionDialogProps {
  paidBy: PaidBy;
  onPaidByUpdated?: () => void;
  onPaidByDeleted?: () => void;
}

export function PaidByActionDialog({
  paidBy,
  onPaidByUpdated,
  onPaidByDeleted,
}: PaidByActionDialogProps) {
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Edit form state
  const [name, setName] = React.useState(paidBy.name);
  const [isActive, setIsActive] = React.useState(paidBy.is_active);

  // Reset form when paidBy changes
  React.useEffect(() => {
    setName(paidBy.name);
    setIsActive(paidBy.is_active);
  }, [paidBy]);

  const handleEdit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setIsLoading(true);
    try {
      await updatePaidBy(paidBy.id, {
        name: name.trim(),
        is_active: isActive,
      });
      toast.success("Paid by entry updated successfully");
      setIsEditOpen(false);
      onPaidByUpdated?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update paid by entry",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deletePaidBy(paidBy.id);
      toast.success("Paid by entry deleted successfully");
      setIsDeleteOpen(false);
      onPaidByDeleted?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete paid by entry",
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
            <DialogTitle>Paid By Details</DialogTitle>
            <DialogDescription>
              View detailed information about this paid-by entry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{paidBy.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <p
                  className={`font-medium ${paidBy.is_active ? "text-green-600" : "text-gray-500"}`}
                >
                  {paidBy.is_active ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p className="font-medium">{formatDate(paidBy.created_at)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Updated</Label>
                <p className="font-medium">{formatDate(paidBy.updated_at)}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Paid By</DialogTitle>
            <DialogDescription>
              Make changes to the paid-by entry details
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
                placeholder="Paid by name"
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
            <DialogTitle>Delete Paid By</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{paidBy.name}&quot;? This
              action cannot be undone.
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
