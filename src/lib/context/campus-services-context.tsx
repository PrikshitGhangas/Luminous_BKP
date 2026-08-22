'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  HostelBuilding,
  HostelRoom,
  HostelMaintenanceRequest,
  HostelIncident,
  TransportRoute,
  TransportVehicle,
  TransportPass,
  TransportAdvisory,
  Complaint,
  ComplaintCategory,
  VisitorPass,
  PlacementCompany,
  PlacementDrive,
  PlacementApplication,
  WellbeingCheckIn,
  AggregatedWellbeingMetric,
  CounselorContact,
} from '../types';
import {
  INITIAL_HOSTEL_BUILDINGS,
  INITIAL_HOSTEL_ROOMS,
  INITIAL_HOSTEL_MAINTENANCE,
  INITIAL_HOSTEL_INCIDENTS,
  INITIAL_TRANSPORT_ROUTES,
  INITIAL_TRANSPORT_VEHICLES,
  INITIAL_TRANSPORT_PASSES,
  INITIAL_TRANSPORT_ADVISORIES,
  INITIAL_COMPLAINTS,
  INITIAL_PLACEMENT_COMPANIES,
  INITIAL_PLACEMENT_DRIVES,
  INITIAL_PLACEMENT_APPLICATIONS,
  INITIAL_WELLBEING_CHECKINS,
  INITIAL_WELLBEING_AGGREGATED,
  COUNSELOR_CONTACTS,
} from '../constants/campus-services-demo-data';
import { analyzeComplaint } from '../services/ai-complaint';

interface SubmitVisitorInput {
  visitorName: string;
  visitorPhone: string;
  visitorCompany?: string;
  purpose: string;
  hostName: string;
  hostDepartment: string;
  destinationBuilding: string;
  visitDate: string;
  visitTimeSlot: string;
  vehicleNumber?: string;
}

interface LodgeComplaintInput {
  title: string;
  description: string;
  categoryHint?: ComplaintCategory;
  location?: string;
  reporterName?: string;
  reporterRole?: string;
}

interface CampusServicesContextType {
  // Hostel
  hostelBuildings: HostelBuilding[];
  hostelRooms: HostelRoom[];
  hostelMaintenance: HostelMaintenanceRequest[];
  hostelIncidents: HostelIncident[];
  submitHostelMaintenance: (data: Omit<HostelMaintenanceRequest, 'id' | 'ticketNumber' | 'reportedAt' | 'status'>) => HostelMaintenanceRequest;
  reportHostelIncident: (data: Omit<HostelIncident, 'id' | 'incidentNumber' | 'reportedAt' | 'status'>) => HostelIncident;

  // Visitors
  visitorPasses: VisitorPass[];
  submitVisitorRequest: (input: SubmitVisitorInput) => VisitorPass;
  approveVisitorHost: (passId: string) => void;
  rejectVisitorHost: (passId: string, notes?: string) => void;
  approveVisitorSecurity: (passId: string, badgeId: string, notes?: string) => void;
  checkInVisitorGate: (passId: string, gateName?: string) => void;
  checkOutVisitorGate: (passId: string, gateName?: string) => void;

  // Transport
  transportRoutes: TransportRoute[];
  transportVehicles: TransportVehicle[];
  transportPasses: TransportPass[];
  transportAdvisories: TransportAdvisory[];
  applyTransportPass: (routeCode: string, pickupStop: string, studentName: string, rollNumber: string) => TransportPass;

  // Complaints
  complaints: Complaint[];
  lodgeComplaint: (input: LodgeComplaintInput) => Promise<Complaint>;
  updateComplaintStatus: (id: string, status: Complaint['status'], notes?: string) => void;

  // Placement
  placementCompanies: PlacementCompany[];
  placementDrives: PlacementDrive[];
  placementApplications: PlacementApplication[];
  applyForDrive: (driveId: string, studentName: string, rollNumber: string, cgpa: number, department: string) => PlacementApplication;
  updatePlacementApplicationStatus: (applicationId: string, status: PlacementApplication['status']) => void;
  createPlacementDrive: (drive: Omit<PlacementDrive, 'id' | 'totalApplicants'>) => PlacementDrive;

