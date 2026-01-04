import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Check if user is accessing protected routes
  const protectedPaths = [
    '/dashboard',
    '/projects',
    '/invoices',
    '/settings',
    '/api/stripe/user-subscription'
  ];

  const isProtectedRoute = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get cookies from the request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
      },
    }
  );

  // Get user session
 const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // For now, allow access - we'll check subscription status in the component
  // In a production app, you might want to make an API call here to check subscription
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/projects/:path*',
    '/invoices/:path*',
    '/settings/:path*',
    '/api/stripe/user-subscription'
  ],
};
