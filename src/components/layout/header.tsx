import Link from 'next/link';

const LogoIcon = () => (
  <svg className="h-10 w-10 sm:h-12 sm:w-12 text-primary" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Updated to use CSS var for gradient if possible, or keep as is if specific brand colors are needed */}
    <rect width="40" height="40" rx="8" fill="currentColor"/> 
    <path d="M11 12L16.6667 28L20.4444 18.2222L29 12L20.4444 15.7778L16.6667 28L14.7778 21.8889L11 19.5556L18.5556 16.6667L11 12Z" fill="white"/>
  </svg>
);

export function AppHeader() {
  return (
    <header className="text-center py-6 sm:py-8 bg-card border-b border-border">
      <Link href="/" className="inline-flex justify-center items-center space-x-3 group" aria-label="VantaBiz Home">
        <LogoIcon />
        <span className="text-3xl sm:text-4xl font-extrabold text-primary group-hover:text-primary/90 transition-colors">VantaBiz Suite</span>
      </Link>
      <p className="text-md sm:text-lg text-foreground mt-1 sm:mt-2 font-medium">Your All-in-One Business Toolkit</p>
    </header>
  );
}
