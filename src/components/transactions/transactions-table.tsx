
"use client";

import React from 'react'; // Removed useRef as pdfContentRef is no longer needed
import { format } from "date-fns";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Transaction } from "@/lib/types";
import { incomeCategories, expenseCategories } from "./transaction-form-shared"; // For icons

const categoryIcons = new Map([...incomeCategories, ...expenseCategories].map(cat => [cat.value, cat.icon]));

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const sortedTransactions = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());

  const handleDownloadReport = async () => {
    if (typeof window !== 'undefined') {
      const html2pdf = (await import('html2pdf.js')).default;

      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const profitOrLoss = totalIncome - totalExpenses;

      let tableBodyHtml = '';
      sortedTransactions.forEach(t => {
        tableBodyHtml += `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 5px;">${format(t.date, "yyyy-MM-dd")}</td>
            <td style="padding: 8px 5px;">${t.description ? t.description.replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}</td>
            <td style="padding: 8px 5px;">${t.category ? t.category.replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}</td>
            <td style="text-align: right; padding: 8px 5px; color: ${t.type === 'income' ? 'green' : 'red'};">
              ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
            </td>
          </tr>
        `;
      });

      const tableFooterHtml = `
        <tr style="border-top: 2px solid #ccc; font-weight: bold;">
          <td colspan="3" style="text-align: right; padding: 8px 5px;">Total Income:</td>
          <td style="text-align: right; padding: 8px 5px; color: green;">
            $${totalIncome.toFixed(2)}
          </td>
        </tr>
        <tr style="font-weight: bold;">
          <td colspan="3" style="text-align: right; padding: 8px 5px;">Total Expenses:</td>
          <td style="text-align: right; padding: 8px 5px; color: red;">
            $${totalExpenses.toFixed(2)}
          </td>
        </tr>
        <tr style="font-weight: bold; border-top: 1px solid #ccc;">
          <td colspan="3" style="text-align: right; padding: 8px 5px;">Profit/Loss:</td>
          <td style="text-align: right; padding: 8px 5px;">
            $${profitOrLoss.toFixed(2)}
          </td>
        </tr>
      `;

      const reportHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; font-size: 10px; width: 7.5in;">
          <h2 style="text-align: center; font-size: 16px; margin-bottom: 15px;">Transaction Report</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid #ccc; background-color: #f0f0f0;">
                <th style="text-align: left; padding: 8px 5px; width: 20%;">Date</th>
                <th style="text-align: left; padding: 8px 5px; width: 35%;">Description</th>
                <th style="text-align: left; padding: 8px 5px; width: 20%;">Category</th>
                <th style="text-align: right; padding: 8px 5px; width: 25%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${sortedTransactions.length > 0 ? tableBodyHtml : '<tr><td colspan="4" style="text-align:center; padding: 20px;">No transactions to display.</td></tr>'}
            </tbody>
            ${sortedTransactions.length > 0 ? `<tfoot>${tableFooterHtml}</tfoot>` : ''}
          </table>
        </div>
      `;
      
      const reportElement = document.createElement('div');
      reportElement.innerHTML = reportHtml;
      
      reportElement.style.position = 'absolute';
      reportElement.style.left = '-9999px'; // Position off-screen
      reportElement.style.top = '-9999px';
      document.body.appendChild(reportElement);

      html2pdf().from(reportElement.firstChild || reportElement) // Use firstChild to get the actual report content div
        .set({
          margin: 0.5,
          filename: 'Financial-Report.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        })
        .save()
        .then(() => {
          document.body.removeChild(reportElement);
        })
        .catch(err => {
          console.error("Failed to generate PDF:", err);
          document.body.removeChild(reportElement);
        });
    }
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
      {/* The hidden div for PDF generation has been removed as it's now generated dynamically in handleDownloadReport */}
    </Card>
  );
}
