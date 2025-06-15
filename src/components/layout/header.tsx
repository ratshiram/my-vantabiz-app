
import Link from 'next/link';
import Image from 'next/image';

export function AppHeader() {
  return (
    <header className="text-center py-6 sm:py-8 bg-card border-b border-border">
      <div className="relative mx-auto w-auto h-16 sm:h-20" style={{ maxWidth: '250px' }}>
        <Image
          src="/vantabizlogo.png"
          alt="VantaBiz Logo"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
      <p className="text-md sm:text-lg text-foreground mt-2 sm:mt-3 font-medium">Your All-in-One Business Toolkit</p>
    </header>
  );
}
