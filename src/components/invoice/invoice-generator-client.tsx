
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlusCircle, Trash2, Download, Save, Loader2, Info } from 'lucide-react';
import type { InvoiceDocument, ServiceItem as ClientServiceItem, TaxInfo as ClientTaxInfo } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

const canadianTaxRates: Record<string, number> = { AB: 0.05,BC: 0.12,MB: 0.12,NB: 0.15,NL: 0.15,NT: 0.05,NS: 0.15,NU: 0.05,ON: 0.13,PE: 0.15,QC: 0.14975,SK: 0.11,YT: 0.05 };
const provinces = Object.keys(canadianTaxRates).map(p => ({ value: p, label: `${p} (${(canadianTaxRates[p]*100).toFixed(canadianTaxRates[p] === 0.14975 ? 3:0)}%)`}));

export function InvoiceGeneratorClient() {
  const { toast } = useToast();
  const { user, isLoading: authLoading, updateUserBusinessDetails } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);
  const [isSavingBusinessInfo, setIsSavingBusinessInfo] = useState(false);
  
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessTaxId, setBusinessTaxId] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  const [serviceItems, setServiceItems] = useState<ClientServiceItem[]>([{ id: crypto.randomUUID(), description: '', amount: 0 }]);
  const [taxOption, setTaxOption] = useState('none');
  const [provinceTax, setProvinceTax] = useState('NL'); 
  const [paymentDate, setPaymentDate] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');

  const [previewHtml, setPreviewHtml] = useState<string>('<div class="text-center h-full flex items-center justify-center text-muted-foreground"><p>Receipt preview appears here after filling the form and clicking "Generate & Preview".</p></div>');
  const [canDownload, setCanDownload] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setReceiptNumber(`RCPT-${Date.now().toString().slice(-6)}`); 
    if (serviceItems.length === 0) {
      addServiceItem();
    }
  }, []);

  useEffect(() => {
    if (user && isClient) {
      setBusinessName(user.businessName || '');
      setBusinessAddress(user.businessAddress || '');
      setBusinessTaxId(user.businessTaxId || '');
      setLogoUrl(user.logoUrl || null);
    }
  }, [user, isClient]);


  const addServiceItem = () => {
    setServiceItems([...serviceItems, { id: crypto.randomUUID(), description: '', amount: 0 }]);
  };

  const removeServiceItem = (id: string) => {
    setServiceItems(serviceItems.filter(item => item.id !== id));
  };

  const handleServiceChange = (id: string, field: keyof ClientServiceItem, value: string | number) => {
    setServiceItems(serviceItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { 
        toast({ title: "Logo Too Large", description: "Please upload a logo smaller than 1MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setLogoUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const calculateTotals = () => {
    const subtotal = serviceItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    let taxRate = 0;
    let taxAmount = 0;
    let taxLabel = 'No Tax';
    let taxInfoForDoc: ClientTaxInfo = { option: 'none' };

    if (taxOption === 'ca' && provinceTax && canadianTaxRates[provinceTax]) {
      taxRate = canadianTaxRates[provinceTax];
      taxAmount = subtotal * taxRate;
      taxLabel = `Tax (${provinceTax} @ ${(taxRate * 100).toFixed(canadianTaxRates[provinceTax] === 0.14975 ? 3:(taxRate * 100 % 1 === 0 ? 0 : 1))}%)`;
      taxInfoForDoc = { option: 'ca', location: provinceTax, rate: taxRate, amount: taxAmount };
    }
    const totalAmount = subtotal + taxAmount;
    return { subtotal, taxAmount, totalAmount, taxLabel, taxInfoForDoc };
  };

  const generatePreview = () => {
    if (!businessName || !clientName || serviceItems.length === 0 || 
        !serviceItems.every(s => s.description.trim() && s.amount >= 0) || 
        !paymentDate || !receiptNumber) {
        toast({ 
            title: "Missing Information", 
            description: "Please fill all required fields: Business Name, Client Name, Payment Date, Receipt Number, and ensure every service item has a description and a valid amount.", 
            variant: "destructive"
        });
        setCanDownload(false);
        setPreviewHtml('<div class="text-center h-full flex items-center justify-center text-destructive-foreground p-4 bg-destructive/10 rounded-md"><p>Preview generation failed. Please check all required fields.</p></div>');
        return;
    }
    const { subtotal, taxAmount, totalAmount, taxLabel } = calculateTotals();
    const formattedDate = paymentDate ? format(new Date(paymentDate + 'T00:00:00'), 'MMMM d, yyyy') : 'N/A';
    
    const servicesHtml = serviceItems.map(s => `<tr><td style="padding: 8px 16px 8px 0; border-bottom: 1px solid #eee; word-break: break-word;">${s.description || 'N/A'}</td><td style="text-align: right; padding: 8px 0 8px 16px; border-bottom: 1px solid #eee;">$${Number(s.amount).toFixed(2)}</td></tr>`).join('');
    
    let tfootHtml = `<tr><td style="padding: 8px 16px 2px 0; color: #6b7280; text-align: right;">Subtotal</td><td style="text-align: right; padding: 8px 0 2px 16px;">$${subtotal.toFixed(2)}</td></tr>`;
    if (taxOption !== 'none' && taxAmount > 0) {
        tfootHtml += `<tr><td style="padding: 2px 16px 8px 0; color: #6b7280; text-align: right;">${taxLabel}</td><td style="text-align: right; padding: 2px 0 8px 16px;">$${taxAmount.toFixed(2)}</td></tr>`;
    }
    tfootHtml += `<tr style="font-weight: bold; color: #111827;"><td style="padding-top: 8px; padding-right: 16px; text-align: right;">Total Paid</td><td style="text-align: right; padding-top: 8px; padding-left: 16px;">$${totalAmount.toFixed(2)}</td></tr>`;
    
    const logoDisplayHtml = logoUrl ? `<img src="${logoUrl}" alt="Business Logo" style="margin-bottom: 1rem; max-height: 4rem; max-width: 10rem; object-fit: contain;">` : '';
    
    const html = `<div style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; padding: 20px; color: #374151; max-width: 800px; margin: auto; border: 1px solid #e5e7eb; background: white;">
                    ${logoDisplayHtml}
                    <table style="width: 100%; margin-bottom: 20px;">
                      <tr>
                        <td style="vertical-align: top; width: 60%;">
                          <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 4px 0; color: #111827;">${businessName || 'Your Business Name'}</h2>
                          <p style="margin: 0 0 2px 0; font-size: 11px;">${businessAddress || 'Your Business Address'}</p>
                          ${businessTaxId ? `<p style="margin:0; font-size: 11px;">Tax ID: ${businessTaxId}</p>` : ''}
                        </td>
                        <td style="text-align: right; vertical-align: top; width: 40%;">
                          <h3 style="font-size: 20px; font-weight: bold; margin: 0 0 4px 0; color: #1f2937;">RECEIPT</h3>
                          <p style="margin: 0 0 2px 0; font-size: 11px;">#${receiptNumber || 'RCPT-XXXX'}</p>
                          <p style="margin: 0; font-size: 11px;">Date: ${formattedDate}</p>
                        </td>
                      </tr>
                    </table>
                    <div style="margin-bottom: 20px;">
                      <h4 style="font-size: 10px; color: #6b7280; text-transform: uppercase; margin: 0 0 5px 0; border-bottom: 1px solid #eee; padding-bottom: 2px;">Bill To</h4>
                      <p style="font-weight: bold; margin: 0 0 2px 0; color: #1f2937;">${clientName || 'Client Name'}</p>
                      <p style="margin: 0; font-size: 11px;">${clientAddress || 'Client Address'}</p>
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
                      <thead style="border-bottom: 2px solid #333;">
                        <tr style="color: #333;">
                          <th style="text-align: left; font-weight: bold; padding: 8px 16px 8px 0;">Description</th>
                          <th style="text-align: right; font-weight: bold; padding: 8px 0 8px 16px;">Amount</th>
                        </tr>
                      </thead>
                      <tbody>${servicesHtml}</tbody>
                      <tfoot style="border-top: 2px solid #e5e7eb; font-medium;">${tfootHtml}</tfoot>
                    </table>
                  </div>`;
    setPreviewHtml(html);
    setCanDownload(true);
    toast({ title: "Preview Updated", description: "Receipt preview has been generated. You can now save or download."});
  };

  const handleDownloadPdf = async () => {
    if (!canDownload || typeof window === 'undefined') return;
    if (!businessName || !clientName || serviceItems.length === 0 || !serviceItems.every(s => s.description.trim() && s.amount >= 0) || !paymentDate || !receiptNumber) {
        toast({ title: "Incomplete Form", description: "Please fill all required fields and add at least one valid service item.", variant: "destructive"});
        return;
    }

    const doc = new jsPDF();
    const { subtotal, taxAmount, totalAmount, taxLabel } = calculateTotals();
    const formattedPaymentDate = paymentDate ? format(new Date(paymentDate + 'T00:00:00'), "MMMM d, yyyy") : 'N/A';
    const pageMargin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = pageMargin;

    if (logoUrl) {
      try {
        const imgTypeMatch = logoUrl.match(/^data:image\/(png|jpeg|jpg);base64,/);
        if (imgTypeMatch && imgTypeMatch[1]) {
            const imgType = imgTypeMatch[1].toUpperCase() as 'PNG' | 'JPEG' | 'JPG';
            
            const image = new Image();
            
            // Wrap image loading in a promise to handle success/failure
            await new Promise<void>((resolve, reject) => {
              image.onload = () => resolve();
              image.onerror = (err) => {
                console.error("Image load error for PDF:", err);
                toast({ title: "Logo Error", description: "Could not load logo image for PDF.", variant: "destructive" });
                reject(new Error("Image load error"));
              };
              image.src = logoUrl; 
            });

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
            doc.addImage(logoUrl, imgType, pageMargin, currentY, imgWidth, imgHeight); 
            currentY += imgHeight + 5;
        } else {
            console.warn("Unsupported image type for PDF logo or invalid data URI.");
            toast({ title: "Logo Warning", description: "Logo image format might not be suitable for PDF.", variant: "default" });
        }
      } catch (e) {
        console.error("Error processing logo for PDF", e);
        // Toast is already shown in the promise reject
      }
    }
    
    doc.setFontSize(18);
    doc.text(businessName || "Your Business Name", pageMargin, currentY);
    currentY += 7;
    doc.setFontSize(10);
    doc.text(businessAddress || "Your Business Address", pageMargin, currentY);
    currentY += 5;
    if (businessTaxId) {
      doc.text(`Tax ID: ${businessTaxId}`, pageMargin, currentY);
      currentY += 5;
    }

    const receiptInfoX = pageWidth - pageMargin;
    let receiptBlockY = pageMargin; 
    if (logoUrl) receiptBlockY = pageMargin; 
    else receiptBlockY = Math.max(pageMargin, currentY - (businessTaxId ? 17 : 12) );


    doc.setFontSize(14).setFont(undefined, 'bold');
    doc.text("RECEIPT", receiptInfoX, receiptBlockY + 5, { align: 'right' });
    doc.setFontSize(10).setFont(undefined, 'normal');
    doc.text(`#${receiptNumber || 'RCPT-XXXX'}`, receiptInfoX, receiptBlockY + 12, { align: 'right' });
    doc.text(`Date: ${formattedPaymentDate}`, receiptInfoX, receiptBlockY + 17, { align: 'right' });
    
    currentY = Math.max(currentY, receiptBlockY + 25); 

    currentY += 10;
    doc.setFontSize(8).setTextColor(100);
    doc.text("BILL TO", pageMargin, currentY);
    currentY += 4;
    doc.setFontSize(10).setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text(clientName || "Client Name", pageMargin, currentY);
    currentY += 5;
    doc.setFont(undefined, 'normal');
    doc.text(clientAddress || "Client Address", pageMargin, currentY);
    currentY += 10;

    const tableColumn = ["Description", "Amount"];
    const tableRows = serviceItems.map(item => [
      item.description,
      `$${Number(item.amount).toFixed(2)}`
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
    const docWithAutoTable = doc as jsPDF & { lastAutoTable?: { finalY?: number } };
    if (docWithAutoTable.lastAutoTable && typeof docWithAutoTable.lastAutoTable.finalY === 'number') {
      tableEndY = docWithAutoTable.lastAutoTable.finalY;
    }
    currentY = tableEndY + 10;

    const totalsX = pageWidth - pageMargin - 70; 
    doc.setFontSize(10);
    doc.text("Subtotal:", totalsX, currentY, { align: 'left' });
    doc.text(`$${subtotal.toFixed(2)}`, pageWidth - pageMargin, currentY, { align: 'right' });
    currentY += 7;

    if (taxOption !== 'none' && taxAmount > 0) {
      doc.text(`${taxLabel}:`, totalsX, currentY, { align: 'left' });
      doc.text(`$${taxAmount.toFixed(2)}`, pageWidth - pageMargin, currentY, { align: 'right' });
      currentY += 7;
    }

    doc.setFont(undefined, 'bold');
    doc.text("Total Paid:", totalsX, currentY, { align: 'left'});
    doc.text(`$${totalAmount.toFixed(2)}`, pageWidth - pageMargin, currentY, { align: 'right' });

    doc.save(`Receipt-${receiptNumber || 'xxxx'}.pdf`);
    toast({ title: "PDF Downloaded", description: "Invoice PDF has been generated."});
  };

  const handleSaveInvoice = async () => {
    if (!user) {
      toast({ title: "Not Logged In", description: "Please log in to save invoices.", variant: "destructive" });
      return;
    }
    if (!businessName || !clientName || serviceItems.length === 0 || !serviceItems.every(s => s.description.trim() && s.amount >= 0) || !paymentDate || !receiptNumber) {
        toast({ title: "Incomplete Form", description: "Please fill all required fields and add at least one valid service item.", variant: "destructive"});
        return;
    }
    setIsSavingInvoice(true);
    const { subtotal, taxAmount, totalAmount, taxInfoForDoc } = calculateTotals();
    const invoiceId = crypto.randomUUID();
    
    const localPaymentDate = new Date(paymentDate ? paymentDate + 'T00:00:00' : Date.now()); 
    
    const invoiceBaseData = {
      id: invoiceId,
      userId: user.id,
      businessName,
      businessAddress,
      clientName,
      clientAddress,
      receiptNumber,
      paymentDate: Timestamp.fromDate(localPaymentDate), 
      services: serviceItems.map(s => ({ description: s.description, amount: Number(s.amount) })),
      subtotal,
      taxInfo: taxInfoForDoc,
      totalAmount,
      createdAt: Timestamp.now(),
      logoUrl: (logoUrl && logoUrl.trim()) ? logoUrl : null, 
    };

    const invoiceToSave: InvoiceDocument = {
        ...invoiceBaseData,
        ...(businessTaxId && businessTaxId.trim() && { taxId: businessTaxId.trim() }),
    };


    try {
      await setDoc(doc(db, "invoices", invoiceId), invoiceToSave);
      toast({ title: "Invoice Saved", description: "Your invoice has been successfully saved to your account." });
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast({ title: "Save Failed", description: "Could not save the invoice. Please try again.", variant: "destructive" });
    } finally {
      setIsSavingInvoice(false);
    }
  };

  const handleSaveBusinessInfo = async () => {
    if (!user || !updateUserBusinessDetails) {
      toast({ title: "Error", description: "Could not save business info. User not available.", variant: "destructive" });
      return;
    }
    setIsSavingBusinessInfo(true);
    try {
      await updateUserBusinessDetails({
        businessName,
        businessAddress,
        businessTaxId,
        logoUrl,
      });
    } catch (error) {
      console.error("Failed to save business info from client:", error);
    } finally {
      setIsSavingBusinessInfo(false);
    }
  };
  
  if (!isClient || authLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary"/> <p className="ml-2">Loading Invoice Generator...</p></div>;
  }
   if (!user && !authLoading) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-background">
        <h2 className="text-2xl font-semibold text-primary mb-4">Invoice & Receipt Generator</h2>
        <p className="text-muted-foreground">Please log in or sign up to create and save invoices.</p>
      </div>
    );
  }


  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <Card className="lg:col-span-2 shadow-xl">
        <CardContent className="p-6">
          <form onSubmit={(e) => { e.preventDefault(); generatePreview(); }} className="space-y-6">
            <div>
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h3 className="text-xl font-semibold text-foreground">1. Your Information</h3>
                <Button 
                  type="button" 
                  onClick={handleSaveBusinessInfo} 
                  variant="outline" 
                  size="sm"
                  disabled={isSavingBusinessInfo}
                  title="Save your business details for next time"
                >
                  {isSavingBusinessInfo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isSavingBusinessInfo ? "Saving..." : "Save My Info"}
                </Button>
              </div>
              <div className="space-y-4">
                <div><Label htmlFor="business-name">Business Name</Label><Input id="business-name" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Your Business Name" required /></div>
                <div><Label htmlFor="business-address">Business Address</Label><Input id="business-address" value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} placeholder="Your Business Address" required /></div>
                <div><Label htmlFor="business-tax-id">Tax ID (Optional)</Label><Input id="business-tax-id" value={businessTaxId} onChange={e => setBusinessTaxId(e.target.value)} placeholder="e.g., HST Number" /></div>
                <div><Label htmlFor="logo-upload">Logo (Optional, max 1MB, PNG/JPEG)</Label><Input id="logo-upload" type="file" accept="image/png, image/jpeg" onChange={handleLogoUpload} className="file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/></div>
                {logoUrl && <div className="mt-2"><Label>Current Logo:</Label><img src={logoUrl} alt="Current business logo" className="mt-1 border rounded-md max-h-20 object-contain"/></div>}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">2. Client Information</h3>
              <div className="space-y-4">
                <div><Label htmlFor="client-name">Client Name</Label><Input id="client-name" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client Name" required /></div>
                <div><Label htmlFor="client-address">Client Address</Label><Input id="client-address" value={clientAddress} onChange={e => setClientAddress(e.target.value)} placeholder="Client Address" required /></div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">3. Services & Payment</h3>
              <div id="service-items-container" className="space-y-3">
                {serviceItems.map((item, index) => (
                  <div key={item.id} className="service-item flex gap-2 items-end">
                    <div className="flex-grow"><Label htmlFor={`service-desc-${index}`}>Description</Label><Input id={`service-desc-${index}`} className="service-desc" value={item.description} onChange={e => handleServiceChange(item.id, 'description', e.target.value)} placeholder="Service Description" required /></div>
                    <div className="w-32"><Label htmlFor={`service-amount-${index}`}>Amount</Label><Input id={`service-amount-${index}`} type="number" className="service-amount" value={item.amount} onChange={e => handleServiceChange(item.id, 'amount', parseFloat(e.target.value) || 0)} placeholder="0.00" required min="0" step="0.01" /></div>
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeServiceItem(item.id)} aria-label="Remove service item"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={addServiceItem} className="w-full mt-3"><PlusCircle className="mr-2 h-4 w-4" /> Add Service</Button>
              
              <div className="border-t pt-4 mt-4 space-y-4">
                <div>
                    <Label htmlFor="tax-option">Tax Option</Label>
                    <Select value={taxOption} onValueChange={setTaxOption}>
                        <SelectTrigger id="tax-option"><SelectValue placeholder="Select tax option" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No Tax</SelectItem>
                            <SelectItem value="ca">Canadian Tax</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {taxOption === 'ca' && (
                  <div>
                    <Label htmlFor="province-tax">Province/Territory</Label>
                    <Select value={provinceTax} onValueChange={setProvinceTax}>
                        <SelectTrigger id="province-tax"><SelectValue placeholder="Select province" /></SelectTrigger>
                        <SelectContent>
                            {provinces.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                )}
                <div><Label htmlFor="payment-date">Payment Date</Label><Input id="payment-date" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} required /></div>
                <div><Label htmlFor="receipt-number">Receipt Number</Label><Input id="receipt-number" value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} placeholder="e.g., RCPT-001" required /></div>
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base">Generate & Preview</Button>
          </form>
        </CardContent>
      </Card>

      <div className="lg:col-span-3">
        <Card className="sticky top-8 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Receipt Preview</CardTitle>
          </CardHeader>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 p-4 border-b">
            <Button 
              onClick={handleSaveInvoice} 
              disabled={!canDownload || isSavingInvoice || !user} 
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white py-3 text-base"
            >
              {isSavingInvoice ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSavingInvoice ? "Saving..." : "Save Invoice"}
            </Button>
            <Button 
              onClick={handleDownloadPdf} 
              disabled={!canDownload} 
              className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base"
            >
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </div>
          <CardContent id="receipt-preview-container" className="min-h-[500px] p-1 bg-muted/30 rounded-b-md overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: previewHtml }}/>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
