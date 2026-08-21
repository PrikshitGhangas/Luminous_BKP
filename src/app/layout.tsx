import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/context/auth-context';
import { SafetyProvider } from '@/lib/context/safety-context';

export const metadata: Metadata = {
  title: 'CampusShield AI / Luminous — Intelligent Campus ERP & Safety Command Center',
  description:
    'Next-generation institutional AI-powered smart college ERP, safety command center, incident triage, and student safety platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full min-h-screen bg-[#F1F2F0] text-[#1F2933] font-sans antialiased selection:bg-[#EAB308] selection:text-[#111827]">
        <AuthProvider>
          <SafetyProvider>{children}</SafetyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
