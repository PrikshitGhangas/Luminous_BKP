# CampusShield AI — Database Implementation & Migration Guide

> **Document**: Database Implementation & Verification  
> **Target Platform**: Supabase PostgreSQL 15+  
> **Schema Version**: 1.0.0  
> **Validation Status**: Verified & Passed  

---

## 1. Migration Architecture & Execution Order

All database migrations are located in `supabase/migrations/` and must be executed in numerical sequence:

```
supabase/migrations/
├── 001_core_schema.sql             # Extensions, Enums, Roles, Departments, Campus Locations, Profiles
├── 002_academic_erp.sql            # Courses, Students, Faculty, Parents, Links, Timetable, Attendance, Exams, Hostels, Placements
├── 003_safety_core.sql             # Incidents, Evidence, Assignments, Timeline, SOS Alerts, Emergency Alerts, Visitors, Complaints, Wellbeing, AI Insights
├── 004_audit_and_triggers.sql      # Audit Logs, Auto-Numbering Triggers, Timeline Logging, Auth User Profile Creation Trigger
├── 005_indexes_and_constraints.sql # Foreign Key Indexes, Composite Indexes, Partial Indexes, GIN Indexes
└── 006_row_level_security.sql      # RLS Enablement, Role Helper Functions, Role-Aware & Privacy-Aware Access Policies
```

### Migration Summary Table

| Migration File | Size | Primary Objects Created | Key Constraints / Triggers |
|---|---|---|---|
| `001_core_schema.sql` | 6.2 KB | 12 Enums, `roles`, `departments`, `campus_locations`, `profiles` | Circular FK `departments.head_profile_id` to `profiles` |
| `002_academic_erp.sql` | 10.4 KB | `courses`, `students`, `faculty`, `parents`, `parent_student_links`, `timetable`, `attendance`, `exams`, `exam_results`, `hostels`, `rooms`, `hostel_allocations`, `placements`, `placement_applications` | `UNIQUE(student_id, subject_code, date)`, `chk_timetable_time`, `chk_exam_time` |
| `003_safety_core.sql` | 10.9 KB | `incidents`, `incident_evidence`, `incident_assignments`, `incident_timeline`, `sos_alerts`, `emergency_alerts`, `visitors`, `visitor_passes`, `complaints`, `announcements`, `notifications`, `wellbeing_checkins`, `ai_insights` | `ai_confidence` bounds, `chk_pass_validity`, enum validations |
| `004_audit_and_triggers.sql` | 8.8 KB | `audit_logs`, 7 PL/pgSQL Trigger functions | `trg_generate_incident_number`, `trg_incident_timeline_logging`, `handle_new_user` |
| `005_indexes_and_constraints.sql`| 6.3 KB | 68 Performance Indexes | GIN on `ai_classification`, partial on active incidents & SOS |
| `006_row_level_security.sql` | 18.5 KB | 32 RLS policies + 5 Security Definer helper functions | Role authorization, parent-student scoping, incident privacy |

---

## 2. Seed Data Specifications

The seed database script (`supabase/seed.sql`) contains **9,585 SQL statements** populating rich, realistic, relational test data:

| Entity / Table | Seed Count | Requirement | Status | Key Characteristics |
|---|---|---|---|---|
| **Students** (`students`) | **520** | >= 500 | ✅ Exceeded | Realistic names, enrollments, blood groups, CGPAs (6.20 - 9.85), batch years (2022-2025) |
| **Faculty** (`faculty`) | **55** | >= 50 | ✅ Exceeded | Professors, Deans, HODs with specializations across CSE, ECE, MECH, MGMT |
| **Security & Admin Users** | **21** | >= 10 | ✅ Exceeded | Super Admin, Directors, Chief Security Officer, Wardens, Counselors, Doctors |
| **Campus Locations** | **16** | >= 10 | ✅ Exceeded | Vector mapped with SVG (X,Y) coords + Lat/Lng, risk levels, and capacities |
| **Safety Incidents** (`incidents`)| **110** | >= 100 | ✅ Exceeded | Fire, medical, harassment, cybercrime, theft; with Gemini AI classification JSON & confidence |
| **Complaints** (`complaints`) | **55** | >= 50 | ✅ Exceeded | Hostel, mess, academics, maintenance tickets with status and resolution notes |
| **Visitors & Passes** (`visitors`)| **35** / **35** | >= 30 | ✅ Exceeded | Masked Aadhaar/Passport, visit host, destination location, and gate badge codes |
| **Attendance** (`attendance`) | **6,000** | Realistic Volume | ✅ Generated | Full daily matrices across courses, subjects, and dates (Present, Absent, Late) |
| **Timetable Entries** (`timetable`) | **30** | Full Week | ✅ Generated | Complete Monday-Friday period schedules across lecture halls and faculty |
| **Placement Drives & Apps** | **8** / **124** | Realistic Volume | ✅ Generated | Top tier firms (Google, Microsoft, CrowdStrike, AWS) with student applications |
| **Notifications** (`notifications`)| **350** | Realistic Volume | ✅ Generated | User alerts across incident updates, SOS dispatches, and emergency alerts |
| **Announcements** (`announcements`)| **25** | Realistic Volume | ✅ Generated | Pinned exams, hackathon alerts, security notices, and blood donation drives |
| **SOS Alerts** (`sos_alerts`) | **15** | Realistic Volume | ✅ Generated | High urgency panic triggers with GPS coords, battery level, and response times |
| **Emergency Broadcasts** | **4** | Realistic Volume | ✅ Generated | Evacuation, severe weather, and phishing security broadcasts |
| **Wellbeing Checkins** | **80** | Realistic Volume | ✅ Generated | Student stress, sleep hours, mood, and counselor escalation flags |
| **AI Predictive Insights** | **12** | Realistic Volume | ✅ Generated | Hotspot predictions, lab safety audit suggestions, and complaint trend analysis |
| **Audit Logs** (`audit_logs`) | **150** | Realistic Volume | ✅ Generated | Mutation audit entries with IP addresses and user agents |

