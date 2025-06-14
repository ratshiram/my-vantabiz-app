import { z } from 'zod';

// FinTrack Lite Types
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  date: Date;
  amount: number;
  category: string;
}

export const transactionSchema = z.object({
  description: z.string().min(1, { message: "Description is required." }).max(100, { message: "Description must be 100 characters or less." }),
  date: z.date({ required_error: "Please select a date." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  category: z.string().min(1, { message: "Please select a category." }),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

// Invoice Generator Types
export interface ServiceItem {
  id: string;
  description: string;
  amount: number;
}

export interface TaxInfo {
  option: 'none' | 'ca';
  location?: string; // e.g., 'ON', 'BC' for Canadian tax
  rate?: number;     // e.g., 0.13 for 13%
  amount?: number;
}

export interface InvoiceData {
  businessName: string;
  businessAddress: string;
  taxId?: string;
  logoUrl?: string | null;
  clientName: string;
  clientAddress: string;
  receiptNumber: string;
  paymentDate: string; // ISO Date string
  services: ServiceItem[];
  subtotal: number;
  taxInfo: TaxInfo;
  totalAmount: number;
}

// You might want a Zod schema for invoice form validation too
export const serviceItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required.").max(200, "Max 200 chars."),
  amount: z.coerce.number().min(0, "Amount must be non-negative."),
});

export const invoiceFormSchema = z.object({
  businessName: z.string().min(1, "Business name is required."),
  businessAddress: z.string().min(1, "Business address is required."),
  businessTaxId: z.string().optional(),
  clientName: z.string().min(1, "Client name is required."),
  clientAddress: z.string().min(1, "Client address is required."),
  serviceItems: z.array(serviceItemSchema).min(1, "At least one service item is required."),
  taxOption: z.enum(["none", "ca"]),
  provinceTax: z.string().optional(), // Make sure to validate this based on taxOption
  paymentDate: z.string().min(1, "Payment date is required."), // Or z.date() if parsing before validation
  receiptNumber: z.string().min(1, "Receipt number is required."),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
