# CampusShield AI — Project Architecture

> AI-Powered Smart College/School ERP & Campus Safety Platform
> Hackathon Build: 24–48 hours

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js App Router)            │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌────────────────┐   │
│  │ Auth UI  │ │ Dashboards│ │ Safety Hub │ │ Command Center │   │
│  └──────────┘ └──────────┘ └────────────┘ └────────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌────────────────┐   │
│  │ ERP Pages│ │ SOS Panel│ │ Campus Map │ │ Analytics      │   │
│  └──────────┘ └──────────┘ └────────────┘ └────────────────┘   │
└───────────────────────┬─────────────────────────────────────────┘
                        │ HTTPS / WebSocket (Supabase Realtime)
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js Route Handlers)            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  /api/incidents  /api/safety  /api/alerts  /api/ai       │   │
│  │  /api/auth       /api/admin   /api/erp     /api/sos      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Auth Guard  │  │ RBAC Middleware│ │ Rate Limiter         │   │
│  └─────────────┘  └──────────────┘  └──────────────────────┘   │
└──────────┬──────────────────┬───────────────────────────────────┘
           │                  │
     ┌─────▼─────┐     ┌─────▼──────────────────────────┐
     │ Supabase  │     │ Gemini AI Layer (Read-Only)     │
     │ PostgreSQL│     │                                 │
     │ + Auth    │     │  User → AI → Structured Output  │
     │ + Storage │     │       → Backend Validation      │
     │ + Realtime│     │       → Authorization Check     │
     │           │     │       → Database Write           │
     └───────────┘     └─────────────────────────────────┘
```

### Core Principle: AI Assists, Never Acts

```
User Input
  → Gemini AI (analysis only, returns structured JSON)
  → Backend Validation (schema + business rules)
  → Authorization Check (RBAC + ownership)
  → Database Mutation (Supabase)
  → Side Effects (alerts, notifications, logs)
