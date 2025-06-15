
import { TrendingUp, TrendingDown, Scale } from "lucide-react";
import { SummaryCard } from "./summary-card";

interface DashboardSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  profitOrLoss: number;
}

export function DashboardSummary({ totalIncome, totalExpenses, profitOrLoss }: DashboardSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      <SummaryCard
        title="Total Income"
        value={`$${totalIncome.toFixed(2)}`}
        icon={<TrendingUp className="h-5 w-5 text-white/80" />}
        gradientClasses="bg-gradient-to-br from-green-400 to-emerald-500"
      />
      <SummaryCard
        title="Total Expenses"
        value={`$${totalExpenses.toFixed(2)}`}
        icon={<TrendingDown className="h-5 w-5 text-white/80" />}
        gradientClasses="bg-gradient-to-br from-red-400 to-rose-500"
      />
      <SummaryCard
        title="Profit / Loss"
        value={`$${profitOrLoss.toFixed(2)}`}
        icon={<Scale className="h-5 w-5 text-white/80" />}
        gradientClasses="bg-gradient-to-br from-blue-400 to-sky-500"
      />
    </div>
  );
}
