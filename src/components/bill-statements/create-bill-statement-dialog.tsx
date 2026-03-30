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
import { createBillStatement } from "@/services/bill-statements.service";

interface CreateBillStatementDialogProps {
  onBillStatementCreated?: () => void;
}

export function CreateBillStatementDialog({
  onBillStatementCreated,
}: CreateBillStatementDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form state
  const [name, setName] = React.useState("");
  const [statementDate, setStatementDate] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [description, setDescription] = React.useState("");

  const resetForm = () => {
    setName("");
    setStatementDate("");
    setDueDate("");
    setDescription("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a bill statement name");
      return;
    }

    setIsLoading(true);
    try {
      await createBillStatement({
        name: name.trim(),
        statement_date: statementDate
          ? new Date(statementDate).toISOString()
          : undefined,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
        description: description.trim() || undefined,
      });
      toast.success("Bill statement created successfully");
      setIsOpen(false);
      resetForm();
      onBillStatementCreated?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create bill statement",
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
          Add Bill Statement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Bill Statement</DialogTitle>
          <DialogDescription>
            Create a new bill statement. Fill in the details below.
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
              placeholder="e.g., January 2026"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="statementDate">Statement Date</Label>
              <Input
                id="statementDate"
                type="date"
                value={statementDate}
                onChange={(e) => setStatementDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Monthly statement for credit card"
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
            {isLoading ? "Creating..." : "Create Bill Statement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
