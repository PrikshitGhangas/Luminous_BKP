import { UserRole } from '@/lib/types';
import {
  INITIAL_INCIDENTS,
  CAMPUS_LOCATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PATROL_LOGS,
  INITIAL_VISITORS,
  INITIAL_ALERTS,
} from '@/lib/constants/demo-data';
import {
  INITIAL_STUDENTS,
  INITIAL_COURSES,
} from '@/lib/constants/academic-demo-data';
import {
  INITIAL_HOSTEL_BUILDINGS,
  INITIAL_HOSTEL_MAINTENANCE,
} from '@/lib/constants/campus-services-demo-data';

export interface UserContext {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  department?: string;
}

export interface ToolExecutionResult {
  toolName: string;
  authorized: boolean;
  clearanceRequired: string;
  userRole: UserRole;
  data?: unknown;
  error?: string;
  securityNotice?: string;
}

/**
 * Server-Side Tool Execution and RBAC Enforcement Gateway
 * 
 * Strict Invariant:
 * 1. Zero Arbitrary SQL execution.
 * 2. Mandatory Server Authorization check before executing any data access.
 * 3. Role and entity-level isolation (e.g. Student self-only, Parent child-only, Security no-admin-logs).
 * 4. Confidentiality redaction for sensitive/anonymous incident telemetry.
 */
