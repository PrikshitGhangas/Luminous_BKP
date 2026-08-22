-- ==============================================================================
-- CampusShield AI — Migration 001: Core Schema & Authentication Foundations
-- ==============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Enums & Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'super_admin',
        'admin',
        'security',
        'faculty',
        'student',
        'parent',
        'warden',
        'transport_admin',
        'receptionist',
        'counselor',
        'medical_staff'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_category AS ENUM (
        'fire',
        'medical',
        'theft',
        'assault',
        'harassment',
        'vandalism',
        'suspicious_activity',
        'natural_disaster',
        'infrastructure',
        'traffic',
        'substance_abuse',
        'cybercrime',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_severity AS ENUM (
        'critical',
        'high',
        'medium',
        'low'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_status AS ENUM (
        'reported',
        'acknowledged',
        'investigating',
        'responding',
        'resolved',
        'closed',
        'false_alarm'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sos_status AS ENUM (
        'active',
        'responding',
        'resolved',
        'false_alarm'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_type AS ENUM (
        'lockdown',
        'evacuation',
        'weather',
        'medical',
        'security',
        'general'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE visitor_status AS ENUM (
        'pre_registered',
        'checked_in',
        'checked_out',
        'denied',
        'expired'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM (
        'present',
        'absent',
        'late',
        'excused'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE complaint_status AS ENUM (
        'open',
        'in_progress',
        'resolved',
        'closed',
        'rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE placement_status AS ENUM (
        'upcoming',
        'ongoing',
        'completed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM (
        'applied',
        'shortlisted',
        'interviewed',
        'offered',
        'rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE wellbeing_mood AS ENUM (
        'great',
        'good',
        'neutral',
        'stressed',
        'overwhelmed',
        'crisis'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Roles Table (System-managed permissions dictionary)
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    hierarchy_level INT NOT NULL DEFAULT 100, -- Lower number = higher authority
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Seed core roles immediately so foreign key on profiles is satisfied
INSERT INTO roles (name, display_name, description, hierarchy_level, permissions)
VALUES
    ('super_admin',       'Super Administrator',       'Full institutional & security control', 1,   '["admin"]'::jsonb),
    ('admin',             'Institution Administrator', 'Campus operations and resource management', 10, '["admin"]'::jsonb),
    ('security',          'Campus Security Officer',   'Live safety command, incident response & patrol', 20, '["security"]'::jsonb),
    ('warden',            'Hostel Warden',             'Hostel discipline, resident safety and room allocation', 30, '["warden"]'::jsonb),
    ('counselor',         'Counselor',                 'Student wellbeing and mental-health support', 35, '["counselor"]'::jsonb),
    ('medical_staff',     'Medical Staff',             'On-campus medical and emergency care', 35, '["medical"]'::jsonb),
    ('faculty',           'Faculty Member / Professor','Academic teaching, attendance and grade evaluations', 40, '["faculty"]'::jsonb),
    ('placement_officer', 'Placement Officer',         'Career drives, internship and recruitment operations', 50, '["placement"]'::jsonb),
    ('receptionist',      'Receptionist',              'Front desk, visitor registration and campus access', 60, '["reception"]'::jsonb),
    ('parent',            'Parent / Guardian',         'Student safety, attendance and grade observation', 110, '["parent"]'::jsonb),
    ('student',           'Enrolled Student',          'Campus member, incident reporter, SOS user & learner', 100, '["student"]'::jsonb),
    ('other',             'Other Member',              'General campus user', 120, '["student"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- 4. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'academic' CHECK (type IN ('academic', 'administrative', 'safety', 'facility', 'support')),
    building VARCHAR(100),
    head_profile_id UUID, -- Foreign key to profiles (resolved via deferred constraint / alter)
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5. Campus Locations (SVG coordinate system & Geolocation mapping)
CREATE TABLE IF NOT EXISTS campus_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    zone VARCHAR(50) NOT NULL, -- e.g. 'North Zone', 'Central Campus', 'Hostel Complex'
    type VARCHAR(50) NOT NULL CHECK (type IN ('building', 'entry', 'facility', 'hostel', 'lab', 'open_area', 'sports', 'parking', 'cafeteria', 'gate')),
    svg_x NUMERIC(8,2) NOT NULL,
    svg_y NUMERIC(8,2) NOT NULL,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    risk_level VARCHAR(20) NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    is_emergency_hotspot BOOLEAN NOT NULL DEFAULT false,
    evacuation_zone_code VARCHAR(50),
    capacity INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 6. Profiles Table (Extends Supabase Auth users table)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY, -- Maps directly to auth.users.id
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student' REFERENCES roles(name) ON UPDATE CASCADE ON DELETE RESTRICT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    emergency_contact JSONB DEFAULT '{"name": "", "relationship": "", "phone": ""}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 7. Add Circular FK from departments.head_profile_id to profiles(id)
ALTER TABLE departments
    DROP CONSTRAINT IF EXISTS fk_departments_head;

ALTER TABLE departments
    ADD CONSTRAINT fk_departments_head
    FOREIGN KEY (head_profile_id) REFERENCES profiles(id)
    ON DELETE SET NULL;
