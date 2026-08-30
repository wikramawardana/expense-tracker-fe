"use client";

import { ExpenseWorkspace } from "@/components/expenses";

export default function ExpensesPage() {
  return (
    <ExpenseWorkspace
      expenseType="transaction"
      title="Transactions"
      singularTitle="Transaction"
      description="A clear view of paid and outstanding spending by payment method."
      emptyMessage="No regular transactions found."
      basePath="/expenses"
      defaultScheduleType="none"
    />
  );
}
