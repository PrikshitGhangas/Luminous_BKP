-- ==============================================================================
-- CampusShield AI — Migration 008: Idempotent Role Seed Repair
--
-- ADDITIVE + SAFE. Fills in any role rows that were missing from an incomplete
-- seed, without touching roles that already exist. Run after 001–007.
-- ==============================================================================

INSERT INTO roles (id, name, display_name, description, hierarchy_level, permissions)
SELECT id, name, display_name, description, hierarchy_level, permissions
FROM (VALUES
    (gen_random_uuid(), 'super_admin',  'Super Administrator',      'Full institutional & security control', 1,   '["admin"]'::jsonb),
    (gen_random_uuid(), 'admin',        'Institution Administrator','Campus operations and resource management', 10, '["admin"]'::jsonb),
    (gen_random_uuid(), 'security',     'Campus Security Officer',  'Live safety command, incident response & patrol', 20, '["security"]'::jsonb),
    (gen_random_uuid(), 'warden',       'Hostel Warden',            'Hostel discipline, resident safety and room allocation', 30, '["warden"]'::jsonb),
    (gen_random_uuid(), 'counselor',    'Counselor',                'Student wellbeing and mental-health support', 35, '["counselor"]'::jsonb),
    (gen_random_uuid(), 'medical_staff','Medical Staff',            'On-campus medical and emergency care', 35, '["medical"]'::jsonb),
    (gen_random_uuid(), 'faculty',      'Faculty Member / Professor','Academic teaching, attendance and grade evaluations', 40, '["faculty"]'::jsonb),
    (gen_random_uuid(), 'placement_officer','Placement Officer',    'Career drives, internship and recruitment operations', 50, '["placement"]'::jsonb),
    (gen_random_uuid(), 'receptionist', 'Receptionist',             'Front desk, visitor registration and campus access', 60, '["reception"]'::jsonb),
    (gen_random_uuid(), 'parent',       'Parent / Guardian',        'Student safety, attendance and grade observation', 110, '["parent"]'::jsonb),
    (gen_random_uuid(), 'student',      'Enrolled Student',         'Campus member, incident reporter, SOS user & learner', 100, '["student"]'::jsonb),
    (gen_random_uuid(), 'other',        'Other Member',             'General campus user', 120, '["student"]'::jsonb)
) AS seed(id, name, display_name, description, hierarchy_level, permissions)
WHERE NOT EXISTS (SELECT 1 FROM roles r WHERE r.name = seed.name)
ON CONFLICT (name) DO NOTHING;

-- ==============================================================================
-- (Recommended) Grant super admin to a specific account ONCE you have a user:
--   INSERT INTO public.authorized_super_admins (email, role)
--   VALUES ('YOUR-EMAIL@example.com', 'super_admin')
--   ON CONFLICT (email) DO NOTHING;
--   UPDATE public.profiles SET role = 'super_admin'
--   WHERE email = 'YOUR-EMAIL@example.com';
-- ==============================================================================