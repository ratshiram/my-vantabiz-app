
import Link from 'next/link';
import Image from 'next/image';

export function AppHeader() {
  // Aspect ratio of the logo image seems to be roughly 176:48 (or 11:3) based on previous URL.
  // Adjust width/height here if your downloaded logo.png has different native dimensions
  // to maintain aspect ratio.
  // For h-10 (40px), width = 40 * (176/48) approx 147px
  // For h-12 (48px), width = 48 * (176/48) = 176px
  const logoHeightSmall = 40; // For sm screens and up, h-10
  const logoWidthSmall = 147; // Approximate width for 40px height based on 11:3 ratio

  const logoHeightLarge = 48; // For md screens and up, h-12
  const logoWidthLarge = 176; // Approximate width for 48px height

  return (
    <header className="text-center py-6 sm:py-8 bg-card border-b border-border">
      <Link href="/" className="inline-block group" aria-label="VantaBiz Home">
        {/*
          Using Next.js Image component for optimized local images.
          The image should be placed in the `public` folder.
          e.g., public/logo.png will be accessible as /logo.png
        */}
        <div className="relative">
          {/* Provide explicit width and height for non-fill images */}
          {/* You might need to adjust these if your logo's aspect ratio is different */}
          <Image
            src="/logo.png" // Points to public/logo.png
            alt="VantaBiz Logo"
            width={logoWidthLarge} // Default width (can be overridden by CSS or responsive variants if needed)
            height={logoHeightLarge} // Default height
            priority // Marks the image as high-priority for loading (good for LCP)
            className="block h-10 w-auto sm:h-12" // Tailwind classes for responsive height, width will scale by aspect ratio
            style={{ width: 'auto' }} // Ensures intrinsic aspect ratio is maintained with height classes
          />
        </div>
      </Link>
      <p className="text-md sm:text-lg text-foreground mt-2 sm:mt-3 font-medium">Your All-in-One Business Toolkit</p>
    </header>
  );
}
