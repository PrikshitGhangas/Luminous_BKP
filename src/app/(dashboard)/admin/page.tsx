'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRole } from '@/lib/hooks/use-role';
import { useSafety } from '@/lib/context/safety-context';
import { useAcademic } from '@/lib/context/academic-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/shared/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/shared/drawer';
import {
  Users,
  Flame,
  BellRing,
  Activity,
  Clock,
  ShieldCheck,
  Settings,
  BarChart3,
  ScrollText,
  UserCog,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, roleMeta } = useRole();
  const { incidents, alerts, notifications } = useSafety();
  const { students, faculty } = useAcademic();

  const [notifDrawer, setNotifDrawer] = useState(false);

  const activeIncidents = incidents.filter(
    (i) => i.status !== 'resolved' && i.status !== 'closed' && i.status !== 'false_alarm'
  );
  const criticalAlerts = alerts.filter((a) => a.is_active && a.severity !== 'low');
  const todayAlerts = alerts.filter((a) => a.is_active).length;
  const unreadNotifs = notifications.filter((n) => !n.read);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6">
      {/* Greeting + institution status */}
      <div className="border-b border-[#D6D8D5] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1F2933]">
          {greeting}, {firstName}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#667085]">
          <ShieldCheck className="h-4 w-4 text-[#3F8F68]" />
          <span>Institution Status:</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-[#3F8F68]">
            <span className="h-2 w-2 rounded-full bg-[#3F8F68]" />
            All systems operational
          </span>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Active Users"
          value={students.length + faculty.length}
          icon={<Users className="h-5 w-5" />}
          variant="primary"
        />
        <StatCard
          title="Open Incidents"
          value={activeIncidents.length}
          icon={<Flame className="h-5 w-5" />}
          variant="warning"
        />
        <StatCard
          title="Today's Alerts"
          value={todayAlerts}
          icon={<BellRing className="h-5 w-5" />}
          variant="critical"
        />
        <StatCard
          title="System Health"
          value="Operational"
          icon={<Activity className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          title="Unread Notifications"
          value={unreadNotifs.length}
          icon={<BellRing className="h-5 w-5" />}
        />
      </div>

      {/* Quick actions — only the most frequent */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/students">
            <UserCog className="h-4 w-4" /> Manage Users
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link href="/incidents">
            <Flame className="h-4 w-4" /> Review Incidents
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link href="/alerts">
            <BarChart3 className="h-4 w-4" /> View Reports
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link href="/settings">
            <Settings className="h-4 w-4" /> System Settings
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Critical alerts — attention only */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#C94C4C]" />
              Critical Alerts
            </CardTitle>
            <Link href="/alerts" className="flex items-center gap-1 text-xs font-medium text-[#8a6d1a] hover:underline">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-3">
            {criticalAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="text-xs text-[#3F8F68] font-semibold">No critical alerts</div>
                <p className="mt-1 text-xs text-[#8A9199]">Everything requiring attention would appear here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {criticalAlerts.slice(0, 4).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-[#D6D8D5] bg-white p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#C94C4C]">{a.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-[#667085]">{a.message}</p>
                    </div>
                    <Badge variant={a.severity === 'high' ? 'high' : a.severity === 'critical' ? 'critical' : 'warning'}>
                      {a.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#8a6d1a]" />
              Recent Activity
            </CardTitle>
            <span className="text-xs text-[#8A9199]">{notifications.length} items</span>
          </CardHeader>
          <CardContent className="p-3">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8A9199]">No recent activity.</div>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="rounded-lg border border-[#D6D8D5] p-2.5">
                    <p className="text-xs font-semibold text-[#1F2933]">{n.title}</p>
                    <p className="line-clamp-1 text-[11px] text-[#667085] mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full gap-1 text-xs"
              onClick={() => setNotifDrawer(true)}
            >
              View all notifications <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Secondary info behind an expandable / view-all drawer */}
      <Card>
        <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#D4AF37]" />
            Administration
          </CardTitle>
          <span className="text-xs text-[#8A9199]">{roleMeta?.label}</span>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <Button asChild variant="outline" size="sm" className="justify-start gap-2">
              <Link href="/audit-logs"><ScrollText className="h-4 w-4" /> Audit Logs</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="justify-start gap-2">
              <Link href="/analytics/safety"><BarChart3 className="h-4 w-4" /> Analytics</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="justify-start gap-2">
              <Link href="/settings"><Settings className="h-4 w-4" /> System Settings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Drawer
        open={notifDrawer}
        onClose={() => setNotifDrawer(false)}
        title="All Notifications"
      >
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-sm text-[#8A9199]">No notifications.</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="rounded-lg border border-[#D6D8D5] p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-[#1F2933]">{n.title}</p>
                  <Badge variant={n.read ? 'secondary' : 'gold'} className="text-[10px]">
                    {n.read ? 'Read' : 'New'}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-[#667085]">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </Drawer>
    </div>
  );
}