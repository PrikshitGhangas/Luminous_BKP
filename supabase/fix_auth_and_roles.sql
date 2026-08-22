-- ==============================================================================
-- Luminous / CampusShield AI: Instant Fix for Signup & Database Setup Issue
-- ==============================================================================
-- Run this entire script in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- This script fixes:
-- 1. Missing roles in public.roles (which causes FK violation on signup)
-- 2. Creates authorized_super_admins table if missing
-- 3. Robust public.handle_new_user() trigger with fail-safe error handling and search_path
-- 4. Re-attaches the trigger to auth.users
-- ==============================================================================

-- 1. Ensure extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Ensure roles table exists
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    hierarchy_level INT NOT NULL DEFAULT 100,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 3. Seed all standard system roles immediately
INSERT INTO public.roles (name, display_name, description, hierarchy_level, permissions)
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

-- 4. Ensure authorized_super_admins allowlist table exists
CREATE TABLE IF NOT EXISTS public.authorized_super_admins (
    email VARCHAR(255) PRIMARY KEY,
    role VARCHAR(50) NOT NULL DEFAULT 'super_admin',
    authorized_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5. Ensure profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student' REFERENCES public.roles(name) ON UPDATE CASCADE ON DELETE RESTRICT,
    department_id UUID,
    phone VARCHAR(30),
    avatar_url TEXT,
    emergency_contact JSONB DEFAULT '{"name": "", "relationship": "", "phone": ""}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 6. Enable RLS on core tables if not enabled
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_super_admins ENABLE ROW LEVEL SECURITY;

-- 7. Ensure baseline RLS policies exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'roles' AND policyname = 'Public roles access') THEN
        CREATE POLICY "Public roles access" ON public.roles FOR SELECT TO authenticated, anon USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles select policy') THEN
        CREATE POLICY "Profiles select policy" ON public.profiles FOR SELECT TO authenticated, anon USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles insert policy') THEN
        CREATE POLICY "Profiles insert policy" ON public.profiles FOR INSERT TO authenticated, anon WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles update policy') THEN
        CREATE POLICY "Profiles update policy" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- 8. Hardened, Fail-Safe Trigger Function for User Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _role VARCHAR(50) := 'student';
    _requested_role VARCHAR(50);
    _allowlisted VARCHAR(50);
    _dept_name TEXT;
    _dept_id UUID := NULL;
    _full_name TEXT;
BEGIN
    -- Ensure fallback 'student' role exists in roles table so foreign key never fails
    INSERT INTO public.roles (name, display_name, description, hierarchy_level, permissions)
    VALUES ('student', 'Enrolled Student', 'Campus member, incident reporter, SOS user & learner', 100, '["student"]'::jsonb)
    ON CONFLICT (name) DO NOTHING;

    -- Check if user is in authorized_super_admins allowlist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'authorized_super_admins') THEN
        SELECT role INTO _allowlisted
        FROM public.authorized_super_admins
        WHERE email = NEW.email;
    END IF;

    IF _allowlisted IS NOT NULL THEN
        _role := _allowlisted;
    ELSE
        _requested_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');

        IF _requested_role IN ('super_admin', 'admin', 'security', 'warden') THEN
            _role := 'student';
        ELSE
            SELECT name INTO _role FROM public.roles WHERE name = _requested_role;
            IF _role IS NULL THEN
                _role := 'student';
            END IF;
        END IF;
    END IF;

    _full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    _dept_name := NEW.raw_user_meta_data->>'department';

    IF _dept_name IS NOT NULL AND _dept_name <> '' AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'departments') THEN
        BEGIN
            SELECT id INTO _dept_id FROM public.departments WHERE code = _dept_name OR name ILIKE _dept_name LIMIT 1;
        EXCEPTION WHEN OTHERS THEN
            _dept_id := NULL;
        END;
    END IF;

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        department_id,
        avatar_url,
        is_active,
        metadata,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        _full_name,
        _role,
        _dept_id,
        NEW.raw_user_meta_data->>'avatar_url',
        true,
        COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
        clock_timestamp(),
        clock_timestamp()
    )
    ON CONFLICT (id) DO UPDATE
        SET email = EXCLUDED.email,
            full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
            updated_at = clock_timestamp();

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- 9. Attach the trigger to auth.users
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;
