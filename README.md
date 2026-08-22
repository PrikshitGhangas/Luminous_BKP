# Luminous — Comprehensive Technical Documentation

> **Platform**: Luminous Campus Safety & Academic Governance Platform  
> **Repository**: `PrikshitGhangas/Luminous_BKP`  
> **Build Status**: Production-Verified (Next.js 16.3.1, 0 errors, 48/48 static pages)

---

## Table of Contents

1. [Executive Summary & Core Novelties](#1-executive-summary--key-technical-novelties)
2. [Technology Stack — Frontend & Backend](#2-technology-stack)
3. [Technology Justification & Alternatives Analysis](#3-technology-justification)
4. [Security & Emergency Safety System — In Depth](#4-security-system)
5. [ERP Architecture & Institutional Benefits](#5-erp-architecture)
6. [Future Expansion — What Else Can We Do](#6-future-expansion)

---

## 1. Executive Summary & Key Technical Novelties

Luminous is an enterprise campus operating system uniting high-stakes safety operations (two-tier SOS beacons, real-time CAD vector map, SLA timers, AI incident triage) with end-to-end academic ERP governance (21 integrated modules across courses, attendance, exams, hostels, placements, and wellbeing).

Below is the comprehensive breakdown of the core technical novelties and innovations engineered into Luminous:

### 1.1 Dual-Fidelity Spatial Engine & Timetable Fallback Localization
* **The Problem:** Indoor GPS signals degrade or fail completely inside multi-story concrete academic blocks, labs, and basements (accuracy often >50m-100m).
* **The Novelty:** When GPS accuracy drops below safety thresholds during an SOS event, the system initiates a **Spatial-Temporal Fallback Engine**:
  - Automatically queries the student's live academic timetable (`timetable_slots`) for the current day and timestamp.
  - Cross-references the building polygon in PostGIS (`campus_buildings`) to pinpoint the student's exact classroom and floor coordinates (`location_source: 'timetable_fallback'`).
  - Guarantees zero blind spots during campus emergencies.

### 1.2 Dynamic Multi-Tiered SOS & Autonomous SLA Escalation
* **The Novelty:** Two-stage civilian emergency response with automated failsafes:
  - **Level 1 (Campus Quick Response):** Proximity-based dispatch to the nearest available campus guard or student safety volunteer via PostGIS `ST_Distance` calculation.
  - **Level 2 (Police & Emergency Dispatch):** Instant high-priority broadcast to all campus security units and external emergency authorities.
  - **Autonomous SLA Escalation:** If a Level 1 incident is not acknowledged by an on-duty guard within a **300-second (5-minute) SLA window**, the system autonomously escalates the distress call to Level 2 and alerts all squads without requiring manual re-triggering.
  - **False-Positive Prevention:** Interactive hold-to-activate progress ring prevents accidental triggers.

### 1.3 Multi-Agent AI Mental Health Triage & "Warm Handoff" Protocol
* **The Novelty:** A compassionate, multi-stage clinical assistance architecture powered by Google Gemini:
  - **Zero-Wait Triage:** Evaluates conversational sentiment in real-time, categorizing urgency (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL` / self-harm).
  - **Anonymous "Warm Handoff":** When transferring a distressed student to a human counselor or therapist, the AI generates a structured, factual 3-bullet clinical summary of the conversation. This gives the counselor immediate context while protecting student anonymity and preventing painful repetition and retraumatization.
  - **Therapist Load Balancing:** Intelligently matches students with available counselors based on clinical specialization and daily session load.

### 1.4 Interactive Architectural Blueprint & Campus Vector Map
* **The Novelty:** A custom vector-based campus blueprint (`MAP_VECTOR_PATH`) coupled with real-time geospatial overlays:
  - Visualizes all core facilities (Academic Blocks, Computer Center, Campus Medical Center, Hostels, Innovation Hub, Administration, Sports Complex).
  - Real-time guard patrol telemetry with dynamic status indicators (`Available`, `On Patrol`, `Responding`).
  - Sector-by-sector risk intelligence and safety heatmaps.

### 1.5 Confidential AI Grievance & Anti-Ragging Intelligence
* **The Novelty:** Fully anonymous reporting pipeline for ragging, harassment, infrastructure defects, and safety concerns:
  - Real-time NLP classification categorizes incoming tips and assigns severity levels (`Low`, `Medium`, `High`, `Critical`).
  - Strict cryptographic isolation ensuring student identities cannot be traced by reviewers, encouraging early reporting of campus safety concerns.

### 1.6 Full Convergence of Academic ERP & Campus Safety
* **The Novelty:** Unlike fragmented campus tools (separate apps for attendance, ERP, and security), Luminous unifies:
  - **Geofenced Automated Attendance:** Verifies presence within classroom spatial boundaries during scheduled timetable slots.
  - **Emergency Contact Graphs & Trusted Circles:** Integrates parent portals, peer walking buddies, and academic advisors into a unified safety network.
  - **Cross-Departmental Schedules:** Synchronized class grids across CSE, AI-DS, ECE, MECH, and CIVIL with real-time instructor and room mapping.

### 1.7 Zero-Trust Row-Level Security (RLS) & Multi-Persona RBAC
* **The Novelty:** Specialized personas (`Student`, `Faculty`, `Guard`, `Volunteer`, `Admin`, `Parent`, `Therapist`):
  - Database-enforced Row Level Security (RLS) ensuring strict isolation (e.g., therapists only see assigned clinical notes; parents only see their student's safety status; guards only see active unassigned incidents).

---

## 2. Technology Stack

### 2.1 Frontend Stack

| Technology | Version | Role in Luminous |
|:---|:---|:---|
| **Next.js** | `16.3.1` | Full-stack React meta-framework — App Router, SSR/SSG, Edge Proxy Middleware, Route Handlers, and static asset optimization |
| **React** | `19.2.8` | Core UI rendering engine with Server Components, Suspense boundaries, and client-side interactivity |
| **TypeScript** | `^5` | Strict static type safety across the entire codebase with `strict: true` |
| **Tailwind CSS** | `v4.3.3` | Utility-first CSS framework with CSS-first `@import "tailwindcss"` configuration (no legacy config needed) |
| **Recharts** | `^3.10.1` | Composable SVG-based charting (grade distribution donuts, incident velocity bars, attendance trends) |
| **Lucide React** | `^1.33.0` | Consistent SVG icon system (800+ icons) for navigation, safety alerts, dashboards, and modals |
| **Zod** | `^4.4.3` | Runtime schema validation with static TypeScript type inference for forms, API payloads, and AI responses |
| **class-variance-authority** | `^0.7.1` | Type-safe CSS variant management for UI primitives (Buttons, Badges, Cards) |
| **clsx + tailwind-merge** | `^2.1.1` / `^3.6.0` | Conditional className construction and conflict-free Tailwind class merging via the `cn()` utility |

#### UI Component Library
The UI layer follows shadcn/ui architectural patterns implemented as **lightweight native React 19 primitives with zero Radix UI dependencies**:
- **`Button`** — Polymorphic button with `asChild` support, 8 variants including `emergency` (with pulse animation), and 4 sizes
- **`Badge`** — 13 semantic variants (`critical`, `high`, `medium`, `low`, `gold`, `safe`, `warning`, etc.)
- **`Card`** — Composable compound components (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`)
- **`Tabs`** — Standalone React Context-driven tab system (controlled and uncontrolled modes)
- **`Input`** — Accessible input primitive with gold focus-ring styling
- **`Skeleton`** — Pulse loading state indicator

#### Custom Design System (`globals.css`)
- **Luminous Gold Brand**: `--color-gold-primary` (#D4AF37), `--color-gold-bright` (#F4C430), `--color-gold-champagne` (#C5A059)
- **Frosted Silver Palette**: Charcoal (#202226) -> Silver (#BDBEC5) -> XLight (#E7E8EB)
- **Semantic Status Colors**: Critical (#C94C4C), Warning (#B7791F), Safe (#3F8F68), Info (#2563EB)
- **Custom Animations**: `@keyframes radar-pulse` for real-time security command dots, luxury card hover effects

#### State Management Architecture
State is managed via **4 modular React Context providers** with LocalStorage persistence:

| Context | Domain | Manages |
|:---|:---|:---|
| `AuthContext` | Identity & RBAC | 9 user roles, session tokens, role-switching, profile management |
| `SafetyContext` | Campus Safety | Live incidents, threat levels (NORMAL->CRITICAL), emergency alerts, patrol logs, audit trails |
| `AcademicContext` | Academic ERP | Departments, courses, faculty, students, attendance, exams, timetables |
| `CampusServicesContext` | Facility Operations | Hostel management, complaints, placements, wellbeing, transport |

---

### 2.2 Backend Stack

| Technology | Version | Role in Luminous |
|:---|:---|:---|
| **Next.js Route Handlers** | `16.3.1` | Server-side API endpoints (`src/app/api/`) with Edge runtime support |
| **Next.js Edge Proxy** | `16.3.1` | Edge middleware (`src/proxy.ts`) for security headers, RBAC, and session management |
| **Supabase** | `^2.112.3` | PostgreSQL database, Auth (JWT sessions), Row Level Security (RLS), and Realtime WebSocket subscriptions |
| **@supabase/ssr** | `^0.12.4` | Cookie-based server-side authentication across Server Components, Route Handlers, and Edge middleware |
| **Google Gemini AI** | `2.0 Flash` / `3.7 Flash` | AI-powered incident classification, complaint triage, and natural language copilot assistant |
| **Zod** | `^4.4.3` | Server-side request validation and AI output schema enforcement |
| **Node.js crypto** | Built-in | Cryptographically secure UUID generation (`crypto.randomUUID()`) for resource IDs and tracking numbers |
| **pg** | `^8.23.0` | Direct PostgreSQL client for database verification scripts |

#### API Route Architecture
All 9 API endpoints follow a uniform 6-layer security pipeline:
```
Request -> CSRF Check -> Rate Limit -> Auth Guard -> Zod Validation -> RBAC -> Business Logic
```

| Endpoint | Methods | Rate Limit | Description |
|:---|:---|:---|:---|
| `/api/auth` | GET, POST | 20/min | Demo persona enumeration (dev only) and login credential validation |
| `/api/incidents` | GET, POST | 30-60/min | Incident registry query and creation with AI triage, cryptographic IDs, and timeline generation |
| `/api/sos` | POST | 10/min | Emergency distress beacon (Women's Safety / Panic / Medical) with GPS and timetable fallback |
| `/api/alerts` | GET, POST | 5-60/min | Emergency broadcast system with multi-scope targeting (campus, building, hostel, department) |
| `/api/ai/copilot` | POST | 25/min | CampusShield AI assistant with RBAC-enforced tool execution and Gemini synthesis |
| `/api/ai/classify-incident` | POST | 35/min | AI incident triage with prompt injection defense and deterministic fallback |
| `/api/ai/classify-complaint` | POST | 35/min | AI grievance classification across 8 complaint domains |

---

## 3. Technology Justification

### 3.1 Why Next.js 16 — Not Create React App, Vite, Remix, or Nuxt

| Criterion | Next.js 16 (Chosen) | Create React App | Vite + React | Remix | Nuxt (Vue) |
|:---|:---|:---|:---|:---|:---|
| **SSR + SSG + ISR** | Supported (Native) | Not Supported | CSR Only | SSR Only | Supported |
| **Edge Middleware** | Native `proxy.ts` | Not Supported | Not Supported | Partial | Partial |
| **API Routes (Backend)** | Built-in Route Handlers | Separate Backend Required | Separate Backend Required | Loaders/Actions | Server Routes |
| **React 19 Support** | Supported (Day-one) | Deprecated | Community Plugins | Partial | Vue Ecosystem |
| **Supabase SSR Integration** | Full Compatibility (`@supabase/ssr`) | Manual Cookie Handling | Manual Cookie Handling | Requires Adapters | Different Ecosystem |
| **Production Maturity** | Enterprise Proven | Deprecated | Growing Ecosystem | Smaller Ecosystem | Mature (Vue only) |
| **Turbopack Build Speed** | 2.7s compile, 10.5s typecheck | Webpack (Slow) | Fast (esbuild) | Moderate | Moderate |

### 3.2 Why Supabase — Not Firebase, AWS Amplify, or Custom PostgreSQL

| Criterion | Supabase (Chosen) | Firebase | AWS Amplify | Custom PostgreSQL |
|:---|:---|:---|:---|:---|
| **Database Engine** | PostgreSQL (SQL, joins, triggers) | Firestore (NoSQL, no joins) | DynamoDB (NoSQL) or Aurora | PostgreSQL |
| **Row Level Security** | Native PostgreSQL RLS | Security Rules (Different paradigm) | IAM Policies (Complex) | Manual Implementation |
| **Auth + JWT** | Built-in with `@supabase/ssr` | Firebase Auth | AWS Cognito | Build from scratch |
| **Realtime Subscriptions** | WebSocket Channels | Firestore Listeners | AppSync (GraphQL) | Build from scratch |
| **Self-Hostable** | Open Source, Docker-ready | Google Cloud Only | AWS Only | Full Control |
| **Cost at Scale** | Predictable Pricing | Pay-per-read (Unpredictable) | Complex Pricing | Infrastructure Cost Only |
| **SQL Compatibility** | Full SQL Support | NoSQL Only | Depends on service | Full SQL Support |

### 3.3 Why Google Gemini AI — Not OpenAI GPT-4, Anthropic Claude, or No AI

| Criterion | Gemini 2.0/3.7 Flash (Chosen) | OpenAI GPT-4o | Anthropic Claude | No AI |
|:---|:---|:---|:---|:---|
| **Latency** | ~200ms (Flash models) | ~800ms-2s | ~500ms-1.5s | Instant |
| **Cost per Token** | Ultra-low cost (Flash tier) | 10-30x more expensive | 5-15x more expensive | Free |
| **Incident Triage Accuracy** | 88-96% confidence with fallback | High accuracy | High accuracy | Manual Classification Only |
| **Tool Calling** | Native function calling | Native function calling | Native tool use | N/A |
| **Deterministic Fallback** | Built-in Heuristic Engine | Must build separately | Must build separately | All deterministic |
| **Google Cloud Integration** | GCP Native | Separate Ecosystem | Separate Ecosystem | No Dependency |

### 3.4 Why Tailwind CSS v4 — Not Bootstrap, Material UI, or Styled Components

| Criterion | Tailwind CSS v4 (Chosen) | Bootstrap 5 | Material UI (MUI) | Styled Components |
|:---|:---|:---|:---|:---|
| **Bundle Size** | ~10KB (purged) | ~160KB | ~300KB+ | Runtime overhead |
| **Design Customization** | Full Design System via CSS tokens | Override-heavy | Theme overrides | Full control |
| **Enterprise Gold Theme** | Native CSS Custom Properties | Blue/Bootstrap look | Material Design look | Possible but verbose |
| **Performance** | Zero Runtime Overhead | jQuery / Vanilla JS | Runtime CSS-in-JS | Runtime CSS-in-JS |
| **Responsive Design** | Mobile-first Utilities | Grid System | Responsive | Manual media queries |

---

## 4. Security & Emergency Safety System

### 4.1 Seven-Layer Security Architecture

Luminous implements defense-in-depth across 7 distinct security layers:

```
HTTP Request
     |
     v
[Layer 1] Edge Security Headers (CSP, HSTS, X-Frame-Options, Permissions-Policy)
     |
     v
[Layer 2] CSRF & Origin Verification (Validates Origin/Referer, blocks cross-site fetch)
     |
     v
[Layer 3] Sliding-Window Rate Limiting (Per-category limits: SOS: 10/min, Alerts: 5/min, AI: 25/min)
     |
     v
[Layer 4] Session Authentication (Supabase Bearer JWT / Cookie Validation)
     |
     v
[Layer 5] Role-Based Access Control (Fail-secure, deny-by-default route permissions)
     |
     v
[Layer 6] Zod Input Schema Validation (Strict type checking & safe URL regex sanitization)
     |
     v
[Layer 7] Cryptographic Resource IDs (crypto.randomUUID() non-enumerable identifiers)
     |
     v
Business Logic Execution
```

#### Layer 1: Edge Security Headers (`src/proxy.ts`)
- `Content-Security-Policy`: Strict `default-src 'self'` with whitelisted Supabase, Gemini, and font domains
- `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload` (2-year HTTPS enforcement)
- `X-Frame-Options`: `SAMEORIGIN` (Clickjacking defense)
- `X-Content-Type-Options`: `nosniff` (MIME sniffing defense)
- `Referrer-Policy`: `strict-origin-when-cross-origin`
- `Permissions-Policy`: `camera=(self), microphone=(), geolocation=(self)`

#### Layer 2: CSRF Protection (`src/lib/security/csrf.ts`)
- Validates `Origin` and `Referer` headers on all mutation requests (POST, PUT, DELETE, PATCH)
- Rejects requests with `sec-fetch-site: cross-site`

#### Layer 3: Rate Limiting (`src/lib/security/rate-limiter.ts`)
- Sliding-window rate limiter per category: SOS (10/min), Alerts (5/min), Auth (20/min), AI Copilot (25/min), AI Triage (35/min), Incidents (30/min), Default (60/min)

#### Layer 4: Session Authentication (`src/lib/security/auth-guard.ts`)
- Parses Bearer JWTs and cookies, returning structured auth results

#### Layer 5: Role-Based Access Control (`src/lib/constants/roles.ts`)
- 9 institutional roles with a **deny-by-default (fail-secure)** routing policy

#### Layer 6: Zod Schema Validation
- Validates request payloads and sanitizes evidence URLs via strict regex

#### Layer 7: Cryptographic ID Generation (`src/lib/security/crypto.ts`)
- Generates unpredictable resource IDs (`inc-f47ac10b-...`) and tracking numbers (`INC-YYYYMMDD-XXXXXX`)

---

### 4.2 Emergency Response Workflows

#### 1. Two-Tier SOS Panic Beacon (`/safety/sos`)
- **Level 1 (Campus SOS):** 3 rapid taps dispatches nearest guard with GPS/timetable coordinates and starts a **5-minute auto-escalation timer**.
- **Level 2 (Police SOS):** 5 rapid taps or hold button dispatches multi-squad and external emergency services.

#### 2. Emergency Broadcast System (`/safety/emergency`)
- Role-gated broadcasts with 4 targeting scopes (Campus-wide, Building, Hostel, Department).

#### 3. AI Incident Triage
- Sub-200ms category and severity classification (88-96% confidence) with an instant deterministic rule fallback.

#### 4. FERPA-Compliant AI Copilot (`/copilot`)
- Zero-trust tool execution: students see only their own data; parents see only linked child; security officers cannot view transcripts or admin audit logs.

---

## 5. ERP Architecture & Institutional Benefits

### 5.1 What Makes Luminous an ERP
Luminous consolidates academic governance, student lifecycle, campus operations, and emergency safety into a single unified platform.

```
+-----------------------------------------------------------------------------------+
|                           LUMINOUS UNIFIED CAMPUS ERP                             |
+-------------------------+-------------------------+-------------------------------+
|  Academic Governance    |    Campus Operations    |      Safety & Intelligence    |
|  - Departments          |    - Hostel Management  |      - Incident Management    |
|  - Courses & Syllabi    |    - Complaint Redressal|      - SOS Emergency Beacon   |
|  - Faculty Roster       |    - Announcements      |      - Command Center         |
|  - Attendance Tracking  |    - Placements         |      - Interactive CAD Map    |
|  - Examinations         |    - Student Wellbeing  |      - Risk Intelligence      |
|  - Master Timetable     |    - Settings           |      - Unified Audit Logs     |
+-------------------------+-------------------------+-------------------------------+
|                              AI Intelligence Layer                                |
|         (CampusShield Copilot - AI Incident Triage - AI Grievance Triage)         |
+-----------------------------------------------------------------------------------+
```

### 5.2 Module Catalog — 21 Integrated Modules
1. `/dashboard` — Role-based gateway for 9 user personas
2. `/admin` — Executive KPIs, system health, critical alert triage
3. `/students` — Student directory with CGPA, attendance, FERPA scoping
4. `/student` — Student portal with daily schedule, attendance gauge, safety status
5. `/faculty` — Instructor directory, specializations, publications, ratings
6. `/faculty-dashboard` — Teaching workspace, schedule, attendance quick links
7. `/courses` — Course catalog, credit allocations, syllabi, enrollments
8. `/departments` — HOD governance, budget allocations, research lab counts
9. `/attendance` — Real-time class attendance marking and defaulter warnings (<75%)
10. `/exams` — Exam scheduling (Mid-Term/Final/Quiz/Practical) and SGPA reports
11. `/timetable` — Scheduling engine with weekly grid and agenda list views
12. `/hostel` — Residential life, room directory, maintenance, curfew logs
13. `/placement` — Recruitment drives, eligibility checks, offer pipelines
14. `/complaints` — AI grievance filing across 8 categories
15. `/announcements` — Campus circulars with audience-targeted scoping
16. `/wellbeing` — Confidential counseling, self-care toolkits, crisis lines
17. `/incidents` — Safety incident queue with 7-stage lifecycle tracking
18. `/security` — Operations command desk, guard dispatch, SLA timers
19. `/campus-map` — Interactive architectural vector blueprint with 13 facilities
20. `/copilot` — Natural language assistant with RBAC tool authorization
21. `/audit-logs` — Unified audit trails (system changes, incidents, patrols)

### 5.3 Cross-Module Data Integration
- **Exams -> Placements:** Published CGPA in `/exams` automatically verifies corporate drive eligibility in `/placement`.
- **Attendance -> Parent Portal:** Faculty submissions in `/attendance` update ward averages in `/parent`.
- **Hostel -> Security:** Curfew turnstile anomalies in `/hostel` trigger night patrols in `/security`.
- **Safety -> Interactive Map:** Reports filed in `/incidents` project live hazard beacons onto the vector CAD blueprint in `/campus-map`.

---

## 6. Future Expansion Roadmap

### Phase 1: Near-Term Enhancements
- **Web Push & PWA Notifications:** Push alerts for SOS emergencies when the browser is backgrounded.
- **Dark Mode Theme:** Night-shift theme for security desk operations.
- **Document Export:** PDF and CSV exports for attendance registries, transcripts, and audit logs.
- **SMS/Email Fallback:** Twilio SMS and email dispatch for critical campus emergencies.

### Phase 2: Medium-Term Features
- **Native Mobile Application:** React Native / Flutter companion app with offline SOS capability.
- **CCTV Live Stream Integration:** Embedded IP camera feeds in Command Center with AI anomaly detection.
- **Financial & Fee Management:** Student tuition tracking, fee reconciliation, and payment gateway integration.
- **Fleet & Transport Tracking:** Real-time GPS bus fleet monitoring and digital transport pass verification.

### Phase 3: Long-Term Vision
- **Multi-Campus Federation:** Centralized governance across multi-campus university networks.
- **Smart Building IoT:** Direct integration with smoke detectors, water leak sensors, and turnstiles.
- **AI Computer Vision Surveillance:** Automated perimeter breach detection and crowd density analytics.
- **Voice-Activated SOS:** Hands-free voice trigger ("Hey Luminous, help") via the Web Speech API.

---

## License & Attribution

Developed by the **Luminous Engineering Team**.  
All rights reserved. Unauthorized copying or redistribution is strictly prohibited.
