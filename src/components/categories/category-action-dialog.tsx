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
import { deleteCategory, updateCategory } from "@/services/categories.service";
import type { Category } from "@/types/category.types";

interface CategoryActionDialogProps {
    category: Category;
    onCategoryUpdated?: () => void;
    onCategoryDeleted?: () => void;
}

// Common emoji options for categories
const EMOJI_OPTIONS = [
    "🍔", "🚗", "🎬", "🛒", "💡", "🏥", "📚", "💼",
    "🏠", "✈️", "🎮", "👕", "💰", "🎁", "📱", "🔧",
];

// Common color options
const COLOR_OPTIONS = [
    "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6",
    "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
];

export function CategoryActionDialog({
    category,
    onCategoryUpdated,
    onCategoryDeleted,
}: CategoryActionDialogProps) {
    const [isViewOpen, setIsViewOpen] = React.useState(false);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    // Edit form state
    const [name, setName] = React.useState(category.name);
    const [icon, setIcon] = React.useState(category.icon || "");
    const [color, setColor] = React.useState(category.color || "");
    const [description, setDescription] = React.useState(category.description || "");
    const [isActive, setIsActive] = React.useState(category.is_active);

    // Reset form when category changes
    React.useEffect(() => {
        setName(category.name);
        setIcon(category.icon || "");
        setColor(category.color || "");
        setDescription(category.description || "");
        setIsActive(category.is_active);
    }, [category]);

    const handleEdit = async () => {
        if (!name.trim()) {
            toast.error("Please enter a category name");
            return;
        }

        setIsLoading(true);
        try {
            await updateCategory(category.id, {
                name: name.trim(),
                icon: icon || undefined,
                color: color || undefined,
                description: description.trim() || undefined,
                is_active: isActive,
            });
            toast.success("Category updated successfully");
            setIsEditOpen(false);
            onCategoryUpdated?.();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to update category",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteCategory(category.id);
            toast.success("Category deleted successfully");
            setIsDeleteOpen(false);
            onCategoryDeleted?.();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to delete category",
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
                        <DialogTitle>Category Details</DialogTitle>
                        <DialogDescription>
                            View detailed information about this category
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-muted-foreground">Name</Label>
                                <p className="font-medium">{category.name}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Icon</Label>
                                <p className="text-2xl">{category.icon || "📁"}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-muted-foreground">Color</Label>
                                {category.color ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <div
                                            className="w-6 h-6 rounded border-2 border-foreground"
                                            style={{ backgroundColor: category.color }}
                                        />
                                        <span className="text-sm">{category.color}</span>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">Not set</p>
                                )}
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Status</Label>
                                <p className={`font-medium ${category.is_active ? "text-green-600" : "text-gray-500"}`}>
                                    {category.is_active ? "Active" : "Inactive"}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-muted-foreground">Created</Label>
                                <p className="font-medium">{formatDate(category.created_at)}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Updated</Label>
                                <p className="font-medium">{formatDate(category.updated_at)}</p>
                            </div>
                        </div>
                        {category.description && (
                            <div>
                                <Label className="text-muted-foreground">Description</Label>
                                <p className="text-sm">{category.description}</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Make changes to the category details
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
                                placeholder="Category name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Icon</Label>
                            <div className="flex flex-wrap gap-2">
                                {EMOJI_OPTIONS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setIcon(icon === emoji ? "" : emoji)}
                                        className={`w-10 h-10 text-xl rounded border-2 transition-all ${icon === emoji
                                                ? "border-foreground bg-[#FFE156] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
                                                : "border-foreground/30 hover:border-foreground"
                                            }`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                            <Input
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                placeholder="Or type custom emoji..."
                                className="mt-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex flex-wrap gap-2">
                                {COLOR_OPTIONS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(color === c ? "" : c)}
                                        className={`w-10 h-10 rounded border-2 transition-all ${color === c
                                                ? "border-foreground shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] scale-110"
                                                : "border-foreground/30 hover:border-foreground"
                                            }`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                            <Input
                                type="text"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                placeholder="Or enter hex color (e.g., #3B82F6)"
                                className="mt-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Category description"
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
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{category.name}&quot;? This action cannot be undone.
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
