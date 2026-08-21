-- ==============================================================================
-- CampusShield AI — Migration 003: Safety Core & Operations Schema
-- ==============================================================================

-- 1. Incidents Table (Hero Safety System Table)
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_number VARCHAR(30) UNIQUE NOT NULL,
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category incident_category NOT NULL,
    severity incident_severity NOT NULL,
    ai_severity incident_severity,
    ai_classification JSONB DEFAULT '{}'::jsonb,
    ai_confidence NUMERIC(4,3) CHECK (ai_confidence BETWEEN 0.000 AND 1.000),
    ai_raw_response JSONB,
    location_id UUID REFERENCES campus_locations(id) ON DELETE SET NULL,
    location_name VARCHAR(150),
    location_lat NUMERIC(10,7),
    location_lng NUMERIC(10,7),
    status incident_status NOT NULL DEFAULT 'reported',
    priority_score INT NOT NULL DEFAULT 1 CHECK (priority_score BETWEEN 1 AND 10),
    assigned_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    is_sensitive BOOLEAN NOT NULL DEFAULT false,
    requires_immediate_response BOOLEAN NOT NULL DEFAULT false,
    evidence_urls TEXT[] DEFAULT '{}',
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. Incident Evidence Table
CREATE TABLE IF NOT EXISTS incident_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT CHECK (file_size_bytes > 0),
    caption TEXT,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 3. Incident Assignments Table
CREATE TABLE IF NOT EXISTS incident_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    role_in_incident VARCHAR(50) NOT NULL DEFAULT 'investigator' CHECK (role_in_incident IN ('lead_officer', 'investigator', 'first_responder', 'counselor', 'medical_responder', 'warden')),
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'reassigned')),
    notes TEXT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 4. Incident Timeline Table
CREATE TABLE IF NOT EXISTS incident_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    previous_state JSONB DEFAULT '{}'::jsonb,
    new_state JSONB DEFAULT '{}'::jsonb,
    comment TEXT,
    is_internal_only BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5. SOS Alerts Table (Women's Safety & Emergency Distress)
CREATE TABLE IF NOT EXISTS sos_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    location_id UUID REFERENCES campus_locations(id) ON DELETE SET NULL,
    location_name VARCHAR(150),
    location_lat NUMERIC(10,7),
    location_lng NUMERIC(10,7),
    status sos_status NOT NULL DEFAULT 'active',
    responded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    response_time_seconds INT CHECK (response_time_seconds >= 0),
    dispatch_notes TEXT,
    battery_level INT CHECK (battery_level BETWEEN 0 AND 100),
    is_silent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    resolved_at TIMESTAMPTZ
);

-- 6. Emergency Alerts Table (Campus-wide Broadcasts)
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type alert_type NOT NULL,
    severity incident_severity NOT NULL,
    target_roles VARCHAR(50)[] NOT NULL DEFAULT '{"student","faculty","parent","security","warden","admin","super_admin"}',
    target_locations UUID[] DEFAULT '{}',
    action_required TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 7. Visitors Table
CREATE TABLE IF NOT EXISTS visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    id_proof_type VARCHAR(50) NOT NULL CHECK (id_proof_type IN ('Aadhaar', 'Passport', 'Driving License', 'Voter ID', 'Govt ID', 'College ID')),
    id_proof_number_masked VARCHAR(50) NOT NULL,
    id_proof_url TEXT,
    photo_url TEXT,
    organization VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 8. Visitor Passes Table
CREATE TABLE IF NOT EXISTS visitor_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pass_number VARCHAR(30) UNIQUE NOT NULL,
    visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    purpose VARCHAR(255) NOT NULL,
    destination_location_id UUID REFERENCES campus_locations(id) ON DELETE SET NULL,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    valid_until TIMESTAMPTZ NOT NULL,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    status visitor_status NOT NULL DEFAULT 'pre_registered',
    badge_number VARCHAR(50),
    vehicle_number VARCHAR(50),
    items_carried TEXT,
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    security_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT chk_pass_validity CHECK (valid_from < valid_until)
);

-- 9. Complaints Table (Campus Grievance Redressal)
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_no VARCHAR(30) UNIQUE NOT NULL,
    filed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('hostel', 'mess', 'infrastructure', 'academics', 'transport', 'harassment', 'hygiene', 'security', 'other')),
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location_id UUID REFERENCES campus_locations(id) ON DELETE SET NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
    status complaint_status NOT NULL DEFAULT 'open',
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 10. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    target_roles VARCHAR(50)[] NOT NULL DEFAULT '{"student","faculty","parent","security","warden","admin","super_admin"}',
    target_courses UUID[] DEFAULT '{}',
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    attachments TEXT[] DEFAULT '{}',
    published_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('incident_alert', 'sos_alert', 'emergency', 'academic', 'hostel', 'visitor', 'grievance', 'placement', 'system')),
    reference_id UUID,
    reference_type VARCHAR(50),
    link VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 12. Wellbeing Checkins Table
CREATE TABLE IF NOT EXISTS wellbeing_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    mood wellbeing_mood NOT NULL,
    stress_level INT NOT NULL CHECK (stress_level BETWEEN 1 AND 10),
    sleep_hours NUMERIC(3,1) CHECK (sleep_hours BETWEEN 0.0 AND 24.0),
    factors VARCHAR(50)[] DEFAULT '{}',
    notes TEXT,
    requires_counselor_followup BOOLEAN NOT NULL DEFAULT false,
    counselor_assigned UUID REFERENCES profiles(id) ON DELETE SET NULL,
    counselor_notes TEXT,
    followed_up_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 13. AI Insights Table (Predictive Safety Analytics & Hotspot Intelligence)
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('safety_trend', 'hotspot_prediction', 'risk_assessment', 'anomaly_detection', 'preventive_recommendation', 'resource_allocation')),
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    data_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    recommended_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    affected_locations UUID[] DEFAULT '{}',
    affected_departments UUID[] DEFAULT '{}',
    severity incident_severity NOT NULL DEFAULT 'medium',
    confidence_score NUMERIC(4,3) NOT NULL CHECK (confidence_score BETWEEN 0.000 AND 1.000),
    is_acknowledged BOOLEAN NOT NULL DEFAULT false,
    acknowledged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