```

Gemini NEVER has database credentials. It receives sanitized context and returns structured recommendations.

---

## 2. Folder Structure

```
smart-edu/
├── docs/                          # Architecture documentation
│   ├── PROJECT_ARCHITECTURE.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── TECH_DECISIONS.md
│   └── AGENT_TASKS.md
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # Auth route group (no layout chrome)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/           # Authenticated route group
│   │   │   ├── layout.tsx         # Sidebar + topbar layout
│   │   │   ├── page.tsx           # Role-based dashboard redirect
│   │   │   │
│   │   │   ├── command-center/    #  HERO: Safety Command Center
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── incidents/         # Incident management
│   │   │   │   ├── page.tsx       # List/grid view
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx   # AI-assisted report form
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Incident detail + timeline
│   │   │   │
│   │   │   ├── campus-map/        # Live safety map
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── alerts/            # Emergency alerts
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── safety-analytics/  # AI safety insights
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── sos/               # Women's safety SOS
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── visitors/          # Visitor management
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── security/          # Security operations
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── students/          # Student ERP
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── faculty/           # Faculty ERP
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── attendance/        # Attendance ERP
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── exams/             # Exams ERP
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── timetable/         # Timetable ERP
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── hostel/            # Hostel ERP
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── transport/         # Transport ERP
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── complaints/        # Complaints
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── placements/        # Placement portal
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── communication/     # Announcements & messaging
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── parent-portal/     # Parent access
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── audit-logs/        # System audit trail
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── settings/          # User/admin settings
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/                   # Route Handlers
│   │   │   ├── ai/
│   │   │   │   ├── classify-incident/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── safety-insights/
│   │   │   │   │   └── route.ts
│   │   │   │   └── risk-assessment/
│   │   │   │       └── route.ts
│   │   │   ├── incidents/
│   │   │   │   ├── route.ts       # GET (list) + POST (create)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # GET + PATCH + DELETE
│   │   │   ├── alerts/
│   │   │   │   └── route.ts
│   │   │   ├── sos/
│   │   │   │   └── route.ts
│   │   │   ├── visitors/
│   │   │   │   └── route.ts
│   │   │   └── erp/
│   │   │       ├── students/
│   │   │       │   └── route.ts
│   │   │       ├── faculty/
│   │   │       │   └── route.ts
│   │   │       ├── attendance/
│   │   │       │   └── route.ts
│   │   │       └── ... (other ERP routes)
│   │   │
│   │   ├── layout.tsx             # Root layout
│   │   ├── globals.css            # Tailwind + global styles
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx
│   │   │   └── mobile-nav.tsx
│   │   ├── safety/                # Safety-specific components
│   │   │   ├── incident-card.tsx
│   │   │   ├── incident-form.tsx
│   │   │   ├── severity-badge.tsx
│   │   │   ├── command-center-grid.tsx
│   │   │   ├── campus-map-view.tsx
│   │   │   ├── alert-banner.tsx
│   │   │   ├── sos-button.tsx
│   │   │   ├── live-feed.tsx
│   │   │   └── ai-insight-card.tsx
│   │   ├── charts/                # Recharts wrappers
│   │   │   ├── incident-trend.tsx
│   │   │   ├── severity-distribution.tsx
│   │   │   └── heatmap.tsx
│   │   └── shared/                # Shared components
│   │       ├── data-table.tsx
│   │       ├── stat-card.tsx
│   │       ├── loading.tsx
│   │       └── empty-state.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser Supabase client
│   │   │   ├── server.ts          # Server Supabase client
│   │   │   ├── admin.ts           # Service-role client (API routes only)
│   │   │   └── middleware.ts      # Auth refresh middleware
│   │   ├── ai/
│   │   │   ├── gemini.ts          # Gemini client setup
│   │   │   ├── prompts.ts         # System prompts for safety AI
│   │   │   ├── schemas.ts         # Zod schemas for AI output validation
│   │   │   └── safety-engine.ts   # AI classification + routing logic
│   │   ├── validators/
│   │   │   ├── incident.ts        # Incident Zod schemas
│   │   │   ├── auth.ts            # Auth Zod schemas
│   │   │   └── erp.ts             # ERP Zod schemas
│   │   ├── constants/
│   │   │   ├── roles.ts           # Role definitions
│   │   │   ├── severity.ts        # Severity levels
│   │   │   ├── categories.ts      # Incident categories
│   │   │   └── departments.ts     # Department routing map
│   │   ├── utils.ts               # General utilities
│   │   └── types.ts               # Shared TypeScript types
│   │
│   ├── hooks/
│   │   ├── use-auth.ts            # Auth state hook
│   │   ├── use-realtime.ts        # Supabase realtime subscription
│   │   ├── use-incidents.ts       # Incidents data hook
│   │   └── use-role.ts            # RBAC hook
│   │
│   └── middleware.ts              # Next.js middleware (auth + RBAC)
│
├── supabase/
│   ├── migrations/                # Database migrations
│   │   ├── 001_auth_profiles.sql
│   │   ├── 002_safety_core.sql
│   │   ├── 003_erp_tables.sql
│   │   └── 004_rls_policies.sql
│   └── seed.sql                   # Demo seed data
│
├── public/
│   ├── campus-map.svg             # Campus map asset
│   └── logo.svg
│
├── .env.local.example
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 3. Route Structure

### Public Routes
| Route | Purpose |
|-------|---------|
| `/login` | Login page |
| `/register` | Registration page |

### Authenticated Routes (Role-Based Access)

| Route | Access | Priority | Purpose |
|-------|--------|----------|---------|
| `/` | All | — | Redirect to role dashboard |
| `/command-center` | Admin, Security |  HERO | Live safety command center |
| `/incidents` | All |  Core | Incident list |
| `/incidents/new` | Student, Faculty, Staff |  Core | AI-assisted incident report |
| `/incidents/[id]` | Varies (owner, admin, security) |  Core | Incident detail + timeline |
| `/campus-map` | All |  Core | Live incident map |
| `/alerts` | All |  High | Emergency alerts feed |
| `/safety-analytics` | Admin, Security |  High | AI safety insights + charts |
| `/sos` | Student, Faculty |  High | SOS panic button + tracking |
| `/visitors` | Admin, Security, Reception |  Medium | Visitor management |
| `/security` | Security |  Medium | Security operations dashboard |
| `/audit-logs` | Admin |  Medium | System audit trail |
| `/students` | Admin, Faculty |  ERP | Student management |
| `/faculty` | Admin |  ERP | Faculty management |
| `/attendance` | Admin, Faculty |  ERP | Attendance tracking |
| `/exams` | Admin, Faculty |  ERP | Exam management |
| `/timetable` | All |  ERP | Schedule viewer |
| `/hostel` | Admin, Warden |  ERP | Hostel management |
| `/transport` | Admin |  ERP | Transport management |
| `/complaints` | All |  ERP | General complaints |
| `/placements` | Admin, Student |  ERP | Placement portal |
| `/communication` | All |  ERP | Announcements |
| `/parent-portal` | Parent |  ERP | Parent access view |
| `/settings` | All |  ERP | Account settings |

