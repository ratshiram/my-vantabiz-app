"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Download } from 'lucide-react';
import type { InvoiceData, ServiceItem } from '@/lib/types'; // Will define these types
import { useToast } from "@/hooks/use-toast";

// Canadian Tax Rates - can be moved to a constants file
const canadianTaxRates: Record<string, number> = { AB: 0.05,BC: 0.12,MB: 0.12,NB: 0.15,NL: 0.15,NT: 0.05,NS: 0.15,NU: 0.05,ON: 0.13,PE: 0.15,QC: 0.14975,SK: 0.11,YT: 0.05 };
const provinces = Object.keys(canadianTaxRates).map(p => ({ value: p, label: `${p} (${(canadianTaxRates[p]*100).toFixed(canadianTaxRates[p] === 0.14975 ? 3:0)}%)`}));

export function InvoiceGeneratorClient() {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessTaxId, setBusinessTaxId] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([{ id: crypto.randomUUID(), description: '', amount: 0 }]);
  const [taxOption, setTaxOption] = useState('none');
  const [provinceTax, setProvinceTax] = useState('NL');
  const [paymentDate, setPaymentDate] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');

  const [previewHtml, setPreviewHtml] = useState<string>('<div class="text-center h-full flex items-center justify-center text-muted-foreground"><p>Receipt preview appears here</p></div>');
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const [canDownload, setCanDownload] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setReceiptNumber(`RCPT-${Date.now()}`);
    if (serviceItems.length === 0) {
      addServiceItem();
    }
  }, []);

  const addServiceItem = () => {
    setServiceItems([...serviceItems, { id: crypto.randomUUID(), description: '', amount: 0 }]);
  };

  const removeServiceItem = (id: string) => {
    setServiceItems(serviceItems.filter(item => item.id !== id));
  };

  const handleServiceChange = (id: string, field: keyof ServiceItem, value: string | number) => {
    setServiceItems(serviceItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setLogoUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generatePreview = () => {
    const subtotal = serviceItems.reduce((sum, item) => sum + Number(item.amount), 0);
    let taxRate = 0;
    let taxAmount = 0;
    let taxInfoDisplay = 'No Tax';

    if (taxOption === 'ca') {
      taxRate = canadianTaxRates[provinceTax];
      taxAmount = subtotal * taxRate;
      taxInfoDisplay = `Tax (${provinceTax} @ ${(taxRate * 100).toFixed(canadianTaxRates[provinceTax] === 0.14975 ? 3:0)}%)`;
    }
    const totalAmount = subtotal + taxAmount;

    const formattedDate = paymentDate ? new Date(paymentDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

    const servicesHtml = serviceItems.map(s => `<tr><td style="padding: 8px 16px 8px 0; border-bottom: 1px solid #eee;">${s.description || 'N/A'}</td><td style="text-align: right; padding: 8px 0 8px 16px; border-bottom: 1px solid #eee;">$${Number(s.amount).toFixed(2)}</td></tr>`).join('');
    
    let tfootHtml = `<tr><td style="padding: 8px 16px 2px 0; color: #6b7280; text-align: right;">Subtotal</td><td style="text-align: right; padding: 8px 0 2px 16px;">$${subtotal.toFixed(2)}</td></tr>`;
    if (taxOption !== 'none') {
        tfootHtml += `<tr><td style="padding: 2px 16px 8px 0; color: #6b7280; text-align: right;">${taxInfoDisplay}</td><td style="text-align: right; padding: 2px 0 8px 16px;">$${taxAmount.toFixed(2)}</td></tr>`;
    }
    tfootHtml += `<tr style="font-weight: bold; color: #111827;"><td style="padding-top: 8px; padding-right: 16px; text-align: right;">Total Paid</td><td style="text-align: right; padding-top: 8px; padding-left: 16px;">$${totalAmount.toFixed(2)}</td></tr>`;

    const logoDisplayHtml = logoUrl ? `<img src="${logoUrl}" alt="Business Logo" style="margin-bottom: 2rem; max-height: 5rem; max-width: 10rem; object-fit: contain;">` : '';

    const html = `
      <div style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; padding: 20px; color: #374151;">
        ${logoDisplayHtml}
        <table style="width: 100%; margin-bottom: 30px;"><tr><td style="vertical-align: top;"><h2 style="font-size: 24px; font-weight: bold; margin: 0; color: #111827;">${businessName || 'Your Business Name'}</h2><p style="margin: 0;">${businessAddress || 'Your Business Address'}</p>${businessTaxId ? `<p style="margin:0;">Tax ID: ${businessTaxId}</p>` : ''}</td><td style="text-align: right; vertical-align: top;"><h3 style="font-size: 20px; font-weight: bold; margin: 0; color: #1f2937;">RECEIPT</h3><p style="margin: 0;">#${receiptNumber || 'RCPT-XXXX'}</p><p style="margin: 0;">Date: ${formattedDate}</p></td></tr></table>
        <div style="margin-bottom: 30px;"><h4 style="font-size: 10px; color: #6b7280; text-transform: uppercase; margin: 0 0 5px 0;">Bill To</h4><p style="font-weight: bold; margin: 0; color: #1f2937;">${clientName || 'Client Name'}</p><p style="margin: 0;">${clientAddress || 'Client Address'}</p></div>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
          <thead style="border-bottom: 2px solid #333;"><tr style="color: #333;"><th style="text-align: left; font-weight: bold; padding-bottom: 8px;">Description</th><th style="text-align: right; font-weight: bold; padding-bottom: 8px;">Amount</th></tr></thead>
          <tbody>${servicesHtml}</tbody>
          <tfoot style="border-top: 2px solid #e5e7eb; font-medium;">${tfootHtml}</tfoot>
        </table>
      </div>
    `;
    setPreviewHtml(html);
    if (pdfContentRef.current) {
        pdfContentRef.current.innerHTML = html;
    }
    setCanDownload(true);
    toast({ title: "Preview Updated", description: "Receipt preview has been generated."});
  };

  const handleDownloadPdf = async () => {
    if (!canDownload || !pdfContentRef.current || typeof window === 'undefined') return;
    const html2pdf = (await import('html2pdf.js')).default;
    
    const elementToPrint = pdfContentRef.current.cloneNode(true) as HTMLElement;
    elementToPrint.style.width = '8.5in'; // Standard letter width

    html2pdf().from(elementToPrint).set({
        margin: 0.5, // 0.5 inch margin
        filename: `Receipt-${receiptNumber || 'xxxx'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).save();
  };
  
  if (!isClient) {
    return <div className="flex justify-center items-center h-64"><p>Loading Invoice Generator...</p></div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Form Section */}
      <Card className="lg:col-span-2 shadow-xl">
        <CardContent className="p-6">
          <form onSubmit={(e) => { e.preventDefault(); generatePreview(); }} className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">1. Your Information</h3>
              <div className="space-y-4">
                <div><Label htmlFor="business-name">Business Name</Label><Input id="business-name" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Your Business Name" required /></div>
                <div><Label htmlFor="business-address">Business Address</Label><Input id="business-address" value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} placeholder="Your Business Address" required /></div>
                <div><Label htmlFor="business-tax-id">Tax ID (Optional)</Label><Input id="business-tax-id" value={businessTaxId} onChange={e => setBusinessTaxId(e.target.value)} placeholder="e.g., HST Number" /></div>
                <div><Label htmlFor="logo-upload">Logo (Optional)</Label><Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/></div>
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
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Generate & Preview</Button>
          </form>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <div className="lg:col-span-3">
        <Card className="sticky top-8 shadow-xl">
            <CardHeader>
                <CardTitle className="text-xl">Receipt Preview</CardTitle>
            </CardHeader>
          <CardContent id="receipt-preview-container" className="min-h-[500px] p-1 bg-white rounded-md">
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} className="prose prose-sm max-w-none"/>
          </CardContent>
        </Card>
        <div className="text-center mt-4">
          <Button onClick={handleDownloadPdf} disabled={!canDownload} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>
      {/* Hidden div for PDF generation. Ensure it's not displayed but available in DOM for html2pdf */}
      <div ref={pdfContentRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px', fontFamily: 'Inter, Arial, sans-serif', fontSize: '12px', color: '#374151', background: 'white' }}></div>
    </div>
  );
}
