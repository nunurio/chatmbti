import createMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { routing } from './i18n/routing';

// Create next-intl middleware with routing configuration
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // First handle auth session update
  const authResponse = await updateSession(request);
  
  // Then handle i18n routing
  const intlResponse = intlMiddleware(request);
  
  // Return the i18n response (which handles redirects) or fall back to auth response
  return intlResponse || authResponse;
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, _vercel)
    // Skip all API routes
    // Skip all static files
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ],
};