
"use client";

import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Landmark, Leaf, Fuel, Utensils, ShoppingCart, Building2, Plane, Megaphone, Briefcase, Cog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { TransactionFormValues } from "@/lib/types";
import { transactionSchema } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export const incomeCategories = [
  { value: "Service", label: "Service", icon: <Landmark className="mr-2 h-4 w-4" /> },
  { value: "Product Sale", label: "Product Sale", icon: <ShoppingCart className="mr-2 h-4 w-4" /> },
  { value: "Other", label: "Other", icon: <Cog className="mr-2 h-4 w-4" /> },
];

export const expenseCategories = [
  { value: "Supplies", label: "Supplies", icon: <Leaf className="mr-2 h-4 w-4" /> },
  { value: "Rent/Mortgage", label: "Rent/Mortgage", icon: <Building2 className="mr-2 h-4 w-4" /> },
  { value: "Utilities", label: "Utilities", icon: <Fuel className="mr-2 h-4 w-4" /> },
  { value: "Software", label: "Software", icon: <Cog className="mr-2 h-4 w-4" /> },
  { value: "Travel", label: "Travel", icon: <Plane className="mr-2 h-4 w-4" /> },
  { value: "Marketing", label: "Marketing", icon: <Megaphone className="mr-2 h-4 w-4" /> },
  { value: "Food", label: "Food", icon: <Utensils className="mr-2 h-4 w-4" /> },
  { value: "Other", label: "Other", icon: <Briefcase className="mr-2 h-4 w-4" /> },
];

interface TransactionFormProps {
  type: "income" | "expense";
  onSubmit: (values: TransactionFormValues) => void;
  defaultDate?: Date;
}

export function TransactionBaseForm({ type, onSubmit, defaultDate: propDefaultDate }: TransactionFormProps) {
  const { toast } = useToast();
  
  const [clientDefaultDate, setClientDefaultDate] = React.useState<Date | undefined>(propDefaultDate);

  useEffect(() => {
    setClientDefaultDate(new Date());
  }, []);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      amount: '' as unknown as number, // Initialize with empty string for controlled input
      category: "",
      date: undefined, 
    },
  });
  
  useEffect(() => {
    if (clientDefaultDate) {
      form.reset({
        description: "",
        amount: '' as unknown as number, // Reset with empty string
        category: "",
        date: clientDefaultDate,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientDefaultDate, form.reset ]); // form was missing from dependency array, added form.reset


  const categories = type === "income" ? incomeCategories : expenseCategories;

  const handleSubmit = (values: TransactionFormValues) => {
    onSubmit(values);
    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Added`,
      description: `${values.description} - $${Number(values.amount).toFixed(2)}`,
      variant: "default",
    });
    if (clientDefaultDate) {
       form.reset({
        description: "",
        amount: '' as unknown as number, // Reset with empty string
        category: "",
        date: clientDefaultDate,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder={type === 'income' ? "e.g., June Childcare - Jane Doe" : "e.g., Art Supplies"} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder={type === 'income' ? "850.00" : "75.50"} 
                  step="0.01" 
                  {...field} 
                  value={field.value === undefined || field.value === null || Number.isNaN(field.value) ? '' : String(field.value)}
                  onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}> {/* Ensure value is not undefined */}
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center">
                        {cat.icon}
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className={cn(
            "w-full",
            type === 'income' ? 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-400' : 'bg-red-500 hover:bg-red-600 focus:ring-red-400',
            'text-white'
          )}
          disabled={form.formState.isSubmitting || !clientDefaultDate}
        >
          {form.formState.isSubmitting ? "Adding..." : `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`}
        </Button>
      </form>
    </Form>
  );
}

