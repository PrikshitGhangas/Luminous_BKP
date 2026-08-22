export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'faculty'
  | 'student'
  | 'parent'
  | 'security'
  | 'warden'
  | 'placement_officer'
  | 'other';

export type IncidentCategory =
  | 'fire'
  | 'medical'
  | 'theft'
  | 'assault'
  | 'harassment'
  | 'vandalism'
  | 'suspicious_activity'
  | 'natural_disaster'
  | 'infrastructure'
  | 'traffic'
  | 'substance_abuse'
  | 'cybercrime'
  | 'sos_panic'
  | 'womens_safety'
  | 'threat'
  | 'other';

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';

export type IncidentStatus =
  | 'reported'
  | 'ai_analyzed'
  | 'assigned'
  | 'acknowledged'
  | 'dispatched'
  | 'responding'
  | 'arrived'
  | 'investigating'
  | 'resolved'
  | 'closed'
  | 'false_alarm';

export type AlertType = 'lockdown' | 'evacuation' | 'weather' | 'medical' | 'security' | 'general';
export type AlertScope = 'campus_wide' | 'building' | 'hostel' | 'department';

export type ThreatLevel = 'NORMAL' | 'ELEVATED' | 'HIGH_ALERT' | 'LOCKDOWN';

export type TimeFilter = 'today' | '7days' | '30days';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string;
  phone?: string;
  avatar_url?: string;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  is_active: boolean;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

/** DB `profiles` row (extends auth.users). */
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department_id?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IncidentTimelineEvent {
  id: string;
  incident_id: string;
  timestamp: string;
  title: string;
  description: string;
  actor_name: string;
  actor_role: string;
  type:
    | 'reported'
    | 'ai_triage'
    | 'assigned'
    | 'acknowledged'
    | 'dispatch'
    | 'arrived'
    | 'status_change'
    | 'resolved'
    | 'broadcast';
  metadata?: Record<string, unknown>;
}

export interface Incident {
  id: string;
  incident_number: string;
  reporter_id: string;
  reporter_name?: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  ai_severity?: IncidentSeverity;
  ai_confidence?: number;
  ai_summary?: string;
  ai_recommended_actions?: string[];
  ai_departments?: string[];
  location_id?: string;
  location_name: string;
  location_lat?: number;
  location_lng?: number;
  status: IncidentStatus;
  priority_score?: number;
  assigned_department?: string;
  assigned_to?: string;
  assigned_officer_name?: string;
  dispatched_at?: string;
  arrived_at?: string;
  is_anonymous?: boolean;
  is_sensitive?: boolean;
  requires_immediate_response?: boolean;
  evidence_urls?: string[];
  timeline?: IncidentTimelineEvent[];
  sos_level?: 'campus' | 'police';
  auto_escalated?: boolean;
  escalated_at?: string;
  sla_expires_at?: string;
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
  resolution_notes?: string;
}

export interface AIIncidentClassification {
  category: IncidentCategory;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  summary: string;
  location: string;
  recommended_actions: string[];
  departments: string[];
  emergency_required: boolean;
}

export interface CampusLocation {
  id: string;
  name: string;
  code: string;
  sector: 'Academic' | 'Residential' | 'Recreation' | 'Administration' | 'Services';
  description: string;
  coordinates: { x: number; y: number }; // percentage on 0-100 grid
  riskLevel: IncidentSeverity;
  activeIncidentsCount: number;
  buildingType: string;
  officerStationed?: string;
  operatingHours?: string;
  floors?: string;
  contactExt?: string;
  inCharge?: string;
  amenities?: string[];
  facilities?: string[];
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  actorRole: string;
  ip: string;
  timestamp: string;
  timeAgo?: string;
  entity: string;
  details?: string;
}

export interface SecurityPatrolLog {
  id: string;
  officer_name: string;
  unit: string;
  location_name: string;
  status: 'patrolling' | 'stationed' | 'responding' | 'break';
  last_check_in: string;
  battery_level?: number;
}

export interface AISafetyInsight {
  id: string;
  title: string;
  location: string;
  pattern_description: string;
  incident_count: number;
  time_window: string;
  confidence: number;
  severity: IncidentSeverity;
  recommendations: string[];
  action_status?: 'pending' | 'applied' | 'dismissed';
}

export interface SosAlert {
  id: string;
  user_id: string;
  user_name: string;
  user_phone?: string;
  location_name: string;
  location_lat?: number;
  location_lng?: number;
  category?: 'womens_safety' | 'sos_panic' | 'medical' | 'threat';
  status: 'active' | 'responding' | 'resolved' | 'false_alarm';
  responded_by?: string;
  responder_name?: string;
  incident_id?: string;
  created_at: string;
  resolved_at?: string;
}

