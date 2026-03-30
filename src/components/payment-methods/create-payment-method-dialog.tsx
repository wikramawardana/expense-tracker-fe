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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPaymentMethod } from "@/services/payment-methods.service";
import type { PaymentMethodType } from "@/types/payment-method.types";
import { PAYMENT_METHOD_TYPES } from "@/types/payment-method.types";

interface CreatePaymentMethodDialogProps {
  onPaymentMethodCreated?: () => void;
}

export function CreatePaymentMethodDialog({
  onPaymentMethodCreated,
}: CreatePaymentMethodDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form state
  const [name, setName] = React.useState("");
  const [methodType, setMethodType] = React.useState<PaymentMethodType>("cash");
  const [description, setDescription] = React.useState("");

  const resetForm = () => {
    setName("");
    setMethodType("cash");
    setDescription("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a payment method name");
      return;
    }

    setIsLoading(true);
    try {
      await createPaymentMethod({
        name: name.trim(),
        method_type: methodType,
        description: description.trim() || undefined,
      });
      toast.success("Payment method created successfully");
      setIsOpen(false);
      resetForm();
      onPaymentMethodCreated?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create payment method",
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
          Add Payment Method
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Payment Method</DialogTitle>
          <DialogDescription>
            Create a new payment method. Fill in the details below.
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
              placeholder="e.g., BCA Credit Card"
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., BCA Mastercard for daily expenses"
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
            {isLoading ? "Creating..." : "Create Payment Method"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
