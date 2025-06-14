"use client";

import React, { useState, useEffect, useMemo } from 'react';
// AppHeader is now part of MainLayout, so it's removed from here.
import { DashboardSummary } from '@/components/dashboard/dashboard-summary';
import { MonthlyOverviewChart } from '@/components/dashboard/monthly-overview-chart';
import { IncomeForm } from '@/components/transactions/income-form';
import { ExpenseForm } from '@/components/transactions/expense-form';
import { TransactionsTable } from '@/components/transactions/transactions-table';
import type { Transaction, TransactionFormValues, MonthlyData } from '@/lib/types';
import { format, getYear } from 'date-fns';

export default function FinTrackPage() { // Renamed component for clarity
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedTransactions = localStorage.getItem('fintracklite-transactions');
    if (storedTransactions) {
      try {
        const parsedTransactions = JSON.parse(storedTransactions).map((t: any) => ({
          ...t,
          date: new Date(t.date)
        }));
        setTransactions(parsedTransactions);
      } catch (error) {
        console.error("Failed to parse transactions from localStorage", error);
        localStorage.removeItem('fintracklite-transactions');
      }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('fintracklite-transactions', JSON.stringify(transactions));
    }
  }, [transactions, isClient]);

  const addTransaction = (values: TransactionFormValues, type: 'income' | 'expense') => {
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      ...values,
      type,
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const totalIncome = useMemo(() => 
    transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), 
    [transactions]
  );
  const totalExpenses = useMemo(() => 
    transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );
  const profitOrLoss = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);

  const monthlyChartData = useMemo((): MonthlyData[] => {
    const dataByMonth: { [key: string]: { income: number; expenses: number } } = {};
    
    transactions.forEach(t => {
      const monthYearKey = format(t.date, "MMM yyyy");
      if (!dataByMonth[monthYearKey]) {
        dataByMonth[monthYearKey] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        dataByMonth[monthYearKey].income += t.amount;
      } else {
        dataByMonth[monthYearKey].expenses += t.amount;
      }
    });

    const currentYear = getYear(new Date());
    const yearMonths: MonthlyData[] = [];
    for (let i = 0; i < 12; i++) {
        const monthDate = new Date(currentYear, i, 1);
        const monthLabel = format(monthDate, "MMM");
        const monthYearKey = format(monthDate, "MMM yyyy");
        
        yearMonths.push({
            month: monthLabel,
            income: dataByMonth[monthYearKey]?.income || 0,
            expenses: dataByMonth[monthYearKey]?.expenses || 0,
        });
    }
    return yearMonths;

  }, [transactions]);

  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-background">
        <div className="animate-pulse">
          <svg className="h-16 w-16 text-primary" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="8" fill="currentColor"/><path d="M11 12L16.6667 28L20.4444 18.2222L29 12L20.4444 15.7778L16.6667 28L14.7778 21.8889L11 19.5556L18.5556 16.6667L11 12Z" fill="white"/></svg>
        </div>
        <p className="text-xl font-semibold text-primary mt-4">Loading FinTrack Lite...</p>
      </div>
    );
  }

  return (
    // Removed AppHeader and footer as they are now in MainLayout
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-8 text-center">FinTrack Lite Dashboard</h1>
      <section id="dashboard-summary" className="mb-8 sm:mb-12"> {/* Updated id for clarity */}
        <DashboardSummary 
          totalIncome={totalIncome} 
          totalExpenses={totalExpenses} 
          profitOrLoss={profitOrLoss} 
        />
        <div className="mt-8">
          <MonthlyOverviewChart data={monthlyChartData} />
        </div>
      </section>
      
      <section id="income-expense-forms" className="mb-8 sm:mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <IncomeForm addIncome={(values) => addTransaction(values, 'income')} />
          <ExpenseForm addExpense={(values) => addTransaction(values, 'expense')} />
        </div>
      </section>

      <section id="transactions-list" className="mb-8 sm:mb-12">
        <TransactionsTable transactions={transactions} />
      </section>
    </main>
  );
}