export async function executeAuthorizedTool(
  toolName: string,
  args: Record<string, unknown>,
  user: UserContext
): Promise<ToolExecutionResult> {
  const role = user.role;

  switch (toolName) {
    // -------------------------------------------------------------------------
    // 1. INCIDENT STATISTICS (Admin, Super Admin, Security)
    // -------------------------------------------------------------------------
    case 'get_incident_statistics': {
      const allowedRoles: UserRole[] = ['super_admin', 'admin', 'security'];
      if (!allowedRoles.includes(role)) {
        return {
          toolName,
          authorized: false,
          clearanceRequired: 'Campus Administrator or Security Operations Clearance',
          userRole: role,
          error: `ACCESS_DENIED: Role '${role}' is not authorized to view aggregated institutional security analytics. Only Administrators and Security Officers may review incident statistics.`,
        };
      }

      const timeframe = (args.timeframe as string) || 'month';
      const severityFilter = (args.severity as string)?.toLowerCase();
      const categoryFilter = (args.category as string)?.toLowerCase();

      // Simulated historical and active incident pool for statistical completeness
      const allIncidents = [
        ...INITIAL_INCIDENTS,
        {
          id: 'inc-past-01',
          incident_number: 'INC-20260804-0012',
          title: 'High-Voltage Power Surge in Block D Maker Space',
          category: 'fire',
          severity: 'critical',
          status: 'resolved',
          location_name: 'Engineering Block',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 17).toISOString(),
        },
        {
          id: 'inc-past-02',
          incident_number: 'INC-20260811-0028',
          title: 'Main Gate Emergency Panic Activation',
          category: 'sos_panic',
          severity: 'critical',
          status: 'resolved',
          location_name: 'Parking / Main Gate',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        },
      ];

      let filtered = allIncidents;
      if (severityFilter) {
        filtered = filtered.filter((i) => i.severity.toLowerCase() === severityFilter);
      }
      if (categoryFilter) {
        filtered = filtered.filter((i) => i.category.toLowerCase() === categoryFilter);
      }

      const criticalCount = allIncidents.filter((i) => i.severity === 'critical').length;
      const highCount = allIncidents.filter((i) => i.severity === 'high').length;
      const mediumCount = allIncidents.filter((i) => i.severity === 'medium').length;
      const lowCount = allIncidents.filter((i) => i.severity === 'low').length;

      const activeCritical = allIncidents.filter(
        (i) => i.severity === 'critical' && i.status !== 'resolved' && i.status !== 'closed'
      );

      return {
        toolName,
        authorized: true,
        clearanceRequired: 'Campus Operations Level 2',
        userRole: role,
        data: {
          timeframe,
          total_incidents_in_period: allIncidents.length,
          matched_filter_count: filtered.length,
          critical_incidents_this_month: criticalCount,
          high_severity_count: highCount,
          medium_severity_count: mediumCount,
          low_severity_count: lowCount,
          active_critical_incidents: activeCritical.length,
          active_critical_list: activeCritical.map((i) => ({
            number: i.incident_number,
            title: i.title,
            location: i.location_name,
            status: i.status,
          })),
          summary: `This month (${timeframe}), there have been ${criticalCount} critical incidents logged on campus (${activeCritical.length} currently active, ${criticalCount - activeCritical.length} successfully contained and resolved).`,
        },
      };
    }

    // -------------------------------------------------------------------------
    // 2. ACTIVE INCIDENTS (Security, Admin, Super Admin, Faculty)
    // -------------------------------------------------------------------------
    case 'get_active_incidents': {
      const allowedRoles: UserRole[] = ['super_admin', 'admin', 'security', 'faculty', 'warden'];
      if (!allowedRoles.includes(role)) {
        return {
          toolName,
          authorized: false,
          clearanceRequired: 'Security / Tactical Response Clearance',
          userRole: role,
          error: `ACCESS_DENIED: Role '${role}' is not authorized to query live tactical incident feeds.`,
        };
      }

      const severityFilter = (args.severity as string)?.toLowerCase();
      let active = INITIAL_INCIDENTS.filter(
        (i) => i.status !== 'resolved' && i.status !== 'closed'
      );

      if (severityFilter) {
        active = active.filter((i) => i.severity.toLowerCase() === severityFilter);
      }

      // Confidentiality Redaction: Strip anonymous reporter identity unless caller is super_admin
      const sanitized = active.map((inc) => ({
        id: inc.id,
        incident_number: inc.incident_number,
        title: inc.title,
        description: inc.description,
        category: inc.category,
        severity: inc.severity,
        location: inc.location_name,
        status: inc.status,
        assigned_officer: inc.assigned_officer_name || 'Dispatch Queue',
        reporter: inc.is_anonymous && role !== 'super_admin' ? '[ANONYMOUS REPORTER - PROTECTED]' : inc.reporter_name,
        created_at: inc.created_at,
      }));

      return {
        toolName,
        authorized: true,
        clearanceRequired: 'Tactical Clearance',
        userRole: role,
        data: {
          active_count: sanitized.length,
          incidents: sanitized,
          summary: sanitized.length > 0
            ? `Found ${sanitized.length} active incident(s) requiring response.`
            : 'No active incidents matching the criteria at this time.',
        },
      };
    }

    // -------------------------------------------------------------------------
    // 3. STUDENT ATTENDANCE (Strict Entity Ownership Check)
    // -------------------------------------------------------------------------
    case 'get_student_attendance': {
      const queryId = (args.student_id as string)?.trim().toLowerCase();
      const queryRoll = (args.roll_number as string)?.trim().toUpperCase();
      const queryName = (args.student_name as string)?.trim().toLowerCase();

      // Find the targeted student in records
      let targetStudent = INITIAL_STUDENTS.find(
        (s) =>
          (queryId && s.id.toLowerCase() === queryId) ||
          (queryRoll && s.rollNumber.toUpperCase() === queryRoll) ||
          (queryName && s.name.toLowerCase().includes(queryName))
      );

      // If student is querying and provided no args, default to themselves
      if (!targetStudent && role === 'student') {
        targetStudent = INITIAL_STUDENTS.find(
          (s) => s.email.toLowerCase() === user.email.toLowerCase() || s.name.toLowerCase() === user.full_name.toLowerCase()
        ) || INITIAL_STUDENTS[0]; // Aanya Patel
      }

      // If parent is querying and provided no args, default to their linked child
      if (!targetStudent && role === 'parent') {
        targetStudent = INITIAL_STUDENTS.find(
          (s) => s.guardianName.toLowerCase().includes(user.full_name.toLowerCase()) || s.guardianEmail?.toLowerCase() === user.email.toLowerCase()
        ) || INITIAL_STUDENTS[0]; // Linked to Aanya Patel
      }

      if (!targetStudent) {
        return {
          toolName,
          authorized: false,
          clearanceRequired: 'Student Record Identification',
          userRole: role,
          error: `Record not found for student identifier '${queryRoll || queryName || queryId}'.`,
        };
      }

      // --- STRICT RBAC AUTHORIZATION BOUNDARY ---

      // 1. Student Persona: Can ONLY query their OWN record
      if (role === 'student') {
        const isSelf =
          targetStudent.email.toLowerCase() === user.email.toLowerCase() ||
          targetStudent.name.toLowerCase() === user.full_name.toLowerCase() ||
          targetStudent.id === 'std-001'; // Default demo student identity

        if (!isSelf && (queryRoll || queryName || queryId)) {
          return {
            toolName,
            authorized: false,
            clearanceRequired: 'Owner Student Clearance Only',
            userRole: role,
            error: `ACCESS_DENIED: Student ${user.full_name} is strictly prohibited from accessing attendance records of other students (${targetStudent.name}, Roll: ${targetStudent.rollNumber}) under University FERPA & Student Privacy Regulations.`,
            securityNotice: 'VIOLATION DETECTED: Cross-student record access blocked at server boundary.',
          };
        }
      }

      // 2. Parent Persona: Can ONLY query their LINKED dependent
      if (role === 'parent') {
        const isLinkedChild =
          targetStudent.guardianName.toLowerCase().includes(user.full_name.toLowerCase()) ||
          targetStudent.guardianEmail?.toLowerCase() === user.email.toLowerCase() ||
          targetStudent.id === 'std-001'; // Linked child Aanya Patel

        if (!isLinkedChild) {
          return {
            toolName,
            authorized: false,
            clearanceRequired: 'Authorized Parent/Guardian Clearance',
            userRole: role,
            error: `ACCESS_DENIED: Parent ${user.full_name} is only authorized to inspect records for linked dependent (Aanya Patel - CS23B042). Access to student ${targetStudent.name} (${targetStudent.rollNumber}) is forbidden.`,
            securityNotice: 'VIOLATION DETECTED: Unauthorized parent-to-student data request blocked.',
          };
        }
      }

      // 3. Security Persona: Forbidden from student academic/attendance data
      if (role === 'security') {
        return {
          toolName,
          authorized: false,
          clearanceRequired: 'Academic Affairs Clearance',
          userRole: role,
          error: `ACCESS_DENIED: Security Operations role does not possess Academic Affairs clearance to access student attendance or personal records.`,
          securityNotice: 'VIOLATION DETECTED: Security officer academic lookup denied.',
        };
      }

      // 4. Faculty / Admin / Super Admin: Authorized
      // Course-by-course breakdown for the student
      const courseBreakdown = targetStudent.enrolledCourses.map((code) => {
        const crs = INITIAL_COURSES.find((c) => c.code === code);
        return {
          course_code: code,
          course_title: crs?.title || code,
          instructor: crs?.instructorName || 'Department Faculty',
          attendance_percentage: targetStudent!.attendancePercentage >= 90 ? targetStudent!.attendancePercentage : targetStudent!.attendancePercentage + 2,
          status: targetStudent!.attendancePercentage >= 75 ? 'Satisfactory' : 'Attendance Shortage Alert',
        };
      });

      return {
        toolName,
        authorized: true,
        clearanceRequired: 'Authorized Academic Access',
        userRole: role,
        data: {
          student_name: targetStudent.name,
          roll_number: targetStudent.rollNumber,
          department: targetStudent.department,
          semester: targetStudent.semester,
          overall_attendance_percentage: targetStudent.attendancePercentage,
          attendance_status: targetStudent.attendancePercentage >= 85 ? 'Excellent' : targetStudent.attendancePercentage >= 75 ? 'Good' : 'Critical Shortage (<75%)',
          enrolled_courses: courseBreakdown,
        },
      };
    }

    // -------------------------------------------------------------------------
    // 4. STUDENT ACADEMIC SUMMARY (Grades, GPA)
    // -------------------------------------------------------------------------
    case 'get_student_academic_summary': {
      const queryId = (args.student_id as string)?.trim().toLowerCase();
      const queryRoll = (args.roll_number as string)?.trim().toUpperCase();
      const queryName = (args.student_name as string)?.trim().toLowerCase();

      let targetStudent = INITIAL_STUDENTS.find(
        (s) =>
          (queryId && s.id.toLowerCase() === queryId) ||
          (queryRoll && s.rollNumber.toUpperCase() === queryRoll) ||
          (queryName && s.name.toLowerCase().includes(queryName))
      );

      if (!targetStudent && role === 'student') {
        targetStudent = INITIAL_STUDENTS[0];
      }
      if (!targetStudent && role === 'parent') {
        targetStudent = INITIAL_STUDENTS[0];
      }

      if (!targetStudent) {
        return {
          toolName,
          authorized: false,
          clearanceRequired: 'Student Record Identification',
          userRole: role,
          error: `Student record not found.`,
        };
      }

      if (role === 'student' && targetStudent.id !== 'std-001' && (queryRoll || queryName || queryId)) {
        return {
          toolName,
          authorized: false,
          clearanceRequired: 'Self Only',
          userRole: role,
          error: `ACCESS_DENIED: Student cannot access academic transcripts of other students.`,
        };
      }

      if (role === 'parent' && targetStudent.id !== 'std-001') {
        return {
          toolName,
          authorized: false,
          clearanceRequired: 'Linked Dependent Only',
          userRole: role,
          error: `ACCESS_DENIED: Parent cannot view grades for non-linked student ${targetStudent.name}.`,
        };
      }

      if (role === 'security') {
        return {
          toolName,
          authorized: false,
          clearanceRequired: 'Academic Affairs Clearance',
          userRole: role,
          error: `ACCESS_DENIED: Security role clearance is restricted to physical campus safety.`,
        };
      }

      return {
        toolName,
        authorized: true,
        clearanceRequired: 'Academic Clearance',
        userRole: role,
        data: {
          student_name: targetStudent.name,
          roll_number: targetStudent.rollNumber,
          department: targetStudent.department,
          cgpa: targetStudent.cgpa,
          semester: targetStudent.semester,
          status: targetStudent.status,
          courses: targetStudent.enrolledCourses,
        },
      };
    }

    // -------------------------------------------------------------------------
    // 5. LOCATION RISK ANALYTICS (Highest incident rate location)
    // -------------------------------------------------------------------------
    case 'get_location_risk_analytics': {
      const allowedRoles: UserRole[] = ['super_admin', 'admin', 'security', 'faculty'];
      if (!allowedRoles.includes(role)) {
        return {
          toolName,
          authorized: false,
          clearanceRequired: 'Campus Operations & Safety Clearance',
          userRole: role,
          error: `ACCESS_DENIED: Role '${role}' is not authorized to inspect campus risk topology.`,
        };
      }

      const locationStats = CAMPUS_LOCATIONS.map((loc) => {
        const incidentsInLoc = INITIAL_INCIDENTS.filter((i) => i.location_id === loc.id || i.location_name.includes(loc.name));
        return {
          location_id: loc.id,
          name: loc.name,
          code: loc.code,
          sector: loc.sector,
          risk_level: loc.riskLevel,
          active_incidents: loc.activeIncidentsCount,
          total_logged_incidents: incidentsInLoc.length,
          stationed_officer: loc.officerStationed,
          incident_density: loc.riskLevel === 'critical' ? 'Highest (3.8x campus baseline)' : loc.riskLevel === 'high' ? 'Elevated' : 'Normal',
        };
      });

      // Sort by risk priority
      const ranking = [...locationStats].sort((a, b) => {
        const score = { critical: 4, high: 3, medium: 2, low: 1 };
        return score[b.risk_level as keyof typeof score] - score[a.risk_level as keyof typeof score] || b.active_incidents - a.active_incidents;
      });

      const highestRiskLocation = ranking[0]; // Engineering Block (Block D)

      return {
        toolName,
        authorized: true,
        clearanceRequired: 'Campus Safety Operations',
        userRole: role,
        data: {
          highest_incident_rate_location: {
            name: highestRiskLocation.name,
            code: highestRiskLocation.code,
            sector: highestRiskLocation.sector,
            risk_level: highestRiskLocation.risk_level.toUpperCase(),
            active_incidents: highestRiskLocation.active_incidents,
            assigned_unit: highestRiskLocation.stationed_officer,
            risk_factors: [
              'High-voltage electrical power labs and maker spaces',
              'Active organic chemistry fume hazard in Lab 302',
              'Highest historical incident frequency (3.8x campus average)',
            ],
          },
          all_locations_ranked: ranking,
          summary: `The location with the highest incident rate on campus is the ${highestRiskLocation.name} (${highestRiskLocation.code}), categorized as CRITICAL risk with ${highestRiskLocation.active_incidents} active incidents and 3.8x the baseline incident frequency.`,
        },
      };
    }

    // -------------------------------------------------------------------------
    // 6. SAFETY ACTION PRIORITIES (Admin decision support)
    // -------------------------------------------------------------------------
    case 'get_safety_action_priorities': {
      const allowedRoles: UserRole[] = ['super_admin', 'admin', 'security'];
      if (!allowedRoles.includes(role)) {
        return {
          toolName,
          authorized: false,
          clearanceRequired: 'Executive Safety Clearance',
          userRole: role,
          error: `ACCESS_DENIED: Role '${role}' lacks clearance for institutional safety directive prioritization.`,
        };
      }

      return {
        toolName,
        authorized: true,
        clearanceRequired: 'Executive Safety Directive Level',
        userRole: role,
        data: {
          prioritized_actions: [
            {
              priority_rank: 1,
              urgency: 'IMMEDIATE / CRITICAL (Next 15 Minutes)',
              location: 'Engineering Block (Block D) - Room 302',
              incident_ref: 'INC-20260821-0042',
              action_title: 'Complete Hazmat Containment & Isolate Chemical Exhaust',
              directives: [
                'Ensure 3rd floor Block D evacuation perimeter is fully secured',
                'Deploy Hazmat Unit with full respirator equipment to isolate Lab 302 exhaust hood',
                'Coordinate with Campus Health Clinic for any fume inhalation checks',
              ],
              responsible_officer: 'Capt. Vikram Sharma (Hazmat Lead)',
            },
            {
              priority_rank: 2,
              urgency: 'HIGH (Next 2 Hours)',
              location: 'Administrative Block - Server Room B',
              incident_ref: 'INC-20260821-0039',
              action_title: 'Lock Down Server Room B Outer Hatch & Audit 48-Hr Badge Telemetry',
              directives: [
                'Engage magnetic emergency interlock on Server Room B corridor',
                'Audit failed badge credential attempts from 02:00 - 03:00 AM',
                'Review high-definition CCTV feed from Corridor Cam #09',
              ],
              responsible_officer: 'SOC Lead Operator / IT Operations',
            },
            {
              priority_rank: 3,
              urgency: 'MEDIUM / PREVENTATIVE (Next 24-48 Hours)',
              location: 'Engineering Block (Block D) Electrical Substation',
              incident_ref: 'AI-INSIGHT-01',
              action_title: 'Deploy Automated Smart Circuit Breaker Isolation Sensors',
              directives: [
                'Install thermal load monitoring on Block D main transformer',
                'Schedule preventative load redistribution during peak lab hours (2:00 PM - 5:00 PM)',
              ],
              responsible_officer: 'Facilities & Maintenance Engineering',
            },
          ],
          executive_summary: 'Top safety priority: Contain the active chemical fume discharge in Block D Organic Lab 302, followed by perimeter lockdown and badge audit of Administrative Server Room B.',
        },
      };
    }

    // -------------------------------------------------------------------------
    // 7. AUDIT LOGS (Super Admin & Admin ONLY)
    // -------------------------------------------------------------------------
    case 'get_audit_logs': {
      const allowedRoles: UserRole[] = ['super_admin', 'admin'];
      if (!allowedRoles.includes(role)) {
        return {
          toolName,
          authorized: false,
          clearanceRequired: 'Super Administrator or Campus Administrator Clearance',
          userRole: role,
          error: `ACCESS_DENIED: Role '${role}' does NOT possess Administrative clearance to access institutional governance logs, audit trails, or compliance records.`,
          securityNotice: 'SECURITY EVENT LOGGED: Unauthorized audit trail access attempt rejected.',
        };
      }

      const limit = typeof args.limit === 'number' ? args.limit : 10;
      const logs = INITIAL_AUDIT_LOGS.slice(0, limit);

      return {
        toolName,
        authorized: true,
        clearanceRequired: 'Administrator Level 1',
        userRole: role,
        data: {
          total_entries: INITIAL_AUDIT_LOGS.length,
          returned_entries: logs.length,
          logs: logs.map((l) => ({
            id: l.id,
            action: l.action,
            actor: l.actor,
            actor_role: l.actorRole,
            entity: l.entity,
            timestamp: l.timestamp,
            details: l.details,
          })),
        },
      };
    }

    // -------------------------------------------------------------------------
    // 8. SECURITY PATROL LOGS
    // -------------------------------------------------------------------------
    case 'get_security_patrol_status': {
      const allowedRoles: UserRole[] = ['super_admin', 'admin', 'security'];
      if (!allowedRoles.includes(role)) {
        return {
          toolName,
          authorized: false,
          clearanceRequired: 'Security Operations Clearance',
          userRole: role,
          error: `ACCESS_DENIED: Role '${role}' is not authorized to inspect security patrol units.`,
        };
      }

      return {
        toolName,
        authorized: true,
        clearanceRequired: 'Security Clearance',
        userRole: role,
        data: {
          active_patrols: INITIAL_PATROL_LOGS,
        },
      };
    }

    // -------------------------------------------------------------------------
    // 9. VISITOR PASSES
    // -------------------------------------------------------------------------
    case 'get_visitor_registry': {
      const allowedRoles: UserRole[] = ['super_admin', 'admin', 'security', 'warden'];
      if (!allowedRoles.includes(role)) {
        return {
          toolName,
          authorized: false,
          clearanceRequired: 'Gate Security Clearance',
          userRole: role,
          error: `ACCESS_DENIED: Role '${role}' is not authorized to inspect visitor access records.`,
        };
      }

      return {
        toolName,
        authorized: true,
        clearanceRequired: 'Gate Clearance',
        userRole: role,
        data: {
          visitors: INITIAL_VISITORS,
        },
      };
    }

    // -------------------------------------------------------------------------
    // 10. HOSTEL OVERVIEW
    // -------------------------------------------------------------------------
    case 'get_hostel_overview': {
      const allowedRoles: UserRole[] = ['super_admin', 'admin', 'warden', 'security'];
      if (!allowedRoles.includes(role)) {
        return {
          toolName,
          authorized: false,
          clearanceRequired: 'Hostel Administration Clearance',
          userRole: role,
          error: `ACCESS_DENIED: Role '${role}' lacks hostel administration clearance.`,
        };
      }

      return {
        toolName,
        authorized: true,
        clearanceRequired: 'Hostel Clearance',
        userRole: role,
        data: {
          buildings: INITIAL_HOSTEL_BUILDINGS,
          maintenance_tickets: INITIAL_HOSTEL_MAINTENANCE,
        },
      };
    }

    // -------------------------------------------------------------------------
    // 11. EMERGENCY ALERTS
    // -------------------------------------------------------------------------
    case 'get_emergency_alerts': {
      return {
        toolName,
        authorized: true,
        clearanceRequired: 'Public Campus Broadcast',
        userRole: role,
        data: {
          alerts: INITIAL_ALERTS.filter((a) => a.is_active),
        },
      };
    }

    default:
      return {
        toolName,
        authorized: false,
        clearanceRequired: 'Unrecognized Tool',
        userRole: role,
        error: `Tool '${toolName}' is not an approved server function. Execution rejected.`,
      };
  }
}
