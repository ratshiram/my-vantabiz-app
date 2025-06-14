"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TransactionFormValues } from "@/lib/types";
import { TransactionBaseForm } from "./transaction-form-shared";

interface ExpenseFormProps {
  addExpense: (values: TransactionFormValues) => void;
}

export function ExpenseForm({ addExpense }: ExpenseFormProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-rose-600">Add Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <TransactionBaseForm type="expense" onSubmit={addExpense} />
      </CardContent>
    </Card>
  );
}
