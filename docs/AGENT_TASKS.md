# CampusShield AI — Agent Tasks

> Task breakdown for AI-assisted development agents.
> Each task is atomic, testable, and can be assigned to an agent.

---

## Task Legend

| Symbol | Meaning |
|--------|---------|
| 🔴 | Critical path — blocks other tasks |
| 🟡 | High priority — needed for demo |
| 🟢 | Medium priority — enhances the product |
| 🔵 | Low priority — nice to have, skip if short on time |
| ⛓️ | Sequential — must wait for dependencies |
| ∥ | Parallelizable — can run alongside other tasks |
| ⏱️ | Estimated time in minutes |

---

## Phase 0: Foundation

### TASK-001 🔴 ⛓️ ⏱️15m
**Initialize Next.js Project**
- Run `npx create-next-app@latest` with TypeScript, Tailwind, App Router, src/ directory
- Verify `npm run dev` works
- Commit initial project
- **Depends on**: Nothing
- **Blocks**: Everything

### TASK-002 🔴 ⛓️ ⏱️20m
**Configure shadcn/ui**
- Run `npx shadcn@latest init`
- Install core components: `button`, `card`, `input`, `label`, `table`, `dialog`, `sheet`, `badge`, `alert`, `tabs`, `tooltip`, `toast`, `skeleton`, `dropdown-menu`, `form`, `select`, `textarea`, `separator`, `avatar`, `popover`, `command`
- **Depends on**: TASK-001
- **Blocks**: All UI tasks

### TASK-003 🔴 ∥ ⏱️15m
**Set Up Supabase Project**
- Create Supabase project in dashboard
- Note down: Project URL, Anon Key, Service Role Key
- Enable Realtime on required tables
- **Depends on**: Nothing (can run in parallel with TASK-001)
- **Blocks**: TASK-005, TASK-006

