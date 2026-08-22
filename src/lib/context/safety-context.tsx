'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Incident,
  IncidentStatus,
  IncidentSeverity,
  IncidentCategory,
  EmergencyAlert,
  AlertType,
  AlertScope,
  SystemNotification,
  AuditLogEntry,
  SecurityPatrolLog,
  AISafetyInsight,
  ThreatLevel,
  IncidentTimelineEvent,
  AIIncidentClassification,
  VisitorPass,
  UserProfile,
} from '../types';
import {
  INITIAL_INCIDENTS,
  INITIAL_ALERTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PATROL_LOGS,
  AI_SAFETY_INSIGHTS,
  INITIAL_VISITORS,
} from '../constants/demo-data';

interface CreateIncidentInput {
  title: string;
  description: string;
  location_name: string;
  category: string;
  severity: IncidentSeverity;
  is_anonymous?: boolean;
  is_emergency?: boolean;
  evidence_urls?: string[];
  reporter_id?: string;
  reporter_name?: string;
  ai_analysis?: AIIncidentClassification;
}

interface SafetyContextType {
  incidents: Incident[];
  auditLogs: AuditLogEntry[];
  notifications: SystemNotification[];
  alerts: EmergencyAlert[];
  patrolLogs: SecurityPatrolLog[];
  safetyInsights: AISafetyInsight[];
  visitors: VisitorPass[];
  threatLevel: ThreatLevel;
  unreadNotificationsCount: number;
  setThreatLevel: (level: ThreatLevel) => void;
  createIncident: (input: CreateIncidentInput) => Promise<Incident>;
  updateIncidentStatus: (id: string, newStatus: IncidentStatus, actorName?: string, notes?: string) => void;
  acknowledgeIncident: (id: string, officerName?: string, notes?: string) => void;
  assignIncident: (id: string, officerName: string, department?: string, notes?: string) => void;
  dispatchResponder: (id: string, department?: string, officerName?: string, unitCode?: string, notes?: string) => void;
  startResponse: (id: string, officerName?: string, notes?: string) => void;
  resolveIncident: (id: string, actorName?: string, notes?: string, resolutionCategory?: string) => void;
  broadcastEmergencyAlert: (
    title: string,
    message: string,
    type?: AlertType,
    severity?: IncidentSeverity,
    scope?: AlertScope,
    targetEntity?: string,
    senderName?: string
  ) => void;
  dismissAlert: (id: string) => void;
  triggerEmergencySos: (
    locationName: string,
    category?: 'womens_safety' | 'sos_panic' | 'medical' | 'threat',
    coordinates?: { lat: number; lng: number },
    userProfile?: UserProfile,
    description?: string
  ) => Promise<{ incident: Incident; alert: EmergencyAlert }>;
  checkInVisitor: (id: string, gate?: string) => void;
  checkOutVisitor: (id: string, gate?: string) => void;
  issueVisitorPass: (passData: Omit<VisitorPass, 'id' | 'created_at'>) => VisitorPass;
  applyInsightAction: (insightId: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  simulateIncomingIncident: () => void;
  resetDemoData: () => void;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

const STORAGE_KEYS = {
  INCIDENTS: 'campusshield_incidents_v3',
  AUDIT_LOGS: 'campusshield_audit_logs_v3',
  NOTIFICATIONS: 'campusshield_notifications_v3',
  ALERTS: 'campusshield_alerts_v3',
  INSIGHTS: 'campusshield_insights_v3',
  VISITORS: 'campusshield_visitors_v3',
  THREAT_LEVEL: 'campusshield_threat_level_v3',
};

export function SafetyProvider({ children }: { children: React.ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_INCIDENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [alerts, setAlerts] = useState<EmergencyAlert[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.ALERTS);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ALERTS;
  });

  const [visitors, setVisitors] = useState<VisitorPass[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.VISITORS);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_VISITORS;
  });

  const [safetyInsights, setSafetyInsights] = useState<AISafetyInsight[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.INSIGHTS);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return AI_SAFETY_INSIGHTS;
  });

  const [patrolLogs] = useState<SecurityPatrolLog[]>(INITIAL_PATROL_LOGS);
  const [threatLevel, setThreatLevelState] = useState<ThreatLevel>('ELEVATED');

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
    }
  }, [incidents]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
    }
  }, [auditLogs]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    }
  }, [notifications]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    }
  }, [alerts]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(visitors));
    }
  }, [visitors]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(safetyInsights));
    }
  }, [safetyInsights]);

  const setThreatLevel = useCallback((level: ThreatLevel) => {
    setThreatLevelState(level);
    const now = new Date().toISOString();
    const newAudit: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      action: 'THREAT_LEVEL_MODIFIED',
      actor: 'Marcus Chen (Admin)',
      actorRole: 'Safety Admin',
      ip: '10.0.4.12',
      timestamp: now,
      timeAgo: 'Just now',
      entity: `Threat Level: ${level}`,
      details: `Campus security posture elevated to ${level}`,
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  }, []);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const createIncident = useCallback(async (input: CreateIncidentInput): Promise<Incident> => {
    const now = new Date().toISOString();
    const incId = `inc-${Date.now()}`;
    const incNumber = `INC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const isCritical = input.severity === 'critical';

    const localTimeline: IncidentTimelineEvent[] = [
      {
        id: `tl-${Date.now()}-1`,
        incident_id: incId,
        timestamp: now,
        title: 'Reported',
        description: input.is_anonymous
          ? 'Submitted anonymously with whistleblower protection enabled'
          : `Reported by ${input.reporter_name || 'Active Student'}`,
        actor_name: input.is_anonymous ? 'Anonymous Student' : (input.reporter_name || 'Active Student'),
        actor_role: 'Student',
        type: 'reported',
      },
    ];

    if (input.ai_analysis) {
      localTimeline.push({
        id: `tl-${Date.now()}-2`,
        incident_id: incId,
        timestamp: new Date(Date.now() + 1000).toISOString(),
        title: 'AI analyzed',
        description: `Classified as ${input.ai_analysis.severity} (${Math.round((input.ai_analysis.confidence || 0.95) * 100)}% confidence). ${input.ai_analysis.summary}`,
        actor_name: 'Gemini 3.7 Flash AI',
        actor_role: 'AI Engine',
        type: 'ai_triage',
      });
    }

    const newInc: Incident = {
      id: incId,
      incident_number: incNumber,
      reporter_id: input.is_anonymous ? 'usr-anon' : (input.reporter_id || 'usr-student-05'),
      reporter_name: input.is_anonymous ? 'Anonymous Student' : (input.reporter_name || 'Aanya Patel'),
      title: input.title,
      description: input.description,
      category: (input.category as IncidentCategory) || 'other',
      severity: input.severity,
      ai_severity: (input.ai_analysis?.severity.toLowerCase() as IncidentSeverity) || input.severity,
      ai_confidence: input.ai_analysis?.confidence || 0.96,
      ai_summary: input.ai_analysis?.summary,
      ai_recommended_actions: input.ai_analysis?.recommended_actions || ['Deploy rapid response team'],
      ai_departments: input.ai_analysis?.departments || ['Campus Security', 'Maintenance'],
      location_name: input.location_name,
      status: 'reported',
      priority_score: isCritical ? 9 : 6,
      assigned_department: input.ai_analysis?.departments?.[0] || 'Campus Security',
      assigned_officer_name: 'Unassigned',
      is_anonymous: input.is_anonymous,
      requires_immediate_response: isCritical || !!input.is_emergency,
      evidence_urls: input.evidence_urls || [],
      timeline: localTimeline,
      created_at: now,
    };

    setIncidents((prev) => [newInc, ...prev]);

    const notif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: `New Incident: ${newInc.incident_number}`,
      message: `${input.severity.toUpperCase()} — ${newInc.title} (${newInc.location_name})`,
      type: isCritical ? 'emergency' : 'incident',
      read: false,
      created_at: now,
      link: '/security',
    };
    setNotifications((prev) => [notif, ...prev]);

    const audit: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      action: isCritical ? 'CRITICAL_INCIDENT_DISPATCHED' : 'INCIDENT_CREATED',
      actor: input.is_anonymous ? 'Anonymous Student' : (input.reporter_name || 'Aanya Patel'),
      actorRole: 'Student',
      ip: '10.0.12.89',
      timestamp: now,
      timeAgo: 'Just now',
      entity: newInc.incident_number,
      details: `${input.severity.toUpperCase()} at ${newInc.location_name}: ${newInc.title}`,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    if (isCritical) {
      const alert: EmergencyAlert = {
        id: `alt-${Date.now()}`,
        title: `EMERGENCY ALERT: ${newInc.title}`,
        message: `Hazard reported at ${newInc.location_name}. Security dispatched. Exercise caution.`,
        type: 'evacuation',
        scope: 'building',
        target_entity: newInc.location_name,
        severity: 'critical',
        target_roles: ['super_admin', 'admin', 'faculty', 'student', 'security', 'warden'],
        is_active: true,
        created_by: 'Campus Safety AI Dispatch (Simulated)',
        created_at: now,
      };
      setAlerts((prev) => [alert, ...prev]);
      setThreatLevelState('HIGH_ALERT');
    }

    return newInc;
  }, []);

  const updateIncidentStatus = useCallback(
    (id: string, newStatus: IncidentStatus, actorName = 'Capt. Vikram Sharma (Security)', notes?: string) => {
      const now = new Date().toISOString();
      setIncidents((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;

          const updatedTimeline: IncidentTimelineEvent[] = [
            ...(i.timeline || []),
            {
              id: `tl-${Date.now()}`,
              incident_id: id,
              timestamp: now,
              title: `Status Changed: ${newStatus.toUpperCase().replace('_', ' ')}`,
              description: notes || `Status transitioned to ${newStatus} by ${actorName}`,
              actor_name: actorName,
              actor_role: 'Security',
              type: 'status_change',
            },
          ];

          return {
            ...i,
            status: newStatus,
            timeline: updatedTimeline,
            resolved_at: newStatus === 'resolved' ? now : i.resolved_at,
            resolution_notes: notes || i.resolution_notes,
          };
        })
      );

      const targetInc = incidents.find((i) => i.id === id);
      const audit: AuditLogEntry = {
        id: `audit-${Date.now()}`,
        action: `INCIDENT_STATUS_${newStatus.toUpperCase()}`,
        actor: actorName,
        actorRole: 'Security Officer',
        ip: '10.0.8.44',
        timestamp: now,
        timeAgo: 'Just now',
        entity: targetInc?.incident_number || id,
        details: `Incident marked as ${newStatus}. ${notes || ''}`,
      };
      setAuditLogs((prev) => [audit, ...prev]);
    },
    [incidents]
  );

  const acknowledgeIncident = useCallback(
    (id: string, officerName = 'Capt. Vikram Sharma (Security)', notes = 'Incident acknowledged and placed under active observation') => {
      const now = new Date().toISOString();
      setIncidents((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;

          const updatedTimeline: IncidentTimelineEvent[] = [
            ...(i.timeline || []),
            {
              id: `tl-${Date.now()}`,
              incident_id: id,
              timestamp: now,
              title: 'Acknowledged',
              description: `${officerName} confirmed notification. Dispatch queue active. ${notes}`,
              actor_name: officerName,
              actor_role: 'Security Officer',
              type: 'acknowledged',
            },
          ];

          return {
            ...i,
            status: 'acknowledged',
            timeline: updatedTimeline,
          };
        })
      );

      const targetInc = incidents.find((i) => i.id === id);
      const audit: AuditLogEntry = {
        id: `audit-${Date.now()}`,
        action: 'INCIDENT_ACKNOWLEDGED',
        actor: officerName,
        actorRole: 'Security Officer',
        ip: '10.0.8.44',
        timestamp: now,
        timeAgo: 'Just now',
        entity: targetInc?.incident_number || id,
        details: `Acknowledged by ${officerName}`,
      };
      setAuditLogs((prev) => [audit, ...prev]);
    },
    [incidents]
  );

  const assignIncident = useCallback(
    (id: string, officerName: string, department = 'Campus Security & Rapid Response', notes?: string) => {
      const now = new Date().toISOString();
      setIncidents((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;

          const updatedTimeline: IncidentTimelineEvent[] = [
            ...(i.timeline || []),
            {
              id: `tl-${Date.now()}`,
              incident_id: id,
              timestamp: now,
              title: 'Assigned',
              description: `Assigned to ${officerName} (${department}). ${notes || 'Designated lead handler.'}`,
              actor_name: officerName,
              actor_role: 'Security Dispatch',
              type: 'assigned',
            },
          ];

          return {
            ...i,
            assigned_officer_name: officerName,
            assigned_department: department,
            status: i.status === 'reported' ? 'assigned' : i.status,
            timeline: updatedTimeline,
          };
        })
      );

      const targetInc = incidents.find((i) => i.id === id);
      const audit: AuditLogEntry = {
        id: `audit-${Date.now()}`,
        action: 'INCIDENT_ASSIGNED',
        actor: 'Capt. Vikram Sharma (Security)',
        actorRole: 'Security Dispatcher',
        ip: '10.0.8.44',
        timestamp: now,
        timeAgo: 'Just now',
        entity: targetInc?.incident_number || id,
        details: `Assigned to ${officerName} (${department})`,
      };
      setAuditLogs((prev) => [audit, ...prev]);
    },
    [incidents]
  );

  const dispatchResponder = useCallback(
    (id: string, department = 'Rapid Reaction Patrol Alpha', officerName = 'Capt. Vikram Sharma', unitCode = 'UNIT-A1', notes?: string) => {
      const now = new Date().toISOString();
      setIncidents((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;

          const updatedTimeline: IncidentTimelineEvent[] = [
            ...(i.timeline || []),
            {
              id: `tl-${Date.now()}`,
              incident_id: id,
              timestamp: now,
              title: 'Officer dispatched',
              description: `${officerName} [${unitCode}] (${department}) deployed en-route to ${i.location_name}. ${notes || 'Sirens and mobile GPS live.'}`,
              actor_name: officerName,
              actor_role: 'Security',
              type: 'dispatch',
            },
          ];

          return {
            ...i,
            status: 'dispatched',
            dispatched_at: now,
            assigned_department: department,
            assigned_officer_name: officerName,
            timeline: updatedTimeline,
          };
        })
      );

      const targetInc = incidents.find((i) => i.id === id);
      const audit: AuditLogEntry = {
        id: `audit-${Date.now()}`,
        action: 'OFFICER_DISPATCHED',
        actor: officerName,
        actorRole: 'Security Officer',
        ip: '10.0.8.44',
        timestamp: now,
        timeAgo: 'Just now',
        entity: targetInc?.incident_number || id,
        details: `${officerName} [${unitCode}] dispatched to ${targetInc?.location_name}`,
      };
      setAuditLogs((prev) => [audit, ...prev]);
    },
    [incidents]
  );

  const startResponse = useCallback(
    (id: string, officerName = 'Capt. Vikram Sharma (Security)', notes = 'Officer reached site, perimeter secured, actively engaged') => {
      const now = new Date().toISOString();
      setIncidents((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;

          const updatedTimeline: IncidentTimelineEvent[] = [
            ...(i.timeline || []),
            {
              id: `tl-${Date.now()}`,
              incident_id: id,
              timestamp: now,
              title: 'Arrived',
              description: `${officerName} arrived at scene. Direct mitigation initiated. ${notes}`,
              actor_name: officerName,
              actor_role: 'Security',
              type: 'arrived',
            },
          ];

          return {
            ...i,
            status: 'arrived',
            arrived_at: now,
            timeline: updatedTimeline,
          };
        })
      );

      const targetInc = incidents.find((i) => i.id === id);
      const audit: AuditLogEntry = {
        id: `audit-${Date.now()}`,
        action: 'OFFICER_ARRIVED_ON_SCENE',
        actor: officerName,
        actorRole: 'Security Officer',
        ip: '10.0.8.44',
        timestamp: now,
        timeAgo: 'Just now',
        entity: targetInc?.incident_number || id,
        details: `${officerName} arrived at ${targetInc?.location_name}`,
      };
      setAuditLogs((prev) => [audit, ...prev]);
    },
    [incidents]
  );

  const resolveIncident = useCallback(
    (id: string, actorName = 'Capt. Vikram Sharma (Security)', notes = 'Area thoroughly secured, zero casualties reported, debrief filed.', resolutionCategory = 'Resolved') => {
      const now = new Date().toISOString();
      setIncidents((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;

          const updatedTimeline: IncidentTimelineEvent[] = [
            ...(i.timeline || []),
            {
              id: `tl-${Date.now()}`,
              incident_id: id,
              timestamp: now,
              title: 'Resolved',
              description: `${resolutionCategory}: ${notes}. Signed off by ${actorName}`,
              actor_name: actorName,
              actor_role: 'Security Officer',
              type: 'resolved',
            },
          ];

          return {
            ...i,
            status: 'resolved',
            resolved_at: now,
            resolution_notes: notes,
            timeline: updatedTimeline,
          };
        })
      );

      const targetInc = incidents.find((i) => i.id === id);
      const audit: AuditLogEntry = {
        id: `audit-${Date.now()}`,
        action: 'INCIDENT_RESOLVED',
        actor: actorName,
        actorRole: 'Security Officer',
        ip: '10.0.8.44',
        timestamp: now,
        timeAgo: 'Just now',
        entity: targetInc?.incident_number || id,
        details: `Incident resolved: ${notes}`,
      };
      setAuditLogs((prev) => [audit, ...prev]);
    },
    [incidents]
  );

  const broadcastEmergencyAlert = useCallback(
    (
      title: string,
      message: string,
      type: AlertType = 'general',
      severity: IncidentSeverity = 'high',
      scope: AlertScope = 'campus_wide',
      targetEntity?: string,
      senderName = 'Campus Safety Admin'
    ) => {
      const now = new Date().toISOString();
      const newAlert: EmergencyAlert = {
        id: `alt-${Date.now()}`,
        title,
        message,
        type,
        scope,
        target_entity: targetEntity,
        severity,
        target_roles: ['super_admin', 'admin', 'faculty', 'student', 'security', 'warden'],
        is_active: true,
        created_by: senderName,
        created_at: now,
      };

      setAlerts((prev) => [newAlert, ...prev]);

      const audit: AuditLogEntry = {
        id: `audit-${Date.now()}`,
        action: 'EMERGENCY_BROADCAST_TRANSMITTED',
        actor: senderName,
        actorRole: 'Safety Dispatch',
        ip: '10.0.4.12',
        timestamp: now,
        timeAgo: 'Just now',
        entity: newAlert.id,
        details: `Scope: ${scope.toUpperCase()} ${targetEntity ? `(${targetEntity})` : ''} - ${title}`,
      };
      setAuditLogs((prev) => [audit, ...prev]);

      const notif: SystemNotification = {
        id: `notif-${Date.now()}`,
        title: `CRITICAL ALERT: ${title}`,
        message: `${scope.toUpperCase()} — ${message}`,
        type: 'emergency',
        read: false,
        created_at: now,
        link: '/safety/emergency',
      };
      setNotifications((prev) => [notif, ...prev]);

      if (severity === 'critical') {
        setThreatLevelState('HIGH_ALERT');
      }
    },
    []
  );

  const triggerEmergencySos = useCallback(
    async (
      locationName: string,
      category: 'womens_safety' | 'sos_panic' | 'medical' | 'threat' = 'womens_safety',
      coordinates = { lat: 12.9716, lng: 77.5946 },
      userProfile?: UserProfile,
      description?: string
    ) => {
      const now = new Date().toISOString();
      const incId = `sos-inc-${Date.now()}`;
      const incNumber = `SOS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const callerName = userProfile?.full_name || 'Aanya Patel';
      const callerPhone = userProfile?.phone || '+91 98454 15881';
      const categoryLabel = 'Emergency SOS Distress Beacon';

      const timeline: IncidentTimelineEvent[] = [
        {
          id: `tl-sos-1-${Date.now()}`,
          incident_id: incId,
          timestamp: now,
          title: 'Reported',
          description: `SOS panic beacon triggered by ${callerName} (${callerPhone}) at ${locationName}. GPS coordinates verified.`,
          actor_name: callerName,
          actor_role: userProfile?.role === 'student' ? 'Student' : 'Campus Member',
          type: 'reported',
        },
        {
          id: `tl-sos-2-${Date.now()}`,
          incident_id: incId,
          timestamp: new Date(Date.now() + 500).toISOString(),
          title: 'AI analyzed',
          description: `Gemini 3.7 Flash AI evaluated distress beacon: Classified CRITICAL Tier (99% confidence). Instant Security Dispatch protocol initiated.`,
          actor_name: 'Gemini 3.7 Flash AI',
          actor_role: 'Autonomous Safety Engine',
          type: 'ai_triage',
        },
        {
          id: `tl-sos-3-${Date.now()}`,
          incident_id: incId,
          timestamp: new Date(Date.now() + 1000).toISOString(),
          title: 'Assigned',
          description: `Assigned immediately to Sector Rapid Response Unit (Lead: Capt. Vikram Sharma).`,
          actor_name: 'Security Automated Dispatch',
          actor_role: 'Security SOC',
          type: 'assigned',
        },
        {
          id: `tl-sos-4-${Date.now()}`,
          incident_id: incId,
          timestamp: new Date(Date.now() + 1500).toISOString(),
          title: 'Acknowledged',
          description: `Security Command Center acknowledged panic alert. Unit Alpha on priority deployment.`,
          actor_name: 'Capt. Vikram Sharma',
          actor_role: 'Security Officer',
          type: 'acknowledged',
        },
        {
          id: `tl-sos-5-${Date.now()}`,
          incident_id: incId,
          timestamp: new Date(Date.now() + 2000).toISOString(),
          title: 'Officer dispatched',
          description: `Officer Ramos [Patrol Alpha] dispatched en-route to ${locationName}. ETA ~90 seconds.`,
          actor_name: 'Officer Ramos (Unit Alpha)',
          actor_role: 'Security Responder',
          type: 'dispatch',
        },
      ];

      const newInc: Incident = {
        id: incId,
        incident_number: incNumber,
        reporter_id: userProfile?.id || 'usr-student-05',
        reporter_name: callerName,
        title: `${categoryLabel} — ${locationName}`,
        description:
          description ||
          `Emergency distress signal transmitted by ${callerName} at ${locationName}. Direct officer dispatch engaged.`,
        category: category,
        severity: 'critical',
        ai_severity: 'critical',
        ai_confidence: 0.99,
        ai_summary: `High-priority SOS signal active at ${locationName}. Response team dispatched.`,
        ai_recommended_actions: [
          'Immediate physical patrol dispatch to caller coordinates',
          'Lock on closest CCTV feed overlooking location',
          'Contact caller emergency phone line',
          'Alert Campus Medical and Executive Safety Officer',
        ],
        ai_departments: ['Campus Security', 'Emergency Rapid Response', 'Campus Medical'],
        location_name: locationName,
        location_lat: coordinates.lat,
        location_lng: coordinates.lng,
        status: 'dispatched',
        priority_score: 10,
        assigned_department: 'Campus Security & Rapid Response',
        assigned_officer_name: 'Capt. Vikram Sharma & Officer Ramos',
        dispatched_at: now,
        is_anonymous: false,
        requires_immediate_response: true,
        timeline: timeline,
        created_at: now,
      };

      setIncidents((prev) => [newInc, ...prev]);

      const emergencyAlert: EmergencyAlert = {
        id: `sos-alt-${Date.now()}`,
        title: `CRITICAL SOS: ${categoryLabel} at ${locationName}`,
        message: `Distress ping from ${callerName}. Security units dispatched. Keep sector access clear.`,
        type: 'security',
        scope: 'building',
        target_entity: locationName,
        severity: 'critical',
        target_roles: ['super_admin', 'admin', 'security', 'faculty', 'warden'],
        is_active: true,
        created_by: `SOS Panic Mesh (Caller: ${callerName})`,
        created_at: now,
      };

      setAlerts((prev) => [emergencyAlert, ...prev]);
      setThreatLevelState('HIGH_ALERT');

      const notifSecurity: SystemNotification = {
        id: `notif-sec-${Date.now()}`,
        title: `🚨 EMERGENCY SOS: ${callerName}`,
        message: `${categoryLabel} at ${locationName}. Patrol Unit Alpha dispatched!`,
        type: 'emergency',
        read: false,
        created_at: now,
        link: '/security',
      };

      const notifAdmin: SystemNotification = {
        id: `notif-adm-${Date.now()}`,
        title: `EMERGENCY SOS LOGGED: ${newInc.incident_number}`,
        message: `Critical alert triggered by ${callerName} at ${locationName}. Security dispatched.`,
        type: 'emergency',
        read: false,
        created_at: now,
        link: '/safety/command-center',
      };

      setNotifications((prev) => [notifSecurity, notifAdmin, ...prev]);

      const audit: AuditLogEntry = {
        id: `audit-sos-${Date.now()}`,
        action: 'EMERGENCY_SOS_ACTIVATED',
        actor: callerName,
        actorRole: userProfile?.role || 'student',
        ip: '10.0.15.22 (Mobile SOS)',
        timestamp: now,
        timeAgo: 'Just now',
        entity: newInc.incident_number,
        details: `SOS beacon: ${locationName} (${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)})`,
      };
      setAuditLogs((prev) => [audit, ...prev]);

      return { incident: newInc, alert: emergencyAlert };
    },
    []
  );

  const checkInVisitor = useCallback((id: string, gate = 'Main Security Gate Alpha') => {
    const now = new Date().toISOString();
    setVisitors((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              status: 'checked_in',
              check_in_time: now,
              gate_entry: gate,
            }
          : v
      )
    );

    const targetVisitor = visitors.find((v) => v.id === id);
    const audit: AuditLogEntry = {
      id: `audit-vis-in-${Date.now()}`,
      action: 'VISITOR_CHECKED_IN',
      actor: 'Capt. Vikram Sharma (Security)',
      actorRole: 'Security Officer',
      ip: '10.0.8.44',
      timestamp: now,
      timeAgo: 'Just now',
      entity: targetVisitor?.pass_number || id,
      details: `${targetVisitor?.visitor_name} checked in at ${gate}`,
    };
    setAuditLogs((prev) => [audit, ...prev]);
  }, [visitors]);

  const checkOutVisitor = useCallback((id: string, gate = 'Main Security Gate Alpha') => {
    const now = new Date().toISOString();
    setVisitors((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              status: 'checked_out',
              check_out_time: now,
            }
          : v
      )
    );

    const targetVisitor = visitors.find((v) => v.id === id);
    const audit: AuditLogEntry = {
      id: `audit-vis-out-${Date.now()}`,
      action: 'VISITOR_CHECKED_OUT',
      actor: 'Capt. Vikram Sharma (Security)',
      actorRole: 'Security Officer',
      ip: '10.0.8.44',
      timestamp: now,
      timeAgo: 'Just now',
      entity: targetVisitor?.pass_number || id,
      details: `${targetVisitor?.visitor_name} checked out from ${gate}`,
    };
    setAuditLogs((prev) => [audit, ...prev]);
  }, [visitors]);

  const issueVisitorPass = useCallback((passData: Omit<VisitorPass, 'id' | 'created_at'>): VisitorPass => {
    const now = new Date().toISOString();
    const newPass: VisitorPass = {
      ...passData,
      id: `vis-${Date.now()}`,
      created_at: now,
    };

    setVisitors((prev) => [newPass, ...prev]);

    const audit: AuditLogEntry = {
      id: `audit-vis-iss-${Date.now()}`,
      action: 'VISITOR_PASS_ISSUED',
      actor: 'Capt. Vikram Sharma (Security)',
      actorRole: 'Security Officer',
      ip: '10.0.8.44',
      timestamp: now,
      timeAgo: 'Just now',
      entity: newPass.pass_number,
      details: `Pass issued for ${newPass.visitor_name} visiting ${newPass.host_name}`,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    return newPass;
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const applyInsightAction = useCallback((insightId: string) => {
    const now = new Date().toISOString();
    setSafetyInsights((prev) =>
      prev.map((ins) => (ins.id === insightId ? { ...ins, action_status: 'applied' } : ins))
    );

    const insight = safetyInsights.find((i) => i.id === insightId);
    const audit: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      action: 'AI_INSIGHT_RECOMMENDATION_EXECUTED',
      actor: 'Marcus Chen (Admin)',
      actorRole: 'Safety Admin',
      ip: '10.0.4.12',
      timestamp: now,
      timeAgo: 'Just now',
      entity: insight?.title || insightId,
      details: `Preventative SOP directive generated for ${insight?.location}`,
    };
    setAuditLogs((prev) => [audit, ...prev]);
  }, [safetyInsights]);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const simulateIncomingIncident = useCallback(() => {
    createIncident({
      title: 'Smoke & Electrical Arcing near Block D Transformer Hub',
      description: 'There is smoke coming from the electrical room near Block D. I can also smell something burning.',
      location_name: 'Engineering Block',
      category: 'fire',
      severity: 'critical',
      is_emergency: true,
      reporter_name: 'Aanya Patel',
      ai_analysis: {
        category: 'fire',
        severity: 'CRITICAL',
        confidence: 0.98,
        summary: 'Active smoke and potential electrical fire hazard detected in Block D. Immediate containment and circuit isolation required.',
        location: 'Block D / Engineering Block',
        recommended_actions: [
          'Dispatch Campus Rapid Security & Hazmat Team immediately',
          'Isolate local electrical main distribution breakers',
          'Initiate Level 1 localized building evacuation',
          'Notify Facility & Maintenance and Campus Executive Administration',
        ],
        departments: ['Security', 'Maintenance', 'Administration'],
        emergency_required: true,
      },
    });
  }, [createIncident]);

  const resetDemoData = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.INCIDENTS);
      localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      localStorage.removeItem(STORAGE_KEYS.ALERTS);
      localStorage.removeItem(STORAGE_KEYS.VISITORS);
      localStorage.removeItem(STORAGE_KEYS.INSIGHTS);
    }
    setIncidents(INITIAL_INCIDENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAlerts(INITIAL_ALERTS);
    setVisitors(INITIAL_VISITORS);
    setSafetyInsights(AI_SAFETY_INSIGHTS);
    setThreatLevelState('ELEVATED');
  }, []);

  return (
    <SafetyContext.Provider
      value={{
        incidents,
        auditLogs,
        notifications,
        alerts,
        patrolLogs,
        safetyInsights,
        visitors,
        threatLevel,
        unreadNotificationsCount,
        setThreatLevel,
        createIncident,
        updateIncidentStatus,
        acknowledgeIncident,
        assignIncident,
        dispatchResponder,
        startResponse,
        resolveIncident,
        broadcastEmergencyAlert,
        dismissAlert,
        triggerEmergencySos,
        checkInVisitor,
        checkOutVisitor,
        issueVisitorPass,
        applyInsightAction,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        simulateIncomingIncident,
        resetDemoData,
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety(): SafetyContextType {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
}

