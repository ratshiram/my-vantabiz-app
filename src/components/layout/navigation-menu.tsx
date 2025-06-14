"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FileText, Tags, UserCircle } from 'lucide-react';


const navItems = [
  { href: '/', label: 'FinTrack', icon: <LayoutDashboard className="mr-2 h-5 w-5" /> },
  { href: '/invoice-generator', label: 'Invoice Gen', icon: <FileText className="mr-2 h-5 w-5" /> },
  { href: '/pricing', label: 'Pricing', icon: <Tags className="mr-2 h-5 w-5" /> },
];

export function NavigationMenu() {
  const pathname = usePathname();

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {navItems.map((item) => (
              <Button key={item.href} variant="ghost" asChild
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Link href={item.href} className="flex items-center">
                  {item.icon}
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
          {/* Placeholder for Login/Signup/Profile */}
          <Button variant="outline">
            <UserCircle className="mr-2 h-5 w-5" />
            Login / Sign Up
          </Button>
        </div>
      </div>
    </nav>
  );
}
