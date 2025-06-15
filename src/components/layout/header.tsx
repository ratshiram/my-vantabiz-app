
import Link from 'next/link';
import Image from 'next/image';

export function AppHeader() {
  return (
    <header className="flex flex-col items-center py-6 sm:py-8 bg-card border-b border-border">
      <div className="relative">
        <Image
          src="/vantabizlogo.png"
          alt="VantaBiz Logo"
          width={388}
          height={145}
          priority
        />
      </div>
      <p className="mt-2 text-sm sm:text-base text-muted-foreground text-center">Your All-in-One Business Toolkit</p>
    </header>
  );
}
