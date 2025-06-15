
"use client";

import React from 'react';
import { format } from "date-fns";
import { Download, Eye } from "lucide-react"; // Eye icon can be for a future "view" functionality
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { InvoiceDocument } from "@/lib/types"; // Assuming types.ts is updated for InvoiceDocument
import { useToast } from '@/hooks/use-toast';

interface InvoicesListTableProps {
  invoices: InvoiceDocument[];
}

// Based on Canadian tax rates in InvoiceGeneratorClient
const canadianTaxRatesForDisplay: Record<string, number> = { AB: 0.05,BC: 0.12,MB: 0.12,NB: 0.15,NL: 0.15,NT: 0.05,NS: 0.15,NU: 0.05,ON: 0.13,PE: 0.15,QC: 0.14975,SK: 0.11,YT: 0.05 };


export function InvoicesListTable({ invoices }: InvoicesListTableProps) {
  const { toast } = useToast();

  const handleDownloadInvoicePdf = async (invoice: InvoiceDocument) => {
    if (typeof window === 'undefined') {
        toast({ title: "Error", description: "PDF generation is only available in the browser.", variant: "destructive"});
        return;
    }
    
    const doc = new jsPDF();
    const pageMargin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = pageMargin;

    // Logo
    if (invoice.logoUrl) {
      try {
        const imgTypeMatch = invoice.logoUrl.match(/^data:image\/(png|jpeg|jpg);base64,/);
        if (imgTypeMatch && imgTypeMatch[1]) {
            const imgType = imgTypeMatch[1].toUpperCase() as 'PNG' | 'JPEG' | 'JPG';
            
            const image = new Image();
            image.src = invoice.logoUrl; // This is line 102
            
            await new Promise<void>(resolve => { image.onload = () => resolve(); image.onerror = () => resolve();});

            const logoMaxHeight = 15;
            const logoMaxWidth = 40;
            let imgWidth = image.naturalWidth;
            let imgHeight = image.naturalHeight;

            if (imgWidth > logoMaxWidth) {
                const ratio = logoMaxWidth / imgWidth;
                imgWidth = logoMaxWidth;
                imgHeight = imgHeight * ratio;
            }
            if (imgHeight > logoMaxHeight) {
                const ratio = logoMaxHeight / imgHeight;
                imgHeight = logoMaxHeight;
                imgWidth = imgWidth * ratio;
            }
            
            doc.addImage(invoice.logoUrl, imgType, pageMargin, currentY, imgWidth, imgHeight);
            currentY += imgHeight + 5; 
        } else {
            console.warn("Invoice logoUrl is not a valid data URI or unsupported image type.");
        }
      } catch (e) {
        console.error("Error adding logo to PDF from saved invoice:", e);
        toast({ title: "Logo Error", description: "Could not add logo to PDF.", variant: "destructive" });
      }
    }


    // Business Details
    doc.setFontSize(18);
    doc.text(invoice.businessName, pageMargin, currentY);
    currentY += 7;
    doc.setFontSize(10);
    doc.text(invoice.businessAddress, pageMargin, currentY);
    currentY += 5;
    if (invoice.taxId) {
      doc.text(`Tax ID: ${invoice.taxId}`, pageMargin, currentY);
      currentY += 5;
    }

    // Receipt Info (aligned to right)
    const receiptInfoX = pageWidth - pageMargin;
    let receiptBlockY = pageMargin; 
    if (invoice.logoUrl) receiptBlockY = pageMargin; 
    else receiptBlockY = Math.max(pageMargin, currentY - (invoice.taxId ? 17 : 12) ); 

    doc.setFontSize(14).setFont(undefined, 'bold');
    doc.text("RECEIPT", receiptInfoX, receiptBlockY + 5, { align: 'right' });
    doc.setFontSize(10).setFont(undefined, 'normal');
    doc.text(`#${invoice.receiptNumber}`, receiptInfoX, receiptBlockY + 12, { align: 'right' });
    doc.text(`Date: ${format(invoice.paymentDate, "MMMM d, yyyy")}`, receiptInfoX, receiptBlockY + 17, { align: 'right' });
    
    currentY = Math.max(currentY, receiptBlockY + 25); 

    // Client Details
    currentY += 10;
    doc.setFontSize(8).setTextColor(100);
    doc.text("BILL TO", pageMargin, currentY);
    currentY += 4;
    doc.setFontSize(10).setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text(invoice.clientName, pageMargin, currentY);
    currentY += 5;
    doc.setFont(undefined, 'normal');
    doc.text(invoice.clientAddress, pageMargin, currentY);
    currentY += 10;

    // Services Table
    const tableColumn = ["Description", "Amount"];
    const tableRows = invoice.services.map(service => [
      service.description,
      `$${Number(service.amount).toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: currentY,
      theme: 'striped',
      headStyles: { fillColor: [70, 128, 144] }, 
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'right', cellWidth: 40 }
      },
      didDrawPage: (data) => { 
        currentY = data.cursor?.y || currentY;
      }
    });
    
    let tableEndY = currentY;
    // Type assertion for jsPDF augmented by autoTable
    const docWithAutoTable = doc as jsPDF & { lastAutoTable?: { finalY?: number } };
    if (docWithAutoTable.lastAutoTable && typeof docWithAutoTable.lastAutoTable.finalY === 'number') {
      tableEndY = docWithAutoTable.lastAutoTable.finalY;
    }
    currentY = tableEndY + 10;


    // Totals
    const totalsX = pageWidth - pageMargin - 70; 
    doc.setFontSize(10);
    doc.text("Subtotal:", totalsX, currentY, { align: 'left' });
    doc.text(`$${invoice.subtotal.toFixed(2)}`, pageWidth - pageMargin, currentY, { align: 'right' });
    currentY += 7;

    if (invoice.taxInfo.option !== 'none' && invoice.taxInfo.amount && invoice.taxInfo.amount > 0) {
      let taxLabel = "Tax";
      if (invoice.taxInfo.option === 'ca' && invoice.taxInfo.location && invoice.taxInfo.rate) {
        const rateDisplay = (invoice.taxInfo.rate * 100).toFixed(invoice.taxInfo.rate === 0.14975 ? 3 : (invoice.taxInfo.rate * 100 % 1 === 0 ? 0 : 1) );
        taxLabel = `Tax (${invoice.taxInfo.location} @ ${rateDisplay}%)`;
      }
      doc.text(`${taxLabel}:`, totalsX, currentY, { align: 'left'});
      doc.text(`$${invoice.taxInfo.amount.toFixed(2)}`, pageWidth - pageMargin, currentY, { align: 'right' });
      currentY += 7;
    }

    doc.setFont(undefined, 'bold');
    doc.text("Total Paid:", totalsX, currentY, { align: 'left'});
    doc.text(`$${invoice.totalAmount.toFixed(2)}`, pageWidth - pageMargin, currentY, { align: 'right' });

    // Save PDF
    doc.save(`Receipt-${invoice.receiptNumber}.pdf`);
    toast({ title: "PDF Downloaded", description: `Invoice ${invoice.receiptNumber} PDF has been generated.`});
  };
  
  if (!invoices || invoices.length === 0) {
    return null; // Page level handles "No invoices" message
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">Your Invoice History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[15%] font-semibold">Receipt #</TableHead>
                <TableHead className="w-[30%] font-semibold">Client</TableHead>
                <TableHead className="w-[20%] font-semibold">Date Paid</TableHead>
                <TableHead className="w-[20%] text-right font-semibold">Amount</TableHead>
                <TableHead className="w-[15%] text-center font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>{invoice.receiptNumber}</TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>{format(invoice.paymentDate, "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right font-medium">${invoice.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownloadInvoicePdf(invoice)}
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:ml-2">Download</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