### TASK-004 🔴 ⛓️ ⏱️10m
**Configure Environment Variables**
- Create `.env.local` with:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  GEMINI_API_KEY=
  ```
- Create `.env.local.example` (without values)
- Add `.env.local` to `.gitignore`
- **Depends on**: TASK-001, TASK-003
- **Blocks**: TASK-005

### TASK-005 🔴 ⛓️ ⏱️30m
**Supabase Client Helpers**
- Install `@supabase/supabase-js` and `@supabase/ssr`
- Create `src/lib/supabase/client.ts` (browser client)
- Create `src/lib/supabase/server.ts` (server client with cookies)
- Create `src/lib/supabase/admin.ts` (service role client)
- Create `src/lib/supabase/middleware.ts` (session refresh)
- **Depends on**: TASK-004
- **Blocks**: TASK-008, all API tasks

### TASK-006 🔴 ⛓️ ⏱️30m
**Database Migrations — Core Safety Tables**
- Create `supabase/migrations/001_auth_profiles.sql`
  - `profiles` table with trigger on auth.users
- Create `supabase/migrations/002_safety_core.sql`
  - `incidents`, `incident_timeline`, `sos_alerts`, `emergency_alerts`, `visitors`, `audit_logs`
- Run migrations in Supabase dashboard or CLI
- **Depends on**: TASK-003
- **Blocks**: All API tasks

### TASK-007 🔴 ⛓️ ⏱️20m
**Database Migrations — ERP Tables**
- Create `supabase/migrations/003_erp_tables.sql`
  - `students`, `faculty`, `attendance`, `timetable`, `hostel_rooms`, `transport_routes`, `complaints`, `placements`, `announcements`
- **Depends on**: TASK-006
- **Blocks**: ERP API tasks

### TASK-008 🔴 ⛓️ ⏱️30m
**Database Migrations — RLS Policies**
- Create `supabase/migrations/004_rls_policies.sql`
- Enable RLS on all tables
- Create policies per the security architecture
- **Depends on**: TASK-006, TASK-007
- **Blocks**: Nothing (can be refined later)

### TASK-009 🔴 ⛓️ ⏱️30m
**Project Structure + Layout Shells**
- Create all folder directories per architecture
- Create placeholder `page.tsx` for each route (just returning the page name)
- Create root `layout.tsx` with font + providers
- Create `globals.css` with Tailwind config
- **Depends on**: TASK-001, TASK-002
- **Blocks**: All page tasks

### TASK-010 🔴 ⛓️ ⏱️30m
**Next.js Auth Middleware**
- Create `src/middleware.ts`
- Implement session refresh on every request
- Redirect unauthenticated users to `/login`
- Redirect authenticated users away from `/login`
- **Depends on**: TASK-005
- **Blocks**: All authenticated pages

### TASK-011 🟡 ⛓️ ⏱️20m
**Seed Demo Data**
- Create `supabase/seed.sql`
- Insert demo users (student, admin, security, faculty, parent)
- Insert 15-20 historical incidents
- Insert sample ERP data
- **Depends on**: TASK-006, TASK-007
- **Blocks**: Demo testing

---

## Phase 1: Auth + Layout

### TASK-101 🔴 ∥ ⏱️45m
**Login Page UI**
- Create `src/app/(auth)/login/page.tsx`
- Create `src/app/(auth)/layout.tsx` (centered card layout)
- Email + password form using shadcn Form, Input, Button
- Error display with Alert component
- Link to register page
- Loading state on submit
- **Depends on**: TASK-009
- **Can parallel with**: TASK-103, TASK-105

### TASK-102 🔴 ⛓️ ⏱️30m
**Register Page UI**
- Create `src/app/(auth)/register/page.tsx`
- Name, email, password, role selection (dropdown)
- Form validation with Zod
- **Depends on**: TASK-101 (shared layout)

### TASK-103 🔴 ∥ ⏱️45m
**Auth API Integration**
- Implement `signInWithPassword` in login page
- Implement `signUp` in register page
- Implement `signOut` handler
- Cookie-based session via `@supabase/ssr`
- **Depends on**: TASK-005
- **Can parallel with**: TASK-101

### TASK-104 🔴 ⛓️ ⏱️20m
**Profile Creation Trigger**
- Create PostgreSQL function + trigger on `auth.users` INSERT
- Auto-create `profiles` row with default role from user metadata
- Test trigger works on signup
- **Depends on**: TASK-006

### TASK-105 🔴 ∥ ⏱️60m
**Dashboard Layout (Sidebar + Topbar)**
- Create `src/app/(dashboard)/layout.tsx`
- Create `src/components/layout/sidebar.tsx`
  - Logo, navigation links, user info, logout
  - Collapsible on mobile
- Create `src/components/layout/topbar.tsx`
  - Page title, search, notifications bell, user avatar dropdown
- Create `src/components/layout/mobile-nav.tsx`
  - Sheet-based mobile navigation
- **Depends on**: TASK-009, TASK-002
- **Can parallel with**: TASK-101, TASK-103

### TASK-106 🟡 ⛓️ ⏱️30m
**Role-Based Sidebar Navigation**
- Define `ROUTE_PERMISSIONS` in `src/lib/constants/roles.ts`
- Filter sidebar links based on user role
- Group links: Safety (shield icon), ERP (book icon), System (settings icon)
- Highlight active route
- **Depends on**: TASK-105, TASK-107

### TASK-107 🔴 ⛓️ ⏱️30m
**Auth Context + Hooks**
- Create `src/hooks/use-auth.ts` — provides user + profile
- Create auth context provider wrapping the dashboard layout
- Handle loading state while session resolves
- **Depends on**: TASK-103

### TASK-108 🔴 ⛓️ ⏱️30m
**RBAC Hook + Middleware Enhancement**
- Create `src/hooks/use-role.ts` — provides `hasPermission()`, `requireRole()`
- Enhance middleware to check role-based route access
- Redirect to `/` if user lacks permission for a route
- Define constants: `src/lib/constants/roles.ts`, `severity.ts`, `categories.ts`, `departments.ts`
- **Depends on**: TASK-107

---

## Phase 2: 🔴 HERO — AI Incident System

### TASK-201 🔴 ∥ ⏱️45m
**Gemini Client Setup**
- Install `@google/generative-ai`
- Create `src/lib/ai/gemini.ts` — initialize Gemini client
- Create `src/lib/ai/prompts.ts` — system prompt for incident classification
- Configure: model `gemini-2.0-flash`, temperature 0.1, JSON output mode
- **Depends on**: TASK-004
- **Can parallel with**: TASK-203

### TASK-202 🔴 ⛓️ ⏱️30m
**AI Output Schemas**
- Create `src/lib/ai/schemas.ts` — Zod schemas for:
  - `IncidentClassification` (category, severity, confidence, summary, recommended_department, recommended_actions, risk_factors, requires_immediate_response)
- Create `src/lib/validators/incident.ts` — Zod schemas for:
  - `IncidentCreateInput` (title, description, location, evidence)
  - `IncidentUpdateInput` (status, assigned_to, notes)
- **Depends on**: TASK-201

### TASK-203 🔴 ∥ ⏱️90m
**Incident Report Form UI**
- Create `src/app/(dashboard)/incidents/new/page.tsx`
- Create `src/components/safety/incident-form.tsx`
- Multi-step or single-page form:
  1. Description (textarea, large, prominent)
  2. Location (dropdown of campus locations)
  3. Evidence upload (optional, Supabase Storage)
  4. Anonymous toggle
- Submit button triggers AI classification
- Show AI classification result with accept/modify option
- Final submit creates incident
- **Depends on**: TASK-009, TASK-002
- **Can parallel with**: TASK-201

### TASK-204 🔴 ⛓️ ⏱️60m
**AI Classification Endpoint**
- Create `src/app/api/ai/classify-incident/route.ts`
- Accepts: `{ description: string, location?: string }`
- Calls Gemini with system prompt + user input
- Parses response with Zod schema
- Returns validated classification JSON
- Does NOT write to database
- Includes error handling + fallback
- **Depends on**: TASK-201, TASK-202

### TASK-205 🟡 ⛓️ ⏱️60m
**AI Classification Display**
- Create `src/components/safety/ai-classification-display.tsx`
- Shows: category (with icon), severity (color-coded badge), confidence (progress bar)
- Shows: recommended department, suggested actions
- Loading state with shimmer animation: "AI is analyzing your report..."
- "Looks correct" / "Modify classification" buttons
- **Depends on**: TASK-203, TASK-204

### TASK-206 🔴 ⛓️ ⏱️60m
**Incident Create API**
- Create `src/app/api/incidents/route.ts` (POST handler)
- Auth check → RBAC check → validate input
- Call AI classification if not already classified
- Validate AI output with Zod
- Insert into `incidents` table
- Create `incident_timeline` entry (action: 'created')
- Create `incident_timeline` entry (action: 'ai_classified')
- Route to department based on AI recommendation
- If `requires_immediate_response` → create emergency alert
- Create audit log entry
- Return created incident
- **Depends on**: TASK-204, TASK-006, TASK-005

### TASK-207 🔴 ∥ ⏱️30m
**Incident List API**
- Add GET handler to `src/app/api/incidents/route.ts`
- Filter by role (admin/security see all, others see own)
- Support query params: `?status=`, `?severity=`, `?category=`
- Pagination support
- **Depends on**: TASK-006, TASK-005
- **Can parallel with**: TASK-206

### TASK-208 🟡 ⛓️ ⏱️45m
**Incident List Page**
- Create `src/app/(dashboard)/incidents/page.tsx`
- Create `src/components/safety/incident-card.tsx`
- Create `src/components/safety/severity-badge.tsx`
- Grid/list toggle view
- Filter by status, severity, category
- Click → navigate to detail
- Show: title, severity badge, category icon, time ago, status
- **Depends on**: TASK-207

### TASK-209 🟡 ∥ ⏱️60m
**Incident Detail Page**
- Create `src/app/(dashboard)/incidents/[id]/page.tsx`
- Create GET handler in `src/app/api/incidents/[id]/route.ts`
- Show: full description, AI classification, evidence, reporter info
- Timeline view (all actions chronologically)
- Status update buttons (for admin/security)
- Assignment dropdown
- **Depends on**: TASK-207
- **Can parallel with**: TASK-206

### TASK-210 🟡 ⛓️ ⏱️45m
**Incident Status Update API**
- Create PATCH handler in `src/app/api/incidents/[id]/route.ts`
- Auth + RBAC (only admin/security can update)
- Validate status transitions
- Create timeline entry for status change
- Create audit log
- **Depends on**: TASK-206

### TASK-211 🟡 ∥ ⏱️45m
**Supabase Realtime Subscriptions**
- Create `src/hooks/use-realtime.ts` — generic realtime hook
- Create `src/hooks/use-incidents.ts` — incidents-specific hook
- Subscribe to `incidents` table changes
- On INSERT → add to list / show notification
- On UPDATE → update item in list
- **Depends on**: TASK-206
- **Can parallel with**: TASK-208

### TASK-212 🟡 ⛓️ ⏱️30m
**Integration Test: Full Incident Flow**
- Manually test OR write a test script:
  1. Login as student
  2. Navigate to `/incidents/new`
  3. Fill form, submit
  4. Verify AI classification appears
  5. Verify incident created in DB
  6. Verify timeline entries exist
  7. Login as admin, verify incident visible
  8. Update status, verify timeline updates
- **Depends on**: TASK-201 through TASK-211

---

## Phase 3: Command Center + Campus Map

### TASK-301 🟡 ∥ ⏱️90m
**Command Center Layout**
- Create `src/app/(dashboard)/command-center/page.tsx`
- Create `src/components/safety/command-center-grid.tsx`
- Grid layout with:
  - Live incident feed (left, large)
  - Campus map (center, large)
  - Stats panel (right sidebar)
  - Emergency alert bar (top)
  - Quick actions panel (bottom)
- Use CSS Grid or shadcn Tabs for sections
- **Depends on**: Phase 2 complete
- **Can parallel with**: TASK-304

### TASK-302 🟡 ⛓️ ⏱️45m
**Live Incident Feed Widget**
- Create `src/components/safety/live-feed.tsx`
- Realtime list of recent incidents
- Severity-colored left border
- Auto-scroll to newest
- Click to expand details
- Pulsing indicator for CRITICAL
- **Depends on**: TASK-211, TASK-301

### TASK-303 🟡 ⛓️ ⏱️30m
**Command Center Stats**
- Create `src/components/shared/stat-card.tsx`
- Cards: Total active, Critical count, Avg response time, Today's count
- Animated counter transitions
- Color-coded by severity
- **Depends on**: TASK-207

### TASK-304 🟡 ∥ ⏱️90m
**SVG Campus Map Component**
- Create `src/components/safety/campus-map-view.tsx`
- Create `public/campus-map.svg` (simple campus layout)
- Design SVG with ~10 buildings, roads, green areas
- Interactive: hover to see building name
- **Depends on**: Phase 2 complete
- **Can parallel with**: TASK-301

### TASK-305 🟡 ⛓️ ⏱️45m
**Incident Pins on Map**
- Plot active incidents as pins on the SVG map
- Color by severity (red/orange/yellow/blue)
- Pulse animation for critical
- Cluster if multiple incidents at same location
- **Depends on**: TASK-304, TASK-207

### TASK-306 🟡 ⛓️ ⏱️30m
**Map Pin Click → Detail Popup**
- Click pin → show popover/dialog with incident summary
- Quick actions: Acknowledge, View full, Assign
- **Depends on**: TASK-305

### TASK-307 🟡 ∥ ⏱️30m
**Emergency Alert API**
- Create `src/app/api/alerts/route.ts`
- POST: create alert (admin/security only)
- GET: list active alerts
- PATCH: deactivate alert
- **Depends on**: TASK-005, TASK-006
- **Can parallel with**: TASK-301

### TASK-308 🟡 ⛓️ ⏱️30m
**Emergency Alert Banner**
- Create `src/components/safety/alert-banner.tsx`
- Fixed banner at top of dashboard
- Red for critical, orange for high
- Dismiss button
- Auto-show on realtime INSERT to `emergency_alerts`
- **Depends on**: TASK-307

### TASK-309 🟡 ⛓️ ⏱️30m
**Realtime Alert Notifications**
- Toast notification when new emergency alert arrives
- Sound effect (optional, time permitting)
- Badge counter on notification bell in topbar
- **Depends on**: TASK-307, TASK-211

### TASK-310 🟡 ⛓️ ⏱️30m
**Command Center Realtime Integration**
- Wire all command center widgets to realtime channels
- Incident feed auto-updates
- Map pins auto-appear
- Stats auto-recalculate
- **Depends on**: TASK-301, TASK-302, TASK-305, TASK-211

### TASK-311 🟢 ⛓️ ⏱️30m
**Department Routing Display**
- Show which department the incident was routed to
- Visual indicator of notification status
- Department-specific icons
- **Depends on**: TASK-206

---

## Phase 4: Safety Features

### TASK-401 🟡 ∥ ⏱️45m
**SOS Panic Button UI**
- Create `src/app/(dashboard)/sos/page.tsx`
- Create `src/components/safety/sos-button.tsx`
- Large, prominent red button
- Confirmation dialog: "Are you sure?"
- Captures current location (browser Geolocation API)
- Shows countdown / "Help is on the way" after trigger
- Active SOS status display
- **Depends on**: TASK-105
- **Can parallel with**: TASK-404

### TASK-402 🟡 ∥ ⏱️45m
**SOS API**
- Create `src/app/api/sos/route.ts`
- POST: trigger SOS (student/faculty only)
- PATCH: respond / resolve (security/admin only)
- GET: list active SOS alerts
- Create audit log on each action
- **Depends on**: TASK-006
- **Can parallel with**: TASK-401

### TASK-403 🟡 ⛓️ ⏱️30m
**SOS on Command Center**
- Add SOS alerts panel to command center
- Realtime updates when SOS triggered
- Show on campus map as special marker
- Quick respond action
- **Depends on**: TASK-402, TASK-310

### TASK-404 🟡 ∥ ⏱️45m
**Safety Analytics Page Layout**
- Create `src/app/(dashboard)/safety-analytics/page.tsx`
- Tab layout: Overview, Trends, AI Insights, Locations
- Placeholder sections for charts
- **Depends on**: TASK-105
- **Can parallel with**: TASK-401

### TASK-405 🟡 ∥ ⏱️60m
**AI Safety Insights Endpoint**
- Create `src/app/api/ai/safety-insights/route.ts`
- Fetch incident statistics from DB (aggregated, no PII)
- Send to Gemini with insights prompt
- Return: patterns, recommendations, risk areas, preventive actions
- Validate output with Zod
- **Depends on**: TASK-201, TASK-206
- **Can parallel with**: TASK-404

### TASK-406 🟡 ⛓️ ⏱️45m
**Recharts: Incident Trends**
- Create `src/components/charts/incident-trend.tsx`
- Area chart showing incidents over time (last 30 days)
- Color-coded by severity
- Responsive container
- **Depends on**: TASK-404, TASK-207

### TASK-407 🟡 ⛓️ ⏱️30m
**Recharts: Severity Distribution**
- Create `src/components/charts/severity-distribution.tsx`
- Donut/pie chart: Critical, High, Medium, Low
- Color-matched to severity palette
- **Depends on**: TASK-404, TASK-207

### TASK-408 🟡 ⛓️ ⏱️30m
**Recharts: Location Analysis**
- Create `src/components/charts/heatmap.tsx`
- Horizontal bar chart of top incident locations
- **Depends on**: TASK-404, TASK-207

### TASK-409 🟡 ⛓️ ⏱️30m
**AI Insight Cards**
- Create `src/components/safety/ai-insight-card.tsx`
- Display AI-generated insights as cards
- Icon + title + description + recommended action
- Loading skeleton while AI processes
- **Depends on**: TASK-405

### TASK-410 🟢 ∥ ⏱️45m
**Visitor Management UI**
- Create `src/app/(dashboard)/visitors/page.tsx`
- Table with: name, phone, purpose, host, check-in time, status
- Register new visitor dialog
- Check-out action button
- **Depends on**: TASK-105
- **Can parallel with**: TASK-405

### TASK-411 🟢 ∥ ⏱️30m
**Visitor Management API**
- Create `src/app/api/visitors/route.ts`
- POST: register visitor
- GET: list visitors (today by default)
- PATCH: check out / update status
- **Depends on**: TASK-006
- **Can parallel with**: TASK-410

### TASK-412 🟢 ∥ ⏱️45m
**Security Operations Dashboard**
- Create `src/app/(dashboard)/security/page.tsx`
- Similar to command center but focused on security officer's workflow
- My assigned incidents, active SOS, visitor log, patrol schedule (mock)
- **Depends on**: TASK-301

### TASK-413 🟢 ∥ ⏱️45m
**Audit Logs Page + API**
- Create `src/app/(dashboard)/audit-logs/page.tsx`
- Create API: GET with pagination + filters
- Table: timestamp, user, action, entity, details
- Filter by date range, action type, user
- **Depends on**: TASK-006
- **Can parallel with**: TASK-412

---

## Phase 5: ERP Features

### TASK-501 🟢 ⛓️ ⏱️45m
**Shared DataTable Component**
- Create `src/components/shared/data-table.tsx`
- Based on shadcn DataTable recipe
- Sortable columns, search, pagination
- Row actions dropdown
- Reusable across ALL ERP pages
- **Depends on**: TASK-002

### TASK-502 🟢 ∥ ⏱️45m
**Students Page**
- Create `src/app/(dashboard)/students/page.tsx`
- DataTable: enrollment no, name, course, semester, section, actions
- Add student dialog
- **Depends on**: TASK-501
- **Can parallel with**: TASK-503

### TASK-503 🟢 ∥ ⏱️45m
**Faculty Page**
- Create `src/app/(dashboard)/faculty/page.tsx`
- DataTable: employee ID, name, department, designation, actions
- **Depends on**: TASK-501
- **Can parallel with**: TASK-502

### TASK-504 🟢 ∥ ⏱️45m
**Students + Faculty API**
- Create `src/app/api/erp/students/route.ts`
- Create `src/app/api/erp/faculty/route.ts`
- Standard CRUD routes
- **Depends on**: TASK-007
- **Can parallel with**: TASK-502, TASK-503

### TASK-505 🟢 ⛓️ ⏱️60m
**Attendance Page**
- Create `src/app/(dashboard)/attendance/page.tsx`
- Date picker + class selector
- Student list with present/absent toggle
- Submit button to save attendance
- View mode: attendance percentage per student
- **Depends on**: TASK-504

### TASK-506 🟢 ∥ ⏱️30m
**Attendance API**
- Create `src/app/api/erp/attendance/route.ts`
- POST: bulk mark attendance
- GET: attendance by date/student/class
- **Depends on**: TASK-007
- **Can parallel with**: TASK-505

### TASK-507 🟢 ∥ ⏱️45m
**Timetable Page**
- Create `src/app/(dashboard)/timetable/page.tsx`
- Weekly grid view (Mon-Sat, periods 1-8)
- Color-coded by subject
- **Depends on**: TASK-105
- **Can parallel with**: TASK-505

### TASK-508 🔵 ∥ ⏱️45m
**Exams Page**
- Create `src/app/(dashboard)/exams/page.tsx`
- Exam schedule table
- Results entry (admin/faculty)
- Results view (student)
- **Depends on**: TASK-501
- **Can parallel with**: TASK-507

### TASK-509 🔵 ∥ ⏱️30m
**Hostel Page**
- Create `src/app/(dashboard)/hostel/page.tsx`
- Room grid with occupancy status
- Room allocation dialog
- **Depends on**: TASK-501
- **Can parallel with**: TASK-508

### TASK-510 🔵 ∥ ⏱️30m
**Transport Page**
- Create `src/app/(dashboard)/transport/page.tsx`
- Route list with stops
- Vehicle details
- **Depends on**: TASK-501
- **Can parallel with**: TASK-509

### TASK-511 🟢 ∥ ⏱️45m
**Complaints Page**
- Create `src/app/(dashboard)/complaints/page.tsx`
- Similar to incidents but for general complaints
- File complaint form
- Status tracking
- **Depends on**: TASK-501
- **Can parallel with**: TASK-510

### TASK-512 🔵 ∥ ⏱️30m
**Placements Page**
- Create `src/app/(dashboard)/placements/page.tsx`
- Placement drive cards
- Company details, package, eligibility
- Register/apply button
- **Depends on**: TASK-501
- **Can parallel with**: TASK-511

### TASK-513 🔵 ∥ ⏱️30m
**Communication/Announcements Page**
- Create `src/app/(dashboard)/communication/page.tsx`
- Announcement feed (card-based)
- Create announcement form (admin/faculty)
- Priority badges
- **Depends on**: TASK-501
- **Can parallel with**: TASK-512

### TASK-514 🔵 ⛓️ ⏱️30m
**Parent Portal**
- Create `src/app/(dashboard)/parent-portal/page.tsx`
- Read-only view: child's attendance, exams, timetable
- Link to parent's child via guardian_id in students table
- **Depends on**: TASK-504, TASK-505

### TASK-515 🟢 ∥ ⏱️60m
**ERP API Routes (Batch)**
- Create remaining API routes:
  - `/api/erp/timetable/route.ts`
  - `/api/erp/hostel/route.ts`
  - `/api/erp/transport/route.ts`
  - `/api/erp/complaints/route.ts`
  - `/api/erp/placements/route.ts`
  - `/api/erp/announcements/route.ts`
- Standard CRUD patterns
- **Depends on**: TASK-007
- **Can parallel with**: TASK-502–513

---

## Phase 6: Polish + Demo

### TASK-601 🟡 ∥ ⏱️60m
**Role-Based Dashboard Landing Pages**
- `/` page redirects to role-specific dashboard:
  - **Admin**: Key stats, recent incidents, quick actions
  - **Security**: Active incidents, SOS, patrol assignments
  - **Student**: My incidents, campus alerts, SOS button
  - **Faculty**: Attendance shortcuts, announcements, incidents
  - **Parent**: Child overview, attendance, alerts
- **Depends on**: All phases
- **Can parallel with**: TASK-602

### TASK-602 🟢 ∥ ⏱️45m
**Mobile Responsive Pass**
- Check all pages on mobile viewport
- Fix sidebar collapse
- Fix tables on mobile (horizontal scroll or card layout)
- Fix command center on mobile (stack vertically)
- **Depends on**: All phases
- **Can parallel with**: TASK-601

### TASK-603 🟢 ⛓️ ⏱️30m
**Loading States + Skeletons**
- Add `<Skeleton>` components to all data-heavy pages
- Loading spinner on form submissions
- Suspense boundaries where needed
- **Depends on**: All phases

### TASK-604 🟢 ⛓️ ⏱️30m
**Error Handling + Toasts**
- Toast notifications for: success, error, info
- Try/catch all API calls in UI
- Meaningful error messages
- **Depends on**: All phases

### TASK-605 🟡 ⛓️ ⏱️30m
**Refresh Demo Seed Data**
- Ensure seed data tells a compelling story:
  - Recent critical incident (fire in lab)
  - A few in-progress incidents
  - Historical data for charts (30 days)
  - Active emergency alert
  - SOS history
  - Visitor log for today
- **Depends on**: All phases

### TASK-606 🟢 ⏱️15m
**Performance Check**
- Run Lighthouse audit
- Check bundle size
- Ensure no obvious performance issues
- **Depends on**: All phases

### TASK-607 🟡 ⏱️60m
**Bug Fixes**
- Allocated time for fixing issues found during testing
- **Depends on**: All phases

### TASK-608 🟡 ⏱️30m
**Demo Script**
- Write step-by-step demo script
- Prepare talking points for judges
- Identify 3-5 "wow" moments to highlight
- **Depends on**: All phases

### TASK-609 🟢 ⏱️30m
**Backup Demo Video**
- Screen record the full demo flow
- In case of technical issues during live demo
- **Depends on**: TASK-608

### TASK-610 🟡 ⏱️15m
**Deploy to Vercel**
- Connect GitHub repo to Vercel
- Configure environment variables
- Test deployed URL
- **Depends on**: All phases

---

## Dependency Graph (Critical Path)

```
TASK-001 → TASK-002 → TASK-009 ──────────────────────────┐
                                                          │
