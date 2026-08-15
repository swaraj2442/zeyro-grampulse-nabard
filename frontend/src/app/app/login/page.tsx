"use client"
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import AuthLayout from '@/components/AuthLayout';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'backend_down') {
      setError('Authentication failed: The backend server is currently unreachable. Please start the backend and try again.');
    } else if (errorParam) {
      setError('An error occurred during authentication.');
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        }
      });
      if (error) throw error;
      // Note: For OAuth, the redirect handles the routing. We'll add a layout check later if needed,
      // but if the user has `onboarding_completed`, we ideally route them to the dashboard.
      // Since `signInWithOAuth` redirects away, we handle metadata checks post-redirect in the dashboard layout.
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.session) {
        const isCompleted = data.session.user.user_metadata?.onboarding_completed === true;
        console.log("Login onboarding_completed:", data.session.user.user_metadata?.onboarding_completed, "isCompleted:", isCompleted);
        
        if (isCompleted) {
          router.push('/bfs-dashboard');
        } else {
          router.push('/bfs-dashboard/onboarding');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full flex flex-col gap-3">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center mb-2">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="relative w-full flex items-center justify-center gap-3 py-3.5 bg-[#1a1a1a] text-white rounded-full font-medium transition-all hover:bg-[#222] disabled:opacity-70 text-sm shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] border border-[#333]"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        <button
          className="relative w-full flex items-center justify-center gap-3 py-3.5 bg-[#1a1a1a] text-white rounded-full font-medium transition-all hover:bg-[#222] disabled:opacity-70 text-sm shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] border border-[#333]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          Sign in with GitHub
        </button>

        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative bg-gray-50 px-3 text-[11px] uppercase tracking-wider text-gray-400 font-medium">
            Or
          </div>
        </div>

        {!showEmailForm ? (
          <button
            onClick={() => setShowEmailForm(true)}
            className="relative w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-b from-white to-gray-100 text-gray-800 rounded-full font-medium transition-all hover:to-gray-200 text-sm shadow-[0_2px_4px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,1)] border border-gray-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            Continue with email
          </button>
        ) : (
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all text-sm shadow-sm"
              placeholder="Email address"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all text-sm shadow-sm"
              placeholder="Password"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-medium transition-colors disabled:opacity-70 text-sm shadow-md"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
