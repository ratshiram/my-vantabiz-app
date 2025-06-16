
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Edit3, Trash2, Link2, CalendarDays } from 'lucide-react';
import type { SchedulerEventDocument, AvailabilityRule } from '@/lib/types';
import Link from 'next/link'; // Import Link from next/link

interface EventTypeCardProps {
  eventType: SchedulerEventDocument;
  username: string;
  onEdit: () => void;
  onDelete: () => void;
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${suffix}`;
}

function getAvailabilitySummary(rules: AvailabilityRule[]): string {
  if (!rules || rules.length === 0) return "No availability set.";
  
  // Simple summary: count of days or first rule
  const uniqueDays = new Set(rules.map(r => r.dayOfWeek));
  if (uniqueDays.size === 7 && rules.every(r => r.startTime === rules[0].startTime && r.endTime === rules[0].endTime)) {
      return `Every day ${formatTime(rules[0].startTime)} - ${formatTime(rules[0].endTime)}`;
  }
  if (uniqueDays.size > 2) {
    return `${uniqueDays.size} days per week.`;
  }
  return rules.map(r => `${r.dayOfWeek.substring(0,3)}: ${formatTime(r.startTime)}-${formatTime(r.endTime)}`).slice(0,2).join(', ') + (rules.length > 2 ? '...' : '');
}

export function EventTypeCard({ eventType, username, onEdit, onDelete }: EventTypeCardProps) {
  const publicBookingLink = `/book/${username}/${eventType.slug}`;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">{eventType.name}</CardTitle>
        <CardDescription className="flex items-center text-sm text-muted-foreground mt-1">
          <Clock className="mr-2 h-4 w-4" /> {eventType.duration} minutes
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        {eventType.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{eventType.description}</p>
        )}
        <div className="text-sm">
          <p className="font-medium text-foreground flex items-center">
            <CalendarDays className="mr-2 h-4 w-4 text-primary/80" />
            Availability:
          </p>
          <p className="text-muted-foreground ml-6">{getAvailabilitySummary(eventType.availabilityRules)}</p>
        </div>
        <div className="text-sm">
            <p className="font-medium text-foreground flex items-center">
                <Link2 className="mr-2 h-4 w-4 text-primary/80" />
                Public Link:
            </p>
            <Link href={publicBookingLink} passHref legacyBehavior>
                <a 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:underline break-all ml-6 text-xs"
                  onClick={(e) => e.stopPropagation()} // Prevents card click if card itself is clickable
                >
                    {publicBookingLink}
                </a>
            </Link>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t pt-4 mt-auto">
        <Button variant="outline" size="sm" onClick={onEdit} aria-label={`Edit ${eventType.name}`}>
          <Edit3 className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Edit</span>
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete} aria-label={`Delete ${eventType.name}`}>
          <Trash2 className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
