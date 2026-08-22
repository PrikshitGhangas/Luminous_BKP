-- ============================================================
-- Migration 004: Helper SQL Functions
-- PostGIS-based functions used by Edge Functions
-- ============================================================

-- ============================================================
-- 1. Find nearest available responder (guard/volunteer)
-- Used by: trigger-sos (smart dispatch)
-- ============================================================
CREATE OR REPLACE FUNCTION find_nearest_responder(
  incident_lng DOUBLE PRECISION,
  incident_lat DOUBLE PRECISION,
  responder_limit INTEGER DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  phone TEXT,
  distance_meters DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now TIME := LOCALTIME;
  v_day TEXT := LOWER(TO_CHAR(NOW(), 'Day'));
BEGIN
  -- Trim whitespace from day name (TO_CHAR pads with spaces)
  v_day := TRIM(v_day);

  RETURN QUERY
  SELECT
    u.id,
    u.name,
    u.phone,
    ST_Distance(
      u.current_location,
      ST_SetSRID(ST_MakePoint(incident_lng, incident_lat), 4326)::geography
    ) AS distance_meters
  FROM users u
  WHERE u.role IN ('guard', 'volunteer')
    AND u.is_available = true
    AND u.is_in_distress = false
    AND u.current_location IS NOT NULL
    -- Exclude responders currently in a timetable slot
    AND u.id NOT IN (
      SELECT ts.user_id
      FROM timetable_slots ts
      WHERE LOWER(TRIM(ts.day)) = v_day
        AND ts.start_time <= v_now
        AND ts.end_time > v_now
    )
  ORDER BY distance_meters ASC
  LIMIT responder_limit;
END;
$$;

-- ============================================================
-- 2. Check if a campus building is within radius of a GPS point
-- Used by: trigger-sos, resolve-location (cross-validation)
-- ============================================================
CREATE OR REPLACE FUNCTION check_location_within_radius(
  p_building_name TEXT,
  p_point_lng DOUBLE PRECISION,
  p_point_lat DOUBLE PRECISION,
  p_radius_meters DOUBLE PRECISION
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result BOOLEAN;
BEGIN
  SELECT ST_DWithin(
    cb.location,
    ST_SetSRID(ST_MakePoint(p_point_lng, p_point_lat), 4326)::geography,
    p_radius_meters
  )
  INTO v_result
  FROM campus_buildings cb
  WHERE cb.name = p_building_name
  LIMIT 1;

  RETURN COALESCE(v_result, false);
END;
$$;

-- ============================================================
-- 3. Check if a point is inside any campus building boundary
-- Used by: check-geofence (attendance)
-- ============================================================
CREATE OR REPLACE FUNCTION check_point_in_buildings(
  p_lng DOUBLE PRECISION,
  p_lat DOUBLE PRECISION
)
RETURNS TABLE (
  building_id UUID,
  building_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cb.id AS building_id,
    cb.name AS building_name
  FROM campus_buildings cb
  WHERE cb.boundary IS NOT NULL
    AND ST_Within(
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geometry,
      cb.boundary::geometry
    );
END;
$$;

-- ============================================================
-- 4. Find buildings near a point (fallback if not inside boundary)
-- Used by: check-geofence
-- ============================================================
CREATE OR REPLACE FUNCTION find_nearby_buildings(
  p_lng DOUBLE PRECISION,
  p_lat DOUBLE PRECISION,
  p_radius_meters DOUBLE PRECISION DEFAULT 50.0
)
RETURNS TABLE (
  building_id UUID,
  building_name TEXT,
  distance_meters DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cb.id AS building_id,
    cb.name AS building_name,
    ST_Distance(
      cb.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) AS distance_meters
  FROM campus_buildings cb
  WHERE ST_DWithin(
    cb.location,
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
    p_radius_meters
  )
  ORDER BY distance_meters ASC;
END;
$$;
