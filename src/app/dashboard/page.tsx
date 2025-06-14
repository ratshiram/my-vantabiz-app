
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DashboardSummary } from '@/components/dashboard/dashboard-summary';
import { MonthlyOverviewChart } from '@/components/dashboard/monthly-overview-chart';
import { IncomeForm } from '@/components/transactions/income-form';
import { ExpenseForm } from '@/components/transactions/expense-form';
import { TransactionsTable } from '@/components/transactions/transactions-table';
import type { Transaction, TransactionFormValues, MonthlyData } from '@/lib/types';
import { format, getYear } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function FinTrackPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setIsLoadingTransactions(false);
      return;
    }
    setIsLoadingTransactions(true);
    try {
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", user.id),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      const fetchedTransactions: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedTransactions.push({
          id: doc.id, // Use Firestore document ID
          userId: data.userId,
          type: data.type,
          description: data.description,
          date: (data.date as Timestamp).toDate(), // Convert Firestore Timestamp to JS Date
          amount: data.amount,
          category: data.category,
        } as Transaction);
      });
      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error("Error fetching transactions: ", error);
      // Handle error (e.g., show toast)
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchTransactions();
    } else if (!authLoading && !user) {
      // User logged out or not logged in, clear transactions
      setTransactions([]);
      setIsLoadingTransactions(false);
    }
  }, [user, authLoading, fetchTransactions]);

  const addTransaction = async (values: TransactionFormValues, type: 'income' | 'expense') => {
    if (!user) {
      // Handle case where user is not logged in (e.g., show toast, redirect)
      console.error("User not logged in, cannot add transaction.");
      return;
    }
    const transactionId = crypto.randomUUID(); // Generate client-side ID to use for Firestore doc ID
    const newTransactionData = {
      userId: user.id,
      type,
      ...values,
      date: Timestamp.fromDate(values.date), // Convert JS Date to Firestore Timestamp for storing
    };

    try {
      // Use the client-generated ID for the document
      await setDoc(doc(db, "transactions", transactionId), newTransactionData);
      // Optimistically update UI or refetch
      setTransactions(prev => [{ id: transactionId, userId: user.id, type, ...values }, ...prev]);
    } catch (error) {
      console.error("Error adding transaction: ", error);
      // Handle error (e.g., show toast)
    }
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

  if (!isClient || authLoading || isLoadingTransactions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-background">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
        <p className="text-xl font-semibold text-primary mt-4">Loading FinTrack Lite...</p>
      </div>
    );
  }
  
  if (!user && !authLoading) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-background">
        <h2 className="text-2xl font-semibold text-primary mb-4">Welcome to FinTrack Lite!</h2>
        <p className="text-muted-foreground">Please log in or sign up to manage your finances.</p>
      </div>
    );
  }


  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-8 text-center">FinTrack Lite Dashboard</h1>
      <section id="dashboard-summary" className="mb-8 sm:mb-12">
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
