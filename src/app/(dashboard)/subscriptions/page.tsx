"use client";

import { ExpenseWorkspace } from "@/components/expenses";

export default function SubscriptionsPage() {
  return (
    <ExpenseWorkspace
      expenseType="subscription"
      title="Subscriptions"
      singularTitle="Subscription"
      description="Keep recurring services and their payment methods in one place."
      emptyMessage="No subscriptions found."
      basePath="/subscriptions"
      defaultScheduleType="subscription"
    />
  );
}
