'use client';

import { useAuth } from './use-auth';
import { UserRole } from '../types';
import { ROLE_DETAILS, PERMISSIONS, isRouteAllowed } from '../constants/roles';

export function useRole() {
  const { role, user, switchRole } = useAuth();

  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin' || isSuperAdmin;
  const isSecurity = role === 'security';
  const isFaculty = role === 'faculty';
  const isStudent = role === 'student';
  const isParent = role === 'parent';
  const isWarden = role === 'warden';
  const isPlacementOfficer = role === 'placement_officer';

  const roleMeta = role ? ROLE_DETAILS[role] : null;

  const permissions = role ? PERMISSIONS[role] ?? [] : [];

  /** UX-level permission check. Backend/RLS is the real enforcement layer. */
  const can = (permission: string): boolean => permissions.includes(permission);

  const canAccess = (path: string): boolean => {
    if (!role) return false;
    return isRouteAllowed(path, role);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!role) return false;
    return roles.includes(role);
  };

  return {
    role,
    user,
    roleMeta,
    permissions,
    can,
    isSuperAdmin,
    isAdmin,
    isSecurity,
    isFaculty,
    isStudent,
    isParent,
    isWarden,
    isPlacementOfficer,
    canAccess,
    hasAnyRole,
    switchRole,
  };
}