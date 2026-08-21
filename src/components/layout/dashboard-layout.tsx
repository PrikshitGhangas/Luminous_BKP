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

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const { role, roleMeta, canAccess } = useRole();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0B132B]">
        <LoadingSpinner text="Authenticating Luminous AI..." />
      </div>
    );
  }

  const isAllowed = canAccess(pathname);

  return (
    <AcademicProvider>
      <CampusServicesProvider>
        <div className="min-h-screen bg-[#0B132B] text-[#F4F1DE] antialiased font-sans">
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
                className="fixed inset-0 bg-black/70 backdrop-blur-xs"
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
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {!isAllowed ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-[#0F1026] border border-red-500/30 rounded-2xl shadow-2xl space-y-5 max-w-2xl mx-auto my-8">
                  <div className="h-16 w-16 rounded-full bg-red-950/80 border-2 border-red-500/60 flex items-center justify-center text-red-400 shadow-xl shadow-red-900/40 animate-pulse">
                    <ShieldAlert className="h-8 w-8" />
                  </div>

                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold">
                      <span>RBAC RESTRICTION • HTTP 403 FORBIDDEN</span>
                    </div>
                    <h2 className="text-2xl font-bold text-[#F4F1DE] font-mono">
                      CLEARANCE LEVEL INSUFFICIENT
                    </h2>
                    <p className="text-xs sm:text-sm text-[#B8B5A3] max-w-md mx-auto">
                      Your active persona ({roleMeta?.name || role}) does not have security authorization to access{' '}
                      <code className="text-[#FFD700] bg-[#1C2541] px-1.5 py-0.5 rounded font-mono">{pathname}</code>.
                    </p>
                  </div>

                  {role === 'security' && (
                    <div className="bg-[#131C38] border border-[#243356] rounded-xl p-3.5 text-xs text-left max-w-md text-[#B8B5A3] space-y-1 font-mono">
                      <div className="font-bold text-[#FFD700] flex items-center gap-1.5">
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
                      className="text-xs gap-1.5 border-[#243356]"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Go Back</span>
                    </Button>

                    {role === 'security' ? (
                      <Button asChild size="sm" className="bg-[#D4AF37] hover:bg-[#C5A059] text-[#0B132B] font-bold text-xs gap-1.5">
                        <Link href="/security">
                          <Radio className="h-3.5 w-3.5" />
                          <span>Open Security Desk</span>
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" className="bg-[#D4AF37] hover:bg-[#C5A059] text-[#0B132B] font-bold text-xs gap-1.5">
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
