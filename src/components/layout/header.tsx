
import Link from 'next/link';
import Image from 'next/image';

export function AppHeader() {
  // Aspect ratio of the logo image. You may need to adjust these
  // if your vantabiz.png has different native dimensions to best fit the desired height.
  // Assuming the logo is somewhat wide, these are example dimensions.
  // For h-10 (40px), if the logo aspect ratio is e.g. 3:1, width would be 120px.
  // For h-12 (48px), if the logo aspect ratio is e.g. 3:1, width would be 144px.
  // The current Tailwind classes h-10/h-12 set the height, and `style={{ width: 'auto' }}`
  // lets the browser calculate width based on intrinsic aspect ratio.
  // For better control with Next/Image, providing explicit width/height matching aspect ratio is good.
  // Let's assume a placeholder aspect ratio for now, you can refine this if needed.
  const intrinsicWidth = 176; // Example intrinsic width of your logo
  const intrinsicHeight = 48;  // Example intrinsic height of your logo

  return (
    <header className="text-center py-6 sm:py-8 bg-card border-b border-border">
      <Link href="/" className="inline-block group" aria-label="VantaBiz Home">
        <div className="relative h-10 w-auto sm:h-12" style={{ aspectRatio: `${intrinsicWidth}/${intrinsicHeight}` }}>
          {/*
            Using Next.js Image component for optimized local images.
            The image should be placed in the `public` folder.
            e.g., public/vantabiz.png will be accessible as /vantabiz.png
          */}
          <Image
            src="/vantabiz.png" // Points to public/vantabiz.png
            alt="VantaBiz Logo"
            fill // Use fill to make the image cover the parent div dimensions
            style={{ objectFit: "contain" }} // Ensures the logo scales correctly within the bounds
            priority // Marks the image as high-priority for loading (good for LCP)
            // The className on the parent div will control the size now
          />
        </div>
      </Link>
      <p className="text-md sm:text-lg text-foreground mt-2 sm:mt-3 font-medium">Your All-in-One Business Toolkit</p>
    </header>
  );
}
