
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { useEffect } from "react";
import { Loader2, UserCircle, Zap, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-background">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
        <p className="text-xl font-semibold text-primary mt-4">Loading Profile...</p>
      </div>
    );
  }

  const tierName = user.tier === 'pro' ? 'Pro Plan' : 'Free Trial';
  const trialEndDateString = user.tier === 'free' && user.trialEndDate 
    ? format(new Date(user.trialEndDate), "MMMM d, yyyy") 
    : null;

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <UserCircle className="h-16 w-16 mx-auto text-primary mb-2" />
            <CardTitle className="text-3xl font-bold">{user.name || "User Profile"}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 border rounded-lg bg-card/50">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                {user.tier === 'pro' ? <Zap className="mr-2 h-5 w-5 text-yellow-500" /> : <ShieldCheck className="mr-2 h-5 w-5 text-green-500" />}
                Subscription Status
              </h3>
              <p className="text-lg font-medium text-primary">{tierName}</p>
              {trialEndDateString && (
                <p className="text-sm text-muted-foreground">
                  Your trial ends on {trialEndDateString}.
                </p>
              )}
            </div>

            {user.tier === 'free' && (
              <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-6 text-lg">
                <Link href="/pricing">Upgrade to Pro Plan</Link>
              </Button>
            )}
            
            <Button onClick={logout} variant="outline" className="w-full">
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
