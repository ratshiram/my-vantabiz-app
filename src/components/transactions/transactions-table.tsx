
"use client";

import React from 'react';
import { format } from "date-fns";
import { Download, CalendarIcon } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Transaction } from "@/lib/types";
import { incomeCategories, expenseCategories } from "./transaction-form-shared";
import { cn } from "@/lib/utils";

const categoryIconsMap = new Map([...incomeCategories, ...expenseCategories].map(cat => [cat.value, cat.icon]));

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDownloadReport = () => {
    if (typeof window === 'undefined') return;

    const doc = new jsPDF();
    const pageMargin = 14;
    let currentY = pageMargin;

    const filteredTransactions = sortedTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      if (startDate) {
        const startOfDayStartDate = new Date(startDate);
        startOfDayStartDate.setHours(0, 0, 0, 0);
        if (transactionDate < startOfDayStartDate) return false;
      }
      if (endDate) {
        const endOfDayEndDate = new Date(endDate);
        endOfDayEndDate.setHours(23, 59, 59, 999);
        if (transactionDate > endOfDayEndDate) return false;
      }
      return true;
    });

    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const profitOrLoss = totalIncome - totalExpenses;

    doc.setFontSize(18);
    doc.text("Transaction Report", pageMargin, currentY + 8);
    currentY += 8;
    doc.setFontSize(10);
    doc.setTextColor(100);
    
    let reportDateRangeString = "All Dates";
    if (startDate && endDate) {
      reportDateRangeString = `${format(startDate, "yyyy-MM-dd")} to ${format(endDate, "yyyy-MM-dd")}`;
    } else if (startDate) {
      reportDateRangeString = `From ${format(startDate, "yyyy-MM-dd")}`;
    } else if (endDate) {
      reportDateRangeString = `Up to ${format(endDate, "yyyy-MM-dd")}`;
    }
    currentY += 7;
    doc.text(`Date Range: ${reportDateRangeString}`, pageMargin, currentY);
    currentY += 7;
    doc.text(`Generated on: ${format(new Date(), "yyyy-MM-dd HH:mm")}`, pageMargin, currentY);


    const tableColumn = ["Date", "Description", "Category", "Type", "Amount"];
    const tableRows: (string | number)[][] = [];

    filteredTransactions.forEach(transaction => {
      const transactionData = [
        format(new Date(transaction.date), "yyyy-MM-dd"),
        transaction.description,
        transaction.category,
        transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
        `$${transaction.amount.toFixed(2)}`
      ];
      tableRows.push(transactionData);
    });
    
    const mainTableStartY = currentY + 6;

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: mainTableStartY,
      theme: 'striped',
      headStyles: { fillColor: [22, 160, 133] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 9, cellPadding: 2.5 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 35 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25, halign: 'right' },
      }
    });

    let tableEndY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY;
    if (typeof tableEndY !== 'number' || isNaN(tableEndY)) {
      tableEndY = mainTableStartY + (tableRows.length > 0 ? tableRows.length * 10 : 0) + 10;
    }
    currentY = tableEndY;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Summary:", pageMargin, currentY + 10);
    
    const summaryData = [
        ["Total Income:", `$${totalIncome.toFixed(2)}`],
        ["Total Expenses:", `$${totalExpenses.toFixed(2)}`],
        ["Profit / Loss:", `$${profitOrLoss.toFixed(2)}`]
    ];
    
    const summaryTableStartY = currentY + 15;
    
    let pageWidthForSummary = doc.internal.pageSize.getWidth();
    if (typeof pageWidthForSummary !== 'number' || pageWidthForSummary <= 0) {
        pageWidthForSummary = 210; 
    }

    let summaryTableMarginLeft = Math.max(pageMargin, pageWidthForSummary - 80 - pageMargin);
    if (typeof summaryTableMarginLeft !== 'number' || isNaN(summaryTableMarginLeft) || summaryTableMarginLeft < 0) {
        summaryTableMarginLeft = pageMargin; 
    }


    autoTable(doc, {
        body: summaryData,
        startY: summaryTableStartY,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
            0: { halign: 'right', fontStyle: 'bold' },
            1: { halign: 'right' }
        },
        tableWidth: 'wrap',
        margin: {left: summaryTableMarginLeft }
    });
    
    doc.save("Financial-Report.pdf");
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 md:p-6">
        <CardTitle className="text-2xl font-bold text-foreground whitespace-nowrap">
          Recent Transactions
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[180px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Start date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={(date) => !!(date > new Date() || date < new Date("1900-01-01"))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[180px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>End date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) => !!(date > new Date() || date < new Date("1900-01-01") || (startDate && date < startDate))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            onClick={handleDownloadReport}
            variant="default"
            size="sm"
            disabled={transactions.length === 0}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 md:p-6 md:pt-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[15%] font-semibold px-4">Date</TableHead>
                <TableHead className="w-[40%] font-semibold px-4">Description</TableHead>
                <TableHead className="w-[20%] font-semibold px-4">Category</TableHead>
                <TableHead className="w-[25%] text-right font-semibold px-4">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.length > 0 ? (
                sortedTransactions.map((t) => {
                  const iconNode = categoryIconsMap.get(t.category);
                  return (
                    <TableRow key={t.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="px-4">{format(new Date(t.date), "MMM d, yyyy")}</TableCell>
                      <TableCell className="px-4">{t.description}</TableCell>
                      <TableCell className="flex items-center px-4">
                        {React.isValidElement(iconNode)
                          ? React.cloneElement(iconNode as React.ReactElement<{className?: string}>, {
                              className: "mr-2 h-4 w-4 text-muted-foreground",
                            })
                          : null}
                        <span>{t.category}</span>
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold px-4 ${
                          t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8 px-4">
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
