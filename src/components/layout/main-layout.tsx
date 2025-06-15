import React from 'react';
import { AppHeader } from './header'; 
import { NavigationMenu } from './navigation-menu';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <AppHeader />
      <NavigationMenu />
      <div className="flex-grow">
        {children}
      </div>
      <footer className="text-center py-6 border-t border-border bg-background">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} VantaBiz. All rights reserved.</p>
      </footer>
    </>
  );
}
