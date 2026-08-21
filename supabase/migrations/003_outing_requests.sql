-- ============================================================
-- Migration 003: Outing Requests (Leave/Visit Filing)
-- Adds outing_requests table for off-campus leave filing.
-- Used as 3rd-layer location fallback in SOS resolution:
--   GPS → Timetable → Outing Destination → Last Known
-- ============================================================

-- Enum for outing request status
CREATE TYPE outing_status AS ENUM ('pending', 'approved', 'active', 'completed', 'rejected');

-- ============================================================
-- OUTING REQUESTS
-- ============================================================
CREATE TABLE public.outing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  destination_name TEXT NOT NULL,                           -- "Lalbagh Garden", "MG Road Mall"
  destination_location GEOGRAPHY(POINT, 4326) NOT NULL,    -- PostGIS point for the destination
  purpose TEXT,                                             -- "Family visit", "Shopping", etc.
  expected_departure TIMESTAMPTZ NOT NULL,
  expected_return TIMESTAMPTZ NOT NULL,
  status outing_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES public.users(id),                   -- faculty or admin who approved
  approved_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,                                -- when student actually left campus
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure return is after departure
  CHECK (expected_return > expected_departure)
);

-- Indexes
CREATE INDEX idx_outing_student ON outing_requests(student_id);
CREATE INDEX idx_outing_status ON outing_requests(status) WHERE status IN ('approved', 'active');
CREATE INDEX idx_outing_active_time ON outing_requests(student_id, expected_departure, expected_return)
  WHERE status IN ('approved', 'active');
CREATE INDEX idx_outing_destination ON outing_requests USING GIST(destination_location);

-- ============================================================
-- RLS POLICIES FOR OUTING REQUESTS
-- ============================================================
ALTER TABLE outing_requests ENABLE ROW LEVEL SECURITY;

-- Students can read their own outing requests
CREATE POLICY "students_read_own_outings" ON outing_requests
  FOR SELECT USING (auth.uid() = student_id);

-- Students can create outing requests
CREATE POLICY "students_create_outings" ON outing_requests
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Students can update own pending requests (cancel/edit before approval)
CREATE POLICY "students_update_own_pending" ON outing_requests
  FOR UPDATE USING (
    auth.uid() = student_id
    AND status = 'pending'
  );

-- Faculty can read all outing requests (to approve them)
CREATE POLICY "faculty_read_outings" ON outing_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('faculty', 'admin'))
  );

-- Faculty/Admin can approve/reject outing requests
CREATE POLICY "faculty_approve_outings" ON outing_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('faculty', 'admin'))
  );

-- Admin full access
CREATE POLICY "admin_full_outings" ON outing_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Guards can read active outings (to verify students off-campus)
CREATE POLICY "guards_read_active_outings" ON outing_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('guard', 'volunteer'))
    AND status IN ('approved', 'active')
  );

-- ============================================================
-- HELPER FUNCTION: Find active outing for a student
-- Used by trigger-sos Edge Function for location fallback
-- ============================================================
CREATE OR REPLACE FUNCTION find_active_outing(
  p_student_id UUID,
  p_sos_point GEOGRAPHY DEFAULT NULL,
  p_radius_meters FLOAT DEFAULT 500.0
)
RETURNS TABLE (
  outing_id UUID,
  destination_name TEXT,
  destination_lat DOUBLE PRECISION,
  destination_lng DOUBLE PRECISION,
  purpose TEXT,
  is_within_radius BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id AS outing_id,
    o.destination_name,
    ST_Y(o.destination_location::geometry) AS destination_lat,
    ST_X(o.destination_location::geometry) AS destination_lng,
    o.purpose,
    CASE
      WHEN p_sos_point IS NOT NULL THEN
        ST_DWithin(o.destination_location, p_sos_point, p_radius_meters)
      ELSE
        TRUE  -- if no SOS point provided, just return the outing
    END AS is_within_radius
  FROM outing_requests o
  WHERE o.student_id = p_student_id
    AND o.status IN ('approved', 'active')
    AND NOW() BETWEEN o.expected_departure AND o.expected_return
  ORDER BY o.expected_departure DESC
  LIMIT 1;
END;
$$;
