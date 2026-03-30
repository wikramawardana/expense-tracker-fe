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
import { formatDate } from "@/lib/format";
import { deleteBillStatement, updateBillStatement } from "@/services/bill-statements.service";
import type { BillStatement } from "@/types/bill-statement.types";

interface BillStatementActionDialogProps {
  billStatement: BillStatement;
  onBillStatementUpdated?: () => void;
  onBillStatementDeleted?: () => void;
}

export function BillStatementActionDialog({
  billStatement,
  onBillStatementUpdated,
  onBillStatementDeleted,
}: BillStatementActionDialogProps) {
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Edit form state
  const [name, setName] = React.useState(billStatement.name);
  const [statementDate, setStatementDate] = React.useState(
    billStatement.statement_date ? billStatement.statement_date.split("T")[0] : ""
  );
  const [dueDate, setDueDate] = React.useState(
    billStatement.due_date ? billStatement.due_date.split("T")[0] : ""
  );
  const [description, setDescription] = React.useState(billStatement.description || "");
  const [isActive, setIsActive] = React.useState(billStatement.is_active);

  // Reset form when billStatement changes
  React.useEffect(() => {
    setName(billStatement.name);
    setStatementDate(billStatement.statement_date ? billStatement.statement_date.split("T")[0] : "");
    setDueDate(billStatement.due_date ? billStatement.due_date.split("T")[0] : "");
    setDescription(billStatement.description || "");
    setIsActive(billStatement.is_active);
  }, [billStatement]);

  const handleEdit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a bill statement name");
      return;
    }

    setIsLoading(true);
    try {
      await updateBillStatement(billStatement.id, {
        name: name.trim(),
        statement_date: statementDate ? new Date(statementDate).toISOString() : undefined,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
        description: description.trim() || undefined,
        is_active: isActive,
      });
      toast.success("Bill statement updated successfully");
      setIsEditOpen(false);
      onBillStatementUpdated?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update bill statement",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteBillStatement(billStatement.id);
      toast.success("Bill statement deleted successfully");
      setIsDeleteOpen(false);
      onBillStatementDeleted?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete bill statement",
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
            <DialogTitle>Bill Statement Details</DialogTitle>
            <DialogDescription>
              View detailed information about this bill statement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{billStatement.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <p className={`font-medium ${billStatement.is_active ? "text-green-600" : "text-gray-500"}`}>
                  {billStatement.is_active ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Statement Date</Label>
                <p className="font-medium">
                  {billStatement.statement_date ? formatDate(billStatement.statement_date) : "Not set"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Due Date</Label>
                <p className={`font-medium ${billStatement.due_date && new Date(billStatement.due_date) < new Date() ? "text-red-600" : ""}`}>
                  {billStatement.due_date ? formatDate(billStatement.due_date) : "Not set"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p className="font-medium">{formatDate(billStatement.created_at)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Updated</Label>
                <p className="font-medium">{formatDate(billStatement.updated_at)}</p>
              </div>
            </div>
            {billStatement.description && (
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm">{billStatement.description}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Bill Statement</DialogTitle>
            <DialogDescription>
              Make changes to the bill statement details
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
                placeholder="Bill statement name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-statementDate">Statement Date</Label>
                <Input
                  id="edit-statementDate"
                  type="date"
                  value={statementDate}
                  onChange={(e) => setStatementDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Bill statement description"
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
            <DialogTitle>Delete Bill Statement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{billStatement.name}&quot;? This action cannot be undone.
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
