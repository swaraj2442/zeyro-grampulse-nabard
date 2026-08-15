import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // `next` lets callers specify where to go after auth; default to /bfs-dashboard
  const next = searchParams.get('next') ?? '/bfs-dashboard'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      const isOnboarded = data.session.user.user_metadata?.onboarding_completed === true
      const destination = isOnboarded ? '/bfs-dashboard' : '/bfs-dashboard/onboarding'
      const response = NextResponse.redirect(new URL(destination, origin))

      // Xchange Supabase session for Backend PASETO token
      try {
        const authApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const exchangeRes = await fetch(`${authApiUrl}/auth/supabase-exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: data.session.access_token,
            user_details: {
              full_name: data.session.user.user_metadata?.full_name || data.session.user.email,
              role: data.session.user.user_metadata?.role || 'user',
              company_name: data.session.user.user_metadata?.company_name || 'My Company',
            }
          })
        });

        if (exchangeRes.ok) {
          const exchangeData = await exchangeRes.json();
          if (exchangeData.access_token) {
            // Set the cookie on the response so client can access it
            response.cookies.set('zeyro_b2b_token', exchangeData.access_token, {
              path: '/',
              httpOnly: false, // Not httpOnly so frontend js can read it for API headers
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: exchangeData.expires_in || 86400
            });
            return response;
          }
        } else {
          console.error('Backend token exchange failed:', await exchangeRes.text());
        }
      } catch (err) {
        console.error('Backend token exchange error (backend might be down):', err);
      }

      // If we got here, token exchange failed. We should log them out of Supabase to prevent a broken session
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login?error=backend_down', origin));
    }
  }

  // Something went wrong — send back to login with an error hint
  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', origin))
}
