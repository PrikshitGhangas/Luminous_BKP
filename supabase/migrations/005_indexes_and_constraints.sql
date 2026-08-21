-- ==============================================================================
-- CampusShield AI — Migration 005: Indexes, Constraints & Performance Tuning
-- ==============================================================================

-- 1. Profiles & Roles Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_metadata_gin ON profiles USING GIN (metadata);

-- 2. Academic ERP Indexes
CREATE INDEX IF NOT EXISTS idx_students_profile_id ON students(profile_id);
CREATE INDEX IF NOT EXISTS idx_students_course_dept ON students(course_id, department_id);
CREATE INDEX IF NOT EXISTS idx_students_semester_section ON students(current_semester, section);
CREATE INDEX IF NOT EXISTS idx_students_enrollment_no ON students(enrollment_no);
CREATE INDEX IF NOT EXISTS idx_students_cgpa ON students(cgpa);

CREATE INDEX IF NOT EXISTS idx_faculty_profile_id ON faculty(profile_id);
CREATE INDEX IF NOT EXISTS idx_faculty_department_id ON faculty(department_id);
CREATE INDEX IF NOT EXISTS idx_faculty_employee_id ON faculty(employee_id);

CREATE INDEX IF NOT EXISTS idx_parents_profile_id ON parents(profile_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_parent ON parent_student_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_student ON parent_student_links(student_id);

CREATE INDEX IF NOT EXISTS idx_timetable_lookup ON timetable(course_id, semester, section, day_of_week);
CREATE INDEX IF NOT EXISTS idx_timetable_faculty ON timetable(faculty_id);
CREATE INDEX IF NOT EXISTS idx_timetable_location ON timetable(location_id);

CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_course_date ON attendance(course_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);

CREATE INDEX IF NOT EXISTS idx_exams_course_sem ON exams(course_id, semester, exam_date);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_student ON exam_results(exam_id, student_id);

CREATE INDEX IF NOT EXISTS idx_rooms_hostel_status ON rooms(hostel_id, status);
CREATE INDEX IF NOT EXISTS idx_hostel_alloc_student ON hostel_allocations(student_id, status);
CREATE INDEX IF NOT EXISTS idx_hostel_alloc_room ON hostel_allocations(room_id, status);

CREATE INDEX IF NOT EXISTS idx_placements_status_date ON placements(status, drive_date);
CREATE INDEX IF NOT EXISTS idx_placement_apps_placement_student ON placement_applications(placement_id, student_id);
CREATE INDEX IF NOT EXISTS idx_placement_apps_status ON placement_applications(status);

-- 3. Safety Core & Incident Indexes
CREATE INDEX IF NOT EXISTS idx_incidents_reporter ON incidents(reporter_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON incidents(category);
CREATE INDEX IF NOT EXISTS idx_incidents_location ON incidents(location_id);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_assigned_to ON incidents(assigned_to);
CREATE INDEX IF NOT EXISTS idx_incidents_assigned_dept ON incidents(assigned_department_id);
CREATE INDEX IF NOT EXISTS idx_incidents_ai_class_gin ON incidents USING GIN (ai_classification);
CREATE INDEX IF NOT EXISTS idx_incidents_active_partial ON incidents(status, severity, created_at DESC)
    WHERE status NOT IN ('resolved', 'closed', 'false_alarm');

CREATE INDEX IF NOT EXISTS idx_incident_evidence_incident ON incident_evidence(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_assignments_incident ON incident_assignments(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_assignments_user ON incident_assignments(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_incident_timeline_incident ON incident_timeline(incident_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_sos_user ON sos_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_status ON sos_alerts(status);
CREATE INDEX IF NOT EXISTS idx_sos_active_partial ON sos_alerts(created_at DESC)
    WHERE status IN ('active', 'responding');

CREATE INDEX IF NOT EXISTS idx_emergency_alerts_active ON emergency_alerts(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_roles_gin ON emergency_alerts USING GIN (target_roles);

CREATE INDEX IF NOT EXISTS idx_visitors_phone ON visitors(phone);
CREATE INDEX IF NOT EXISTS idx_visitor_passes_visitor ON visitor_passes(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_passes_host ON visitor_passes(host_id);
CREATE INDEX IF NOT EXISTS idx_visitor_passes_status_date ON visitor_passes(status, valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_visitor_passes_active ON visitor_passes(status)
    WHERE status IN ('pre_registered', 'checked_in');

CREATE INDEX IF NOT EXISTS idx_complaints_filed_by ON complaints(filed_by);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON complaints(assigned_to);

CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_roles_gin ON announcements USING GIN (target_roles);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wellbeing_student ON wellbeing_checkins(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wellbeing_followup ON wellbeing_checkins(requires_counselor_followup)
    WHERE requires_counselor_followup = true;

CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(insight_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_unack ON ai_insights(is_acknowledged)
    WHERE is_acknowledged = false;
CREATE INDEX IF NOT EXISTS idx_ai_insights_payload_gin ON ai_insights USING GIN (data_payload);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
