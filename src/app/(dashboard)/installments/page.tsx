"use client";

import { ExpenseWorkspace } from "@/components/expenses";

export default function InstallmentsPage() {
  return (
    <ExpenseWorkspace
      expenseType="installment"
      title="Installments"
      singularTitle="Installment"
      description="Track installment plans and outstanding payments separately."
      emptyMessage="No installment plans found."
      basePath="/installments"
      defaultScheduleType="installment"
    />
  );
}
