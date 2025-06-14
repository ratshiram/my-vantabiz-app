import { InvoiceGeneratorClient } from '@/components/invoice/invoice-generator-client';

export default function InvoiceGeneratorPage() {
  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-8 text-center">Invoice & Receipt Generator</h1>
      <InvoiceGeneratorClient />
    </main>
  );
}
