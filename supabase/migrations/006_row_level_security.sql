-- ==============================================================================
-- CampusShield AI — Migration 006: Row Level Security (RLS) & Role-Aware Access
-- ==============================================================================

-- 1. Helper Functions for RLS Policies (Hardened with fixed search_path)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS VARCHAR AS $$
DECLARE
    u_role VARCHAR;
BEGIN
    SELECT role INTO u_role FROM public.profiles WHERE id = auth.uid();
    RETURN COALESCE(u_role, 'anonymous');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin_or_security()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'admin', 'security')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_institution_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'admin')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_parent_of_student(target_student_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.parent_student_links psl
        JOIN public.parents p ON psl.parent_id = p.id
        WHERE p.profile_id = auth.uid()
        AND psl.student_id = target_student_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_parent_of_student_profile(target_profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.parent_student_links psl
        JOIN public.parents p ON psl.parent_id = p.id
        JOIN public.students s ON psl.student_id = s.id
        WHERE p.profile_id = auth.uid()
        AND s.profile_id = target_profile_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 2. Enable RLS on all tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellbeing_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. Core System & Profile Policies
-- ------------------------------------------------------------------------------

-- Roles: Read-only for authenticated users, Admin can modify
CREATE POLICY "Authenticated users can view roles"
    ON roles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage roles"
    ON roles FOR ALL TO authenticated USING (public.is_institution_admin());

-- Departments: Read-only for all, Admin can manage
CREATE POLICY "Authenticated users can view departments"
    ON departments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage departments"
    ON departments FOR ALL TO authenticated USING (public.is_institution_admin());

-- Campus Locations: Read-only for all, Admin/Security can manage
CREATE POLICY "Authenticated users can view campus locations"
    ON campus_locations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/Security can manage campus locations"
    ON campus_locations FOR ALL TO authenticated USING (public.is_admin_or_security());

-- Profiles:
-- Users can view their own profile
-- Admins and Security can view all profiles
-- Faculty can view student profiles
-- Parents can view linked student profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT TO authenticated
    USING (
        auth.uid() = id
        OR public.is_admin_or_security()
        OR (public.current_user_role() IN ('faculty', 'warden', 'counselor'))
        OR public.is_parent_of_student_profile(id)
    );

CREATE POLICY "Users can update own profile non-privileged fields"
    ON profiles FOR UPDATE TO authenticated
    USING (auth.uid() = id OR public.is_institution_admin())
    WITH CHECK (auth.uid() = id OR public.is_institution_admin());

CREATE POLICY "Admins can insert or delete profiles"
    ON profiles FOR ALL TO authenticated
    USING (public.is_institution_admin());

-- ------------------------------------------------------------------------------
-- 4. Academic ERP Policies
-- ------------------------------------------------------------------------------

-- Courses: Read for all, manage by Admins
CREATE POLICY "Anyone authenticated can view courses"
    ON courses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage courses"
    ON courses FOR ALL TO authenticated USING (public.is_institution_admin());

-- Students:
CREATE POLICY "Students view policy"
    ON students FOR SELECT TO authenticated
    USING (
        profile_id = auth.uid()
        OR public.is_admin_or_security()
        OR public.current_user_role() IN ('faculty', 'warden', 'counselor')
        OR public.is_parent_of_student(id)
    );

CREATE POLICY "Admins and Faculty can manage students"
    ON students FOR ALL TO authenticated
    USING (public.is_institution_admin() OR public.current_user_role() = 'faculty');

-- Faculty:
CREATE POLICY "Faculty view policy"
    ON faculty FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage faculty"
    ON faculty FOR ALL TO authenticated USING (public.is_institution_admin());

-- Parents & Parent-Student Links:
CREATE POLICY "Parents view own profile and links"
    ON parents FOR SELECT TO authenticated
    USING (profile_id = auth.uid() OR public.is_institution_admin());

CREATE POLICY "Parent student links view policy"
    ON parent_student_links FOR SELECT TO authenticated
    USING (
        parent_id IN (SELECT id FROM parents WHERE profile_id = auth.uid())
        OR student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
        OR public.is_institution_admin()
    );

CREATE POLICY "Admins can manage parent links"
    ON parent_student_links FOR ALL TO authenticated USING (public.is_institution_admin());

-- Timetable:
CREATE POLICY "Authenticated users can view timetable"
    ON timetable FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and Faculty can manage timetable"
    ON timetable FOR ALL TO authenticated
    USING (public.is_institution_admin() OR public.current_user_role() = 'faculty');

-- Attendance:
CREATE POLICY "Attendance view policy"
    ON attendance FOR SELECT TO authenticated
    USING (
        student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
        OR public.is_parent_of_student(student_id)
        OR public.is_admin_or_security()
        OR public.current_user_role() = 'faculty'
    );

CREATE POLICY "Faculty and Admins can record attendance"
    ON attendance FOR INSERT TO authenticated
    WITH CHECK (public.is_institution_admin() OR public.current_user_role() = 'faculty');

CREATE POLICY "Faculty and Admins can update attendance"
    ON attendance FOR UPDATE TO authenticated
    USING (public.is_institution_admin() OR public.current_user_role() = 'faculty');

-- Exams & Exam Results:
CREATE POLICY "Authenticated users can view exam schedules"
    ON exams FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and Faculty can manage exams"
    ON exams FOR ALL TO authenticated
    USING (public.is_institution_admin() OR public.current_user_role() = 'faculty');

CREATE POLICY "Exam results view policy"
    ON exam_results FOR SELECT TO authenticated
    USING (
        student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
        OR public.is_parent_of_student(student_id)
        OR public.is_institution_admin()
        OR public.current_user_role() = 'faculty'
    );

CREATE POLICY "Faculty and Admins can grade exams"
    ON exam_results FOR ALL TO authenticated
    USING (public.is_institution_admin() OR public.current_user_role() = 'faculty');

-- Hostels & Rooms & Allocations:
CREATE POLICY "View hostels and rooms policy"
    ON hostels FOR SELECT TO authenticated USING (true);

CREATE POLICY "View rooms policy"
    ON rooms FOR SELECT TO authenticated USING (true);

CREATE POLICY "Hostel allocations view policy"
    ON hostel_allocations FOR SELECT TO authenticated
    USING (
        student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
        OR public.is_admin_or_security()
        OR public.current_user_role() = 'warden'
        OR public.is_parent_of_student(student_id)
    );

CREATE POLICY "Wardens and Admins can manage hostel allocations"
    ON hostel_allocations FOR ALL TO authenticated
    USING (public.is_institution_admin() OR public.current_user_role() = 'warden');

-- Placements & Applications:
CREATE POLICY "Placements view policy"
    ON placements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage placements"
    ON placements FOR ALL TO authenticated USING (public.is_institution_admin());

CREATE POLICY "Placement applications view policy"
    ON placement_applications FOR SELECT TO authenticated
    USING (
        student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
        OR public.is_institution_admin()
        OR public.current_user_role() = 'faculty'
    );

CREATE POLICY "Students can apply for placements"
    ON placement_applications FOR INSERT TO authenticated
    WITH CHECK (
        student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
    );

CREATE POLICY "Admins can manage placement applications"
    ON placement_applications FOR UPDATE TO authenticated
    USING (public.is_institution_admin());

-- ------------------------------------------------------------------------------
-- 5. Safety Core Policies (Incidents, SOS, Alerts, Evidence)
-- ------------------------------------------------------------------------------

-- Incidents:
-- 1. Reporter can view their own incidents
-- 2. Admin & Security can view ALL incidents
-- 3. Assigned personnel can view their assigned incidents
-- 4. Any authenticated user can create an incident
-- 5. Only Admin/Security can update incident status/resolution
CREATE POLICY "Incidents view policy"
    ON incidents FOR SELECT TO authenticated
    USING (
        reporter_id = auth.uid()
        OR public.is_admin_or_security()
        OR assigned_to = auth.uid()
        OR id IN (SELECT incident_id FROM incident_assignments WHERE assigned_to = auth.uid())
    );

CREATE POLICY "Authenticated users can report incidents"
    ON incidents FOR INSERT TO authenticated
    WITH CHECK (
        reporter_id = auth.uid()
    );

CREATE POLICY "Admin and Security can update incidents"
    ON incidents FOR UPDATE TO authenticated
    USING (
        public.is_admin_or_security()
        OR assigned_to = auth.uid()
    );

CREATE POLICY "Admins can delete incidents"
    ON incidents FOR DELETE TO authenticated
    USING (public.is_institution_admin());

-- Incident Evidence:
CREATE POLICY "Incident evidence view policy"
    ON incident_evidence FOR SELECT TO authenticated
    USING (
        incident_id IN (
            SELECT id FROM incidents
            WHERE reporter_id = auth.uid()
               OR public.is_admin_or_security()
               OR assigned_to = auth.uid()
        )
    );

CREATE POLICY "Users can upload incident evidence"
    ON incident_evidence FOR INSERT TO authenticated
    WITH CHECK (
        uploaded_by = auth.uid()
        OR public.is_admin_or_security()
    );

CREATE POLICY "Admin and Security can manage evidence"
    ON incident_evidence FOR ALL TO authenticated
    USING (public.is_admin_or_security());

-- Incident Assignments:
CREATE POLICY "Incident assignments view policy"
    ON incident_assignments FOR SELECT TO authenticated
    USING (
        assigned_to = auth.uid()
        OR public.is_admin_or_security()
    );

CREATE POLICY "Admin and Security can assign incidents"
    ON incident_assignments FOR ALL TO authenticated
    USING (public.is_admin_or_security());

-- Incident Timeline:
CREATE POLICY "Incident timeline view policy"
    ON incident_timeline FOR SELECT TO authenticated
    USING (
        (NOT is_internal_only AND incident_id IN (
            SELECT id FROM incidents WHERE reporter_id = auth.uid()
        ))
        OR public.is_admin_or_security()
        OR incident_id IN (SELECT id FROM incidents WHERE assigned_to = auth.uid())
    );

CREATE POLICY "Admin and Security can add timeline entries"
    ON incident_timeline FOR INSERT TO authenticated
    WITH CHECK (public.is_admin_or_security() OR actor_id = auth.uid());

-- SOS Alerts:
CREATE POLICY "SOS alerts view policy"
    ON sos_alerts FOR SELECT TO authenticated
    USING (
        user_id = auth.uid()
        OR public.is_admin_or_security()
    );

CREATE POLICY "Authenticated users can trigger SOS"
    ON sos_alerts FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Security and Admin can update SOS"
    ON sos_alerts FOR UPDATE TO authenticated
    USING (public.is_admin_or_security());

-- Emergency Alerts:
CREATE POLICY "All authenticated users can view active emergency alerts"
    ON emergency_alerts FOR SELECT TO authenticated
    USING (
        is_active = true
        OR public.is_admin_or_security()
    );

CREATE POLICY "Admin and Security can manage emergency alerts"
    ON emergency_alerts FOR ALL TO authenticated
    USING (public.is_admin_or_security());

-- Visitors & Visitor Passes:
CREATE POLICY "Visitors view policy"
    ON visitors FOR SELECT TO authenticated
    USING (
        public.is_admin_or_security()
        OR public.current_user_role() = 'receptionist'
    );

CREATE POLICY "Visitors manage policy"
    ON visitors FOR ALL TO authenticated
    USING (
        public.is_admin_or_security()
        OR public.current_user_role() = 'receptionist'
    );

CREATE POLICY "Visitor passes view policy"
    ON visitor_passes FOR SELECT TO authenticated
    USING (
        host_id = auth.uid()
        OR public.is_admin_or_security()
        OR public.current_user_role() = 'receptionist'
    );

CREATE POLICY "Visitor passes create policy"
    ON visitor_passes FOR INSERT TO authenticated
    WITH CHECK (
        host_id = auth.uid()
        OR public.is_admin_or_security()
        OR public.current_user_role() = 'receptionist'
    );

CREATE POLICY "Visitor passes update policy"
    ON visitor_passes FOR UPDATE TO authenticated
    USING (
        public.is_admin_or_security()
        OR public.current_user_role() = 'receptionist'
        OR host_id = auth.uid()
    );

-- Complaints:
CREATE POLICY "Complaints view policy"
    ON complaints FOR SELECT TO authenticated
    USING (
        filed_by = auth.uid()
        OR public.is_admin_or_security()
        OR assigned_to = auth.uid()
    );

CREATE POLICY "Users can file complaints"
    ON complaints FOR INSERT TO authenticated
    WITH CHECK (filed_by = auth.uid());

CREATE POLICY "Admins and Assignees can update complaints"
    ON complaints FOR UPDATE TO authenticated
    USING (public.is_institution_admin() OR assigned_to = auth.uid() OR public.is_admin_or_security());

-- Announcements:
CREATE POLICY "Announcements view policy"
    ON announcements FOR SELECT TO authenticated
    USING (
        published_at <= clock_timestamp()
        AND (expires_at IS NULL OR expires_at >= clock_timestamp())
        OR public.is_institution_admin()
        OR author_id = auth.uid()
    );

CREATE POLICY "Admins and Faculty can manage announcements"
    ON announcements FOR ALL TO authenticated
    USING (public.is_institution_admin() OR public.current_user_role() = 'faculty');

-- Notifications:
CREATE POLICY "Users view their own notifications"
    ON notifications FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can mark their notifications as read"
    ON notifications FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT TO authenticated
    WITH CHECK (true);

-- Wellbeing Checkins:
CREATE POLICY "Wellbeing checkins view policy"
    ON wellbeing_checkins FOR SELECT TO authenticated
    USING (
        student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
        OR public.is_institution_admin()
        OR public.current_user_role() = 'counselor'
        OR counselor_assigned = auth.uid()
    );

CREATE POLICY "Students can submit wellbeing checkins"
    ON wellbeing_checkins FOR INSERT TO authenticated
    WITH CHECK (
        student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
    );

CREATE POLICY "Counselors can update wellbeing checkins"
    ON wellbeing_checkins FOR UPDATE TO authenticated
    USING (public.current_user_role() = 'counselor' OR public.is_institution_admin());

-- AI Insights:
CREATE POLICY "AI insights view policy"
    ON ai_insights FOR SELECT TO authenticated
    USING (public.is_admin_or_security() OR public.is_institution_admin());

CREATE POLICY "Admin can manage AI insights"
    ON ai_insights FOR ALL TO authenticated
    USING (public.is_institution_admin() OR public.is_admin_or_security());

-- Audit Logs:
CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT TO authenticated
    USING (public.is_institution_admin());

CREATE POLICY "Service role can insert audit logs"
    ON audit_logs FOR INSERT TO authenticated
    WITH CHECK (true);