export interface EmergencyAlert {
  id: string;
  title: string;
  message: string;
  type: AlertType;
  scope?: AlertScope;
  target_entity?: string;
  severity: IncidentSeverity;
  target_roles: UserRole[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  expires_at?: string;
  acknowledged_by?: string[];
}

export interface VisitorPass {
  id: string;
  pass_number: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_company?: string;
  purpose: string;
  host_name: string;
  host_id?: string;
  host_department: string;
  destination_building: string;
  badge_id: string;
  status: 'expected' | 'pending_host' | 'approved_host' | 'rejected_host' | 'approved_security' | 'checked_in' | 'checked_out' | 'flagged';
  visit_date?: string;
  visit_time_slot?: string;
  check_in_time?: string;
  check_out_time?: string;
  gate_entry?: string;
  gate_exit?: string;
  vehicle_number?: string;
  id_verified: boolean;
  security_notes?: string;
  created_at: string;
}

export interface HostelBuilding {
  id: string;
  name: string;
  code: string;
  gender: 'Boys' | 'Girls' | 'Co-ed';
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  wardenName: string;
  wardenPhone: string;
  amenities: string[];
}

export interface HostelRoom {
  id: string;
  buildingCode: string;
  roomNumber: string;
  floor: number;
  type: 'Single' | 'Double' | 'Triple';
  capacity: number;
  occupiedCount: number;
  status: 'Occupied' | 'Vacant' | 'Under Maintenance';
  occupants: {
    studentId: string;
    studentName: string;
    rollNumber: string;
    bedNumber: string;
  }[];
}

export interface HostelMaintenanceRequest {
  id: string;
  ticketNumber: string;
  buildingCode: string;
  roomNumber: string;
  category: 'Plumbing' | 'Electrical' | 'Furniture' | 'Cleanliness' | 'Wi-Fi / Network';
  description: string;
  reportedBy: string;
  reportedAt: string;
  status: 'Pending' | 'Assigned' | 'In Progress' | 'Fixed';
  priority: 'Low' | 'Medium' | 'High';
  assignedTechnician?: string;
}

export interface HostelIncident {
  id: string;
  incidentNumber: string;
  buildingCode: string;
  title: string;
  description: string;
  category: 'Curfew Violation' | 'Noise Violation' | 'Unauthorized Guest' | 'Property Damage' | 'Security Risk';
  studentName?: string;
  studentRoll?: string;
  reportedAt: string;
  status: 'Reported' | 'Warden Under Review' | 'Resolved' | 'Escalated to Security';
  actionTaken?: string;
}

export interface TransportRoute {
  id: string;
  routeName: string;
  routeCode: string;
  startPoint: string;
  endPoint: string;
  stops: string[];
  departureTime: string;
  estimatedDuration: string;
  capacity: number;
  subscribedCount: number;
  assignedBusNo: string;
}

export interface TransportVehicle {
  id: string;
  busNumber: string;
  routeCode: string;
  driverName: string;
  driverPhone: string;
  status: 'Active on Route' | 'At Terminal' | 'Under Service';
  currentLocationStop: string;
  nextStop: string;
  speedKmH: number;
  fuelLevelPercent: number;
}

export interface TransportPass {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  routeCode: string;
  pickupStop: string;
  validityPeriod: string;
  status: 'Active' | 'Pending Renewal' | 'Expired';
}

export interface TransportAdvisory {
  id: string;
  title: string;
  routeCode: string;
  message: string;
  type: 'Delay' | 'Route Change' | 'Maintenance' | 'Emergency';
  postedAt: string;
}

export type ComplaintCategory =
  | 'academic'
  | 'hostel'
  | 'infrastructure'
  | 'transport'
  | 'faculty'
  | 'it'
  | 'safety'
  | 'other';

export interface Complaint {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  aiClassifiedCategory?: ComplaintCategory;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Escalated';
  reportedBy: string;
  reporterRole: string;
  assignedDepartment: string;
  location?: string;
  aiSummary?: string;
  aiRecommendedActions?: string[];
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface PlacementCompany {
  id: string;
  name: string;
  industry: string;
  website: string;
  logoUrl?: string;
  tier: 'Marquee / Tech Giant' | 'Super Dream' | 'Dream' | 'Core';
}

export interface PlacementDrive {
  id: string;
  driveCode: string;
  companyId: string;
  companyName: string;
  jobRole: string;
  ctcPackage: string;
  location: string;
  driveDate: string;
  deadlineDate: string;
  minCgpa: number;
  maxBacklogs: number;
  allowedDepartments: string[];
  status: 'Applications Open' | 'Shortlisting' | 'Interviews Ongoing' | 'Completed';
  totalApplicants: number;
}

export interface PlacementApplication {
  id: string;
  driveId: string;
  companyName: string;
  jobRole: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  cgpa: number;
  department: string;
  appliedAt: string;
  status: 'Applied' | 'Shortlisted' | 'Interview Scheduled' | 'Offered' | 'Rejected';
}

export interface WellbeingCheckIn {
  id: string;
  userId: string;
  userRole: UserRole;
  department: string;
  moodRating: 1 | 2 | 3 | 4 | 5; // 1 = Low, 5 = Great
  energyLevel: 1 | 2 | 3 | 4 | 5;
  stressFactor?: 'Academics' | 'Exams' | 'Hostel' | 'Career' | 'Personal' | 'None';
  anonymousNotes?: string;
  createdAt: string;
}

export interface AggregatedWellbeingMetric {
  department: string;
  avgMood: number;
  avgEnergy: number;
  checkInCount: number;
  topStressFactor: string;
}

export interface CounselorContact {
  id: string;
  name: string;
  designation: string;
  specialty: string;
  availabilityHours: string;
  officeLocation: string;
  phone: string;
  email: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'emergency' | 'incident' | 'system' | 'academic';
  read: boolean;
  created_at: string;
  link?: string;
}
