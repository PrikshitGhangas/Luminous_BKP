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
      <div className="border-b border-[#D6D8D5] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F2933] flex items-center gap-2">
          <Settings className="h-6 w-6 text-[#8a6d1a]" />
          <span>Account Settings</span>
        </h1>
        <p className="text-xs text-[#667085] mt-1">
          Configure profile details, emergency contacts, and notifications.
        </p>
      </div>

      <Card className="bg-white border-[#D6D8D5]">
        <CardHeader className="p-4 pb-2 border-b border-[#D6D8D5]">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#1F2933]">
            <Shield className="h-4 w-4 text-[#8a6d1a]" />
            <span>Profile Identity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#1F2933]">Full Name</label>
              <Input defaultValue={user?.full_name} className="border-[#D6D8D5]" />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#1F2933]">Role Assigned</label>
              <Input value={role || 'N/A'} disabled className="bg-[#F7F8F6] text-[#8a6d1a] border-[#D6D8D5]" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#1F2933]">Department / Unit</label>
            <Input defaultValue={user?.department || 'N/A'} className="border-[#D6D8D5]" />
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" className="bg-[#EAB308] hover:bg-[#D4AF37] text-[#111827] font-bold text-xs">
              Save Profile Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
