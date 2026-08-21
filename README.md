# 🌟 Luminous — AI-Powered Campus Safety ERP

> **Where Every ERP Module Becomes an Intelligent Safety Net.**

Luminous is a unified campus platform where daily academic modules (timetables, attendance, student profiles, leave requests) directly power an enterprise-grade emergency response system.

---

## 🚀 Key Innovations & Features

### 🔴 Core Safety & Smart Dispatch
1. **Tiered Emergency SOS**:
   - **3 Presses**: Level 1 Campus Alert → dispatches nearest available guard/volunteer via PostGIS geospatial calculation.
   - **5 Presses**: Level 2 Police/Emergency (112) → broadcasts to all campus responders & parents.
   - **Auto-Escalation**: Unanswered Level 1 alerts auto-escalate to Level 2 after 120 seconds.
2. **Cross-Validated Indoor Location ("Dead Reckoning")**:
   - When GPS accuracy degrades indoors (>50m), the system cross-validates against the student's timetable and approved off-campus outing requests.
   - Guard receives both the GPS approximate radius and contextual hints (*"Likely in Chemistry Block, Lab 3"*).
3. **Ghost Mode Privacy**: Zero continuous tracking. Location is only transmitted on SOS trigger, attendance geofence entry, or opt-in Night Walk mode.
4. **Offline / Airplane Mode Failsafe**: Instant fallback to native SMS pre-populated with GPS coordinates, blood group, medical conditions, and guard numbers.

### 🟡 AI-Powered Modules (Google Gemini 2.0 Flash)
1. **Anonymous Tip Classifier**: Classifies student tips into category (*ragging, harassment, infrastructure, etc.*) and severity (*low, medium, high*).
2. **Wellbeing Chat Triage & Anti-Spam**: Evaluates student messages, assigns urgency scores, and filters joke/spam submissions.
3. **Warm Counselor Handoff**: Generates a 3-bullet factual summary and approach strategy for therapists so students never have to re-explain their trauma.

### 🟢 Smart ERP Integration
1. **Geofenced Attendance**: Automatic attendance verification using PostGIS polygon boundaries and scheduled class slots.
2. **Leave & Outing Filing**: Off-campus visit requests with destination coordinates acting as secondary location hints.
3. **Medical Student Profiles**: Vital information (blood group, allergies, conditions) displayed directly to responding security guards.

---

## 🛠️ Technology Stack

- **Backend & Database**: Supabase (PostgreSQL 17 + PostGIS)
- **Security**: ~50 Row Level Security (RLS) policies with `security_invoker = true`
- **Serverless Compute**: 8 Supabase Edge Functions (Deno / TypeScript)
- **AI Intelligence**: Google Gemini 2.0 Flash
- **Realtime**: Supabase Realtime WebSocket Channels
- **Frontend / Integration**: React + Vite (PWA), Leaflet.js, Tailwind CSS + shadcn/ui

---

## 📂 Repository Structure

```
├── docs/
│   ├── Luminous_Summary.docx          # Complete 5-minute demo script & judge Q&As
│   └── Luminous_Preparation_Guide.pdf # Architecture & presentation preparation guide
├── supabase/
│   ├── migrations/
│   │   ├── 001_schema.sql             # 14 tables, 10 enums, 20+ indexes, 3 views
│   │   ├── 002_rls_policies.sql       # Role-based Row Level Security policies
│   │   ├── 003_outing_requests.sql    # Outing & leave filing with PostGIS
│   │   └── 004_helper_functions.sql   # PostGIS smart dispatch & geofence RPCs
│   ├── functions/
│   │   ├── trigger-sos/               # 3-press/5-press SOS + smart dispatch
│   │   ├── resolve-location/          # GPS & timetable cross-validation engine
│   │   ├── escalate-sos/              # Auto-escalation to police (112)
│   │   ├── classify-tip/              # Gemini tip classification
│   │   ├── triage-chat/               # Gemini wellbeing triage & anti-spam
│   │   ├── warm-handoff/              # Gemini 3-bullet counselor summary
│   │   ├── match-therapist/           # Load-balanced counselor assignment
│   │   └── check-geofence/            # PostGIS polygon attendance
│   └── seed/
│       ├── seed_data.sql              # Realistic demo dataset (Bangalore campus)
│       └── reset.sql                  # Safe table truncate script
├── API_DOCUMENTATION.md               # Frontend API endpoints & Realtime contract
└── README.md
```

---

## 📖 API Documentation & Frontend Integration

Refer to [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) for full request/response schemas, Edge Function URLs, and Realtime listener examples.
