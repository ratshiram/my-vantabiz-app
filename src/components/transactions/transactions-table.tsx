
"use client";

import React from 'react';
import { format } from "date-fns";
import { Download } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Transaction } from "@/lib/types";
import { incomeCategories, expenseCategories } from "./transaction-form-shared";

const categoryIcons = new Map([...incomeCategories, ...expenseCategories].map(cat => [cat.value, cat.icon]));

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const sortedTransactions = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());

  const handleDownloadReport = () => {
    if (typeof window === 'undefined') return;

    const doc = new jsPDF();

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const profitOrLoss = totalIncome - totalExpenses;

    // Add Title
    doc.setFontSize(18);
    doc.text("Transaction Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${format(new Date(), "yyyy-MM-dd HH:mm")}`, 14, 29);

    // Define table columns and rows
    const tableColumn = ["Date", "Description", "Category", "Type", "Amount"];
    const tableRows: (string | number)[][] = [];

    sortedTransactions.forEach(transaction => {
      const transactionData = [
        format(transaction.date, "yyyy-MM-dd"),
        transaction.description,
        transaction.category,
        transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
        `$${transaction.amount.toFixed(2)}`
      ];
      tableRows.push(transactionData);
    });

    // Add table to PDF
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'striped', // or 'grid', 'plain'
      headStyles: { fillColor: [22, 160, 133] }, // Example: Teal color
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 9, cellPadding: 2.5 },
      columnStyles: {
        0: { cellWidth: 25 }, // Date
        1: { cellWidth: 'auto' }, // Description
        2: { cellWidth: 35 }, // Category
        3: { cellWidth: 20 }, // Type
        4: { cellWidth: 25, halign: 'right' }, // Amount
      }
    });

    let finalY = (doc as any).lastAutoTable.finalY || 50; // Get Y position of the EOT

    // Add Summary
    doc.setFontSize(12);
    doc.text("Summary:", 14, finalY + 10);
    finalY += 10;

    const summaryData = [
        ["Total Income:", `$${totalIncome.toFixed(2)}`],
        ["Total Expenses:", `$${totalExpenses.toFixed(2)}`],
        ["Profit / Loss:", `$${profitOrLoss.toFixed(2)}`]
    ];

    autoTable(doc, {
        body: summaryData,
        startY: finalY + 5,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
            0: { halign: 'right', fontStyle: 'bold' },
            1: { halign: 'right' }
        },
        tableWidth: 'wrap', // Adjust table width to content
        margin: {left: doc.internal.pageSize.getWidth() - 70} // Align summary table to the right
    });
    

    doc.save("Financial-Report.pdf");
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold text-foreground">Recent Transactions</CardTitle>
        <Button onClick={handleDownloadReport} variant="default" size="sm" disabled={transactions.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[15%] font-semibold">Date</TableHead>
                <TableHead className="w-[40%] font-semibold">Description</TableHead>
                <TableHead className="w-[20%] font-semibold">Category</TableHead>
                <TableHead className="w-[25%] text-right font-semibold">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.length > 0 ? (
                sortedTransactions.map((t) => (
                  <TableRow key={t.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>{format(t.date, "MMM d, yyyy")}</TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell className="flex items-center">
                      {categoryIcons.get(t.category) || null}
                      <span className="ml-2">{t.category}</span>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No transactions yet. Add some income or expenses to get started!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
