# Luminous — Backend API Documentation & Frontend Integration Guide

This guide details all Supabase Edge Functions, database schema, Realtime channels, and authentication integration rules for the frontend development team.

---

## 1. Authentication & Base Configuration

### Supabase Client Initialization (Frontend)
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Calling Edge Functions
All Edge Functions accept an authenticated user session token automatically when invoked via `supabase.functions.invoke`:
```typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { ...payload }
})
```

---

## 2. Edge Functions Specification

### 2.1 `trigger-sos`
Triggers an emergency SOS panic event (Level 1 Campus or Level 2 Police) with intelligent cross-validated location resolution and smart guard dispatch.

- **Endpoint**: `POST /functions/v1/trigger-sos`
- **Request Headers**: `Authorization: Bearer <user_token>`
- **Request Body**:
```json
{
  "level": "campus", // "campus" (3 presses) or "police" (5 presses)
  "location": {
    "lat": 12.9712,
    "lng": 77.5912,
    "accuracy": 120.5 // in meters
  }
}
```
- **Response `(200 OK)`**:
```json
{
  "incidentId": "a1b2c3d4-...",
  "locationSource": "gps_with_timetable_confirmed", // or "gps", "gps_with_outing_confirmed", etc.
  "gpsLocation": {
    "lat": 12.9712,
    "lng": 77.5912,
    "accuracy": 120.5
  },
  "locationHint": {
    "type": "timetable",
    "building": "Chemistry Block",
    "room": "CHEM-Lab3",
    "subject": "Chemistry",
    "confirmed": true,
    "note": "Likely in Chemistry Block, CHEM-Lab3 (scheduled for Chemistry, confirmed within GPS radius)"
  },
  "assignedGuard": {
    "id": "u-guard-1",
    "name": "Rajesh Yadav",
    "phone": "+919900110001",
    "distanceMeters": 45.2
  },
  "backupGuards": [
    {
      "id": "u-guard-2",
      "name": "Suresh Patil",
      "phone": "+919900110002",
      "distanceMeters": 110.8
    }
  ]
}
```

---

### 2.2 `resolve-location`
Cross-validates GPS area with student timetable or active outing request without triggering an SOS incident.

- **Endpoint**: `POST /functions/v1/resolve-location`
- **Request Body**:
```json
{
  "userId": "uuid-of-student",
  "location": {
    "lat": 12.9712,
    "lng": 77.5912,
    "accuracy": 95.0
  }
}
```
- **Response `(200 OK)`**:
```json
{
  "gpsLocation": { "lat": 12.9712, "lng": 77.5912, "accuracy": 95.0 },
  "source": "gps_with_timetable_confirmed",
  "confidence": "medium_high",
  "hint": {
    "type": "timetable",
    "building": "Chemistry Block",
    "room": "CHEM-Lab3",
    "subject": "Chemistry",
    "confirmed": true,
    "note": "Likely in Chemistry Block, CHEM-Lab3 (scheduled for Chemistry, within GPS radius)"
  }
}
```

---

### 2.3 `escalate-sos`
Promotes an unresolved Level 1 (Campus) SOS incident to Level 2 (Police) after a 120-second timeout or manual escalation.

- **Endpoint**: `POST /functions/v1/escalate-sos`
- **Request Body**:
```json
{
  "incidentId": "uuid-of-incident"
}
```
- **Response `(200 OK)`**:
```json
{
  "escalated": true,
  "incidentId": "uuid-of-incident",
  "allGuardsNotified": 6,
  "guards": [
    { "id": "g-1", "name": "Rajesh Yadav", "phone": "+919900110001" },
    { "id": "g-2", "name": "Suresh Patil", "phone": "+919900110002" }
  ]
}
```

---

### 2.4 `classify-tip`
Classifies student anonymous tips using Google Gemini 2.0 Flash into categorized reports and severity ratings.

- **Endpoint**: `POST /functions/v1/classify-tip`
- **Request Body**:
```json
{
  "text": "Some seniors in BH block are forcing freshers to do push-ups after midnight.",
  "anonymous": true
}
```
- **Response `(201 Created)`**:
```json
{
  "tipId": "tip-uuid",
  "aiCategory": "ragging", // "harassment" | "ragging" | "infrastructure" | "medical" | "academic" | "other"
  "aiSeverity": "high"     // "low" | "medium" | "high"
}
```

---

### 2.5 `triage-chat`
Evaluates wellbeing conversation messages with Gemini AI for urgency classification and anti-spam triage.

