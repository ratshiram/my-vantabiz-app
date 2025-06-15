
import React from 'react';

export function AppHeader() {
  return (
    <header className="flex flex-col items-center py-6 sm:py-8 bg-card border-b border-border">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          <span className="text-primary">Vanta</span><span className="text-foreground">Biz</span>
        </h1>
        <p className="text-sm sm:text-base font-medium text-muted-foreground tracking-wider -mt-1">
          SUITE
        </p>
      </div>
      <p className="mt-2 text-sm sm:text-md text-muted-foreground text-center">
        Your All-in-One Business Toolkit
      </p>
    </header>
  );
}
