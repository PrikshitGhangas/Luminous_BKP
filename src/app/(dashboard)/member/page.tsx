'use client';

import React from 'react';
import Link from 'next/link';
import { useRole } from '@/lib/hooks/use-role';
import { useAuth } from '@/lib/context/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Megaphone,
  ShieldCheck,
  HeartPulse,
  Phone,
  MapPin,
  User,
} from 'lucide-react';

export default function MemberDashboardPage() {
  const { user } = useAuth();
  const { roleMeta } = useRole();

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="border-b border-[#D6D8D5] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1F2933]">
          Welcome, {user?.full_name?.split(' ')[0] || 'there'}
        </h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-[#667085]">
          <Badge variant="secondary" className="text-[10px]">{roleMeta?.label}</Badge>
          <span>{user?.email}</span>
        </div>
      </div>

      {/* Primary actions */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Button asChild size="sm" variant="emergency" className="gap-1.5">
          <Link href="/safety/sos"><HeartPulse className="h-4 w-4 animate-pulse" /> Emergency SOS</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link href="/complaints"><Phone className="h-4 w-4" /> Contact Support</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Announcements */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-[#D6D8D5] p-4">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#1F2933]">
              <Megaphone className="h-4 w-4 text-[#8a6d1a]" />
              Announcements
            </CardTitle>
            <Link href="/announcements" className="flex items-center gap-1 text-xs font-medium text-[#8a6d1a] hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-2 p-4">
            <div className="rounded-lg border border-[#D6D8D5] p-3">
              <p className="text-sm font-semibold text-[#1F2933]">Mid-term exam roster published</p>
              <p className="text-xs text-[#667085] mt-0.5">Official timetable for CS &amp; AI departments.</p>
            </div>
            <div className="rounded-lg border border-[#D6D8D5] p-3">
              <p className="text-sm font-semibold text-[#1F2933]">Campus maintenance notice</p>
              <p className="text-xs text-[#667085] mt-0.5">Main entrance closed this weekend for repairs.</p>
            </div>
          </CardContent>
        </Card>

        {/* Safety + profile */}
        <div className="space-y-5">
          <Card>
            <CardHeader className="border-b border-[#D6D8D5] p-4">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#1F2933]">
                <ShieldCheck className="h-4 w-4 text-[#3F8F68]" />
                Safety Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-[#3F8F68]">● Campus secure</p>
              <Button asChild size="sm" variant="outline" className="mt-3 w-full gap-1.5">
                <Link href="/campus-map"><MapPin className="h-4 w-4" /> View campus map</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-[#D6D8D5] p-4">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#1F2933]">
                <User className="h-4 w-4 text-[#667085]" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4 text-sm">
              <div>
                <p className="text-xs text-[#8A9199]">Name</p>
                <p className="text-[#1F2933]">{user?.full_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-[#8A9199]">Email</p>
                <p className="text-[#1F2933]">{user?.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-[#8A9199]">Role</p>
                <p className="text-[#1F2933]">{roleMeta?.name || '—'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}