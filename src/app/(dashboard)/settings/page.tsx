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
      <div className="border-b border-[#D0D1D6] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202226] font-mono flex items-center gap-2">
          <Settings className="h-6 w-6 text-[#B45309]" />
          <span>ACCOUNT &amp; SAFETY SETTINGS</span>
        </h1>
        <p className="text-xs text-[#555960] mt-1">
          Configure multi-factor authentication, emergency contacts, and notifications
        </p>
      </div>

      <Card>
        <CardHeader className="p-4 pb-2 border-b border-[#D0D1D6]">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#202226] font-mono">
            <Shield className="h-4 w-4 text-[#B45309]" />
            <span>Profile Identity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#202226]">Full Name</label>
              <Input defaultValue={user?.full_name} />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#202226]">Role Assigned</label>
              <Input value={role || 'N/A'} disabled className="bg-[#F4F5F6] text-[#B45309] font-mono" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#202226]">Department / Unit</label>
            <Input defaultValue={user?.department || 'N/A'} />
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" className="bg-gradient-to-r from-[#EAB308] to-[#D4AF37] text-[#0B132B] font-bold text-xs">
              Save Profile Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
