export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'OBJECT';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required?: string[];
  };
}

export const COPILOT_TOOLS: ToolDefinition[] = [
  {
    name: 'get_incident_statistics',
    description: 'Retrieve statistical aggregations of campus incidents, counts by severity, category, and timeframes (e.g. this month, past 7 days, today). Authorized for Admin, Super Admin, and Security.',
    parameters: {
      type: 'OBJECT',
      properties: {
        timeframe: {
          type: 'STRING',
          description: 'Timeframe filter: "month" (current month / 30 days), "7days", "today", or "all"',
          enum: ['month', '7days', 'today', 'all'],
        },
        severity: {
          type: 'STRING',
          description: 'Filter by severity: "critical", "high", "medium", "low"',
          enum: ['critical', 'high', 'medium', 'low'],
        },
        category: {
          type: 'STRING',
          description: 'Filter by incident category (e.g. "fire", "medical", "suspicious_activity", "infrastructure")',
        },
      },
    },
  },
  {
    name: 'get_active_incidents',
    description: 'Retrieve currently active, dispatched, responding, or under-investigation security and safety incidents. Authorized for Security, Admin, Super Admin, Faculty.',
    parameters: {
      type: 'OBJECT',
      properties: {
        severity: {
          type: 'STRING',
          description: 'Filter by severity level',
          enum: ['critical', 'high', 'medium', 'low'],
        },
        location: {
          type: 'STRING',
          description: 'Filter by campus location name or code',
        },
        category: {
          type: 'STRING',
          description: 'Filter by incident category',
        },
        limit: {
          type: 'INTEGER',
          description: 'Maximum number of active incidents to return',
        },
      },
    },
  },
  {
    name: 'get_student_attendance',
    description: 'Retrieve attendance percentage, subject breakdown, and status for a student. Strictly restricted: Students may ONLY query their own attendance; Parents may ONLY query their linked child; Faculty/Admin may query institutional attendance.',
    parameters: {
      type: 'OBJECT',
      properties: {
        student_id: {
          type: 'STRING',
          description: 'Internal student ID (e.g. "std-001")',
        },
        roll_number: {
          type: 'STRING',
          description: 'Student academic roll number (e.g. "CS23B042", "CS23B043")',
        },
        student_name: {
          type: 'STRING',
          description: 'Full name or partial name of the student',
        },
      },
    },
  },
  {
    name: 'get_student_academic_summary',
    description: 'Retrieve student academic profile, CGPA, semester, section, and enrolled courses. Strictly restricted to the authorized student owner, linked parent, or academic staff.',
    parameters: {
      type: 'OBJECT',
      properties: {
        student_id: {
          type: 'STRING',
          description: 'Internal student ID',
        },
        roll_number: {
          type: 'STRING',
          description: 'Student roll number',
        },
        student_name: {
          type: 'STRING',
          description: 'Student name',
        },
      },
    },
  },
  {
    name: 'get_location_risk_analytics',
    description: 'Retrieve incident rates, risk levels, and hazard density per campus location/building (e.g. Engineering Block, Administrative Block, Library, Hostels) to identify highest incident rate locations. Authorized for Admin, Super Admin, Security.',
    parameters: {
      type: 'OBJECT',
      properties: {
        location_name: {
          type: 'STRING',
          description: 'Optional location name or code to inspect',
        },
      },
    },
  },
  {
    name: 'get_safety_action_priorities',
    description: 'Synthesize and rank immediate prioritized safety actions, operational interventions, and hazard mitigations based on active incidents and AI pattern telemetry. Authorized for Admin, Super Admin, Security.',
    parameters: {
      type: 'OBJECT',
      properties: {
        focus_area: {
          type: 'STRING',
          description: 'Optional focus area e.g. "fire", "security", "perimeter", "hazmat"',
        },
      },
    },
  },
  {
    name: 'get_audit_logs',
    description: 'Retrieve institutional compliance audit trails, security access records, and administrative modifications. STRICTLY RESTRICTED to Campus Administrator and Super Administrator clearance.',
    parameters: {
      type: 'OBJECT',
      properties: {
        limit: {
          type: 'INTEGER',
          description: 'Number of recent audit entries to retrieve',
        },
        action_type: {
          type: 'STRING',
          description: 'Filter by action type',
        },
      },
    },
  },
  {
    name: 'get_security_patrol_status',
    description: 'Retrieve live security officer patrol statuses, units, stationed locations, and telemetry. Authorized for Security, Admin, Super Admin.',
    parameters: {
      type: 'OBJECT',
      properties: {
        unit_code: {
          type: 'STRING',
          description: 'Optional patrol unit code or officer name',
        },
      },
    },
  },
  {
    name: 'get_visitor_registry',
    description: 'Retrieve visitor passes, badge verifications, and gate entry records. Authorized for Security, Admin, Warden.',
    parameters: {
      type: 'OBJECT',
      properties: {
        status: {
          type: 'STRING',
          description: 'Visitor pass status (e.g. "checked_in", "expected", "flagged")',
        },
        destination_building: {
          type: 'STRING',
          description: 'Filter by destination building',
        },
      },
    },
  },
  {
    name: 'get_hostel_overview',
    description: 'Retrieve hostel residential building status, bed occupancy, and active maintenance tickets. Authorized for Warden, Admin, Security.',
    parameters: {
      type: 'OBJECT',
      properties: {
        building_code: {
          type: 'STRING',
          description: 'Hostel building code (e.g. "HST-A", "HST-B")',
        },
      },
    },
  },
  {
    name: 'get_emergency_alerts',
    description: 'Retrieve active university emergency alerts, lockdown advisories, and safety broadcast notices. Public to all authenticated campus roles.',
    parameters: {
      type: 'OBJECT',
      properties: {
        is_active_only: {
          type: 'BOOLEAN',
          description: 'Whether to only return currently active alerts',
        },
      },
    },
  },
];

/**
 * Format tools for Google Gemini REST API function declarations format
 */
export function getGeminiFunctionDeclarations() {
  return COPILOT_TOOLS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: {
      type: 'OBJECT',
      properties: Object.entries(tool.parameters.properties).reduce(
        (acc, [key, val]) => {
          acc[key] = {
            type: val.type.toUpperCase(),
            description: val.description,
            ...(val.enum ? { enum: val.enum } : {}),
          };
          return acc;
        },
        {} as Record<string, unknown>
      ),
      ...(tool.parameters.required ? { required: tool.parameters.required } : {}),
    },
  }));
}
