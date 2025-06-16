
"use client";

import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { SchedulerEventFormValues, AvailabilityRule, DayOfWeek } from '@/lib/types';
import { schedulerEventFormSchema } from '@/lib/types';
import { PlusCircle, Trash2, Save, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const daysOfWeek: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface EventTypeFormProps {
  onSubmit: (values: SchedulerEventFormValues) => Promise<void>;
  existingEvent?: SchedulerEventFormValues | null;
  onCancel: () => void;
}

export function EventTypeForm({ onSubmit, existingEvent, onCancel }: EventTypeFormProps) {
  const form = useForm<SchedulerEventFormValues>({
    resolver: zodResolver(schedulerEventFormSchema),
    defaultValues: existingEvent || {
      name: '',
      slug: '',
      duration: 30,
      description: '',
      availabilityRules: [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' }],
      // color: '#3b82f6', // Default blue
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'availabilityRules',
  });

  useEffect(()_ => {
    if (existingEvent) {
      form.reset(existingEvent);
    } else {
      form.reset({
        name: '',
        slug: '',
        duration: 30,
        description: '',
        availabilityRules: [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' }],
      });
    }
  }, [existingEvent, form]);

  const handleFormSubmit = async (values: SchedulerEventFormValues) => {
    // Transform slug to lowercase
    const transformedValues = {
      ...values,
      slug: values.slug.toLowerCase(),
    };
    await onSubmit(transformedValues);
    if (!existingEvent) { // Only reset if it's a new event form
        form.reset(); // Reset form after successful submission
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl><Input placeholder="e.g., 30 Minute Consultation" {...field} /></FormControl>
              <FormDescription>A short, descriptive name for your event type.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Public Link URL</FormLabel>
              <FormControl><Input placeholder="e.g., 30-min-consult" {...field} /></FormControl>
              <FormDescription>Used in the public booking link. Use lowercase letters, numbers, and hyphens only.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl><Input type="number" placeholder="e.g., 30" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
              <FormDescription>How long this event will last, in minutes.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl><Textarea placeholder="Briefly describe this event type..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Color (Optional)</FormLabel>
              <FormControl><Input type="color" {...field} /></FormControl>
              <FormDescription>Choose a color to represent this event type in your calendar.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        
        <div>
          <Label className="text-lg font-semibold">Availability Rules</Label>
          <p className="text-sm text-muted-foreground mb-3">Define when you are available for this event type.</p>
          {fields.map((field, index) => (
            <Card key={field.id} className="mb-4 p-4 relative bg-muted/30 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <FormField
                  control={form.control}
                  name={`availabilityRules.${index}.dayOfWeek`}
                  render={({ field: dayField }) => (
                    <FormItem>
                      <FormLabel>Day</FormLabel>
                      <Select onValueChange={dayField.onChange} defaultValue={dayField.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {daysOfWeek.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`availabilityRules.${index}.startTime`}
                  render={({ field: timeField }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl><Input type="time" {...timeField} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`availabilityRules.${index}.endTime`}
                  render={({ field: timeField }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl><Input type="time" {...timeField} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove rule</span>
                </Button>
              )}
            </Card>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' })}
            className="w-full mt-2"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Availability Rule
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            <XCircle className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
             <Save className="mr-2 h-4 w-4" /> {form.formState.isSubmitting ? 'Saving...' : (existingEvent ? 'Save Changes' : 'Create Event Type')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