  // Wellbeing
  wellbeingCheckIns: WellbeingCheckIn[];
  wellbeingAggregated: AggregatedWellbeingMetric[];
  counselors: CounselorContact[];
  logWellbeingCheckIn: (mood: 1 | 2 | 3 | 4 | 5, energy: 1 | 2 | 3 | 4 | 5, stressFactor?: WellbeingCheckIn['stressFactor'], notes?: string, role?: string, dept?: string) => WellbeingCheckIn;
}

const CampusServicesContext = createContext<CampusServicesContextType | undefined>(undefined);

const STORAGE_KEYS = {
  HOSTEL_MAINTENANCE: 'luminous_hostel_maintenance_v1',
  HOSTEL_INCIDENTS: 'luminous_hostel_incidents_v1',
  VISITOR_PASSES: 'luminous_visitor_passes_v1',
  TRANSPORT_PASSES: 'luminous_transport_passes_v1',
  COMPLAINTS: 'luminous_complaints_v1',
  PLACEMENT_APPS: 'luminous_placement_apps_v1',
  WELLBEING_CHECKINS: 'luminous_wellbeing_checkins_v1',
};

function getStored<T>(key: string, fallback: T): T {
  if (typeof window !== 'undefined') {
    try {
      const item = localStorage.getItem(key);
      if (item) return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`Failed to parse localStorage "${key}":`, e);
    }
  }
  return fallback;
}

