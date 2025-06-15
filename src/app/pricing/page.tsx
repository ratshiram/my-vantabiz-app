
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import Link from 'next/link';

const tiers = [
  {
    name: "Free Trial",
    price: "C$0",
    duration: "/ 7 days",
    features: [
      "Access to FinTrack Lite",
      "Access to Invoice Generator",
      "Limited to 10 transactions",
      "Limited to 5 invoices",
    ],
    cta: "Start Free Trial",
    variant: "outline",
    id: "free",
  },
  {
    name: "Pro",
    price: "C$10",
    duration: "/ month",
    features: [
      "Full access to FinTrack Lite",
      "Full access to Invoice Generator",
      "Unlimited transactions",
      "Unlimited invoices",
      "Priority support",
      "Data export options",
    ],
    cta: "Go Pro",
    variant: "default",
    popular: true,
    id: "pro",
  },
] as const;

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');


export default function PricingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoadingPro, setIsLoadingPro] = useState(false);
  const [isStripeKeyMissing, setIsStripeKeyMissing] = useState(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key || String(key).trim() === "") {
      console.warn(
        "CRITICAL_STRIPE_CONFIG: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set or is empty. " +
        "Stripe payments will not work. Please check your .env.local file and restart the server."
      );
      toast({
        title: "Stripe Configuration Error",
        description: "Stripe publishable key is missing. Payments are disabled. Please check environment variables.",
        variant: "destructive",
        duration: Infinity,
      });
      setIsStripeKeyMissing(true);
    } else {
      setIsStripeKeyMissing(false);
    }
  }, [toast]);

  const handleGoProClick = async () => {
    if (isStripeKeyMissing) {
      toast({
        title: "Stripe Not Configured",
        description: "Cannot proceed: Stripe publishable key is missing. Please check environment variables.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in or sign up to upgrade to Pro.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingPro(true);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session.');
      }

      const { sessionId } = await response.json();
      if (!sessionId) {
        throw new Error('Checkout session ID not found.');
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe.js failed to load. Please check your internet connection or ad-blockers.');
      }

      const { error: stripeJsError } = await stripe.redirectToCheckout({ sessionId });

      if (stripeJsError) {
        console.error("Stripe.js reported an error before redirect:", stripeJsError);
        toast({
          title: "Payment Error",
          description: stripeJsError.message || "Could not initiate Stripe redirect. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Go Pro error during API call or redirect:", error);
      let description = "An unexpected error occurred. Please try again.";
      if (error instanceof Error) {
        if (error.message && error.message.includes("Failed to set a named property 'href' on 'Location'")) {
            description = "Could not redirect to Stripe. This can happen due to restrictions in the current browsing environment (e.g., running in an iframe without top-navigation permission). If possible, try completing this action in a new, standalone browser tab or window.";
        } else {
            description = error.message;
        }
      } else {
        description = String(error);
      }

      toast({
        title: "Upgrade Failed",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsLoadingPro(false);
    }
  };

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground">Simple, Transparent Pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that&apos;s right for your business. Start for free, then upgrade when you&apos;re ready.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {tiers.map((tier) => (
          <Card key={tier.name} className={`flex flex-col shadow-xl ${('popular' in tier && tier.popular) ? 'border-primary border-2 ring-4 ring-primary/20' : ''}`}>
            {('popular' in tier && tier.popular) && (
              <div className="py-1 px-4 bg-primary text-primary-foreground text-sm font-semibold rounded-t-lg -mb-px text-center">
                Most Popular
              </div>
            )}
            <CardHeader className="items-center text-center">
              <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-extrabold">{tier.price}</span>
                <span className="text-muted-foreground">{tier.duration}</span>
              </div>
              <CardDescription className="mt-1">{tier.name === "Free Trial" ? "Get started with core features." : "Unlock all features for your growing business."}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {tier.id === "pro" ? (
                <Button
                  className="w-full text-lg py-6"
                  variant={tier.variant}
                  onClick={handleGoProClick}
                  disabled={isLoadingPro || isStripeKeyMissing}
                >
                  {isLoadingPro && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {isLoadingPro ? "Processing..." : tier.cta}
                </Button>
              ) : (
                 <Button asChild className="w-full text-lg py-6" variant={tier.variant}>
                    <Link href={user ? "/" : "/signup"}>{tier.cta}</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
       <div className="mt-12 text-center text-muted-foreground">
          <p>All prices are in CAD. You can cancel your Pro subscription at any time.</p>
      </div>
    </main>
  );
}
