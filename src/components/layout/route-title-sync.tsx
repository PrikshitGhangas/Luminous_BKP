'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Luminous AI',
  '/login': 'Sign In | Luminous AI',
  '/register': 'Sign Up | Luminous AI',
  '/forgot-password': 'Forgot Password | Luminous AI',
  '/reset-password': 'Reset Password | Luminous AI',
  '/student': 'Student Dashboard | Luminous AI',
  '/faculty-dashboard': 'Faculty Dashboard | Luminous AI',
  '/faculty': 'Faculty Directory | Luminous AI',
  '/security': 'Security Dashboard | Luminous AI',
  '/admin': 'Admin Dashboard | Luminous AI',
  '/campus-map': 'Campus Map | Luminous AI',
  '/incidents': 'Incidents | Luminous AI',
  '/copilot': 'AI Copilot | Luminous AI',
  '/dashboard': 'Dashboard | Luminous AI',
  '/safety/command-center': 'Campus Safety Desk | Luminous AI',
  '/safety/emergency': 'Emergency Dispatch | Luminous AI',
  '/safety/risk-intelligence': 'Risk Intelligence | Luminous AI',
  '/safety/sos': 'SOS Alert Center | Luminous AI',
  '/analytics/safety': 'Safety Analytics | Luminous AI',
  '/announcements': 'Announcements | Luminous AI',
  '/attendance': 'Attendance | Luminous AI',
  '/audit-logs': 'Audit Logs | Luminous AI',
  '/complaints': 'Complaints & Grievances | Luminous AI',
  '/courses': 'Courses | Luminous AI',
  '/departments': 'Departments | Luminous AI',
  '/exams': 'Examinations | Luminous AI',
  '/hostel': 'Hostel Management | Luminous AI',
  '/member': 'Member Profile | Luminous AI',
  '/parent': 'Parent Portal | Luminous AI',
  '/placement': 'Placement & Careers | Luminous AI',
  '/settings': 'Settings | Luminous AI',
  '/students': 'Student Directory | Luminous AI',
  '/timetable': 'Timetable | Luminous AI',
  '/wellbeing': 'Student Wellbeing | Luminous AI',
  '/demo': 'Role Explorer | Luminous AI',
};

export function RouteTitleSync() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const matchedTitle = ROUTE_TITLES[pathname];
      if (matchedTitle) {
        document.title = matchedTitle;
      } else {
        document.title = 'Luminous AI';
      }
    }
  }, [pathname]);

  return null;
}