---

## 4. Database Architecture

### Schema Diagram

```
┌──────────────────┐     ┌──────────────────────┐
│ auth.users       │     │ profiles              │
│ (Supabase Auth)  │────>│ id (FK auth.users)    │
│                  │     │ full_name             │
│                  │     │ role                  │
│                  │     │ department            │
│                  │     │ phone                 │
│                  │     │ avatar_url            │
│                  │     │ emergency_contact     │
└──────────────────┘     └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ incidents        │  │ sos_alerts       │  │ visitors         │
│ id               │  │ id               │  │ id               │
│ reporter_id (FK) │  │ user_id (FK)     │  │ name             │
│ title            │  │ location         │  │ phone            │
│ description      │  │ status           │  │ purpose          │
│ category         │  │ responded_by     │  │ host_id (FK)     │
│ severity         │  │ created_at       │  │ check_in         │
│ ai_severity      │  │ resolved_at      │  │ check_out        │
│ ai_classification│  └──────────────────┘  │ status           │
│ ai_confidence    │                        │ id_proof_url     │
│ location         │                        └──────────────────┘
│ location_lat     │
│ location_lng     │  ┌──────────────────┐
│ status           │  │ emergency_alerts │
│ assigned_dept    │  │ id               │
│ assigned_to      │  │ incident_id (FK) │
│ evidence_urls    │  │ type             │
│ ai_raw_response  │  │ message          │
│ created_at       │  │ severity         │
│ updated_at       │  │ target_roles     │
│ resolved_at      │  │ is_active        │
└───────┬──────────┘  │ created_by       │
        │             │ expires_at       │
        ▼             └──────────────────┘
┌──────────────────┐
│ incident_timeline│  ┌──────────────────┐
│ id               │  │ audit_logs       │
│ incident_id (FK) │  │ id               │
│ actor_id (FK)    │  │ user_id (FK)     │
│ action           │  │ action           │
│ details          │  │ entity_type      │
│ created_at       │  │ entity_id        │
└──────────────────┘  │ old_values       │
                      │ new_values       │
                      │ ip_address       │
                      │ created_at       │
                      └──────────────────┘
```

### Core Safety Tables

```sql
-- Profiles (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN (
    'super_admin', 'admin', 'faculty', 'student',
    'security', 'warden', 'transport_admin', 'parent', 'receptionist'
  )),
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  emergency_contact JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Incidents (HERO TABLE)
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'fire', 'medical', 'theft', 'assault', 'harassment',
    'vandalism', 'suspicious_activity', 'natural_disaster',
    'infrastructure', 'traffic', 'substance_abuse', 'cybercrime', 'other'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  ai_severity TEXT CHECK (ai_severity IN ('critical', 'high', 'medium', 'low')),
  ai_classification JSONB,       -- AI's full classification output
  ai_confidence NUMERIC(3,2),    -- 0.00 to 1.00
  location TEXT,
  location_lat NUMERIC(10,7),
  location_lng NUMERIC(10,7),
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN (
    'reported', 'acknowledged', 'investigating', 'responding',
    'resolved', 'closed', 'false_alarm'
  )),
  assigned_dept TEXT,
  assigned_to UUID REFERENCES profiles(id),
  evidence_urls TEXT[],          -- Supabase Storage URLs
  ai_raw_response JSONB,         -- Full AI response for audit
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Incident Timeline
CREATE TABLE incident_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,           -- 'created', 'classified', 'assigned', 'status_changed', 'comment'
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SOS Alerts (Women's Safety)
CREATE TABLE sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  location TEXT,
  location_lat NUMERIC(10,7),
  location_lng NUMERIC(10,7),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'responding', 'resolved', 'false_alarm')),
  responded_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Emergency Alerts (Campus-wide)
CREATE TABLE emergency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents(id),
  type TEXT NOT NULL CHECK (type IN ('lockdown', 'evacuation', 'weather', 'medical', 'security', 'general')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  target_roles TEXT[],            -- Which roles see this alert
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES profiles(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Visitors
CREATE TABLE visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  purpose TEXT NOT NULL,
  host_id UUID REFERENCES profiles(id),
  id_proof_type TEXT,
  id_proof_url TEXT,
  photo_url TEXT,
  check_in TIMESTAMPTZ DEFAULT now(),
  check_out TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'checked_in' CHECK (status IN ('pre_registered', 'checked_in', 'checked_out', 'denied')),
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Logs (Immutable)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### ERP Tables (Secondary Priority)

```sql
-- Students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id),
  enrollment_no TEXT UNIQUE NOT NULL,
  course TEXT NOT NULL,
  semester INT,
  section TEXT,
  batch_year INT,
  guardian_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Faculty
