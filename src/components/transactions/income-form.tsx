"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TransactionFormValues } from "@/lib/types";
import { TransactionBaseForm } from "./transaction-form-shared";

interface IncomeFormProps {
  addIncome: (values: TransactionFormValues) => void;
}

export function IncomeForm({ addIncome }: IncomeFormProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-emerald-600">Add Income</CardTitle>
      </CardHeader>
      <CardContent>
        <TransactionBaseForm type="income" onSubmit={addIncome} />
      </CardContent>
    </Card>
  );
}