- **Endpoint**: `POST /functions/v1/triage-chat`
- **Request Body**:
```json
{
  "messages": [
    { "role": "user", "content": "I am feeling overwhelmed with exams and having severe panic attacks every night." }
  ]
}
```
- **Response `(200 OK)`**:
```json
{
  "urgency": "HIGH", // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  "isSpam": false,
  "reasoning": "Student reports recurring panic attacks and acute distress requiring immediate counselor intervention.",
  "suggestedAction": "connect_now", // "deflect" | "schedule" | "connect_now" | "emergency"
  "deflectionResponse": null
}
```

---

### 2.6 `warm-handoff`
Generates a compassionate 3-bullet factual summary and approach strategy for the assigned campus therapist before joining a session.

- **Endpoint**: `POST /functions/v1/warm-handoff`
- **Request Body**:
```json
{
  "sessionId": "session-uuid",
  "messages": [
    { "role": "user", "content": "I can't sleep because of intense anxiety about grades." },
    { "role": "assistant", "content": "I hear how hard this has been for you. Let me connect you to Dr. Meena." }
  ]
}
```
- **Response `(200 OK)`**:
```json
{
  "sessionId": "session-uuid",
  "bullets": [
    "Student reports severe sleep disruption due to academic anxiety.",
    "Expresses fear of failure in upcoming semester examinations.",
    "Receptive to immediate counseling and coping strategies."
  ],
  "suggestedApproach": "Validate academic stress, introduce calming breathing exercises, and establish a manageable study schedule."
}
```

---

### 2.7 `match-therapist`
Assigns an available, non-busy therapist balancing session loads across the campus counseling team.

- **Endpoint**: `POST /functions/v1/match-therapist`
- **Request Body**:
```json
{
  "studentId": "student-uuid",
  "urgency": "high",
  "anonymous": false,
  "triageSummary": "Acute panic attack symptoms during exam week."
}
```
- **Response `(200 OK)`**:
```json
{
  "sessionId": "session-uuid",
  "therapist": {
    "id": "therapist-uuid",
    "name": "Dr. Meena Iyer",
    "specialization": "Anxiety & Panic Disorders"
  },
  "status": "connected" // or "queued"
}
```

---

### 2.8 `check-geofence`
Detects whether a student is inside a campus building polygon and automatically marks attendance if a scheduled class slot matches.

- **Endpoint**: `POST /functions/v1/check-geofence`
- **Request Body**:
```json
{
  "userId": "student-uuid",
  "location": {
    "lat": 12.9700,
    "lng": 77.5900
  }
}
```
- **Response `(200 OK)`**:
```json
{
  "insideBuilding": true,
  "buildingName": "Computer Science Block",
  "attendanceMarked": true
}
```

---

## 3. Realtime Subscription Channels

### 3.1 Incidents (Admin & Security Dashboard)
```typescript
const channel = supabase
  .channel('public:incidents')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'incidents' },
    (payload) => {
      console.log('Incident update received:', payload)
      // Refresh active incidents or update UI pin
    }
  )
  .subscribe()
```

### 3.2 Therapy Sessions (Therapist Dashboard)
```typescript
const channel = supabase
  .channel('public:therapy_sessions')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'therapy_sessions', filter: `therapist_id=eq.${currentUserId}` },
    (payload) => {
      console.log('New student session assigned:', payload.new)
    }
  )
  .subscribe()
```

---

## 4. Database Views for Quick UI Binding

| View Name | Target Screen | Description |
|---|---|---|
| `active_incidents_view` | Command Center Map | Joins active incidents with student name, blood group, medical conditions, and assigned guard details. |
| `available_guards_view` | Dispatch Monitor | Lists available security guards with real-time PostGIS locations and timestamps. |
| `available_therapists_view` | Student Counseling Screen | Lists currently available therapists with specializations and load statistics. |

---

## 5. Offline SMS URI Format
When `navigator.onLine === false`, the frontend triggers native SMS:
```typescript
const sendOfflineSOS = (guardPhone: string, studentName: string, lat: number, lng: number, bloodGroup: string, medical: string) => {
  const mapLink = `https://maps.google.com/?q=${lat},${lng}`
  const body = encodeURIComponent(
    `EMERGENCY SOS: ${studentName} needs urgent help at GPS (${lat.toFixed(5)}, ${lng.toFixed(5)}) ${mapLink}. Blood: ${bloodGroup || 'N/A'}, Medical: ${medical || 'None'}`
  )
  window.location.href = `sms:${guardPhone}?body=${body}`
}
```
