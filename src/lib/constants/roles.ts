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
    badgeColor: 'bg-[#D4AF37]/15 text-[#FFD700] border-[#D4AF37]/40',
    defaultPath: '/safety/command-center',
  },
  admin: {
    name: 'Campus Administrator',
    label: 'ADMIN',
    description: 'Institution management, safety operations, and department oversight',
    badgeColor: 'bg-[#C5A059]/15 text-[#C5A059] border-[#C5A059]/40',
    defaultPath: '/safety/command-center',
  },
  security: {
    name: 'Security Operations Officer',
    label: 'SECURITY',
    description: 'Live surveillance, incident dispatch, patrol logs, visitor access',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    defaultPath: '/security',
  },
  faculty: {
    name: 'Faculty Professor',
    label: 'FACULTY',
    description: 'Academic management, student attendance, grades, and classroom safety',
    badgeColor: 'bg-indigo-400/15 text-indigo-200 border-indigo-400/40',
    defaultPath: '/attendance',
  },
  student: {
    name: 'Undergraduate Student',
    label: 'STUDENT',
    description: 'Campus emergency SOS, incident reporting, timetable, and academics',
    badgeColor: 'bg-[#D4AF37]/10 text-[#F4F1DE] border-[#D4AF37]/30',
    defaultPath: '/sos',
  },
  parent: {
    name: 'Parent / Guardian',
    label: 'PARENT',
    description: 'Student safety status, attendance observer, and grade portal',
    badgeColor: 'bg-teal-500/15 text-teal-200 border-teal-500/40',
    defaultPath: '/parent-portal',
  },
  warden: {
    name: 'Hostel Warden',
    label: 'HOSTEL WARDEN',
    description: 'Residential quarters, curfew tracking, room management, and security',
    badgeColor: 'bg-orange-500/15 text-orange-200 border-orange-500/40',
    defaultPath: '/hostel',
  },
  placement_officer: {
    name: 'Placement Officer',
    label: 'PLACEMENT OFFICER',
    description: 'Career drives, company drives, student eligibility, and recruitment',
    badgeColor: 'bg-[#C5A059]/20 text-[#FFD700] border-[#C5A059]/40',
    defaultPath: '/placements',
  },
};

export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/demo': ['super_admin', 'admin', 'security', 'faculty', 'student', 'parent', 'warden', 'placement_officer'],
  '/safety/command-center': ['super_admin', 'admin', 'security', 'faculty', 'student', 'warden', 'placement_officer', 'parent'],
  '/safety/emergency': ['super_admin', 'admin', 'security', 'faculty', 'warden'],
  '/safety/sos': ['student', 'faculty', 'super_admin', 'admin', 'warden', 'security', 'parent', 'placement_officer'],
  '/safety': ['super_admin', 'admin', 'security', 'faculty', 'student', 'warden', 'placement_officer', 'parent'],
  '/command-center': ['super_admin', 'admin', 'security', 'faculty', 'student', 'warden', 'placement_officer', 'parent'],
  '/incidents': ['super_admin', 'admin', 'security', 'faculty', 'student', 'warden', 'placement_officer'],
  '/campus-map': ['super_admin', 'admin', 'security', 'faculty', 'student', 'warden', 'placement_officer'],
  '/alerts': ['super_admin', 'admin', 'security', 'faculty', 'student', 'parent', 'warden', 'placement_officer'],
  '/safety-analytics': ['super_admin', 'admin', 'security', 'faculty'],
  '/analytics/safety': ['super_admin', 'admin', 'security', 'faculty', 'student', 'warden', 'placement_officer', 'parent'],
  '/safety/risk-intelligence': ['super_admin', 'admin', 'security', 'faculty', 'warden'],
  '/copilot': ['super_admin', 'admin', 'security', 'faculty', 'student', 'warden', 'placement_officer', 'parent'],
  '/sos': ['student', 'faculty', 'super_admin', 'admin', 'warden', 'security', 'parent', 'placement_officer'],
  '/visitors': ['super_admin', 'admin', 'security', 'student', 'faculty', 'warden'],
  '/security': ['super_admin', 'security', 'admin'],
  '/student': ['student', 'super_admin', 'admin', 'faculty', 'parent'],
  '/students': ['super_admin', 'admin', 'faculty', 'student', 'parent'],
  '/faculty': ['super_admin', 'admin', 'faculty', 'student'],
  '/attendance': ['super_admin', 'admin', 'faculty', 'student', 'parent'],
  '/exams': ['super_admin', 'admin', 'faculty', 'student', 'parent'],
  '/timetable': ['super_admin', 'admin', 'faculty', 'student', 'parent', 'warden'],
  '/courses': ['super_admin', 'admin', 'faculty', 'student', 'parent'],
  '/departments': ['super_admin', 'admin', 'faculty', 'student'],
  '/hostel': ['super_admin', 'admin', 'warden', 'student', 'faculty', 'parent'],
  '/transport': ['super_admin', 'admin', 'student', 'parent', 'faculty', 'warden'],
  '/complaints': ['super_admin', 'admin', 'faculty', 'student', 'warden', 'placement_officer'],
  '/placement': ['super_admin', 'admin', 'placement_officer', 'student'],
  '/placements': ['super_admin', 'admin', 'placement_officer', 'student'],
  '/announcements': ['super_admin', 'admin', 'faculty', 'student', 'parent', 'warden', 'placement_officer', 'security'],
  '/communication': ['super_admin', 'admin', 'faculty', 'student', 'parent', 'warden', 'placement_officer', 'security'],
  '/parent': ['parent', 'super_admin', 'admin'],
  '/parent-portal': ['parent', 'super_admin', 'admin'],
  '/wellbeing': ['student', 'faculty', 'super_admin', 'admin', 'warden', 'parent'],
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
