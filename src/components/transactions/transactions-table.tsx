"use client";

import React, { useRef } from 'react';
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
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const handleDownloadReport = async () => {
    if (typeof window !== 'undefined') {
      const html2pdf = (await import('html2pdf.js')).default;
      if (pdfContentRef.current) {
        const reportElement = pdfContentRef.current.cloneNode(true) as HTMLElement;
        
        // Ensure the cloned element is visible for html2pdf.js but not to the user
        reportElement.style.position = 'absolute';
        reportElement.style.left = '-9999px';
        reportElement.style.top = '-9999px';
        document.body.appendChild(reportElement);

        html2pdf().from(reportElement).set({
          margin: 0.5,
          filename: 'Financial-Report.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        }).save().then(() => {
          document.body.removeChild(reportElement);
        }).catch(err => {
          console.error("Failed to generate PDF:", err);
          document.body.removeChild(reportElement);
        });
      }
    }
  };
  
  const sortedTransactions = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());

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
      {/* Hidden div for PDF generation */}
      <div ref={pdfContentRef} className="hidden">
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', fontSize: '10px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '16px', marginBottom: '15px' }}>Transaction Report</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ccc', backgroundColor: '#f0f0f0' }}>
                <th style={{ textAlign: 'left', padding: '8px 5px' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '8px 5px' }}>Description</th>
                <th style={{ textAlign: 'left', padding: '8px 5px' }}>Category</th>
                <th style={{ textAlign: 'right', padding: '8px 5px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px 5px' }}>{format(t.date, "yyyy-MM-dd")}</td>
                  <td style={{ padding: '8px 5px' }}>{t.description}</td>
                  <td style={{ padding: '8px 5px' }}>{t.category}</td>
                  <td style={{ textAlign: 'right', padding: '8px 5px', color: t.type === 'income' ? 'green' : 'red' }}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
             <tfoot>
                <tr style={{ borderTop: '2px solid #ccc', fontWeight: 'bold' }}>
                  <td colSpan={3} style={{ textAlign: 'right', padding: '8px 5px' }}>Total Income:</td>
                  <td style={{ textAlign: 'right', padding: '8px 5px', color: 'green' }}>
                    ${transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                  </td>
                </tr>
                <tr style={{ fontWeight: 'bold' }}>
                  <td colSpan={3} style={{ textAlign: 'right', padding: '8px 5px' }}>Total Expenses:</td>
                  <td style={{ textAlign: 'right', padding: '8px 5px', color: 'red' }}>
                    ${transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                  </td>
                </tr>
                <tr style={{ fontWeight: 'bold', borderTop: '1px solid #ccc' }}>
                  <td colSpan={3} style={{ textAlign: 'right', padding: '8px 5px' }}>Profit/Loss:</td>
                  <td style={{ textAlign: 'right', padding: '8px 5px' }}>
                    ${(transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
          </table>
        </div>
      </div>
    </Card>
  );
}
