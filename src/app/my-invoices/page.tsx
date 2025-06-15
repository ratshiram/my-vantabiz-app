
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import type { InvoiceDocument } from '@/lib/types';
import { InvoicesListTable } from '@/components/invoice/invoices-list-table';
import { Loader2, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MyInvoicesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceDocument[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchInvoices = useCallback(async () => {
    if (!user) {
      setInvoices([]);
      setIsLoadingInvoices(false);
      return;
    }
    setIsLoadingInvoices(true);
    try {
      const q = query(
        collection(db, "invoices"),
        where("userId", "==", user.id),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const fetchedInvoices: InvoiceDocument[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedInvoices.push({
          id: doc.id,
          userId: data.userId,
          businessName: data.businessName,
          businessAddress: data.businessAddress,
          taxId: data.taxId,
          logoUrl: data.logoUrl,
          clientName: data.clientName,
          clientAddress: data.clientAddress,
          receiptNumber: data.receiptNumber,
          paymentDate: (data.paymentDate as Timestamp).toDate(),
          services: data.services,
          subtotal: data.subtotal,
          taxInfo: data.taxInfo,
          totalAmount: data.totalAmount,
          createdAt: (data.createdAt as Timestamp).toDate(),
        } as InvoiceDocument);
      });
      setInvoices(fetchedInvoices);
    } catch (error) {
      console.error("Error fetching invoices: ", error);
      // Consider adding a toast message for error
    } finally {
      setIsLoadingInvoices(false);
    }
  }, [user]);

  useEffect(() => {
    if (isClient && user && !authLoading) {
      fetchInvoices();
    } else if (isClient && !authLoading && !user) {
      setInvoices([]);
      setIsLoadingInvoices(false);
    }
  }, [user, authLoading, fetchInvoices, isClient]);

  if (!isClient || authLoading || (isLoadingInvoices && user)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-background">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
        <p className="text-xl font-semibold text-primary mt-4">Loading Your Invoices...</p>
      </div>
    );
  }

  if (!user && !authLoading) {
    return (
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
        <Card className="w-full max-w-2xl mx-auto text-center shadow-xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Access Your Invoices</CardTitle>
                <CardDescription>Please log in or sign up to view and manage your saved invoices.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Info className="h-12 w-12 mx-auto text-primary mb-4" />
                 <Button asChild><Link href="/login">Log In</Link></Button>
            </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-8 text-center">My Saved Invoices</h1>
      {invoices.length === 0 && !isLoadingInvoices ? (
        <Card className="w-full max-w-2xl mx-auto text-center shadow-xl">
            <CardHeader>
                <CardTitle className="text-xl font-semibold">No Invoices Yet</CardTitle>
            </CardHeader>
            <CardContent>
                <Info className="h-12 w-12 mx-auto text-primary mb-4" />
                <p className="text-muted-foreground mb-4">You haven&apos;t saved any invoices. Create one now!</p>
                <Button asChild variant="default">
                    <Link href="/invoice-generator">Go to Invoice Generator</Link>
                </Button>
            </CardContent>
        </Card>
      ) : (
        <InvoicesListTable invoices={invoices} />
      )}
    </main>
  );
}
