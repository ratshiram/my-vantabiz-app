import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from '@/components/layout/main-layout';
import { AuthProvider } from '@/contexts/auth-context'; // Added AuthProvider

export const metadata: Metadata = {
  title: 'VantaBiz Suite',
  description: 'Financial Tools for Your Business by VantaBiz',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background">
        <AuthProvider> {/* Wrapped with AuthProvider */}
          <MainLayout>
            {children}
          </MainLayout>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
