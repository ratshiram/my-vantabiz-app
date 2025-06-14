
import { z } from 'zod';

// FinTrack Lite Types
export interface Transaction {
  id: string; // Will be used as Firestore document ID
  userId: string; // ID of the user who owns this transaction
  type: 'income' | 'expense';
  description: string;
  date: Date; // Stored as Firestore Timestamp, converted to/from Date in client
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
  id: string; // client-side ID for managing items in the form
  description: string;
  amount: number;
}

export interface TaxInfo {
  option: 'none' | 'ca';
  location?: string;
  rate?: number;
  amount?: number;
}

// This is the data structure used by the InvoiceGeneratorClient component internally
export interface InvoiceFormClientData {
  businessName: string;
  businessAddress: string;
  taxId?: string;
  logoUrl?: string | null;
  clientName: string;
  clientAddress: string;
  receiptNumber: string;
  paymentDate: string; // ISO Date string from date input
  services: ServiceItem[];
  // Subtotal, taxAmount, totalAmount are calculated dynamically in the component
}

// This is the data structure that will be saved to Firestore
export interface InvoiceDocument {
  id: string; // Firestore document ID
  userId: string;
  businessName: string;
  businessAddress: string;
  taxId?: string;
  logoUrl?: string | null; // Storing as data URI for now
  clientName: string;
  clientAddress: string;
  receiptNumber: string;
  paymentDate: Date; // Stored as Firestore Timestamp
  services: Array<{ description: string; amount: number }>; // Simplified ServiceItem for storage
  subtotal: number;
  taxInfo: TaxInfo;
  totalAmount: number;
  createdAt: Date; // Firestore Timestamp
}


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
  provinceTax: z.string().optional(),
  paymentDate: z.string().min(1, "Payment date is required."), // This is kept as string because the input type="date" provides it as string
  receiptNumber: z.string().min(1, "Receipt number is required."),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;


// Auth and User Types
export type UserTier = 'free' | 'pro';

export interface User {
  id: string;
  email: string;
  name?: string;
  tier: UserTier;
  trialEndDate?: Date | null;
}

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});
export type SignupFormValues = z.infer<typeof signupSchema>;
