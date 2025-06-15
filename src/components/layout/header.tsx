
import Link from 'next/link';
import Image from 'next/image';

export function AppHeader() {
  return (
    <header className="text-center py-6 sm:py-8 bg-card border-b border-border">
      <div className="relative mx-auto w-auto h-20 sm:h-24">
        <Image
          src="/vantabizlogo.png"
          alt="VantaBiz Logo"
          width={200}
          height={50}
          style={{ objectFit: 'contain', width: 'auto', height: '100%' }}
          priority
        />
      </div>
      <p className="text-md sm:text-lg text-foreground mt-2 sm:mt-3 font-medium">Your All-in-One Business Toolkit</p>
    </header>
  );
}
