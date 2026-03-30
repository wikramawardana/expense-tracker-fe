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
import { createRecurrenceType } from "@/services/recurrence-types.service";

interface CreateRecurrenceTypeDialogProps {
  onRecurrenceTypeCreated?: () => void;
}

export function CreateRecurrenceTypeDialog({
  onRecurrenceTypeCreated,
}: CreateRecurrenceTypeDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form state
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  const resetForm = () => {
    setName("");
    setDescription("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a recurrence type name");
      return;
    }

    setIsLoading(true);
    try {
      await createRecurrenceType({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Recurrence type created successfully");
      setIsOpen(false);
      resetForm();
      onRecurrenceTypeCreated?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create recurrence type",
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
          Add Recurrence Type
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Recurrence Type</DialogTitle>
          <DialogDescription>
            Create a new recurrence type for expenses. Fill in the details
            below.
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
              placeholder="e.g., Subscription, Installment"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Monthly recurring payments"
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
            {isLoading ? "Creating..." : "Create Recurrence Type"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
