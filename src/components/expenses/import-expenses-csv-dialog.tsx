"use client";

import { Download, FileUp } from "lucide-react";
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
  downloadExpenseImportTemplate,
  importExpensesCsv,
} from "@/services/expenses.service";

interface ImportExpensesCsvDialogProps {
  onExpensesImported?: () => void;
}

export function ImportExpensesCsvDialog({
  onExpensesImported,
}: ImportExpensesCsvDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] =
    React.useState(false);

  const handleImport = async () => {
    if (!file) {
      toast.error("Please choose a CSV file first");
      return;
    }

    setIsImporting(true);
    try {
      const response = await importExpensesCsv(file);
      toast.success(`${response.data.count} expenses imported successfully`);
      setFile(null);
      setIsOpen(false);
      onExpensesImported?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to import expenses",
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      await downloadExpenseImportTemplate();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to download template",
      );
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileUp className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Expenses CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV with expense rows. Use either related record IDs or
            names for category, bill statement, and payment method.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleDownloadTemplate}
            disabled={isDownloadingTemplate}
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloadingTemplate ? "Downloading..." : "Download Template"}
          </Button>

          <div className="space-y-2">
            <Label htmlFor="expenses-csv">CSV file</Label>
            <Input
              id="expenses-csv"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            Required columns: title, amount, expense_date, category or
            category_id, bill_statement or bill_statement_id, payment_method or
            payment_method_id.
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleImport} disabled={isImporting}>
            {isImporting ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
