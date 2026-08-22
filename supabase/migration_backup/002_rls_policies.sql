-- ============================================================
-- SafeCampus — RLS Policies Migration 002
-- ============================================================
-- Enables Row Level Security on every table and defines
-- granular policies using auth.uid() with role-based checks.
-- ============================================================

-- Helper: reusable function to get the current user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- =========================
-- Enable RLS on all tables
-- =========================
ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_slots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_buildings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_slots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_circle       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.night_walk_sessions  ENABLE ROW LEVEL SECURITY;

-- =========================
-- USERS
-- =========================

-- Students can read their own profile
CREATE POLICY users_select_own ON public.users
  FOR SELECT
  USING (id = auth.uid());

-- Guards can read all users (needed for incident context)
CREATE POLICY users_select_guard ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('guard', 'volunteer')
    )
  );

-- Admin can read all users
CREATE POLICY users_select_admin ON public.users
  FOR SELECT
  USING (current_user_role() = 'admin');

-- Therapists can read student profiles for session context
CREATE POLICY users_select_therapist ON public.users
  FOR SELECT
  USING (current_user_role() = 'therapist');

-- Faculty can read users (for attendance)
CREATE POLICY users_select_faculty ON public.users
  FOR SELECT
  USING (current_user_role() = 'faculty');

-- Users can update their own profile
CREATE POLICY users_update_own ON public.users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Users can insert their own profile (sign-up)
CREATE POLICY users_insert_own ON public.users
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- =========================
-- EMERGENCY_CONTACTS
-- =========================

-- Users can read their own contacts
CREATE POLICY ec_select_own ON public.emergency_contacts
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own contacts
CREATE POLICY ec_insert_own ON public.emergency_contacts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own contacts
CREATE POLICY ec_update_own ON public.emergency_contacts
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own contacts
CREATE POLICY ec_delete_own ON public.emergency_contacts
  FOR DELETE
  USING (user_id = auth.uid());

-- Admin can read all contacts
CREATE POLICY ec_select_admin ON public.emergency_contacts
  FOR SELECT
  USING (current_user_role() = 'admin');

-- =========================
-- TIMETABLE_SLOTS
-- =========================

-- Users can read their own timetable
CREATE POLICY timetable_select_own ON public.timetable_slots
  FOR SELECT
  USING (user_id = auth.uid());

-- Admin can read all timetables
CREATE POLICY timetable_select_admin ON public.timetable_slots
  FOR SELECT
  USING (current_user_role() = 'admin');

-- Users can manage their own timetable
CREATE POLICY timetable_insert_own ON public.timetable_slots
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY timetable_update_own ON public.timetable_slots
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY timetable_delete_own ON public.timetable_slots
  FOR DELETE
  USING (user_id = auth.uid());

-- =========================
-- CAMPUS_BUILDINGS
-- =========================

-- Anyone authenticated can read buildings
CREATE POLICY buildings_select_all ON public.campus_buildings
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admin can manage buildings
CREATE POLICY buildings_insert_admin ON public.campus_buildings
  FOR INSERT
  WITH CHECK (current_user_role() = 'admin');

CREATE POLICY buildings_update_admin ON public.campus_buildings
  FOR UPDATE
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

CREATE POLICY buildings_delete_admin ON public.campus_buildings
  FOR DELETE
  USING (current_user_role() = 'admin');

-- =========================
-- INCIDENTS
-- =========================

-- Students can read their own incidents
CREATE POLICY incidents_select_own ON public.incidents
  FOR SELECT
  USING (reported_by = auth.uid());

-- Guards/volunteers can see active (unresolved) incidents
CREATE POLICY incidents_select_guard ON public.incidents
  FOR SELECT
  USING (
    status != 'resolved'
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('guard', 'volunteer')
    )
  );

-- Admin can read all incidents
CREATE POLICY incidents_select_admin ON public.incidents
  FOR SELECT
  USING (current_user_role() = 'admin');

-- Any authenticated user can report an incident
CREATE POLICY incidents_insert_any ON public.incidents
  FOR INSERT
  WITH CHECK (reported_by = auth.uid());

-- Guards can update incidents they are assigned to
CREATE POLICY incidents_update_guard ON public.incidents
  FOR UPDATE
  USING (
    assigned_to = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('guard', 'volunteer')
    )
  )
  WITH CHECK (
    assigned_to = auth.uid()
  );

-- Admin can update any incident
CREATE POLICY incidents_update_admin ON public.incidents
  FOR UPDATE
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

-- =========================
-- THERAPIST_PROFILES
-- =========================

-- Therapists can read & update their own profile
CREATE POLICY tp_select_own ON public.therapist_profiles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY tp_update_own ON public.therapist_profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Students can read therapist availability (for booking)
CREATE POLICY tp_select_student ON public.therapist_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'student'
    )
  );

-- Admin can read all therapist profiles
CREATE POLICY tp_select_admin ON public.therapist_profiles
  FOR SELECT
  USING (current_user_role() = 'admin');

-- Admin can insert/update therapist profiles
CREATE POLICY tp_insert_admin ON public.therapist_profiles
  FOR INSERT
  WITH CHECK (current_user_role() = 'admin' OR user_id = auth.uid());

-- =========================
-- THERAPIST_SLOTS
-- =========================

-- Therapists can manage their own slots
CREATE POLICY ts_select_own ON public.therapist_slots
  FOR SELECT
  USING (therapist_id = auth.uid());

