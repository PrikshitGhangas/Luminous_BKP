-- ==============================================================================
-- CampusShield AI — Migration 007: Role Hardening & Manual Super-Admin Authorization
--
-- ADDITIVE + SAFE. No existing tables are dropped or data removed.
--
-- Goals:
--   1. Prevent any normal user from self-assigning privileged roles (super_admin,
--      admin) through the auth signup flow (raw_user_meta_data.role).
--   2. Provide a manual authorization flow: only emails listed in
--      `authorized_super_admins` are granted 'super_admin'; everyone else gets the
--      normal role they chose (default 'student').
--   3. Defense-in-depth: a BEFORE UPDATE trigger blocks role escalation on
--      `profiles.role` unless performed by an institution admin or the system.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Manual authorization table (empty by default; you insert allowed emails).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.authorized_super_admins (
    email VARCHAR(255) PRIMARY KEY,
    role VARCHAR(50) NOT NULL DEFAULT 'super_admin',
    authorized_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.authorized_super_admins ENABLE ROW LEVEL SECURITY;

-- Only the super_admin role (and the service role) can manage the allowlist.
CREATE POLICY "Super admins can manage authorized_super_admins"
    ON public.authorized_super_admins
    FOR ALL TO authenticated
    USING (public.is_institution_admin())
    WITH CHECK (public.is_institution_admin());

-- ------------------------------------------------------------------------------
-- 2. Hardened `handle_new_user` trigger function.
--    Replaces the previous version to:
--      - derive the role ONLY from the DB allowlist OR the normalized signup role,
--      - NEVER accept super_admin/admin from user-supplied metadata,
--      - default to 'student'.
-- ------------------------------------------------------------------------------
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
BEGIN
    -- Ensure fallback 'student' role exists in public.roles to guarantee foreign key integrity
    INSERT INTO public.roles (name, display_name, description, hierarchy_level, permissions)
    VALUES ('student', 'Enrolled Student', 'Campus member, incident reporter, SOS user & learner', 100, '["student"]'::jsonb)
    ON CONFLICT (name) DO NOTHING;

    -- 1. Check the manual authorization allowlist first if table exists.
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'authorized_super_admins') THEN
        SELECT role INTO _allowlisted
        FROM public.authorized_super_admins
        WHERE email = NEW.email;
    END IF;

    IF _allowlisted IS NOT NULL THEN
        _role := _allowlisted;
    ELSE
        -- 2. Otherwise use the signup metadata role, but ONLY if it is a
        --    non-privileged role present in the `roles` table.
        _requested_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');

        IF _requested_role IN ('super_admin', 'admin', 'security', 'warden') THEN
            -- Never honor privileged role requests from self-signup.
            _role := 'student';
        ELSE
            -- Only accept known non-privileged roles.
            SELECT name INTO _role FROM public.roles WHERE name = _requested_role;
            IF _role IS NULL THEN
                _role := 'student';
            END IF;
        END IF;
    END IF;

    _dept_name := NEW.raw_user_meta_data->>'department';
    IF _dept_name IS NOT NULL AND _dept_name <> '' THEN
        SELECT id INTO _dept_id FROM public.departments WHERE code = _dept_name OR name ILIKE _dept_name LIMIT 1;
    END IF;

    INSERT INTO public.profiles (
        id, email, full_name, role, department_id, is_active, created_at, updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        _role,
        _dept_id,
        true,
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

-- Re-attach the trigger (idempotent), only if the auth schema exists.
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. Defense in depth: block role escalation on `profiles.role` from the client.
--    A user may update their own non-privileged profile fields, but NO user may
--    change their own `role` (or anyone's role) unless they are an institution
--    admin. RLS already limits direct updates; this adds a hard check.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (OLD.role IS DISTINCT FROM NEW.role) THEN
        IF public.is_institution_admin() = false THEN
            RAISE EXCEPTION 'role cannot be changed by non-admin users';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_role_escalation ON public.profiles;

CREATE TRIGGER prevent_role_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_role_escalation();

-- ------------------------------------------------------------------------------
-- 4. Grant a super_admin (run ONCE, as service role / authenticated super admin):
--
--    INSERT INTO public.authorized_super_admins (email, role) VALUES ('admin@example.com', 'super_admin');
--    -- Then, for an already-existing account:
--    UPDATE public.profiles SET role = 'super_admin'
--      WHERE email = 'admin@example.com'
--        AND public.is_institution_admin(); -- or run as service role directly
-- ==============================================================================