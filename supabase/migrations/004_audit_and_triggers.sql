-- ==============================================================================
-- CampusShield AI — Migration 004: Audit Trail, Functions & Triggers
-- ==============================================================================

-- 1. Audit Logs Table (Append-only immutable record of system events)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- e.g. 'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'ELEVATED_ACTION'
    entity_type VARCHAR(50) NOT NULL, -- e.g. 'incidents', 'sos_alerts', 'emergency_alerts', 'students'
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. Generic updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = clock_timestamp();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at triggers
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'departments',
        'profiles',
        'courses',
        'students',
        'faculty',
        'parents',
        'placements',
        'placement_applications',
        'incidents',
        'incident_assignments',
        'emergency_alerts',
        'visitors',
        'visitor_passes',
        'complaints',
        'announcements'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON %I;', t);
        EXECUTE format('CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();', t);
    END LOOP;
END $$;

-- 3. Automatic Incident Number Generator (INC-YYYYMMDD-XXXX)
CREATE OR REPLACE FUNCTION generate_incident_number()
RETURNS TRIGGER AS $$
DECLARE
    date_part TEXT;
    seq_num INT;
BEGIN
    IF NEW.incident_number IS NULL OR NEW.incident_number = '' THEN
        date_part := to_char(clock_timestamp(), 'YYYYMMDD');
        SELECT COUNT(*) + 1 INTO seq_num
        FROM incidents
        WHERE incident_number LIKE 'INC-' || date_part || '-%';

        NEW.incident_number := 'INC-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_incident_number ON incidents;
CREATE TRIGGER trg_generate_incident_number
BEFORE INSERT ON incidents
FOR EACH ROW
EXECUTE FUNCTION generate_incident_number();

-- 4. Automatic Visitor Pass Number Generator (PASS-YYYYMMDD-XXXX)
CREATE OR REPLACE FUNCTION generate_visitor_pass_number()
RETURNS TRIGGER AS $$
DECLARE
    date_part TEXT;
    seq_num INT;
BEGIN
    IF NEW.pass_number IS NULL OR NEW.pass_number = '' THEN
        date_part := to_char(clock_timestamp(), 'YYYYMMDD');
        SELECT COUNT(*) + 1 INTO seq_num
        FROM visitor_passes
        WHERE pass_number LIKE 'PASS-' || date_part || '-%';

        NEW.pass_number := 'PASS-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_visitor_pass_number ON visitor_passes;
CREATE TRIGGER trg_generate_visitor_pass_number
BEFORE INSERT ON visitor_passes
FOR EACH ROW
EXECUTE FUNCTION generate_visitor_pass_number();

-- 5. Automatic Complaint Ticket Number Generator (CMP-YYYYMMDD-XXXX)
CREATE OR REPLACE FUNCTION generate_complaint_ticket_no()
RETURNS TRIGGER AS $$
DECLARE
    date_part TEXT;
    seq_num INT;
BEGIN
    IF NEW.ticket_no IS NULL OR NEW.ticket_no = '' THEN
        date_part := to_char(clock_timestamp(), 'YYYYMMDD');
        SELECT COUNT(*) + 1 INTO seq_num
        FROM complaints
        WHERE ticket_no LIKE 'CMP-' || date_part || '-%';

        NEW.ticket_no := 'CMP-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_complaint_ticket_no ON complaints;
CREATE TRIGGER trg_generate_complaint_ticket_no
BEFORE INSERT ON complaints
FOR EACH ROW
EXECUTE FUNCTION generate_complaint_ticket_no();

-- 6. Automatic Incident Timeline Logging
CREATE OR REPLACE FUNCTION log_incident_timeline_event()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO incident_timeline (
            incident_id,
            actor_id,
            action,
            previous_state,
            new_state,
            comment,
            is_internal_only
        ) VALUES (
            NEW.id,
            NEW.reporter_id,
            'reported',
            '{}'::jsonb,
            jsonb_build_object(
                'status', NEW.status,
                'severity', NEW.severity,
                'category', NEW.category,
                'priority_score', NEW.priority_score
            ),
            'Incident reported into CampusShield system',
            false
        );
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Check if status changed
        IF (OLD.status IS DISTINCT FROM NEW.status) THEN
            INSERT INTO incident_timeline (
                incident_id,
                actor_id,
                action,
                previous_state,
                new_state,
                comment,
                is_internal_only
            ) VALUES (
                NEW.id,
                NEW.assigned_to,
                'status_changed',
                jsonb_build_object('status', OLD.status),
                jsonb_build_object('status', NEW.status),
                'Status changed from ' || OLD.status || ' to ' || NEW.status,
                false
            );
        END IF;

        -- Check if assignment changed
        IF (OLD.assigned_to IS DISTINCT FROM NEW.assigned_to AND NEW.assigned_to IS NOT NULL) THEN
            INSERT INTO incident_timeline (
                incident_id,
                actor_id,
                action,
                previous_state,
                new_state,
                comment,
                is_internal_only
            ) VALUES (
                NEW.id,
                NEW.assigned_to,
                'assigned',
                jsonb_build_object('assigned_to', OLD.assigned_to),
                jsonb_build_object('assigned_to', NEW.assigned_to),
                'Incident assigned to security personnel',
                false
            );
        END IF;

        -- Check if resolution occurred
        IF (OLD.resolved_at IS NULL AND NEW.resolved_at IS NOT NULL) THEN
            INSERT INTO incident_timeline (
                incident_id,
                actor_id,
                action,
                previous_state,
                new_state,
                comment,
                is_internal_only
            ) VALUES (
                NEW.id,
                NEW.assigned_to,
                'resolved',
                jsonb_build_object('status', OLD.status),
                jsonb_build_object('status', NEW.status, 'resolution_notes', NEW.resolution_notes),
                COALESCE(NEW.resolution_notes, 'Incident marked as resolved'),
                false
            );
        END IF;

        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_incident_timeline_logging ON incidents;
CREATE TRIGGER trg_incident_timeline_logging
AFTER INSERT OR UPDATE ON incidents
FOR EACH ROW
EXECUTE FUNCTION log_incident_timeline_event();

-- 7. Supabase Auth Signup Trigger: Auto-create Profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    default_role VARCHAR(50);
    user_full_name TEXT;
    dept_name TEXT;
    dept_id UUID := NULL;
BEGIN
    -- Ensure fallback 'student' role exists in public.roles so foreign key never fails
    INSERT INTO public.roles (name, display_name, description, hierarchy_level, permissions)
    VALUES ('student', 'Enrolled Student', 'Campus member, incident reporter, SOS user & learner', 100, '["student"]'::jsonb)
    ON CONFLICT (name) DO NOTHING;

    default_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    dept_name := NEW.raw_user_meta_data->>'department';

    -- Verify role exists in roles table, fallback to 'student'
    IF NOT EXISTS (SELECT 1 FROM public.roles WHERE name = default_role) THEN
        default_role := 'student';
    END IF;

    IF dept_name IS NOT NULL AND dept_name <> '' THEN
        SELECT id INTO dept_id FROM public.departments WHERE code = dept_name OR name ILIKE dept_name LIMIT 1;
    END IF;

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        department_id,
        avatar_url,
        is_active,
        metadata
    ) VALUES (
        NEW.id,
        NEW.email,
        user_full_name,
        default_role,
        dept_id,
        NEW.raw_user_meta_data->>'avatar_url',
        true,
        COALESCE(NEW.raw_user_meta_data, '{}'::jsonb)
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = clock_timestamp();

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- Attach trigger to auth.users if auth schema exists
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;