CREATE TABLE faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id),
  employee_id TEXT UNIQUE NOT NULL,
  designation TEXT,
  specialization TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Attendance
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  subject TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, subject, date)
);

-- Timetable
CREATE TABLE timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course TEXT NOT NULL,
  semester INT NOT NULL,
  section TEXT,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject TEXT NOT NULL,
  faculty_id UUID REFERENCES faculty(id),
  room TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Hostel Rooms
CREATE TABLE hostel_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number TEXT NOT NULL,
  block TEXT NOT NULL,
  floor INT,
  capacity INT NOT NULL DEFAULT 2,
  occupant_ids UUID[],
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Transport Routes
CREATE TABLE transport_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name TEXT NOT NULL,
  vehicle_number TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  stops JSONB,    -- [{name, time, lat, lng}]
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Complaints (General)
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filed_by UUID NOT NULL REFERENCES profiles(id),
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES profiles(id),
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Placements
CREATE TABLE placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  package_lpa NUMERIC(5,2),
  drive_date DATE,
  eligible_courses TEXT[],
  min_cgpa NUMERIC(3,2),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  registrations UUID[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Communications / Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id),
  target_roles TEXT[],
  target_departments TEXT[],
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 5. Authentication Architecture

> **Authentication and authorization are separate layers.**
> - **Authentication** establishes *who* the user is (identity + session).
> - **Authorization** determines *what* that identity is allowed to do.
>
> Authentication is handled through **Supabase Auth**, supporting email-based
> authentication and OAuth/social login. Authentication establishes the user's
> identity and session, while authorization is enforced separately through
> trusted server-side role resolution and PostgreSQL Row Level Security.

```
User
  ↓
Supabase Auth         (email/password sign-in, OAuth/social login, JWT + session)
  ↓
Authenticated Session / JWT   (managed via @supabase/ssr secure cookies)
  ↓
Server-side Role Resolution   (role read from the profiles table by auth.uid(), never from client input)
  ↓
RBAC Authorization            (Next.js middleware + route handlers + permission checks)
  ↓
PostgreSQL RLS                (Row Level Security policies keyed on the authenticated JWT)
  ↓
Authorized ERP / Safety / AI Operations
```

### Authentication vs. Authorization

| Layer | Mechanism | Responsibility |
|-------|-----------|----------------|
| **Authentication** | Supabase Auth (JWT / session, via `@supabase/ssr`) | Verify identity, issue and refresh the session, manage sign-in / sign-out / password recovery / email verification. Supports **email** and **OAuth/social** providers. |
| **Authorization** | Server-side role resolution + RBAC + PostgreSQL RLS | Determine and enforce what a given authenticated identity may access. Institutional roles (student, faculty, security, admin, warden, parent, placement_officer, super_admin) are **never trusted from client input**. |

### Auth Flow

1. **Sign Up**: User registers (email/password) → Supabase creates an `auth.users` row → a database trigger provisions a matching `profiles` row with a **default, non-privileged** role. Privileged roles (e.g. `super_admin`) cannot be self-assigned through the signup UI or signup metadata.
2. **Sign In**: Supabase authenticates the email/password (or an OAuth provider) and issues a JWT, which is stored in a **secure HTTP-only cookie** via `@supabase/ssr` and persisted across page navigation and refresh.
3. **Middleware**: Every request runs through `middleware.ts`, which refreshes the Supabase session and verifies that an authenticated user exists before a protected route is served.
4. **Role Resolution**: On authentication, the user's role is read **server-side** from the `profiles` table using the authenticated user's JWT/`auth.uid()` — never from a value supplied by the browser.
5. **Authorization Check**: Route handlers and the middleware apply role-based checks before any data operation.
6. **Database Access**: All database reads/writes rely on the authenticated user's Supabase JWT context, with **PostgreSQL Row Level Security** as the final enforcement layer.

> **OAuth / social login**: Supabase Auth natively supports OAuth providers (e.g. Google, GitHub, Microsoft). In this repository the email/password flow and the Supabase session plumbing are implemented; the OAuth provider buttons are wired to `signInWithOAuth` but require the corresponding provider to be **enabled in the Supabase project** (Auth → Providers) and an OAuth callback/redirect route. **Status: partially implemented — requires project provider configuration and verification.**

### Role Hierarchy