TASK-003 → TASK-006 → TASK-007 → TASK-008                │
     │          │                                          │
     └─→ TASK-004 → TASK-005 → TASK-010                  │
                         │                                 │
                         └─→ TASK-103 → TASK-107          │
                                           │               │
                    TASK-101 ←─────────────┤               │
                         │                 │               │
                         └─→ TASK-105 ─────┤───────────────┘
                                │          │
                                └─→ TASK-106, TASK-108
                                           │
                         TASK-201 ─────────┤
                              │            │
                              └─→ TASK-204 │
                                     │     │
                              TASK-203─────┤
                                     │     │
                                     └─→ TASK-206 ─→ TASK-211
                                           │              │
                                           └─→ TASK-301, TASK-304
                                                     │
                                                     └─→ TASK-310
                                                           │
                                                     Phase 4-6
```

**Critical path time**: ~24 hours sequential, ~16 hours with parallelization.

---

## Skip List (If Running Out of Time)

Cut these first, in order:
1. TASK-514 (Parent Portal) 🔵
2. TASK-510 (Transport) 🔵
3. TASK-509 (Hostel) 🔵
4. TASK-512 (Placements) 🔵
5. TASK-508 (Exams) 🔵
6. TASK-513 (Communication) 🔵
7. TASK-602 (Mobile Responsive) 🟢
8. TASK-412 (Security Dashboard) 🟢

**NEVER skip**: Phase 2 (Incidents + AI), Phase 3 (Command Center + Map), TASK-401-403 (SOS), TASK-404-409 (Analytics)
