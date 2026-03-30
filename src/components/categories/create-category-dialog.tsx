"use client";

import { Plus } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCategory } from "@/services/categories.service";

interface CreateCategoryDialogProps {
  onCategoryCreated?: () => void;
}

// Common emoji options for categories
const EMOJI_OPTIONS = [
  "🍔",
  "🚗",
  "🎬",
  "🛒",
  "💡",
  "🏥",
  "📚",
  "💼",
  "🏠",
  "✈️",
  "🎮",
  "👕",
  "💰",
  "🎁",
  "📱",
  "🔧",
];

// Common color options
const COLOR_OPTIONS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
];

export function CreateCategoryDialog({
  onCategoryCreated,
}: CreateCategoryDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form state
  const [name, setName] = React.useState("");
  const [icon, setIcon] = React.useState("");
  const [color, setColor] = React.useState("");
  const [description, setDescription] = React.useState("");

  const resetForm = () => {
    setName("");
    setIcon("");
    setColor("");
    setDescription("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    setIsLoading(true);
    try {
      await createCategory({
        name: name.trim(),
        icon: icon || undefined,
        color: color || undefined,
        description: description.trim() || undefined,
      });
      toast.success("Category created successfully");
      setIsOpen(false);
      resetForm();
      onCategoryCreated?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create category",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Create a new expense category. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Transportation"
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
                  className={`w-10 h-10 text-xl rounded border-2 transition-all ${
                    icon === emoji
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
                  className={`w-10 h-10 rounded border-2 transition-all ${
                    color === c
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Grab, Gojek, taxi"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
