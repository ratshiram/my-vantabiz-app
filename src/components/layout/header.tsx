
import Link from 'next/link';
import Image from 'next/image';

export function AppHeader() {
  return (
    <header className="flex flex-col items-center py-6 sm:py-8 bg-card border-b border-border">
      <div className="relative"> {/* Removed Tailwind height classes */}
        <Image
          src="/vantabizlogo.png"
          alt="VantaBiz Logo"
          width={388}
          height={145}
          priority
          // Removed inline style forcing it to fit a container
        />
      </div>
    </header>
  );
}
