
import Link from 'next/link';
import Image from 'next/image';

// URL for the new logo
const logoUrl = "https://image-proxy.idx.run/https%3A%2F%2Ffirebasestorage.googleapis.com%2Fv0%2Fb%2Fproject-idx-75379.appspot.com%2Fo%2Fgithub.com%252FAssistant%252Finitial_content_images%252Fimage_2.png%3Falt%3Dmedia%26token%3D8a5182aa-e9df-4a8a-9d4c-d576d36e34e4";

export function AppHeader() {
  // Aspect ratio of the logo is 176:48 (or 11:3)
  // For h-10 (40px), width = 40 * (176/48) = 146.67px
  // For h-12 (48px), width = 48 * (176/48) = 176px
  return (
    <header className="text-center py-6 sm:py-8 bg-card border-b border-border">
      <Link href="/" className="inline-block group" aria-label="VantaBiz Home">
        <div className="relative h-10 w-[147px] sm:h-12 sm:w-[176px]"> {/* Approx widths for aspect ratio */}
          <Image
            src={logoUrl}
            alt="VantaBiz Logo"
            fill
            style={{ objectFit: "contain" }} // Ensures the image scales nicely within the bounds
            priority // Marks the image as high-priority for loading (good for LCP)
          />
        </div>
      </Link>
      <p className="text-md sm:text-lg text-foreground mt-2 sm:mt-3 font-medium">Your All-in-One Business Toolkit</p>
    </header>
  );
}