CREATE POLICY ts_insert_own ON public.therapist_slots
  FOR INSERT
  WITH CHECK (therapist_id = auth.uid());

CREATE POLICY ts_update_own ON public.therapist_slots
  FOR UPDATE
  USING (therapist_id = auth.uid())
  WITH CHECK (therapist_id = auth.uid());

CREATE POLICY ts_delete_own ON public.therapist_slots
  FOR DELETE
  USING (therapist_id = auth.uid());

-- Students can read therapist slots (for booking visibility)
CREATE POLICY ts_select_student ON public.therapist_slots
  FOR SELECT
  USING (current_user_role() = 'student');

-- Admin can read all
CREATE POLICY ts_select_admin ON public.therapist_slots
  FOR SELECT
  USING (current_user_role() = 'admin');

-- =========================
-- THERAPY_SESSIONS
-- =========================

-- Students can see their own sessions
CREATE POLICY sessions_select_student ON public.therapy_sessions
  FOR SELECT
  USING (student_id = auth.uid());

-- Therapists can see sessions assigned to them
CREATE POLICY sessions_select_therapist ON public.therapy_sessions
  FOR SELECT
  USING (therapist_id = auth.uid());

-- Admin can see all sessions
CREATE POLICY sessions_select_admin ON public.therapy_sessions
  FOR SELECT
  USING (current_user_role() = 'admin');

-- Students can create sessions (request therapy)
CREATE POLICY sessions_insert_student ON public.therapy_sessions
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- Therapists can update sessions assigned to them (start/end)
CREATE POLICY sessions_update_therapist ON public.therapy_sessions
  FOR UPDATE
  USING (therapist_id = auth.uid())
  WITH CHECK (therapist_id = auth.uid());

-- Admin can update any session
CREATE POLICY sessions_update_admin ON public.therapy_sessions
  FOR UPDATE
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

-- =========================
-- TIPS
-- =========================

-- Anyone authenticated can submit a tip (including anonymous)
CREATE POLICY tips_insert_any ON public.tips
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only admin can read tips
CREATE POLICY tips_select_admin ON public.tips
  FOR SELECT
  USING (current_user_role() = 'admin');

-- Only admin can update tips (review)
CREATE POLICY tips_update_admin ON public.tips
  FOR UPDATE
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

-- =========================
-- BROADCASTS
-- =========================

-- Any authenticated user can read broadcasts
CREATE POLICY broadcasts_select_all ON public.broadcasts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admin can create broadcasts
CREATE POLICY broadcasts_insert_admin ON public.broadcasts
  FOR INSERT
  WITH CHECK (current_user_role() = 'admin');

-- Only admin can update/delete broadcasts
CREATE POLICY broadcasts_update_admin ON public.broadcasts
  FOR UPDATE
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

CREATE POLICY broadcasts_delete_admin ON public.broadcasts
  FOR DELETE
  USING (current_user_role() = 'admin');

-- =========================
-- ATTENDANCE
-- =========================

-- Students can see their own attendance
CREATE POLICY attendance_select_own ON public.attendance
  FOR SELECT
  USING (user_id = auth.uid());

-- Faculty can see all attendance
CREATE POLICY attendance_select_faculty ON public.attendance
  FOR SELECT
  USING (current_user_role() = 'faculty');

-- Admin can see all attendance
CREATE POLICY attendance_select_admin ON public.attendance
  FOR SELECT
  USING (current_user_role() = 'admin');

-- Faculty/admin can insert attendance records
CREATE POLICY attendance_insert_staff ON public.attendance
  FOR INSERT
  WITH CHECK (
    current_user_role() IN ('faculty', 'admin')
    OR user_id = auth.uid()
  );

-- Faculty/admin can update attendance
CREATE POLICY attendance_update_staff ON public.attendance
  FOR UPDATE
  USING (current_user_role() IN ('faculty', 'admin'))
  WITH CHECK (current_user_role() IN ('faculty', 'admin'));

-- =========================
-- TRUSTED_CIRCLE
-- =========================

-- Users can read their own circle
CREATE POLICY tc_select_own ON public.trusted_circle
  FOR SELECT
  USING (user_id = auth.uid() OR trusted_user_id = auth.uid());

-- Users can add to their own circle
CREATE POLICY tc_insert_own ON public.trusted_circle
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can remove from their own circle
CREATE POLICY tc_delete_own ON public.trusted_circle
  FOR DELETE
  USING (user_id = auth.uid());

-- Admin can read all
CREATE POLICY tc_select_admin ON public.trusted_circle
  FOR SELECT
  USING (current_user_role() = 'admin');

-- =========================
-- NIGHT_WALK_SESSIONS
-- =========================

-- Users can read their own night walk sessions
CREATE POLICY nw_select_own ON public.night_walk_sessions
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can start a night walk session
CREATE POLICY nw_insert_own ON public.night_walk_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update (end) their own sessions
CREATE POLICY nw_update_own ON public.night_walk_sessions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Guards can view active night walk sessions
CREATE POLICY nw_select_guard ON public.night_walk_sessions
  FOR SELECT
  USING (
    is_active = TRUE
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('guard', 'volunteer')
    )
  );

-- Admin can read all
CREATE POLICY nw_select_admin ON public.night_walk_sessions
  FOR SELECT
  USING (current_user_role() = 'admin');
