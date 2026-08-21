# 🌟 Luminous — AI-Powered Campus Safety ERP & Smart Campus Platform

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
4. **AI Copilot & Incident Assistant**: Natural language querying and automated triage for security personnel.

### 🟢 Smart ERP Integration
1. **Academic ERP**: Full curriculum management, timetables, attendance tracking, courses, and departments.
2. **Geofenced Attendance**: Automatic attendance verification using PostGIS polygon boundaries and scheduled class slots.
3. **Leave & Outing Filing**: Off-campus visit requests with destination coordinates acting as secondary location hints.
4. **Medical Student Profiles**: Vital information (blood group, allergies, conditions) displayed directly to responding security guards.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts
- **Backend & Database**: Supabase (PostgreSQL 17 + PostGIS)
- **Security**: ~50 Row Level Security (RLS) policies with `security_invoker = true`
- **Serverless Compute**: Supabase Edge Functions (Deno / TypeScript) & Next.js API Routes
- **AI Intelligence**: Google Gemini 2.0 Flash
- **Realtime**: Supabase Realtime WebSocket Channels

---

## 📂 Repository Structure

```
├── docs/
│   ├── DATABASE_DESIGN.md             # Comprehensive DB schema & entity relationships
│   ├── DATABASE_IMPLEMENTATION.md     # Production implementation & deployment guide
│   ├── HACKATHON_DEMO.md              # 5-minute interactive pitch & demo guide
│   ├── QA_REPORT.md                   # Full QA verification & audit report
│   ├── SECURITY_AUDIT.md              # RLS and RBAC security analysis
│   ├── UI_UX_DESIGN.md                # Design system and user experience specs
│   ├── Luminous_Summary.docx          # Demo script & judge Q&As
│   └── Luminous_Preparation_Guide.pdf # Architecture & presentation guide
├── src/                               # Next.js frontend & full dashboard suite
│   ├── app/                           # App router pages (Safety, ERP, Auth, APIs)
│   ├── components/                    # UI & Feature components (Copilot, Map, Charts)
│   └── lib/                           # Contexts, Services, Hooks, and Supabase client
├── supabase/
│   ├── migrations/                    # Core schema, academic ERP, safety, and RLS policies
│   ├── functions/                     # Edge functions (SOS, Location, AI Triage, Handoff)
│   └── seed/                          # Demo seed datasets
├── API_DOCUMENTATION.md               # API endpoints & Realtime specifications
└── README.md
```

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 3. Run Automated Tests
```bash
npm test
```

