
import { z } from 'zod';
import type { Timestamp } from 'firebase/firestore'; // Keep this import

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
}

export interface InvoiceDocument {
  id: string; // Firestore document ID
  userId: string;
  businessName: string;
  businessAddress: string;
  taxId?: string;
  logoUrl?: string | null;
  clientName: string;
  clientAddress: string;
  receiptNumber: string;
  paymentDate: Date;
  services: Array<{ description: string; amount: number }>;
  subtotal: number;
  taxInfo: TaxInfo;
  totalAmount: number;
  createdAt: Date;
}

export interface InvoiceWriteData {
  id: string;
  userId: string;
  businessName: string;
  businessAddress: string;
  taxId?: string;
  logoUrl?: string | null;
  clientName: string;
  clientAddress: string;
  receiptNumber: string;
  paymentDate: Timestamp;
  services: Array<{ description: string; amount: number }>;
  subtotal: number;
  taxInfo: TaxInfo;
  totalAmount: number;
  createdAt: Timestamp;
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
  paymentDate: z.string().min(1, "Payment date is required."),
  receiptNumber: z.string().min(1, "Receipt number is required."),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;


// Auth and User Types
export type UserTier = 'free' | 'pro';

export interface UserBusinessDetails {
  businessName?: string;
  businessAddress?: string;
  businessTaxId?: string;
  logoUrl?: string | null;
}

export interface User extends UserBusinessDetails {
  id: string;
  email: string;
  name?: string;
  username?: string;
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
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).max(30, { message: "Username must be 30 characters or less." }).regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});
export type SignupFormValues = z.infer<typeof signupSchema>;

export interface AuthProviderProps {
  children: React.ReactNode;
}

// Scheduler Types
export const dayOfWeekEnum = z.enum(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
export type DayOfWeek = z.infer<typeof dayOfWeekEnum>;

export const availabilityRuleSchema = z.object({
  id: z.string().uuid().optional(),
  dayOfWeek: dayOfWeekEnum,
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be HH:MM format (e.g., 09:00)."),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be HH:MM format (e.g., 17:00)."),
}).refine(data => {
  if (data.startTime && data.endTime) {
    return data.startTime < data.endTime;
  }
  return true;
}, {
  message: "Start time must be before end time.",
  path: ["endTime"],
});
export type AvailabilityRule = z.infer<typeof availabilityRuleSchema>;

export const baseSchedulerEventSchema = z.object({
  name: z.string().min(3, "Name requires at least 3 characters.").max(100, "Name cannot exceed 100 characters."),
  slug: z.string()
    .min(3, "Link URL requires at least 3 characters.")
    .max(50, "Link URL cannot exceed 50 characters.")
    .regex(/^[a-z0-9-]+$/, "Link URL can only use lowercase letters, numbers, and hyphens."),
  duration: z.coerce.number().int().positive("Duration must be a positive number of minutes (e.g., 30)."),
  description: z.string().max(500, "Description cannot exceed 500 characters.").optional(),
  availabilityRules: z.array(availabilityRuleSchema).min(1, "At least one availability rule is required."),
  // color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code (e.g., #RRGGBB).").optional(),
});

// Schema for form validation (client-side)
export const schedulerEventFormSchema = baseSchedulerEventSchema;
export type SchedulerEventFormValues = z.infer<typeof schedulerEventFormSchema>;

// Schema for data stored in Firestore (includes server-generated fields)
export interface SchedulerEventDocument extends z.infer<typeof baseSchedulerEventSchema> {
  id: string; // Firestore document ID
  userId: string;
  createdAt: Date; // Converted from Firestore Timestamp
  updatedAt: Date; // Converted from Firestore Timestamp
}

// Schema for writing data to Firestore (uses Firestore Timestamps)
export interface SchedulerEventWriteData extends z.infer<typeof baseSchedulerEventSchema> {
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const bookingSchema = z.object({
  schedulerEventId: z.string(),
  providerUserId: z.string(),
  clientName: z.string().min(1, "Name is required."),
  clientEmail: z.string().email("Valid email is required."),
  startTime: z.date(), // Will be Timestamp in Firestore
  endTime: z.date(),   // Will be Timestamp in Firestore
  notes: z.string().optional(),
  status: z.enum(['confirmed', 'cancelled_by_client', 'cancelled_by_provider']).default('confirmed'),
  // createdAt: z.date(), // Will be Timestamp in Firestore
});
export type Booking = z.infer<typeof bookingSchema>;

export interface BookingDocument extends Omit<Booking, 'startTime' | 'endTime'> {
  id: string; // Firestore document ID
  startTime: Date; // Converted from Timestamp
  endTime: Date;   // Converted from Timestamp
  createdAt: Date; // Converted from Timestamp
}

export interface BookingWriteData extends Omit<Booking, 'startTime' | 'endTime'> {
  startTime: Timestamp;
  endTime: Timestamp;
  createdAt: Timestamp;
}


export type BookingFormValues = Pick<Booking, 'clientName' | 'clientEmail' | 'notes'> & {
  startTime: Date; // For form handling (client selects a specific slot which is a Date)
};
