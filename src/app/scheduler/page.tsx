
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Loader2, PlusCircle, CalendarDays, Info } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { SchedulerEventDocument, SchedulerEventFormValues, SchedulerEventWriteData } from '@/lib/types';
import { EventTypeForm } from '@/components/scheduler/event-type-form';
import { EventTypeCard } from '@/components/scheduler/event-type-card';
import { useToast } from '@/hooks/use-toast';

export default function SchedulerPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [eventTypes, setEventTypes] = useState<SchedulerEventDocument[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchedulerEventDocument | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchEventTypes = useCallback(async () => {
    if (!user) {
      setEventTypes([]);
      setIsLoadingEvents(false);
      return;
    }
    setIsLoadingEvents(true);
    try {
      const q = query(
        collection(db, "schedulerEvents"),
        where("userId", "==", user.id),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const fetchedEvents: SchedulerEventDocument[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedEvents.push({
          id: doc.id,
          userId: data.userId,
          name: data.name,
          slug: data.slug,
          duration: data.duration,
          description: data.description,
          availabilityRules: data.availabilityRules,
          // color: data.color,
          createdAt: (data.createdAt as Timestamp).toDate(),
          updatedAt: (data.updatedAt as Timestamp).toDate(),
        } as SchedulerEventDocument);
      });
      setEventTypes(fetchedEvents);
    } catch (error) {
      console.error("Error fetching event types: ", error);
      toast({ title: "Error", description: "Could not fetch your event types.", variant: "destructive" });
    } finally {
      setIsLoadingEvents(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (isClient && user && !authLoading) {
      fetchEventTypes();
    } else if (isClient && !authLoading && !user) {
      setEventTypes([]);
      setIsLoadingEvents(false);
    }
  }, [user, authLoading, fetchEventTypes, isClient]);

  const handleFormSubmit = async (values: SchedulerEventFormValues) => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    const dataToSave: Omit<SchedulerEventWriteData, 'createdAt' | 'updatedAt'> & { createdAt?: Timestamp, updatedAt: Timestamp } = {
      ...values,
      userId: user.id,
      updatedAt: serverTimestamp() as Timestamp,
    };

    try {
      if (editingEvent) {
        // Update existing event
        const eventDocRef = doc(db, "schedulerEvents", editingEvent.id);
        await updateDoc(eventDocRef, dataToSave);
        toast({ title: "Success", description: "Event type updated successfully." });
      } else {
        // Create new event
        dataToSave.createdAt = serverTimestamp() as Timestamp;
        await addDoc(collection(db, "schedulerEvents"), dataToSave);
        toast({ title: "Success", description: "Event type created successfully." });
      }
      setIsFormOpen(false);
      setEditingEvent(null);
      fetchEventTypes(); // Refresh list
    } catch (error) {
      console.error("Error saving event type: ", error);
      toast({ title: "Error", description: "Could not save event type.", variant: "destructive" });
    }
  };

  const handleEditEvent = (eventType: SchedulerEventDocument) => {
    setEditingEvent(eventType);
    setIsFormOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete this event type? This action cannot be undone.")) {
        return;
    }
    try {
        await deleteDoc(doc(db, "schedulerEvents", eventId));
        toast({ title: "Deleted", description: "Event type deleted successfully." });
        fetchEventTypes(); // Refresh list
    } catch (error) {
        console.error("Error deleting event type:", error);
        toast({ title: "Error", description: "Could not delete event type.", variant: "destructive" });
    }
  };


  const openNewEventForm = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };
  
  if (!isClient || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-background">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
        <p className="text-xl font-semibold text-primary mt-4">Loading Scheduler...</p>
      </div>
    );
  }

  if (!user && !authLoading) {
    return (
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
        <Card className="w-full max-w-2xl mx-auto text-center shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Access Your Scheduler</CardTitle>
            <CardDescription>Please log in or sign up to manage your booking availability.</CardDescription>
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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">My Event Types</h1>
            <p className="text-muted-foreground mt-1">Manage your schedulable events and availability.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
            setIsFormOpen(isOpen);
            if (!isOpen) setEditingEvent(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={openNewEventForm} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" /> Create New Event Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Edit Event Type' : 'Create New Event Type'}</DialogTitle>
              <DialogDescription>
                {editingEvent ? 'Update the details of your event type.' : 'Define a new type of event that others can book with you.'}
              </DialogDescription>
            </DialogHeader>
            <EventTypeForm
              onSubmit={handleFormSubmit}
              existingEvent={editingEvent}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingEvent(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingEvents && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="ml-2">Loading your event types...</p>
        </div>
      )}

      {!isLoadingEvents && eventTypes.length === 0 && (
        <Card className="text-center py-12 shadow-md">
          <CardHeader>
            <CalendarDays className="h-16 w-16 mx-auto text-primary mb-4" />
            <CardTitle className="text-2xl">No Event Types Yet</CardTitle>
            <CardDescription className="mt-2 text-lg">
              Create your first event type to start taking bookings!
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Button onClick={openNewEventForm}>
              <PlusCircle className="mr-2 h-5 w-5" /> Create Event Type
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoadingEvents && eventTypes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventTypes.map((eventType) => (
            <EventTypeCard 
              key={eventType.id} 
              eventType={eventType} 
              username={user?.username || user?.id || 'user'} 
              onEdit={() => handleEditEvent(eventType)}
              onDelete={() => handleDeleteEvent(eventType.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
