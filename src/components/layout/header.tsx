import Link from 'next/link';

const LogoIcon = () => (
  <svg className="h-10 w-10 sm:h-12 sm:w-12" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="url(#logo-gradient)"/>
    <path d="M11 12L16.6667 28L20.4444 18.2222L29 12L20.4444 15.7778L16.6667 28L14.7778 21.8889L11 19.5556L18.5556 16.6667L11 12Z" fill="white"/>
    <defs>
      <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4F46E5"/>
        <stop offset="1" stopColor="#818CF8"/>
      </linearGradient>
    </defs>
  </svg>
);

export function AppHeader() {
  return (
    <header className="text-center py-8 sm:py-12">
      <Link href="/" className="inline-flex justify-center items-center space-x-3 group" aria-label="VantaBiz Home">
        <LogoIcon />
        <span className="text-3xl sm:text-4xl font-extrabold text-indigo-600 group-hover:text-indigo-700 transition-colors">VantaBiz</span>
      </Link>
      <p className="text-md sm:text-lg text-muted-foreground mt-2 sm:mt-4 font-medium">Financial Tracker</p>
    </header>
  );
}
