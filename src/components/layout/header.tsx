
import Link from 'next/link';
import Image from 'next/image';

export function AppHeader() {
  return (
    <header className="flex flex-col items-center py-6 sm:py-8 bg-card border-b border-border">
      <div className="relative w-auto h-24 sm:h-28">
        <Image
          src="/vantabizlogo.png"
          alt="VantaBiz Logo"
          width={500}
          height={500}
          style={{ objectFit: 'contain', width: 'auto', height: '100%' }}
          priority
        />
      </div>
    </header>
  );
}
