import { UserRole } from '../types';

export const ROLES: Record<string, UserRole> = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
  PARENT: 'parent',
  SECURITY: 'security',
  HOSTEL_WARDEN: 'warden',
  PLACEMENT_OFFICER: 'placement_officer',
  OTHER: 'other',
} as const;

export const ROLE_DETAILS: Record<
  UserRole,
  {
    name: string;
    label: string;
    description: string;
    badgeColor: string;
    defaultPath: string;
  }
> = {
  super_admin: {
    name: 'Super Administrator',
    label: 'SUPER ADMIN',
    description: 'Complete system, security, and institutional governance',
    badgeColor: 'bg-[#EAB308]/15 text-[#8a6d1a] border-[#EAB308]/40',
    defaultPath: '/admin',
  },
  admin: {
    name: 'Campus Administrator',
    label: 'ADMIN',
    description: 'Institution management, safety operations, and department oversight',
    badgeColor: 'bg-[#D4AF37]/15 text-[#8a6d1a] border-[#EAB308]/40',
    defaultPath: '/admin',
  },
  security: {
    name: 'Security Operations Officer',
    label: 'SECURITY',
    description: 'Live surveillance, incident dispatch, patrol logs, visitor access',
    badgeColor: 'bg-amber-500/15 text-[#B7791F] border-amber-500/40',
    defaultPath: '/security',
  },
  faculty: {
    name: 'Faculty Professor',
    label: 'FACULTY',
    description: 'Academic management, student attendance, grades, and classroom safety',
    badgeColor: 'bg-indigo-400/15 text-[#4338ca] border-indigo-400/40',
    defaultPath: '/faculty-dashboard',
  },
  student: {
    name: 'Undergraduate Student',
    label: 'STUDENT',
    description: 'Campus emergency SOS, incident reporting, timetable, and academics',
    badgeColor: 'bg-[#EAB308]/10 text-[#8a6d1a] border-[#EAB308]/30',
    defaultPath: '/student',
  },
  parent: {
    name: 'Parent / Guardian',
    label: 'PARENT',
    description: 'Student safety status, attendance observer, and grade portal',
    badgeColor: 'bg-teal-500/15 text-[#0f766e] border-teal-500/40',
    defaultPath: '/parent-portal',
  },
  warden: {
    name: 'Hostel Warden',
    label: 'HOSTEL WARDEN',
    description: 'Residential quarters, curfew tracking, room management, and security',
    badgeColor: 'bg-orange-500/15 text-[#c2410c] border-orange-500/40',
    defaultPath: '/hostel',
  },
  placement_officer: {
    name: 'Placement Officer',
    label: 'PLACEMENT OFFICER',
    description: 'Career drives, company drives, student eligibility, and recruitment',
    badgeColor: 'bg-[#D4AF37]/20 text-[#8a6d1a] border-[#EAB308]/40',
    defaultPath: '/placements',
  },
  other: {
    name: 'Institute Member',
    label: 'OTHER',
    description: 'Campus announcements, safety information, and personal profile',
    badgeColor: 'bg-[#E8E9E7] text-[#667085] border-[#D6D8D5]',
    defaultPath: '/member',
  },
};

/** Fine-grained permission flags per role. Frontend uses these for UX; backend/RLS enforce security. */
export const PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    'view_institution',
    'manage_users',
    'manage_roles',
    'manage_system_settings',
    'view_audit_logs',
    'view_analytics',
    'manage_incidents',
    'admin_erp',
    'view_all_students',
    'view_all_faculty',
    'manage_security',
  ],
  admin: [
    'view_institution',
    'manage_users',
    'view_audit_logs',
    'view_analytics',
    'manage_incidents',
    'admin_erp',
    'view_all_students',
    'view_all_faculty',
    'manage_security',
  ],
  security: ['manage_incidents', 'view_analytics', 'manage_security', 'view_visitors'],
  faculty: ['manage_own_attendance', 'view_students', 'manage_incidents', 'send_announcements', 'view_academic'],
  student: ['view_own_academic', 'report_incident', 'sos', 'view_announcements', 'view_campus_safety'],
  parent: ['view_linked_student', 'view_announcements', 'view_campus_safety'],
  warden: ['manage_hostel', 'view_students', 'manage_incidents', 'view_announcements', 'view_campus_safety'],
  placement_officer: ['manage_placements', 'view_announcements'],
  other: ['view_announcements', 'view_campus_safety', 'sos', 'contact_support'],
};

