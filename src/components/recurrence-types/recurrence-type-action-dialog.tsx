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
import { deleteRecurrenceType, updateRecurrenceType } from "@/services/recurrence-types.service";
import type { RecurrenceType } from "@/types/recurrence-type.types";

interface RecurrenceTypeActionDialogProps {
    recurrenceType: RecurrenceType;
    onRecurrenceTypeUpdated?: () => void;
    onRecurrenceTypeDeleted?: () => void;
}

export function RecurrenceTypeActionDialog({
    recurrenceType,
    onRecurrenceTypeUpdated,
    onRecurrenceTypeDeleted,
}: RecurrenceTypeActionDialogProps) {
    const [isViewOpen, setIsViewOpen] = React.useState(false);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    // Edit form state
    const [name, setName] = React.useState(recurrenceType.name);
    const [description, setDescription] = React.useState(recurrenceType.description || "");
    const [isActive, setIsActive] = React.useState(recurrenceType.is_active);

    // Reset form when recurrence type changes
    React.useEffect(() => {
        setName(recurrenceType.name);
        setDescription(recurrenceType.description || "");
        setIsActive(recurrenceType.is_active);
    }, [recurrenceType]);

    const handleEdit = async () => {
        if (!name.trim()) {
            toast.error("Please enter a recurrence type name");
            return;
        }

        setIsLoading(true);
        try {
            await updateRecurrenceType(recurrenceType.id, {
                name: name.trim(),
                description: description.trim() || undefined,
                is_active: isActive,
            });
            toast.success("Recurrence type updated successfully");
            setIsEditOpen(false);
            onRecurrenceTypeUpdated?.();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to update recurrence type",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteRecurrenceType(recurrenceType.id);
            toast.success("Recurrence type deleted successfully");
            setIsDeleteOpen(false);
            onRecurrenceTypeDeleted?.();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to delete recurrence type",
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
                        <DialogTitle>Recurrence Type Details</DialogTitle>
                        <DialogDescription>
                            View detailed information about this recurrence type
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-muted-foreground">Name</Label>
                                <p className="font-medium">{recurrenceType.name}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Status</Label>
                                <p className={`font-medium ${recurrenceType.is_active ? "text-green-600" : "text-gray-500"}`}>
                                    {recurrenceType.is_active ? "Active" : "Inactive"}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-muted-foreground">Created</Label>
                                <p className="font-medium">{formatDate(recurrenceType.created_at)}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Updated</Label>
                                <p className="font-medium">{formatDate(recurrenceType.updated_at)}</p>
                            </div>
                        </div>
                        {recurrenceType.description && (
                            <div>
                                <Label className="text-muted-foreground">Description</Label>
                                <p className="font-medium">{recurrenceType.description}</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Recurrence Type</DialogTitle>
                        <DialogDescription>
                            Update the recurrence type details
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
                                placeholder="e.g., Subscription"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g., Monthly recurring payments"
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="edit-is-active">Active</Label>
                            <Switch
                                id="edit-is-active"
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

            {/* Delete Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Delete Recurrence Type</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{recurrenceType.name}&quot;? This action cannot be undone.
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
