
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Clone the request headers and set new ones
  const headers = new Headers(request.headers);

  // Prevent browsers from trying to guess the content type, which can lead to security vulnerabilities.
  headers.set('X-Content-Type-Options', 'nosniff');
  
  // Prevent the page from being displayed in an iframe, which helps mitigate clickjacking attacks.
  headers.set('X-Frame-Options', 'DENY');
  
  // Enforce the use of HTTPS, reducing the risk of man-in-the-middle attacks.
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  
  // Enable the built-in XSS protection in modern browsers.
  headers.set('X-XSS-Protection', '1; mode=block');

  // Control how much referrer information is sent with requests.
  headers.set('Referrer-Policy', 'origin-when-cross-origin');

  // Return response with the new headers
  return NextResponse.next({
    request: {
      headers,
    },
  });
}

export const config = {
  // Apply this middleware to all routes except for static assets, API routes, and internal Next.js paths.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
