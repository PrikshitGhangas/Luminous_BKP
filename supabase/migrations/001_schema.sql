-- ============================================================
-- SafeCampus — Schema Migration 001
-- ============================================================
-- Creates all extensions, enums, tables, indexes, and views.
-- ============================================================

-- =========================
-- 1. Extensions
-- =========================
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- =========================
-- 2. Enums
-- =========================
CREATE TYPE public.user_role AS ENUM (
  'student', 'faculty', 'guard', 'volunteer', 'admin', 'parent', 'therapist'
);

CREATE TYPE public.sos_level AS ENUM (
  'campus', 'police'
);

CREATE TYPE public.incident_status AS ENUM (
  'reported', 'assigned', 'responding', 'resolved'
);

CREATE TYPE public.location_source AS ENUM (
  'gps', 'timetable_fallback', 'last_known'
);

CREATE TYPE public.tip_status AS ENUM (
  'new', 'reviewed'
);

CREATE TYPE public.urgency_level AS ENUM (
  'low', 'medium', 'high', 'critical'
);

CREATE TYPE public.session_status AS ENUM (
  'queued', 'active', 'completed'
);

CREATE TYPE public.broadcast_type AS ENUM (
  'emergency', 'info', 'drill'
);

CREATE TYPE public.attendance_status AS ENUM (
  'present', 'absent', 'late'
);

CREATE TYPE public.attendance_method AS ENUM (
  'geofence', 'manual'
);

-- =========================
-- 3. Tables
-- =========================

-- ----- users -----
CREATE TABLE public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  email           TEXT        NOT NULL UNIQUE,
  role            user_role   NOT NULL DEFAULT 'student',
  department      TEXT,
  year            INT,
  phone           TEXT,
  blood_group     TEXT,
  medical_conditions TEXT,
  hostel_room     TEXT,

  -- real-time location
  current_location    GEOGRAPHY(POINT, 4326),
  location_accuracy   FLOAT,
  location_reason     location_source,
  location_updated_at TIMESTAMPTZ,

  -- distress state
  is_in_distress  BOOLEAN     NOT NULL DEFAULT FALSE,
  distress_level  sos_level,

  -- availability (guards / volunteers)
  is_available    BOOLEAN     NOT NULL DEFAULT TRUE,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- emergency_contacts -----
CREATE TABLE public.emergency_contacts (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID        NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  name      TEXT        NOT NULL,
  phone     TEXT        NOT NULL,
  relation  TEXT
);

-- ----- timetable_slots -----
CREATE TABLE public.timetable_slots (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID     NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  day        SMALLINT NOT NULL CHECK (day BETWEEN 0 AND 6),  -- 0 = Sunday
  start_time TIME     NOT NULL,
  end_time   TIME     NOT NULL,
  subject    TEXT,
  building   TEXT,
  room       TEXT,

  CONSTRAINT timetable_time_order CHECK (end_time > start_time)
);

-- ----- campus_buildings -----
CREATE TABLE public.campus_buildings (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT NOT NULL UNIQUE,
  location  GEOGRAPHY(POINT, 4326),
  boundary  GEOGRAPHY(POLYGON, 4326),
  floors    INT
);

-- ----- incidents -----
CREATE TABLE public.incidents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by       UUID            NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  description       TEXT,
  sos_level         sos_level       NOT NULL DEFAULT 'campus',
  location          GEOGRAPHY(POINT, 4326),
  location_accuracy FLOAT,
  location_source   location_source,
  fallback_building TEXT,
  fallback_room     TEXT,
  fallback_subject  TEXT,
  status            incident_status NOT NULL DEFAULT 'reported',
  assigned_to       UUID            REFERENCES public.users (id) ON DELETE SET NULL,
  ai_classification TEXT,
  offline_triggered BOOLEAN         NOT NULL DEFAULT FALSE,
  auto_escalated    BOOLEAN         NOT NULL DEFAULT FALSE,
  escalated_at      TIMESTAMPTZ,
  responded_at      TIMESTAMPTZ,
  resolved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- ----- therapist_profiles -----
