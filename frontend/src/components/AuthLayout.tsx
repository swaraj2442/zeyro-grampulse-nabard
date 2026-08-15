"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  return (
    <div className="min-h-screen flex bg-gray-50 p-2 md:p-4">
      {/* Left Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative rounded-[32px] overflow-hidden bg-gray-900">
        <img 
          src="/o1.jpg" 
          alt="Zeyro Background" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>

      {/* Right Panel (Auth Form) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative">
        <div className="w-full max-w-[360px] flex flex-col items-center">
          
          <h2 className="text-4xl font-normal text-gray-900 mb-2" style={{ fontFamily: 'var(--font-syne, Georgia, serif)' }}>
            Zeyro
          </h2>
          <p className="text-gray-500 text-[15px] mb-8">Let's build your company.</p>

          {/* Segmented Control */}
          <div className="flex items-center bg-gray-100/80 p-1 rounded-full mb-10 w-64 border border-gray-200/50">
            <Link 
              href="/login"
              className={`flex-1 py-1.5 text-center text-sm font-medium rounded-full transition-all ${isLogin ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Sign In
              </span>
            </Link>
            <Link 
              href="/signup"
              className={`flex-1 py-1.5 text-center text-sm font-medium rounded-full transition-all ${!isLogin ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                Sign Up
              </span>
            </Link>
          </div>

          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {children}
          </motion.div>

          <p className="text-center text-gray-400 text-[10px] mt-8">
            By continuing you agree to our<br/>
            <Link href="#" className="underline hover:text-gray-600">Privacy Policy</Link> and <Link href="#" className="underline hover:text-gray-600">Terms of Service</Link>
          </p>
        </div>
        
        {/* Footer Text */}
        <div className="absolute bottom-8 text-center text-gray-400 text-xs" style={{ fontFamily: 'var(--font-syne, Georgia, serif)' }}>
          The General Intelligence<br/>Company of New York
        </div>
      </div>
    </div>
  );
}