export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/admin': ['super_admin', 'admin'],
  '/member': ['other', 'super_admin', 'admin'],
  '/demo': ['super_admin', 'admin', 'security', 'faculty', 'student', 'parent', 'warden', 'placement_officer'],
  '/safety/command-center': ['super_admin', 'admin', 'security', 'faculty', 'student', 'warden', 'placement_officer', 'parent'],
  '/safety/emergency': ['super_admin', 'admin', 'security', 'faculty', 'warden'],
  '/safety/sos': ['student', 'faculty', 'super_admin', 'admin', 'warden', 'security', 'parent', 'placement_officer'],
  '/safety': ['super_admin', 'admin', 'security', 'faculty', 'student', 'other', 'warden', 'placement_officer', 'parent'],
  '/command-center': ['super_admin', 'admin', 'security', 'faculty', 'student', 'warden', 'placement_officer', 'parent'],
  '/incidents': ['super_admin', 'admin', 'security', 'faculty', 'student', 'warden', 'placement_officer'],
  '/campus-map': ['super_admin', 'admin', 'security', 'faculty', 'student', 'other', 'warden', 'placement_officer'],
  '/alerts': ['super_admin', 'admin', 'security', 'faculty', 'student', 'other', 'parent', 'warden', 'placement_officer'],
  '/safety-analytics': ['super_admin', 'admin', 'security', 'faculty'],
  '/analytics/safety': ['super_admin', 'admin', 'security', 'faculty', 'student', 'warden', 'placement_officer', 'parent'],
  '/safety/risk-intelligence': ['super_admin', 'admin', 'security', 'faculty', 'warden'],
  '/copilot': ['super_admin', 'admin', 'security', 'faculty', 'student', 'other', 'warden', 'placement_officer', 'parent'],
  '/sos': ['student', 'other', 'faculty', 'super_admin', 'admin', 'warden', 'security', 'parent', 'placement_officer'],
  '/visitors': ['super_admin', 'admin', 'security', 'student', 'faculty', 'warden'],
  '/security': ['super_admin', 'security', 'admin'],
  '/student': ['student', 'other', 'super_admin', 'admin', 'faculty', 'parent'],
  '/students': ['super_admin', 'admin', 'faculty', 'student', 'parent'],
  '/faculty': ['super_admin', 'admin', 'faculty', 'student'],
  '/faculty-dashboard': ['faculty', 'super_admin', 'admin'],
  '/attendance': ['super_admin', 'admin', 'faculty', 'student', 'parent'],
  '/exams': ['super_admin', 'admin', 'faculty', 'student', 'parent'],
  '/timetable': ['super_admin', 'admin', 'faculty', 'student', 'parent', 'warden'],
  '/courses': ['super_admin', 'admin', 'faculty', 'student', 'parent'],
  '/departments': ['super_admin', 'admin', 'faculty', 'student'],
  '/hostel': ['super_admin', 'admin', 'warden', 'student', 'faculty', 'parent'],
  '/transport': ['super_admin', 'admin', 'student', 'parent', 'faculty', 'warden'],
  '/complaints': ['super_admin', 'admin', 'faculty', 'student', 'other', 'warden', 'placement_officer'],
  '/placement': ['super_admin', 'admin', 'placement_officer', 'student'],
  '/placements': ['super_admin', 'admin', 'placement_officer', 'student'],
  '/announcements': ['super_admin', 'admin', 'faculty', 'student', 'other', 'parent', 'warden', 'placement_officer', 'security'],
  '/communication': ['super_admin', 'admin', 'faculty', 'student', 'parent', 'warden', 'placement_officer', 'security'],
  '/parent': ['parent', 'super_admin', 'admin'],
  '/parent-portal': ['parent', 'super_admin', 'admin'],
  '/wellbeing': ['student', 'other', 'faculty', 'super_admin', 'admin', 'warden', 'parent'],
  '/audit-logs': ['super_admin', 'admin'],
  '/settings': ['super_admin', 'admin', 'faculty', 'student', 'parent', 'security', 'warden', 'placement_officer'],
};

export function isRouteAllowed(path: string, role: UserRole): boolean {
  const cleanPath = path.split('?')[0];
  const basePath = '/' + cleanPath.split('/')[1];
  const allowedRoles = ROUTE_PERMISSIONS[cleanPath] || ROUTE_PERMISSIONS[basePath];
  if (!allowedRoles) return true;
  return allowedRoles.includes(role);
}
