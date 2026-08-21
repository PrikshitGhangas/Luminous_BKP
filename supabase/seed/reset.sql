-- ============================================================================
-- SafeCampus — Reset (Truncate All Tables)
-- Run this before re-seeding to clear all data.
-- Order respects FK constraints (children first, parents last).
-- ============================================================================

-- Disable triggers temporarily to avoid FK check overhead during truncate
SET session_replication_role = 'replica';

-- ---- Child / junction tables first ----
TRUNCATE TABLE trusted_circle          CASCADE;
TRUNCATE TABLE night_walk_sessions     CASCADE;
TRUNCATE TABLE outing_requests         CASCADE;
TRUNCATE TABLE timetable_slots         CASCADE;
TRUNCATE TABLE emergency_contacts      CASCADE;
TRUNCATE TABLE therapist_slots         CASCADE;
TRUNCATE TABLE therapy_sessions        CASCADE;
TRUNCATE TABLE therapist_profiles      CASCADE;

-- ---- Domain tables ----
TRUNCATE TABLE tips                    CASCADE;
TRUNCATE TABLE incidents               CASCADE;
TRUNCATE TABLE broadcasts              CASCADE;
TRUNCATE TABLE attendance              CASCADE;
TRUNCATE TABLE campus_buildings        CASCADE;

-- ---- Core user table last ----
TRUNCATE TABLE users                   CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

DO $$ BEGIN
  RAISE NOTICE '🗑️  All SafeCampus tables truncated. Ready for re-seeding.';
END $$;
