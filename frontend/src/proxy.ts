import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  // Match all paths except API routes, static files, and Next.js internal files
  matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
};

export default function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || 'zeyro.in';
  
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'app.zeyro.in';

  // ── Supabase OAuth fallback intercept ──────────────────────────────────────
  // When the Supabase redirect URL isn't whitelisted, Supabase falls back to
  // the Site URL (e.g. http://localhost:3000/?code=xxx). We catch that here
  // and forward the code to the proper callback handler.
  const code = url.searchParams.get('code');
  if (code && (url.pathname === '/' || url.pathname === '')) {
    const callbackUrl = new URL('/api/auth/callback', req.url);
    callbackUrl.searchParams.set('code', code);
    return NextResponse.redirect(callbackUrl);
  }

  // Check if pathname is already prefixed or is a root route
  if (
    url.pathname.startsWith('/app/') ||
    url.pathname.startsWith('/marketing/') ||
    url.pathname.startsWith('/nabard-demo')
  ) {
    return NextResponse.next();
  }

  // App routes that should map to /app/...
  const isAppRoute =
    url.pathname === '/login' ||
    url.pathname.startsWith('/login/') ||
    url.pathname === '/signup' ||
    url.pathname.startsWith('/signup/') ||
    url.pathname === '/bfs-dashboard' ||
    url.pathname.startsWith('/bfs-dashboard/');

  const isAppDomain = hostname === appDomain;

  if (isAppDomain || isAppRoute) {
    // Rewrite requests for app subdomain or app routes to the /app/ folder
    const targetPath = url.pathname === '/' ? '/app/login' : `/app${url.pathname}`;
    return NextResponse.rewrite(new URL(targetPath, req.url));
  } else {
    // Rewrite requests to the main domain to the /marketing/ folder
    return NextResponse.rewrite(new URL(`/marketing${url.pathname}`, req.url));
  }
}
