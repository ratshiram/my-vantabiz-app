"use client"; // Add "use client" if any interactivity is planned directly here, or for hooks like usePathname etc. For static content, it might not be needed.
// However, since it's a landing page, it's likely to be mostly static from a React perspective.
// For now, let's assume it's a server component by default unless client-side interactivity is needed.
// Removing "use client" unless strictly necessary for this specific page's direct behavior.

import Link from 'next/link'; // Import Link for Next.js optimized navigation if needed, using <a> for now as per original HTML for some links.

export default function LandingPage() {
  return (
    <>
      {/* Header / Nav from the provided HTML */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <svg className="h-8 w-8" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="8" fill="url(#logo-gradient-header)" />
                <path d="M11 12L16.6667 28L20.4444 18.2222L29 12L20.4444 15.7778L16.6667 28L14.7778 21.8889L11 19.5556L18.5556 16.6667L11 12Z" fill="white" />
                <defs>
                  <linearGradient id="logo-gradient-header" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4F46E5" />
                    <stop offset="1" stopColor="#818CF8" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-2xl font-bold text-indigo-600">VantaBiz</span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <a href="#features" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Features</a>
                <a href="#pricing" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Pricing</a>
                <span className="text-gray-300">|</span>
                <a href="/login" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Login</a> {/* Changed to /login assuming Next.js page */}
                <a href="/signup" className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-opacity">Start Free Trial</a> {/* Changed to /signup */}
              </div>
            </div>
            <div className="md:hidden">
              <a href="/signup" className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-opacity">Get Started</a> {/* Changed to /signup */}
            </div>
          </div>
        </nav>
      </header>

      <main>
        <div className="bg-slate-50"> {/* Replaced hero-bg class */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-24 md:py-32 text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                <span className="block">The Simple Way to Manage</span>
                <span className="block text-indigo-600">Your Business Finances.</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">Get a handle on your income, expenses, and invoicing with two powerful, easy-to-use tools. Start your free 7-day trial today.</p>
              <div className="mt-8">
                <a href="/signup" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-opacity">Start Your Free 7-Day Trial</a> {/* Changed to /signup */}
              </div>
            </div>
          </div>
        </div>

        <section id="suite" className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">Your App Dashboard</h2> {/* Applied section-title classes */}
              <p className="mt-4 text-lg text-gray-500">Access your tools from here after logging in.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Link href="/dashboard" className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <h3 className="text-2xl font-bold text-indigo-600">Financial Tracker</h3>
                <p className="mt-2 text-gray-600">Log income and expenses, view your dashboard, and download financial reports.</p>
              </Link>
              <Link href="/invoice-generator" className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <h3 className="text-2xl font-bold text-indigo-600">Invoice Generator</h3>
                <p className="mt-2 text-gray-600">Create, save, and download professional PDF receipts and invoices for your clients.</p>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="bg-gray-50 py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">Two Powerful Tools, One Simple Price</h2> {/* Applied section-title classes */}
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">Stop juggling spreadsheets and complicated software. VantaBiz gives you exactly what you need.</p>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <div className="p-6 bg-white rounded-lg shadow-md text-left">
                <h3 className="text-lg font-medium text-gray-900">Financial Tracker</h3>
                <p className="mt-2 text-base text-gray-500">Log income and expenses in seconds. See your profit and loss at a glance with a clean dashboard and charts, and download professional reports as PDFs.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md text-left">
                <h3 className="text-lg font-medium text-gray-900">Invoice & Receipt Generator</h3>
                <p className="mt-2 text-base text-gray-500">Create beautiful, branded invoices and receipts with automatic tax calculations. Save them to your records and download PDFs for your clients.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-white py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">Simple, Transparent Pricing</h2> {/* Applied section-title classes */}
              <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">Try everything free for 7 days. No credit card required.</p>
            </div>
            <div className="mt-12 mx-auto max-w-md lg:max-w-4xl grid gap-8 lg:grid-cols-2">
              <div className="border border-gray-200 rounded-lg shadow-sm flex flex-col"> {/* Applied pricing-card classes */}
                <div className="p-6 text-center flex-grow">
                  <h2 className="text-2xl leading-6 font-bold text-gray-900">Free Trial</h2>
                  <p className="mt-4 text-sm text-gray-500">Full access to all tools.</p>
                  <p className="mt-8"><span className="text-5xl font-extrabold text-gray-900">C$0</span><span className="text-base font-medium text-gray-500">/ 7 days</span></p> {/* Updated price to CAD */}
                </div>
                <div className="p-6 mt-auto">
                  <a href="/signup" className="block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700">Start Trial</a> {/* Changed to /signup */}
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg shadow-sm flex flex-col"> {/* Applied pricing-card classes */}
                <div className="p-6 text-center flex-grow">
                  <h2 className="text-2xl leading-6 font-bold text-gray-900">Pro</h2>
                  <p className="mt-4 text-sm text-gray-500">Unlimited access forever.</p>
                  <p className="mt-8"><span className="text-5xl font-extrabold text-gray-900">C$10</span><span className="text-base font-medium text-gray-500">/mo</span></p> {/* Updated price to CAD */}
                </div>
                <div className="p-6 mt-auto">
                  <a href="/signup" className="block w-full bg-gray-800 border border-gray-800 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-gray-900">Go Pro</a> {/* Changed to /signup */}
                </div>
              </div>
            </div>
             <div className="mt-12 text-center text-gray-500">
                <p>All prices are in CAD. Cancel anytime.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer from the provided HTML */}
      <footer className="bg-gray-800">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} VantaBiz. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
}
