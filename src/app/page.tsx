"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { AppHeader } from '@/components/layout/header';
import { DashboardSummary } from '@/components/dashboard/dashboard-summary';
import { MonthlyOverviewChart } from '@/components/dashboard/monthly-overview-chart';
import { IncomeForm } from '@/components/transactions/income-form';
import { ExpenseForm } from '@/components/transactions/expense-form';
import { TransactionsTable } from '@/components/transactions/transactions-table';
import type { Transaction, TransactionFormValues, MonthlyData } from '@/lib/types';
import { format, getMonth, getYear, startOfMonth } from 'date-fns';

export default function HomePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load transactions from localStorage if available
    const storedTransactions = localStorage.getItem('fintracklite-transactions');
    if (storedTransactions) {
      try {
        const parsedTransactions = JSON.parse(storedTransactions).map((t: any) => ({
          ...t,
          date: new Date(t.date) // Ensure date is a Date object
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
      const monthYearKey = format(t.date, "MMM yyyy"); // e.g., "Jan 2023"
      if (!dataByMonth[monthYearKey]) {
        dataByMonth[monthYearKey] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        dataByMonth[monthYearKey].income += t.amount;
      } else {
        dataByMonth[monthYearKey].expenses += t.amount;
      }
    });

    // Get current year and create labels for all months of the current year
    const currentYear = getYear(new Date());
    const yearMonths: MonthlyData[] = [];
    for (let i = 0; i < 12; i++) {
        const monthDate = new Date(currentYear, i, 1);
        const monthLabel = format(monthDate, "MMM"); // Jan, Feb, etc.
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
    // Render a loading state or null until client is mounted to avoid hydration mismatch
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse">
          <svg className="h-16 w-16 text-primary" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="8" fill="currentColor"/><path d="M11 12L16.6667 28L20.4444 18.2222L29 12L20.4444 15.7778L16.6667 28L14.7778 21.8889L11 19.5556L18.5556 16.6667L11 12Z" fill="white"/></svg>
        </div>
        <p className="text-xl font-semibold text-primary mt-4">Loading VantaBiz...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
        <section id="dashboard" className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-6 text-center sr-only">Dashboard</h2>
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
      <footer className="text-center py-6 border-t border-border">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} VantaBiz. All rights reserved.</p>
      </footer>
    </div>
  );
}
