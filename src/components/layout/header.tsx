import Link from 'next/link';
import Image from 'next/image';

// URL for the new logo
const logoUrl = "https://image-proxy.idx.run/https%3A%2F%2Ffirebasestorage.googleapis.com%2Fv0%2Fb%2Fproject-idx-75379.appspot.com%2Fo%2Fgithub.com%252FAssistant%252Finitial_content_images%252Fimage_2.png%3Falt%3Dmedia%26token%3D8a5182aa-e9df-4a8a-9d4c-d576d36e34e4";

export function AppHeader() {
  return (
    <header className="text-center py-6 sm:py-8 bg-card border-b border-border">
      <Link href="/" className="inline-block group" aria-label="VantaBiz Home">
        <Image
          src={logoUrl}
          alt="VantaBiz Logo"
          width={176} // Intrinsic width for an aspect ratio of approx 3.66:1
          height={48} // Intrinsic height for an aspect ratio of approx 3.66:1
          className="h-10 sm:h-12 w-auto" // Tailwind classes to control responsive display size
          priority // Marks the image as high-priority for loading (good for LCP)
        />
        {/* The "VantaBiz Suite" text span that was here is removed as the logo image includes the text */}
      </Link>
      <p className="text-md sm:text-lg text-foreground mt-2 sm:mt-3 font-medium">Your All-in-One Business Toolkit</p>
    </header>
  );
}
