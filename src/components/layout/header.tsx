
import Link from 'next/link';
import Image from 'next/image';

export function AppHeader() {
  // Assuming vantabiz.png has an intrinsic aspect ratio.
  // These are placeholder dimensions for aspect ratio calculation if needed.
  // For best results, these should match the actual logo's dimensions.
  const intrinsicWidth = 176; // Example
  const intrinsicHeight = 48;  // Example

  return (
    <header className="text-center py-6 sm:py-8 bg-card border-b border-border">
      <Link href="/" className="inline-block group" aria-label="VantaBiz Home">
        {/* This div controls the size of the logo via height and aspect ratio */}
        <div
          className="relative h-20 w-auto sm:h-24" // Increased height
          style={{ aspectRatio: `${intrinsicWidth}/${intrinsicHeight}` }} // Aspect ratio helps maintain shape
        >
          <Image
            src="/vantabiz.png" // Points to public/vantabiz.png
            alt="VantaBiz Logo"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </Link>
      <p className="text-md sm:text-lg text-foreground mt-2 sm:mt-3 font-medium">Your All-in-One Business Toolkit</p>
    </header>
  );
}