export function CampusServicesProvider({ children }: { children: React.ReactNode }) {
  // Hostel State
  const [hostelBuildings] = useState<HostelBuilding[]>(INITIAL_HOSTEL_BUILDINGS);
  const [hostelRooms] = useState<HostelRoom[]>(INITIAL_HOSTEL_ROOMS);
  const [hostelMaintenance, setHostelMaintenance] = useState<HostelMaintenanceRequest[]>(() =>
    getStored(STORAGE_KEYS.HOSTEL_MAINTENANCE, INITIAL_HOSTEL_MAINTENANCE)
  );
  const [hostelIncidents, setHostelIncidents] = useState<HostelIncident[]>(() =>
    getStored(STORAGE_KEYS.HOSTEL_INCIDENTS, INITIAL_HOSTEL_INCIDENTS)
  );

  // Visitor State
  const [visitorPasses, setVisitorPasses] = useState<VisitorPass[]>(() =>
    getStored(STORAGE_KEYS.VISITOR_PASSES, [
      {
        id: 'vis-101',
        pass_number: 'PASS-20260821-0391',
        visitor_name: 'Dr. Anita Roy',
        visitor_phone: '+91 98450 12339',
        visitor_company: 'Stanford AI Institute',
        purpose: 'Guest Keynote on Agentic Safety & Robotics',
        host_name: 'Prof. Sarah Jenkins',
        host_department: 'Computer Science & Engineering',
        destination_building: 'Main Auditorium',
        badge_id: 'VIS-SEC-A12',
        status: 'checked_in',
        visit_date: '2026-08-21',
        visit_time_slot: '09:00 AM - 05:00 PM',
        check_in_time: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
        gate_entry: 'Main Security Gate Alpha',
        vehicle_number: 'KA-01-EQ-9921',
        id_verified: true,
        created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      },
      {
        id: 'vis-102',
        pass_number: 'PASS-20260821-0392',
        visitor_name: 'Vikramaditya Roy',
        visitor_phone: '+91 98450 19440',
        visitor_company: 'Infosys Research Lab',
        purpose: 'Technical Seminar & Capstone Evaluation',
        host_name: 'Prof. Sarah Jenkins',
        host_department: 'Computer Science & Engineering',
        destination_building: 'Engineering Block D',
        badge_id: 'VIS-PENDING',
        status: 'pending_host',
        visit_date: '2026-08-22',
        visit_time_slot: '10:00 AM - 01:00 PM',
        id_verified: false,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
    ])
  );

  // Transport State
  const [transportRoutes] = useState<TransportRoute[]>(INITIAL_TRANSPORT_ROUTES);
  const [transportVehicles] = useState<TransportVehicle[]>(INITIAL_TRANSPORT_VEHICLES);
  const [transportPasses, setTransportPasses] = useState<TransportPass[]>(() =>
    getStored(STORAGE_KEYS.TRANSPORT_PASSES, INITIAL_TRANSPORT_PASSES)
  );
  const [transportAdvisories] = useState<TransportAdvisory[]>(INITIAL_TRANSPORT_ADVISORIES);

  // Complaints State
  const [complaints, setComplaints] = useState<Complaint[]>(() =>
    getStored(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS)
  );

  // Placement State
  const [placementCompanies] = useState<PlacementCompany[]>(INITIAL_PLACEMENT_COMPANIES);
  const [placementDrives, setPlacementDrives] = useState<PlacementDrive[]>(INITIAL_PLACEMENT_DRIVES);
  const [placementApplications, setPlacementApplications] = useState<PlacementApplication[]>(() =>
    getStored(STORAGE_KEYS.PLACEMENT_APPS, INITIAL_PLACEMENT_APPLICATIONS)
  );

  // Wellbeing State
  const [wellbeingCheckIns, setWellbeingCheckIns] = useState<WellbeingCheckIn[]>(() =>
    getStored(STORAGE_KEYS.WELLBEING_CHECKINS, INITIAL_WELLBEING_CHECKINS)
  );
  const [wellbeingAggregated] = useState<AggregatedWellbeingMetric[]>(INITIAL_WELLBEING_AGGREGATED);
  const [counselors] = useState<CounselorContact[]>(COUNSELOR_CONTACTS);

  // Sync state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.HOSTEL_MAINTENANCE, JSON.stringify(hostelMaintenance));
      localStorage.setItem(STORAGE_KEYS.HOSTEL_INCIDENTS, JSON.stringify(hostelIncidents));
      localStorage.setItem(STORAGE_KEYS.VISITOR_PASSES, JSON.stringify(visitorPasses));
      localStorage.setItem(STORAGE_KEYS.TRANSPORT_PASSES, JSON.stringify(transportPasses));
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
      localStorage.setItem(STORAGE_KEYS.PLACEMENT_APPS, JSON.stringify(placementApplications));
      localStorage.setItem(STORAGE_KEYS.WELLBEING_CHECKINS, JSON.stringify(wellbeingCheckIns));
    }
  }, [hostelMaintenance, hostelIncidents, visitorPasses, transportPasses, complaints, placementApplications, wellbeingCheckIns]);

  // Hostel Mutations
  const submitHostelMaintenance = useCallback((data: Omit<HostelMaintenanceRequest, 'id' | 'ticketNumber' | 'reportedAt' | 'status'>): HostelMaintenanceRequest => {
    const newReq: HostelMaintenanceRequest = {
      ...data,
      id: `hmt-${Date.now()}`,
      ticketNumber: `HMT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      reportedAt: new Date().toISOString(),
      status: 'Pending',
    };
    setHostelMaintenance((prev) => [newReq, ...prev]);
    return newReq;
  }, []);

  const reportHostelIncident = useCallback((data: Omit<HostelIncident, 'id' | 'incidentNumber' | 'reportedAt' | 'status'>): HostelIncident => {
    const newInc: HostelIncident = {
      ...data,
      id: `hinc-${Date.now()}`,
      incidentNumber: `HINC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`,
      reportedAt: new Date().toISOString(),
      status: 'Reported',
    };
    setHostelIncidents((prev) => [newInc, ...prev]);
    return newInc;
  }, []);

  // Visitor Pass Mutations
  const submitVisitorRequest = useCallback((input: SubmitVisitorInput): VisitorPass => {
    const now = new Date().toISOString();
    const passNum = `PASS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPass: VisitorPass = {
      id: `vis-${Date.now()}`,
      pass_number: passNum,
      visitor_name: input.visitorName,
      visitor_phone: input.visitorPhone,
      visitor_company: input.visitorCompany || 'Independent Visitor',
      purpose: input.purpose,
      host_name: input.hostName,
      host_department: input.hostDepartment,
      destination_building: input.destinationBuilding,
      badge_id: 'VIS-PENDING',
      status: 'pending_host',
      visit_date: input.visitDate,
      visit_time_slot: input.visitTimeSlot,
      vehicle_number: input.vehicleNumber,
      id_verified: false,
      created_at: now,
    };
    setVisitorPasses((prev) => [newPass, ...prev]);
    return newPass;
  }, []);

  const approveVisitorHost = useCallback((passId: string) => {
    setVisitorPasses((prev) =>
      prev.map((vp) => (vp.id === passId ? { ...vp, status: 'approved_host' } : vp))
    );
  }, []);

  const rejectVisitorHost = useCallback((passId: string, notes?: string) => {
    setVisitorPasses((prev) =>
      prev.map((vp) => (vp.id === passId ? { ...vp, status: 'rejected_host', security_notes: notes || 'Host declined visit' } : vp))
    );
  }, []);

  const approveVisitorSecurity = useCallback((passId: string, badgeId: string, notes?: string) => {
    setVisitorPasses((prev) =>
      prev.map((vp) =>
        vp.id === passId
          ? {
              ...vp,
              status: 'approved_security',
              badge_id: badgeId || `VIS-SEC-${Math.floor(100 + Math.random() * 900)}`,
              id_verified: true,
              security_notes: notes,
            }
          : vp
      )
    );
  }, []);

  const checkInVisitorGate = useCallback((passId: string, gateName = 'Main Security Gate Alpha') => {
    const now = new Date().toISOString();
    setVisitorPasses((prev) =>
      prev.map((vp) =>
        vp.id === passId
          ? {
              ...vp,
              status: 'checked_in',
              check_in_time: now,
              gate_entry: gateName,
            }
          : vp
      )
    );
  }, []);

  const checkOutVisitorGate = useCallback((passId: string, gateName = 'Main Security Gate Alpha') => {
    const now = new Date().toISOString();
    setVisitorPasses((prev) =>
      prev.map((vp) =>
        vp.id === passId
          ? {
              ...vp,
              status: 'checked_out',
              check_out_time: now,
              gate_exit: gateName,
            }
          : vp
      )
    );
  }, []);

  // Transport Mutations
  const applyTransportPass = useCallback((routeCode: string, pickupStop: string, studentName: string, rollNumber: string): TransportPass => {
    const newPass: TransportPass = {
      id: `tpass-${Date.now()}`,
      studentId: 'usr-student-05',
      studentName,
      rollNumber,
      routeCode,
      pickupStop,
      validityPeriod: 'Fall Semester 2026',
      status: 'Active',
    };
    setTransportPasses((prev) => [newPass, ...prev]);
    return newPass;
  }, []);

  // Complaint Triage & Mutation
  const lodgeComplaint = useCallback(async (input: LodgeComplaintInput): Promise<Complaint> => {
    const now = new Date().toISOString();
    const ticketNo = `CMP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Call Gemini AI classification
    const aiAnalysis = await analyzeComplaint({
      title: input.title,
      description: input.description,
      location: input.location,
      categoryHint: input.categoryHint,
    });

    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      ticketNumber: ticketNo,
      title: input.title,
      description: input.description,
      category: aiAnalysis.category,
      aiClassifiedCategory: aiAnalysis.category,
      priority: aiAnalysis.priority,
      status: 'Pending',
      reportedBy: input.reporterName || 'Aanya Patel',
      reporterRole: input.reporterRole || 'Student',
      assignedDepartment: aiAnalysis.assigned_department,
      location: input.location || 'Campus Premises',
      aiSummary: aiAnalysis.summary,
      aiRecommendedActions: aiAnalysis.recommended_actions,
      createdAt: now,
    };

    setComplaints((prev) => [newComplaint, ...prev]);
    return newComplaint;
  }, []);

  const updateComplaintStatus = useCallback((id: string, status: Complaint['status'], notes?: string) => {
    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status,
              resolvedAt: status === 'Resolved' ? now : c.resolvedAt,
              resolutionNotes: notes || c.resolutionNotes,
            }
          : c
      )
    );
  }, []);

  // Placement Mutations
  const applyForDrive = useCallback((driveId: string, studentName: string, rollNumber: string, cgpa: number, department: string): PlacementApplication => {
    const targetDrive = placementDrives.find((d) => d.id === driveId);
    const newApp: PlacementApplication = {
      id: `app-${Date.now()}`,
      driveId,
      companyName: targetDrive?.companyName || 'Campus Recruiter',
      jobRole: targetDrive?.jobRole || 'Software Trainee',
      studentId: 'usr-student-05',
      studentName,
      rollNumber,
      cgpa,
      department,
      appliedAt: new Date().toISOString(),
      status: 'Applied',
    };
    setPlacementApplications((prev) => [newApp, ...prev]);
    return newApp;
  }, [placementDrives]);

  const updatePlacementApplicationStatus = useCallback((applicationId: string, status: PlacementApplication['status']) => {
    setPlacementApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
    );
  }, []);

  const createPlacementDrive = useCallback((drive: Omit<PlacementDrive, 'id' | 'totalApplicants'>): PlacementDrive => {
    const newDrive: PlacementDrive = {
      ...drive,
      id: `drv-${Date.now()}`,
      totalApplicants: 0,
    };
    setPlacementDrives((prev) => [newDrive, ...prev]);
    return newDrive;
  }, []);

  // Wellbeing Check-in Logger
  const logWellbeingCheckIn = useCallback((
    mood: 1 | 2 | 3 | 4 | 5,
    energy: 1 | 2 | 3 | 4 | 5,
    stressFactor?: WellbeingCheckIn['stressFactor'],
    notes?: string,
    role = 'student',
    dept = 'Computer Science & Engineering'
  ): WellbeingCheckIn => {
    const newCheckIn: WellbeingCheckIn = {
      id: `wb-${Date.now()}`,
      userId: 'usr-student-05',
      userRole: role as WellbeingCheckIn['userRole'],
      department: dept,
      moodRating: mood,
      energyLevel: energy,
      stressFactor: stressFactor || 'None',
      anonymousNotes: notes,
      createdAt: new Date().toISOString(),
    };
    setWellbeingCheckIns((prev) => [newCheckIn, ...prev]);
    return newCheckIn;
  }, []);

  return (
    <CampusServicesContext.Provider
      value={{
        hostelBuildings,
        hostelRooms,
        hostelMaintenance,
        hostelIncidents,
        submitHostelMaintenance,
        reportHostelIncident,
        visitorPasses,
        submitVisitorRequest,
        approveVisitorHost,
        rejectVisitorHost,
        approveVisitorSecurity,
        checkInVisitorGate,
        checkOutVisitorGate,
        transportRoutes,
        transportVehicles,
        transportPasses,
        transportAdvisories,
        applyTransportPass,
        complaints,
        lodgeComplaint,
        updateComplaintStatus,
        placementCompanies,
        placementDrives,
        placementApplications,
        applyForDrive,
        updatePlacementApplicationStatus,
        createPlacementDrive,
        wellbeingCheckIns,
        wellbeingAggregated,
        counselors,
        logWellbeingCheckIn,
      }}
    >
      {children}
    </CampusServicesContext.Provider>
  );
}

export function useCampusServices(): CampusServicesContextType {
  const context = useContext(CampusServicesContext);
  if (!context) {
    throw new Error('useCampusServices must be used within a CampusServicesProvider');
  }
  return context;
}