```
super_admin          ← Full platform control
  └── admin          ← Institution management
       ├── security  ← Safety operations
       ├── faculty   ← Academic operations
       ├── warden    ← Hostel operations
       ├── placement_officer ← Career operations
       └── other     ← General institute member
  └── student        ← Student access
  └── parent         ← Read-only parent view
```

---

## 6. RBAC Architecture

### Permission Matrix

| Resource | super_admin | admin | security | faculty | student | parent | warden | receptionist |
|----------|:-----------:|:-----:|:--------:|:-------:|:-------:|:------:|:------:|:------------:|
| Command Center | [PASS] | [PASS] | [PASS] | [FAIL] | [FAIL] | [FAIL] | [FAIL] | [FAIL] |
| Create Incident | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] | [FAIL] | [PASS] | [PASS] |
| View All Incidents | [PASS] | [PASS] | [PASS] | [FAIL] | [FAIL] | [FAIL] | [FAIL] | [FAIL] |
| View Own Incidents | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] | [FAIL] | [PASS] | [PASS] |
| Manage Incidents | [PASS] | [PASS] | [PASS] | [FAIL] | [FAIL] | [FAIL] | [FAIL] | [FAIL] |
| Emergency Alerts (send) | [PASS] | [PASS] | [PASS] | [FAIL] | [FAIL] | [FAIL] | [FAIL] | [FAIL] |
| Emergency Alerts (view) | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] |
| SOS Trigger | [PASS] | [PASS] | [FAIL] | [PASS] | [PASS] | [FAIL] | [FAIL] | [FAIL] |
| SOS Respond | [PASS] | [PASS] | [PASS] | [FAIL] | [FAIL] | [FAIL] | [FAIL] | [FAIL] |
| Campus Map | [PASS] | [PASS] | [PASS] | [PASS] | [PASS] | [FAIL] | [PASS] | [PASS] |
| Safety Analytics | [PASS] | [PASS] | [PASS] | [FAIL] | [FAIL] | [FAIL] | [FAIL] | [FAIL] |
| Visitor Mgmt | [PASS] | [PASS] | [PASS] | [FAIL] | [FAIL] | [FAIL] | [FAIL] | [PASS] |
| Audit Logs | [PASS] | [PASS] | [FAIL] | [FAIL] | [FAIL] | [FAIL] | [FAIL] | [FAIL] |
| Student CRUD | [PASS] | [PASS] | [FAIL] | R | Self | R | [FAIL] | [FAIL] |
| Faculty CRUD | [PASS] | [PASS] | [FAIL] | Self | [FAIL] | [FAIL] | [FAIL] | [FAIL] |
| Attendance | [PASS] | [PASS] | [FAIL] | CRU | R | R | [FAIL] | [FAIL] |
| Timetable | [PASS] | [PASS] | [FAIL] | R | R | R | [FAIL] | [FAIL] |
| Hostel | [PASS] | [PASS] | [FAIL] | [FAIL] | R | [FAIL] | CRU | [FAIL] |
| Transport | [PASS] | [PASS] | [FAIL] | R | R | R | [FAIL] | [FAIL] |
| Placements | [PASS] | [PASS] | [FAIL] | R | R | R | [FAIL] | [FAIL] |
| Settings | [PASS] | [PASS] | Self | Self | Self | Self | Self | Self |

### Implementation

```typescript
// lib/constants/roles.ts
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  SECURITY: 'security',
  FACULTY: 'faculty',
  STUDENT: 'student',
  PARENT: 'parent',
  WARDEN: 'warden',
  TRANSPORT_ADMIN: 'transport_admin',
  RECEPTIONIST: 'receptionist',
} as const;

// Permissions defined per route/resource
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/command-center': ['super_admin', 'admin', 'security'],
  '/incidents/new': ['super_admin', 'admin', 'security', 'faculty', 'student', 'warden', 'receptionist'],
  '/safety-analytics': ['super_admin', 'admin', 'security'],
  '/visitors': ['super_admin', 'admin', 'security', 'receptionist'],
  '/audit-logs': ['super_admin', 'admin'],
  // ...
};
```

### Enforcement Points

1. **Middleware (Next.js)**: Route-level access control — redirect unauthorized users
2. **API Route Handlers**: Server-side `requireRole()` guard before any DB operation
3. **Supabase RLS**: Row-Level Security policies as the final defense layer
4. **UI**: Conditionally render navigation items based on user role

---

## 7. Gemini AI Architecture

### AI Safety Engine