CREATE TABLE public.therapist_profiles (
  user_id             UUID PRIMARY KEY REFERENCES public.users (id) ON DELETE CASCADE,
  specialization      TEXT,
  currently_busy      BOOLEAN NOT NULL DEFAULT FALSE,
  active_session_with UUID    REFERENCES public.users (id) ON DELETE SET NULL,
  sessions_today      INT     NOT NULL DEFAULT 0
);

-- ----- therapist_slots -----
CREATE TABLE public.therapist_slots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  day          SMALLINT NOT NULL CHECK (day BETWEEN 0 AND 6),
  start_time   TIME     NOT NULL,
  end_time     TIME     NOT NULL,

  CONSTRAINT therapist_slot_time_order CHECK (end_time > start_time)
);

-- ----- therapy_sessions -----
CREATE TABLE public.therapy_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID           NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  therapist_id      UUID           NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  urgency           urgency_level  NOT NULL DEFAULT 'medium',
  ai_triage_summary TEXT,
  ai_warm_handoff   JSONB,
  status            session_status NOT NULL DEFAULT 'queued',
  anonymous         BOOLEAN        NOT NULL DEFAULT FALSE,
  started_at        TIMESTAMPTZ,
  ended_at          TIMESTAMPTZ,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- ----- tips -----