---

## 3. How to Apply Migrations & Seed Data

### Option A: Via Supabase CLI (Local Development)

```bash
# 1. Start local Supabase instance (requires Docker)
npx supabase start

# 2. Apply all migrations
npx supabase migration up

# 3. Apply seed data
npx supabase db reset
```

### Option B: Via Supabase Cloud Dashboard (SQL Editor)

1. Open your Supabase Project Dashboard.
2. Navigate to **SQL Editor** -> **New Query**.
3. Copy and run the contents of migration files in order:
   - `001_core_schema.sql`
   - `002_academic_erp.sql`
   - `003_safety_core.sql`
   - `004_audit_and_triggers.sql`
   - `005_indexes_and_constraints.sql`
   - `006_row_level_security.sql`
4. Copy and run `supabase/seed.sql` to populate demo data.

### Option C: Automated Verification via Node.js Test Runner

We provide a built-in automated test suite:

```bash
# Regenerate seed file if customized
node scripts/generate_seed.js

# Run full database schema, RLS, and seed validation test suite
node scripts/validate_database.js
```

---

## 4. Benchmark SQL Queries & Workflows

### Query 1: Safety Command Center — Active Incidents Grid
```sql
SELECT 
    i.id,
    i.incident_number,
    i.title,
    i.category,
    i.severity,
    i.ai_confidence,
    i.status,
    i.priority_score,
    loc.name AS location_name,
    loc.svg_x,
    loc.svg_y,
    p.full_name AS reporter_name,
    i.created_at
FROM incidents i
JOIN campus_locations loc ON i.location_id = loc.id
JOIN profiles p ON i.reporter_id = p.id
WHERE i.status NOT IN ('resolved', 'closed', 'false_alarm')
ORDER BY i.priority_score DESC, i.created_at DESC
LIMIT 10;
```

### Query 2: Student Dashboard — Daily Schedule & Attendance Rate
```sql
-- Fetch weekly schedule for student's current semester & section
SELECT 
    t.day_of_week,
    t.start_time,
    t.end_time,
    t.subject_code,
    t.subject_name,
    f.designation || ' ' || p.full_name AS instructor,
    loc.name AS classroom
FROM timetable t
JOIN students s ON s.course_id = t.course_id AND s.current_semester = t.semester AND s.section = t.section
JOIN faculty f ON t.faculty_id = f.id
JOIN profiles p ON f.profile_id = p.id
JOIN campus_locations loc ON t.location_id = loc.id
WHERE s.profile_id = '20000000-0000-0000-0000-000000000001' -- Priya Sharma
ORDER BY t.day_of_week, t.start_time;
```

### Query 3: Parent Portal — Linked Ward Performance & Safety Status
```sql
-- Authenticated Parent viewing their child's academic and safety status
SELECT 
    s.enrollment_no,
    p_student.full_name AS student_name,
    c.name AS course_name,
    s.current_semester,
    s.cgpa,
    s.attendance_percentage,
    (SELECT COUNT(*) FROM incidents WHERE reporter_id = p_student.id) AS incidents_reported,
    (SELECT COUNT(*) FROM sos_alerts WHERE user_id = p_student.id AND status = 'active') AS active_sos
FROM parent_student_links psl
JOIN parents par ON psl.parent_id = par.id
JOIN students s ON psl.student_id = s.id
JOIN profiles p_student ON s.profile_id = p_student.id
JOIN courses c ON s.course_id = c.id
WHERE par.profile_id = '30000000-0000-0000-0000-000000000001'; -- Rajesh Sharma
```

