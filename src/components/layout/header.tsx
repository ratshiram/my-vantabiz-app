
import Link from 'next/link';
import Image from 'next/image';

export function AppHeader() {
  return (
    <header className="text-center py-6 sm:py-8 bg-card border-b border-border">
      <Link href="/" className="inline-block group" aria-label="VantaBiz Home">
        {/* This div controls the size of the logo via height */}
        <div
          className="relative h-12 w-auto sm:h-16" // Set to a moderate, visible size
        >
          <Image
            src="/vantabiz.png" // Points to public/vantabiz.png
            alt="VantaBiz Logo"
            fill
            style={{ objectFit: "contain" }} // Ensures the image scales within the bounds without distortion
            priority // Prioritize loading the logo
          />
        </div>
      </Link>
      <p className="text-md sm:text-lg text-foreground mt-2 sm:mt-3 font-medium">Your All-in-One Business Toolkit</p>
    </header>
  );
}
