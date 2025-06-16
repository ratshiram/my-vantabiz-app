// src/middleware.ts
import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // This is a basic middleware that does nothing but pass the request through.
  // Its presence helps ensure Next.js generates a middleware-manifest.json,
  // which some deployment adapters (like Firebase App Hosting's) might expect.
  return NextResponse.next();
}

// You can define a config object to specify which paths the middleware should apply to.
// If you don't have specific middleware logic yet, you can make it match all paths
// or a minimal set of paths. For just generating the manifest, even this might be optional
// depending on the Next.js version, but it's good practice.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
