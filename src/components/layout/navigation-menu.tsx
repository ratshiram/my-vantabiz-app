
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FileText, Tags, UserCircle, LogIn, UserPlus, LogOut, Settings, ListChecks } from 'lucide-react'; // Added ListChecks
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


const navItems = [
  { href: '/', label: 'FinTrack', icon: <LayoutDashboard className="mr-2 h-5 w-5" /> },
  { href: '/invoice-generator', label: 'Invoice Gen', icon: <FileText className="mr-2 h-5 w-5" /> },
  { href: '/my-invoices', label: 'My Invoices', icon: <ListChecks className="mr-2 h-5 w-5" /> }, // New Nav Item
  { href: '/pricing', label: 'Pricing', icon: <Tags className="mr-2 h-5 w-5" /> },
];

export function NavigationMenu() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  const getUserInitials = (name?: string) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => (
              <Button key={item.href} variant="ghost" asChild
                className={cn(
                  "text-xs sm:text-sm font-medium transition-colors hover:text-primary px-2 sm:px-3 py-1 sm:py-2",
                  pathname === item.href ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                )}
              >
                <Link href={item.href} className="flex items-center">
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.label.substring(0,4)}</span>
                </Link>
              </Button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <Button variant="ghost" size="sm" disabled>Loading...</Button>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                      {/* <AvatarImage src="/avatars/01.png" alt={user.name || user.email} /> */}
                      <AvatarFallback>{getUserInitials(user.name) || <UserCircle />}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Profile & Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login" className="flex items-center">
                    <LogIn className="mr-1 h-4 w-4" /> Login
                  </Link>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <Link href="/signup" className="flex items-center">
                    <UserPlus className="mr-1 h-4 w-4" /> Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