```
┌───────────────────────────────────────────────────────────────┐
│                    AI SAFETY ENGINE                            │
│                                                               │
│  INPUT                                                        │
│  ├── Incident description (user text)                         │
│  ├── Location context                                         │
│  ├── Reporter metadata (anonymized)                           │
│  └── Historical context (aggregated, no PII)                  │
│                                                               │
│  GEMINI 2.0 FLASH                                             │
│  ├── System Prompt (safety classification specialist)         │
│  ├── Structured Output Schema (enforced JSON)                 │
│  └── Temperature: 0.1 (deterministic)                         │
│                                                               │
│  OUTPUT (Structured JSON)                                     │
│  ├── category: string (from allowed enum)                     │
│  ├── severity: 'critical' | 'high' | 'medium' | 'low'        │
│  ├── confidence: number (0-1)                                 │
│  ├── summary: string (AI-generated summary)                   │
│  ├── recommended_department: string                           │
│  ├── recommended_actions: string[]                            │
│  ├── risk_factors: string[]                                   │
│  ├── requires_immediate_response: boolean                     │
│  └── suggested_alert_level: string                            │
│                                                               │
│  BACKEND VALIDATION (post-AI)                                 │
│  ├── Zod schema validation of AI output                       │
│  ├── Category must be in allowed enum                         │
│  ├── Severity must be in allowed enum                         │
│  ├── Confidence threshold check (>0.5 to auto-classify)       │
│  ├── Critical incidents require human confirmation             │
│  └── Log full AI response for audit                           │
│                                                               │
│  AUTHORIZATION (post-validation)                              │
│  ├── Verify reporter has permission to file incidents          │
│  ├── Verify assigned department exists                         │
│  └── Rate limit per user (prevent spam)                       │
└───────────────────────────────────────────────────────────────┘
```

### AI Endpoints

| Endpoint | Purpose | Input | Output |
|----------|---------|-------|--------|
| `POST /api/ai/classify-incident` | Classify incoming incident | `{description, location}` | `{category, severity, confidence, ...}` |
| `POST /api/ai/safety-insights` | Analyze historical trends | `{timeRange, department}` | `{patterns, recommendations, riskAreas}` |
| `POST /api/ai/risk-assessment` | Predict risk for a location/time | `{location, timeOfDay, eventType}` | `{riskLevel, factors, suggestions}` |

### AI Prompt Architecture

```typescript
// System prompt for incident classification
const INCIDENT_CLASSIFIER_PROMPT = `
You are a campus safety AI assistant for CampusShield AI.
Your role is to classify safety incidents reported on a college campus.

RULES:
- Analyze the incident description carefully
- Classify into exactly one category from the allowed list
- Assess severity based on potential harm, urgency, and scale
- Provide actionable recommendations
- Never output information not supported by the input
- If unsure, set confidence below 0.5 and flag for human review

CATEGORIES: fire, medical, theft, assault, harassment, vandalism,
suspicious_activity, natural_disaster, infrastructure, traffic,
substance_abuse, cybercrime, other

SEVERITY LEVELS:
- critical: Immediate threat to life, requires emergency response
- high: Serious situation, needs urgent attention within minutes
- medium: Concerning but not immediately dangerous, respond within hours
- low: Minor issue, can be addressed during normal operations
`;
```

---

## 8. Safety Architecture

### Incident Lifecycle

```
  STUDENT                    AI ENGINE               BACKEND                SECURITY/ADMIN
    │                            │                      │                       │
    │ 1. Report Incident         │                      │                       │
    │──────────────────────────>│                      │                       │
    │                            │ 2. Classify           │                       │
    │                            │─────────────────────>│                       │
    │                            │                      │ 3. Validate AI output │
    │                            │                      │ 4. Check auth         │
    │                            │                      │ 5. Create incident    │
    │                            │                      │ 6. Create timeline    │
    │                            │                      │ 7. Route to dept      │
    │                            │                      │──────────────────────>│
    │                            │                      │ 8. Emit realtime      │
    │                            │                      │    event              │
    │ 9. Confirmation            │                      │                       │
    │<──────────────────────────│                      │                       │
    │                            │                      │                       │
    │                            │                      │         10. Ack       │
    │                            │                      │<──────────────────────│
    │                            │                      │                       │
    │                            │                      │       11. Respond     │
    │                            │                      │<──────────────────────│
    │                            │                      │                       │
    │                            │                      │       12. Resolve     │
    │                            │                      │<──────────────────────│
    │ 13. Resolution             │                      │                       │
    │    notification            │                      │                       │
    │<──────────────────────────│                      │                       │
```

### Realtime Event Architecture (Supabase Realtime)