### Query 4: Security Rapid Response — Active SOS Alerts
```sql
SELECT 
    sos.id,
    sos.user_id,
    p.full_name AS caller_name,
    p.phone AS caller_phone,
    p.emergency_contact,
    sos.location_name,
    sos.location_lat,
    sos.location_lng,
    sos.battery_level,
    sos.is_silent,
    sos.created_at
FROM sos_alerts sos
JOIN profiles p ON sos.user_id = p.id
WHERE sos.status IN ('active', 'responding')
ORDER BY sos.created_at DESC;
```

### Query 5: AI Safety Engine — Incident Hotspot Clustering
```sql
SELECT 
    loc.name AS hotspot_location,
    loc.zone,
    COUNT(i.id) AS total_incidents,
    SUM(CASE WHEN i.severity IN ('critical', 'high') THEN 1 ELSE 0 END) AS high_severity_count,
    ROUND(AVG(i.ai_confidence)::numeric, 2) AS avg_ai_confidence,
    jsonb_agg(DISTINCT i.category) AS incident_categories
FROM campus_locations loc
JOIN incidents i ON i.location_id = loc.id
GROUP BY loc.id, loc.name, loc.zone
HAVING COUNT(i.id) >= 5
ORDER BY high_severity_count DESC, total_incidents DESC;
```

---

## 5. Security & Row Level Security (RLS) Verification

| Scenario | Tested Action | Expected Result | Policy Enforced |
|---|---|---|---|
| **Student viewing own grades** | `SELECT * FROM exam_results WHERE student_id = '...'` | ✅ Returned | `exam_results_view_policy` |
| **Student attempting to view other student's grades** | `SELECT * FROM exam_results WHERE student_id = '<other_id>'` | 🚫 Blocked (0 rows) | `exam_results_view_policy` |
| **Parent viewing linked child attendance** | `SELECT * FROM attendance WHERE student_id = '<linked_child>'` | ✅ Returned | `attendance_view_policy` |
| **Parent viewing unlinked student attendance** | `SELECT * FROM attendance WHERE student_id = '<unlinked_child>'` | 🚫 Blocked (0 rows) | `is_parent_of_student()` check |
| **Security officer viewing live incidents** | `SELECT * FROM incidents` | ✅ All 110 incidents returned | `is_admin_or_security()` |
| **Student reporting an incident** | `INSERT INTO incidents (reporter_id, ...)` | ✅ Allowed when `reporter_id = auth.uid()` | `incidents_insert_policy` |
| **Unauthorized user modifying an incident** | `UPDATE incidents SET status = 'resolved'` | 🚫 Blocked (0 rows affected) | `is_admin_or_security()` |
| **Student querying audit logs** | `SELECT * FROM audit_logs` | 🚫 Blocked (0 rows) | `is_institution_admin()` |
| **Anonymous reporter protection** | Non-admin querying anonymous incident | `reporter_id` is protected via backend view masking | Role-aware presentation |

---

## 6. Verification Test Report

```
==================================================================
CampusShield AI — Database Foundation Architecture Verification
==================================================================

Found 6 migration files:
  - 001_core_schema.sql (6.2 KB)
  - 002_academic_erp.sql (10.4 KB)
  - 003_safety_core.sql (10.9 KB)
  - 004_audit_and_triggers.sql (8.8 KB)
  - 005_indexes_and_constraints.sql (6.3 KB)
  - 006_row_level_security.sql (18.5 KB)

--- Checking Table Definitions in Migrations ---
  ✅ All 32 required tables are properly defined

--- Checking Row Level Security (RLS) Enablement ---
  ✅ 32/32 tables have Row Level Security enabled

--- Checking Performance Indexes ---
  ✅ Found 68 explicit performance and lookup indexes

--- Checking Seed Data Volume & Requirements ---
  ✅ Students count >= 500 (520)
  ✅ Faculty count >= 50 (55)
  ✅ Campus Locations >= 10 (16)
  ✅ Incidents count >= 100 (110)
  ✅ Complaints count >= 50 (55)
  ✅ Visitors count >= 30 (35)
  ✅ Attendance records present (6,000)
  ✅ Timetable schedules present (30)
  ✅ Placements present (8)
  ✅ Notifications present (350)
  ✅ Announcements present (25)

🎯 ALL DATABASE SCHEMA & SEED REQUIREMENTS ARE 100% SATISFIED AND VERIFIED!
```
