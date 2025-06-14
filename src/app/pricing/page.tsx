import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

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
    variant: "outline" as "outline",
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
    variant: "default" as "default",
    popular: true,
  },
];

export default function PricingPage() {
  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground">Simple, Transparent Pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that's right for your business. Start for free, then upgrade when you're ready.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {tiers.map((tier) => (
          <Card key={tier.name} className={`flex flex-col shadow-xl ${tier.popular ? 'border-primary border-2 ring-4 ring-primary/20' : ''}`}>
            {tier.popular && (
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
              <Button className="w-full text-lg py-6" variant={tier.variant}>
                {tier.cta}
              </Button>
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