CREATE TABLE public.tips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by UUID        REFERENCES public.users (id) ON DELETE SET NULL,
  anonymous   BOOLEAN     NOT NULL DEFAULT TRUE,
  text        TEXT        NOT NULL,
  ai_category TEXT,
  ai_severity urgency_level,
  status      tip_status  NOT NULL DEFAULT 'new',
  reviewed_by UUID        REFERENCES public.users (id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- broadcasts -----
CREATE TABLE public.broadcasts (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                TEXT           NOT NULL,
  message              TEXT           NOT NULL,
  type                 broadcast_type NOT NULL DEFAULT 'info',
  target_location      GEOGRAPHY(POINT, 4326),
  target_radius_meters FLOAT,
  created_by           UUID           NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  created_at           TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- ----- attendance -----
CREATE TABLE public.attendance (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID              NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  date      DATE              NOT NULL DEFAULT CURRENT_DATE,
  status    attendance_status NOT NULL DEFAULT 'present',
  method    attendance_method,
  building  TEXT,
  marked_at TIMESTAMPTZ       NOT NULL DEFAULT now(),

  CONSTRAINT attendance_unique_user_date UNIQUE (user_id, date)
);

-- ----- trusted_circle -----
CREATE TABLE public.trusted_circle (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  trusted_user_id UUID        NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT trusted_circle_unique UNIQUE (user_id, trusted_user_id),
  CONSTRAINT trusted_circle_no_self CHECK (user_id != trusted_user_id)
);

-- ----- night_walk_sessions -----
CREATE TABLE public.night_walk_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at   TIMESTAMPTZ
);

-- =========================
-- 4. Indexes
-- =========================

-- ---- GIST indexes on geography columns ----
CREATE INDEX idx_users_current_location
  ON public.users USING GIST (current_location);

CREATE INDEX idx_campus_buildings_location
  ON public.campus_buildings USING GIST (location);

CREATE INDEX idx_campus_buildings_boundary
  ON public.campus_buildings USING GIST (boundary);

CREATE INDEX idx_incidents_location
  ON public.incidents USING GIST (location);

CREATE INDEX idx_broadcasts_target_location
  ON public.broadcasts USING GIST (target_location);

-- ---- Composite index on timetable_slots ----
CREATE INDEX idx_timetable_slots_user_day_time
  ON public.timetable_slots (user_id, day, start_time, end_time);

-- ---- Partial index on active incidents ----
CREATE INDEX idx_incidents_active_status
  ON public.incidents (status)
  WHERE status != 'resolved';

-- ---- Partial index on active night walk sessions ----
CREATE INDEX idx_night_walk_sessions_active
  ON public.night_walk_sessions (user_id)
  WHERE is_active = TRUE;

-- ---- Foreign-key / lookup indexes ----
CREATE INDEX idx_emergency_contacts_user_id
  ON public.emergency_contacts (user_id);

CREATE INDEX idx_timetable_slots_user_id
  ON public.timetable_slots (user_id);

CREATE INDEX idx_incidents_reported_by
  ON public.incidents (reported_by);

CREATE INDEX idx_incidents_assigned_to
  ON public.incidents (assigned_to);

CREATE INDEX idx_therapist_slots_therapist_id
  ON public.therapist_slots (therapist_id);

CREATE INDEX idx_therapy_sessions_student_id
  ON public.therapy_sessions (student_id);

CREATE INDEX idx_therapy_sessions_therapist_id
  ON public.therapy_sessions (therapist_id);

CREATE INDEX idx_tips_reported_by
  ON public.tips (reported_by);

CREATE INDEX idx_tips_status
  ON public.tips (status);

CREATE INDEX idx_broadcasts_created_by
  ON public.broadcasts (created_by);

CREATE INDEX idx_attendance_user_id
  ON public.attendance (user_id);

CREATE INDEX idx_attendance_date
  ON public.attendance (date);

CREATE INDEX idx_trusted_circle_user_id
  ON public.trusted_circle (user_id);

CREATE INDEX idx_trusted_circle_trusted_user_id
  ON public.trusted_circle (trusted_user_id);

CREATE INDEX idx_night_walk_sessions_user_id
  ON public.night_walk_sessions (user_id);

CREATE INDEX idx_users_role
  ON public.users (role);

CREATE INDEX idx_users_is_available
  ON public.users (is_available)
  WHERE is_available = TRUE;

CREATE INDEX idx_users_is_in_distress
  ON public.users (is_in_distress)
  WHERE is_in_distress = TRUE;

-- =========================
-- 5. Views
-- =========================

-- Active incidents with student & guard info
CREATE OR REPLACE VIEW public.active_incidents_view AS
SELECT
  i.id               AS incident_id,
  i.description,
  i.sos_level,
  i.status,
  i.location         AS incident_location,
  i.location_accuracy,
  i.location_source,
  i.fallback_building,
  i.fallback_room,
  i.fallback_subject,
  i.ai_classification,
  i.offline_triggered,
  i.auto_escalated,
  i.escalated_at,
  i.responded_at,
  i.created_at,

  -- student (reporter) info
  s.id               AS student_id,
  s.name             AS student_name,
  s.phone            AS student_phone,
  s.department       AS student_department,
  s.current_location AS student_location,
  s.blood_group      AS student_blood_group,
  s.medical_conditions AS student_medical_conditions,

  -- guard (assignee) info
  g.id               AS guard_id,
  g.name             AS guard_name,
  g.phone            AS guard_phone,
  g.current_location AS guard_location

FROM public.incidents i
JOIN public.users s ON s.id = i.reported_by
LEFT JOIN public.users g ON g.id = i.assigned_to
WHERE i.status != 'resolved';

-- Available guards and volunteers
CREATE OR REPLACE VIEW public.available_guards_view AS
SELECT
  u.id,
  u.name,
  u.role,
  u.phone,
  u.current_location,
  u.location_accuracy,
  u.location_updated_at
FROM public.users u
WHERE u.role IN ('guard', 'volunteer')
  AND u.is_available = TRUE;

-- Available therapists
CREATE OR REPLACE VIEW public.available_therapists_view AS
SELECT
  u.id,
  u.name,
  u.phone,
  tp.specialization,
  tp.sessions_today,
  tp.currently_busy
FROM public.users u
JOIN public.therapist_profiles tp ON tp.user_id = u.id
WHERE u.role = 'therapist'
  AND tp.currently_busy = FALSE;
