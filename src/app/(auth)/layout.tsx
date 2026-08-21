import React from 'react';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0B132B] text-[#F4F1DE] antialiased selection:bg-[#D4AF37] selection:text-[#0B132B]">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-[#243356] bg-[#0B132B]/90 px-6 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD700] via-[#D4AF37] to-[#C5A059] shadow-md shadow-[#D4AF37]/25 text-[#0B132B]">
            <Sparkles className="h-5 w-5 font-bold" />
          </div>
          <span className="font-bold text-sm text-[#F4F1DE] tracking-tight font-mono">
            Luminous <span className="text-[#FFD700]">AI</span>
          </span>
        </Link>
        <div className="text-xs text-[#C5A059] font-mono">Institutional Portal Access</div>
      </header>

      {/* Main Form Center */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#243356] py-4 text-center text-[11px] text-[#B8B5A3] font-mono bg-[#0B132B]">
        Secured with End-to-End Encryption &amp; Supabase RBAC
      </footer>
    </div>
  );
}
