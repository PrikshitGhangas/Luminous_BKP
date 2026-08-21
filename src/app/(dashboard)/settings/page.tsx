'use client';

import React from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { user, role } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="border-b border-[#243356] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F1DE] font-mono flex items-center gap-2">
          <Settings className="h-6 w-6 text-[#FFD700]" />
          <span>ACCOUNT &amp; SAFETY SETTINGS</span>
        </h1>
        <p className="text-xs text-[#B8B5A3] mt-1">
          Configure multi-factor authentication, emergency contacts, and notifications
        </p>
      </div>

      <Card>
        <CardHeader className="p-4 pb-2 border-b border-[#243356]">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#F4F1DE] font-mono">
            <Shield className="h-4 w-4 text-[#FFD700]" />
            <span>Profile Identity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#F4F1DE]">Full Name</label>
              <Input defaultValue={user?.full_name} />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#F4F1DE]">Role Assigned</label>
              <Input value={role || 'N/A'} disabled className="bg-[#0F1026] text-[#FFD700] font-mono" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#F4F1DE]">Department / Unit</label>
            <Input defaultValue={user?.department || 'N/A'} />
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" className="bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#0B132B] font-bold text-xs">
              Save Profile Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
