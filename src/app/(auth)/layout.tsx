import React from 'react';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F1F2F0] text-[#1F2933] antialiased selection:bg-[#EAB308] selection:text-[#111827]">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-[#D6D8D5] bg-white/90 px-6 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#F4C430] via-[#EAB308] to-[#D4AF37] text-[#111827] shadow-sm shadow-[#D4AF37]/30">
            <Sparkles className="h-5 w-5 font-bold" />
          </div>
          <span className="font-bold text-sm text-[#1F2933] tracking-tight">
            Luminous <span className="text-[#8a6d1a]">AI</span>
          </span>
        </Link>
        <div className="text-xs text-[#667085]">Institutional Portal Access</div>
      </header>

      {/* Main Form Center */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#D6D8D5] py-4 text-center text-[11px] text-[#667085] bg-white">
        Secured with End-to-End Encryption &amp; Supabase RBAC
      </footer>
    </div>
  );
}