| Channel | Events | Subscribers |
|---------|--------|-------------|
| `incidents` | INSERT, UPDATE | Command Center, Campus Map |
| `sos_alerts` | INSERT, UPDATE | Security Dashboard, Admin |
| `emergency_alerts` | INSERT | All authenticated users |
| `incident_timeline:{id}` | INSERT | Incident detail page viewers |

### Department Routing Map

```typescript
const DEPARTMENT_ROUTING: Record<string, string[]> = {
  fire: ['security', 'administration', 'fire_department'],
  medical: ['security', 'medical_center'],
  theft: ['security', 'police_liaison'],
  assault: ['security', 'police_liaison', 'counseling'],
  harassment: ['security', 'women_cell', 'counseling'],
  vandalism: ['security', 'maintenance'],
  suspicious_activity: ['security'],
  natural_disaster: ['security', 'administration', 'maintenance'],
  infrastructure: ['maintenance', 'administration'],
  traffic: ['security', 'transport'],
  substance_abuse: ['security', 'counseling', 'administration'],
  cybercrime: ['security', 'it_department'],
  other: ['security', 'administration'],
};
```

---

## 9. API Architecture

### API Design Principles

1. **All mutations go through Route Handlers** (`/api/*`) — never direct Supabase client writes from browser
2. **Every route handler**: authenticate → authorize → validate → execute → audit log
3. **AI routes**: authenticate → authorize → call Gemini → validate AI output → return structured response
4. **Consistent error format**: `{ error: string, code: string, details?: any }`

### Key API Routes

```
POST   /api/incidents              Create incident (with AI classification)
GET    /api/incidents              List incidents (filtered by role)
GET    /api/incidents/:id          Get incident detail
PATCH  /api/incidents/:id          Update incident (status, assignment)
DELETE /api/incidents/:id          Soft-delete incident (admin only)

POST   /api/ai/classify-incident   AI classification (returns JSON, no DB write)
POST   /api/ai/safety-insights     AI analytics (read-only)
POST   /api/ai/risk-assessment     AI risk prediction (read-only)

POST   /api/alerts                 Create emergency alert
GET    /api/alerts                 List active alerts
PATCH  /api/alerts/:id             Deactivate alert

POST   /api/sos                    Trigger SOS
PATCH  /api/sos/:id                Respond to / resolve SOS

POST   /api/visitors               Register visitor
GET    /api/visitors               List visitors
PATCH  /api/visitors/:id           Check out / update visitor

GET    /api/audit-logs             List audit logs (admin only)

// ERP routes follow same pattern
POST/GET   /api/erp/students
POST/GET   /api/erp/attendance
POST/GET   /api/erp/timetable
// etc.
```

### API Middleware Stack

```typescript
// Every API route handler follows this pattern:
export async function POST(request: Request) {
  // 1. Auth
  const { user, profile } = await getAuthUser(request);
  if (!user) return unauthorized();

  // 2. RBAC
  if (!hasPermission(profile.role, 'incidents', 'create')) {
    return forbidden();
  }

  // 3. Validate input
  const body = await request.json();
  const parsed = incidentCreateSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  // 4. Business logic (may include AI call)
  const aiResult = await classifyIncident(parsed.data.description);
  const validatedAI = aiOutputSchema.parse(aiResult); // Zod validates AI output

  // 5. Database write (via server Supabase client)
  const incident = await createIncident({
    ...parsed.data,
    ai_classification: validatedAI,
    severity: validatedAI.severity,
  });

  // 6. Side effects
  await createTimelineEntry(incident.id, 'created');
  await notifyDepartment(validatedAI.recommended_department, incident);
  if (validatedAI.requires_immediate_response) {
    await createEmergencyAlert(incident);
  }

  // 7. Audit log
  await createAuditLog(user.id, 'create', 'incident', incident.id);

  return Response.json(incident, { status: 201 });
}
```

---

## 10. Security Architecture

### Defense in Depth

```
Layer 1: Network          — HTTPS only, CORS restrictions
Layer 2: Authentication   — Supabase Auth, JWT tokens, httpOnly cookies
Layer 3: Authorization    — RBAC middleware in Next.js
Layer 4: Input Validation — Zod schemas on every API input
Layer 5: AI Output Guard  — Zod schemas on every AI response
Layer 6: Row Level Security — Supabase RLS on every table
Layer 7: Audit Logging    — Every mutation logged with user, action, timestamp
Layer 8: Rate Limiting    — Per-user rate limits on AI + incident creation
```

