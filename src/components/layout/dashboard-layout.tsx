'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { AlertBanner } from '../shared/alert-banner';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRole } from '@/lib/hooks/use-role';
import { LoadingSpinner } from '../shared/loading';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShieldAlert, ArrowLeft, Radio, HeartPulse, UserCheck } from 'lucide-react';
import Link from 'next/link';

import { AcademicProvider } from '@/lib/context/academic-context';
import { CampusServicesProvider } from '@/lib/context/campus-services-context';
import { CampusShieldCopilot } from '@/components/copilot/campus-shield-copilot';
import { DemoModeBanner } from '@/components/shared/demo-mode-banner';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isDemoMode } = useAuth();
  const { role, roleMeta, canAccess } = useRole();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F1F2F0]">
        <LoadingSpinner text="Authenticating Luminous AI..." />
      </div>
    );
  }

  const isAllowed = !mounted || canAccess(pathname);

  return (
    <AcademicProvider>
      <CampusServicesProvider>
        <div className="min-h-screen bg-[#F1F2F0] text-[#1F2933] antialiased font-sans">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <Sidebar
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </div>

          {/* Mobile Drawer Backdrop & Sidebar */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="relative z-50 h-full w-72">
                <Sidebar
                  isCollapsed={false}
                  onToggleCollapse={() => setIsMobileMenuOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div
            className={cn(
              'flex flex-col transition-all duration-300 min-h-screen',
              isSidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
            )}
          >
            <Topbar onToggleMobileMenu={() => setIsMobileMenuOpen(true)} />
            <AlertBanner />
            {isDemoMode && <DemoModeBanner />}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {!isAllowed ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white border border-[#C94C4C]/40 rounded-2xl shadow-sm space-y-5 max-w-2xl mx-auto my-8">
                  <div className="h-16 w-16 rounded-full bg-[#C94C4C]/10 border-2 border-[#C94C4C]/40 flex items-center justify-center text-[#C94C4C]">
                    <ShieldAlert className="h-8 w-8" />
                  </div>

                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C94C4C]/10 border border-[#C94C4C]/30 text-[#C94C4C] text-xs font-bold">
                      <span>RBAC RESTRICTION • HTTP 403 FORBIDDEN</span>
                    </div>
                    <h2 className="text-2xl font-bold text-[#1F2933]">
                      {!user ? 'AUTHENTICATION REQUIRED' : 'CLEARANCE LEVEL INSUFFICIENT'}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#667085] max-w-md mx-auto">
                      {!user ? (
                        <>You must sign in or select a demo persona to access <code className="text-[#8a6d1a] bg-[#F7F8F6] px-1.5 py-0.5 rounded">{pathname}</code>.</>
                      ) : (
                        <>Your active persona ({roleMeta?.name || role}) does not have security authorization to access <code className="text-[#8a6d1a] bg-[#F7F8F6] px-1.5 py-0.5 rounded">{pathname}</code>.</>
                      )}
                    </p>
                  </div>

                  {role === 'security' && (
                    <div className="bg-[#F7F8F6] border border-[#D6D8D5] rounded-xl p-3.5 text-xs text-left max-w-md text-[#667085] space-y-1">
                      <div className="font-bold text-[#8a6d1a] flex items-center gap-1.5">
                        <UserCheck className="h-4 w-4" />
                        <span>Security Officer Protocol Notice:</span>
                      </div>
                      <p className="text-[11px]">
                        Security officers are granted tactical surveillance, dispatch, and visitor clearance only. University governance, audit logs, and academic records require Super Administrator privileges.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.back()}
                      className="text-xs gap-1.5"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Go Back</span>
                    </Button>

                    {!user ? (
                      <>
                        <Button asChild size="sm" className="gap-1.5">
                          <Link href={`/login?next=${encodeURIComponent(pathname)}`}>
                            <span>Sign In</span>
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                          <Link href="/">
                            <span>Launch Demo</span>
                          </Link>
                        </Button>
                      </>
                    ) : role === 'security' ? (
                      <Button asChild size="sm" className="gap-1.5">
                        <Link href="/security">
                          <Radio className="h-3.5 w-3.5" />
                          <span>Open Security Desk</span>
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" className="gap-1.5">
                        <Link href={roleMeta?.defaultPath || '/safety/sos'}>
                          <HeartPulse className="h-3.5 w-3.5" />
                          <span>Return to Authorized Portal</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                children
              )}
            </main>
          </div>
          {/* Global CampusShield AI Copilot Widget */}
          <CampusShieldCopilot />
        </div>
      </CampusServicesProvider>
    </AcademicProvider>
  );
}
