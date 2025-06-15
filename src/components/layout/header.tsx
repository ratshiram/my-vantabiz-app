
import Link from 'next/link';
import Image from 'next/image';

export function AppHeader() {
  return (
    <header className="text-center py-6 sm:py-8 bg-card border-b border-border">
      <div className="relative mx-auto w-auto h-12 sm:h-16" style={{ maxWidth: '200px' }}>
        <Image
          src="https://placehold.co/150x50.png"
          alt="VantaBiz Logo Placeholder"
          fill
          style={{ objectFit: 'contain' }}
          data-ai-hint="logo wordmark"
          priority
        />
      </div>
      <p className="text-md sm:text-lg text-foreground mt-2 sm:mt-3 font-medium">Your All-in-One Business Toolkit</p>
    </header>
  );
}