### Supabase RLS Policies (Examples)

```sql
-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admin/Security can view all profiles
CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'security')
    )
  );

-- Users can view their own incidents
CREATE POLICY "Users can view own incidents"
  ON incidents FOR SELECT
  USING (reporter_id = auth.uid());

-- Security/Admin can view all incidents
CREATE POLICY "Admin/Security can view all incidents"
  ON incidents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'security')
    )
  );

-- Only authenticated users can create incidents
CREATE POLICY "Authenticated users can create incidents"
  ON incidents FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Audit logs are insert-only, readable by admin
CREATE POLICY "Admin can read audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);  -- API routes use service role
```

### AI Security Constraints

1. **No database credentials** passed to Gemini ever
2. **No PII** in AI context (anonymize reporter data)
3. **Output schema enforcement** — AI must return exact JSON schema
4. **Confidence thresholds** — low confidence → human review queue
5. **Rate limiting** — max 10 AI calls per user per minute
6. **Audit trail** — every AI request/response logged
7. **Fallback** — if AI fails, incident still created with manual classification

---

## 11. Demo Architecture

### The Hero Demo Flow (5 minutes)

```
STEP 1: Student Login
  → Student "Priya" logs in
  → Sees her dashboard with campus map

STEP 2: Report Incident
  → Priya clicks "Report Incident"
  → Types: "There's a fire in the chemistry lab on the 2nd floor.
     Smoke is coming from the windows. Students are evacuating."
  → Optionally uploads photo
  → Clicks Submit

STEP 3: AI Classification (visible in real-time)
  → Loading state: "AI is analyzing your report..."
  → AI returns:
    Category: Fire 
    Severity: CRITICAL
    Confidence: 0.95
    Department: Security + Fire Department
    Immediate Response: YES
    Actions: Evacuate building, Call fire department, Alert medical

STEP 4: Backend Processing (shown in timeline)
  → Incident created with ID
  → AI classification validated 
  → Assigned to Security Department
  → Emergency alert generated

STEP 5: Switch to Admin View
  → Admin "Dr. Kumar" logs in
  → Command Center shows:
    - New CRITICAL incident flashing red
    - Campus map with fire pin at Chemistry Lab
    - Live incident counter updated
    - Emergency alert banner active

STEP 6: Security Response
  → Security "Officer Sharma" sees notification
  → Acknowledges incident → status: Responding
  → Timeline updates in real-time

STEP 7: AI Safety Insights
  → Navigate to Safety Analytics
  → AI shows: "3 fire-related incidents in Science Block in last
    semester. Recommend: Fire safety audit, extinguisher check,
    lab safety refresher training."

STEP 8: Resolution
  → Security marks resolved
  → Timeline shows full lifecycle
  → Audit log captures every action
```

### Demo Seed Data

Pre-populate with:
- 5 user accounts (student, admin, security, faculty, parent)
- 15-20 historical incidents across categories
- 3-4 resolved SOS alerts
- 10 visitor records
- Emergency alert history
- Sample ERP data (students, timetable, attendance)

---

## 12. Campus Map Architecture

### Approach: SVG-Based Campus Map

Given hackathon constraints, we'll use a custom SVG campus map rather than Google Maps:

```typescript
// Campus locations with coordinates on SVG grid
const CAMPUS_LOCATIONS = [
  { id: 'main_gate', name: 'Main Gate', x: 50, y: 450, type: 'entry' },
  { id: 'admin_block', name: 'Admin Block', x: 200, y: 300, type: 'building' },
  { id: 'science_block', name: 'Science Block', x: 350, y: 200, type: 'building' },
  { id: 'library', name: 'Central Library', x: 300, y: 350, type: 'building' },
  { id: 'hostel_a', name: 'Hostel A (Boys)', x: 500, y: 150, type: 'hostel' },
  { id: 'hostel_b', name: 'Hostel B (Girls)', x: 500, y: 300, type: 'hostel' },
  { id: 'sports', name: 'Sports Complex', x: 150, y: 100, type: 'facility' },
  { id: 'cafeteria', name: 'Cafeteria', x: 250, y: 250, type: 'facility' },
  { id: 'parking', name: 'Parking Lot', x: 100, y: 450, type: 'facility' },
  { id: 'auditorium', name: 'Auditorium', x: 400, y: 400, type: 'building' },
  // ...more locations
];
```

Incidents are plotted as pins on this map with color-coded severity (red=critical, orange=high, yellow=medium, blue=low).

---

This architecture document serves as the single source of truth for all development work on CampusShield AI.
