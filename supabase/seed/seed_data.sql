-- ============================================================================
-- Luminous (SafeCampus) — Seed Data
-- Realistic Indian college demo data (Bangalore-area campus)
-- Run after migrations. Requires PostGIS extension enabled.
-- ============================================================================

-- Enable PostGIS if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Temporarily bypass FK constraints to allow seeding sample users
SET session_replication_role = 'replica';

DO $$
DECLARE
  -- ===== STUDENT UUIDs =====
  v_student_priya     uuid := gen_random_uuid();
  v_student_arjun     uuid := gen_random_uuid();
  v_student_sneha     uuid := gen_random_uuid();
  v_student_rohit     uuid := gen_random_uuid();
  v_student_anita     uuid := gen_random_uuid();
  v_student_vikram    uuid := gen_random_uuid();
  v_student_deepa     uuid := gen_random_uuid();
  v_student_karthik   uuid := gen_random_uuid();
  v_student_meghna    uuid := gen_random_uuid();
  v_student_siddharth uuid := gen_random_uuid();

  -- ===== GUARD UUIDs =====
  v_guard_rajesh      uuid := gen_random_uuid();
  v_guard_suresh      uuid := gen_random_uuid();
  v_guard_manoj       uuid := gen_random_uuid();
  v_guard_dinesh      uuid := gen_random_uuid();

  -- ===== VOLUNTEER UUIDs =====
  v_volunteer_kavya   uuid := gen_random_uuid();
  v_volunteer_arun    uuid := gen_random_uuid();

  -- ===== THERAPIST UUIDs =====
  v_therapist_meena   uuid := gen_random_uuid();
  v_therapist_rahul   uuid := gen_random_uuid();
  v_therapist_ananya  uuid := gen_random_uuid();

  -- ===== ADMIN UUID =====
  v_admin_srinivas    uuid := gen_random_uuid();

  -- ===== PARENT UUIDs =====
  v_parent_sharma     uuid := gen_random_uuid();
  v_parent_patel      uuid := gen_random_uuid();

  -- ===== BUILDING UUIDs =====
  v_bld_main_academic uuid := gen_random_uuid();
  v_bld_chemistry     uuid := gen_random_uuid();
  v_bld_cs            uuid := gen_random_uuid();
  v_bld_library       uuid := gen_random_uuid();
  v_bld_boys_hostel   uuid := gen_random_uuid();
  v_bld_girls_hostel  uuid := gen_random_uuid();
  v_bld_sports        uuid := gen_random_uuid();
  v_bld_admin_block   uuid := gen_random_uuid();

  -- ===== INCIDENT UUIDs =====
  v_incident_1        uuid := gen_random_uuid();
  v_incident_2        uuid := gen_random_uuid();
  v_incident_3        uuid := gen_random_uuid();

  -- ===== TIP UUIDs =====
  v_tip_1             uuid := gen_random_uuid();
  v_tip_2             uuid := gen_random_uuid();
  v_tip_3             uuid := gen_random_uuid();
  v_tip_4             uuid := gen_random_uuid();
  v_tip_5             uuid := gen_random_uuid();

BEGIN

  -- ==========================================================================
  -- 1. USERS — Students
  -- ==========================================================================
  INSERT INTO users (id, name, email, role, department, year, phone, blood_group, medical_conditions, hostel_room, is_in_distress, distress_level, is_available, created_at) VALUES
    (v_student_priya,     'Priya Sharma',      'priya.sharma@college.edu',      'student', 'CSE', 3, '+919876543210', 'B+',   'Asthma',            'GH-204', false, null, true,  now()),
    (v_student_arjun,     'Arjun Patel',       'arjun.patel@college.edu',       'student', 'ECE', 2, '+919876543211', 'O+',   null,                'BH-112', false, null, true,  now()),
    (v_student_sneha,     'Sneha Nair',        'sneha.nair@college.edu',        'student', 'CSE', 4, '+919876543212', 'A+',   null,                'GH-301', false, null, true,  now()),
    (v_student_rohit,     'Rohit Kumar',       'rohit.kumar@college.edu',       'student', 'ME',  1, '+919876543213', 'AB+',  'Diabetes (Type 1)', 'BH-105', false, null, true,  now()),
    (v_student_anita,     'Anita Deshmukh',    'anita.deshmukh@college.edu',    'student', 'ECE', 3, '+919876543214', 'B-',   null,                'GH-102', false, null, true,  now()),
    (v_student_vikram,    'Vikram Singh',      'vikram.singh@college.edu',      'student', 'CSE', 2, '+919876543215', 'O-',   'Epilepsy',          'BH-308', false, null, true,  now()),
    (v_student_deepa,     'Deepa Menon',       'deepa.menon@college.edu',       'student', 'CE',  1, '+919876543216', 'A-',   null,                'GH-405', false, null, true,  now()),
    (v_student_karthik,   'Karthik Rao',       'karthik.rao@college.edu',       'student', 'ME',  4, '+919876543217', 'A+',   null,                'BH-210', false, null, true,  now()),
    (v_student_meghna,    'Meghna Joshi',      'meghna.joshi@college.edu',      'student', 'CSE', 1, '+919876543218', 'B+',   'Migraine (chronic)','GH-103', false, null, true,  now()),
    (v_student_siddharth, 'Siddharth Reddy',   'siddharth.reddy@college.edu',   'student', 'ECE', 3, '+919876543219', 'O+',   null,                'BH-401', false, null, true,  now());

  -- ==========================================================================
  -- 2. USERS — Guards
  -- ==========================================================================
  INSERT INTO users (id, name, email, role, phone, is_available, current_location, created_at) VALUES
    (v_guard_rajesh,  'Rajesh Yadav',   'rajesh.guard@college.edu',  'guard', '+919900110001', true,
      ST_SetSRID(ST_MakePoint(77.5895, 12.9705), 4326)::geography, now()),
    (v_guard_suresh,  'Suresh Patil',   'suresh.guard@college.edu',  'guard', '+919900110002', true,
      ST_SetSRID(ST_MakePoint(77.5910, 12.9695), 4326)::geography, now()),
    (v_guard_manoj,   'Manoj Tiwari',   'manoj.guard@college.edu',   'guard', '+919900110003', true,
      ST_SetSRID(ST_MakePoint(77.5885, 12.9710), 4326)::geography, now()),
    (v_guard_dinesh,  'Dinesh Gowda',   'dinesh.guard@college.edu',  'guard', '+919900110004', true,
      ST_SetSRID(ST_MakePoint(77.5920, 12.9688), 4326)::geography, now());

  -- ==========================================================================
  -- 3. USERS — Volunteers
  -- ==========================================================================
  INSERT INTO users (id, name, email, role, department, year, phone, is_available, current_location, created_at) VALUES
    (v_volunteer_kavya, 'Kavya Hegde',  'kavya.volunteer@college.edu', 'volunteer', 'CSE', 4, '+919900220001', true,
      ST_SetSRID(ST_MakePoint(77.5902, 12.9698), 4326)::geography, now()),
    (v_volunteer_arun,  'Arun Prasad',  'arun.volunteer@college.edu',  'volunteer', 'ME',  3, '+919900220002', true,
      ST_SetSRID(ST_MakePoint(77.5912, 12.9702), 4326)::geography, now());

  -- ==========================================================================
  -- 4. USERS — Therapists
  -- ==========================================================================
  INSERT INTO users (id, name, email, role, phone, is_available, created_at) VALUES
    (v_therapist_meena,  'Dr. Meena Iyer',   'meena.therapist@college.edu',  'therapist', '+919900330001', true, now()),
    (v_therapist_rahul,  'Dr. Rahul Verma',  'rahul.therapist@college.edu',  'therapist', '+919900330002', true, now()),
    (v_therapist_ananya, 'Dr. Ananya Reddy', 'ananya.therapist@college.edu', 'therapist', '+919900330003', true, now());

  -- ==========================================================================
  -- 5. USERS — Admin
  -- ==========================================================================
  INSERT INTO users (id, name, email, role, phone, is_available, created_at) VALUES
    (v_admin_srinivas, 'Dr. Srinivas Murthy', 'admin@college.edu', 'admin', '+919900440001', true, now());

  -- ==========================================================================
  -- 6. USERS — Parents
  -- ==========================================================================
  INSERT INTO users (id, name, email, role, phone, created_at) VALUES
    (v_parent_sharma, 'Ramesh Sharma',  'ramesh.sharma@gmail.com',  'parent', '+919800110001', now()),
    (v_parent_patel,  'Sunita Patel',   'sunita.patel@gmail.com',   'parent', '+919800110002', now());

  -- ==========================================================================
  -- 7. EMERGENCY CONTACTS (for students)
  -- ==========================================================================
  INSERT INTO emergency_contacts (id, user_id, name, phone, relation) VALUES
    -- Priya's emergency contacts
    (gen_random_uuid(), v_student_priya, 'Ramesh Sharma',   '+919800110001', 'Father'),
    (gen_random_uuid(), v_student_priya, 'Sunita Sharma',   '+919800110010', 'Mother'),
    (gen_random_uuid(), v_student_priya, 'Amit Sharma',     '+919800110011', 'Brother'),

    -- Arjun's emergency contacts
    (gen_random_uuid(), v_student_arjun, 'Sunita Patel',    '+919800110002', 'Mother'),
    (gen_random_uuid(), v_student_arjun, 'Rajendra Patel',  '+919800110012', 'Father'),

    -- Sneha
    (gen_random_uuid(), v_student_sneha, 'Suresh Nair',     '+919800110020', 'Father'),
    (gen_random_uuid(), v_student_sneha, 'Lakshmi Nair',    '+919800110021', 'Mother'),

    -- Rohit
    (gen_random_uuid(), v_student_rohit, 'Vinod Kumar',     '+919800110030', 'Father'),
    (gen_random_uuid(), v_student_rohit, 'Asha Kumar',      '+919800110031', 'Mother'),

    -- Anita
    (gen_random_uuid(), v_student_anita, 'Pramod Deshmukh', '+919800110040', 'Father'),

    -- Vikram
    (gen_random_uuid(), v_student_vikram, 'Harpreet Singh',  '+919800110050', 'Father'),
    (gen_random_uuid(), v_student_vikram, 'Jaspreet Singh',  '+919800110051', 'Mother');

  -- ==========================================================================
  -- 8. THERAPIST PROFILES (PK is user_id)
  -- ==========================================================================
  INSERT INTO therapist_profiles (user_id, specialization, currently_busy, active_session_with, sessions_today) VALUES
    (v_therapist_meena,  'Anxiety & Panic Disorders',      false, null, 0),
    (v_therapist_rahul,  'General Counseling & Stress',    false, null, 0),
    (v_therapist_ananya, 'Trauma & PTSD',                  false, null, 0);

  -- ==========================================================================
  -- 9. THERAPIST SLOTS (day is TEXT)
  -- ==========================================================================
  INSERT INTO therapist_slots (id, therapist_id, day, start_time, end_time) VALUES
    -- Dr. Meena Iyer — Mon to Fri, 9 AM - 1 PM and 2 PM - 5 PM
    (gen_random_uuid(), v_therapist_meena, 'monday',    '09:00', '13:00'),
    (gen_random_uuid(), v_therapist_meena, 'monday',    '14:00', '17:00'),
    (gen_random_uuid(), v_therapist_meena, 'tuesday',   '09:00', '13:00'),
    (gen_random_uuid(), v_therapist_meena, 'tuesday',   '14:00', '17:00'),
    (gen_random_uuid(), v_therapist_meena, 'wednesday', '09:00', '13:00'),
    (gen_random_uuid(), v_therapist_meena, 'wednesday', '14:00', '17:00'),
    (gen_random_uuid(), v_therapist_meena, 'thursday',  '09:00', '13:00'),
    (gen_random_uuid(), v_therapist_meena, 'thursday',  '14:00', '17:00'),
    (gen_random_uuid(), v_therapist_meena, 'friday',    '09:00', '13:00'),
    (gen_random_uuid(), v_therapist_meena, 'friday',    '14:00', '17:00'),

    -- Dr. Rahul Verma — Mon, Wed, Fri, 10 AM - 4 PM
    (gen_random_uuid(), v_therapist_rahul, 'monday',    '10:00', '16:00'),
    (gen_random_uuid(), v_therapist_rahul, 'wednesday', '10:00', '16:00'),
    (gen_random_uuid(), v_therapist_rahul, 'friday',    '10:00', '16:00'),

    -- Dr. Ananya Reddy — Tue, Thu, 9 AM - 5 PM; Sat, 9 AM - 1 PM
    (gen_random_uuid(), v_therapist_ananya, 'tuesday',  '09:00', '17:00'),
    (gen_random_uuid(), v_therapist_ananya, 'thursday', '09:00', '17:00'),
    (gen_random_uuid(), v_therapist_ananya, 'saturday', '09:00', '13:00');

  -- ==========================================================================
  -- 10. CAMPUS BUILDINGS (PostGIS POINT + POLYGON)
  -- ==========================================================================
  INSERT INTO campus_buildings (id, name, location, boundary, floors) VALUES
    -- Main Academic Block (center-north)
    (v_bld_main_academic, 'Main Academic Block',
      ST_SetSRID(ST_MakePoint(77.5900, 12.9710), 4326)::geography,
      ST_SetSRID(ST_MakePolygon(ST_GeomFromText(
        'LINESTRING(77.5898 12.9708, 77.5902 12.9708, 77.5902 12.9712, 77.5898 12.9712, 77.5898 12.9708)'
      )), 4326)::geography, 4),

    -- Chemistry Block (north-east)
    (v_bld_chemistry, 'Chemistry Block',
      ST_SetSRID(ST_MakePoint(77.5912, 12.9712), 4326)::geography,
      ST_SetSRID(ST_MakePolygon(ST_GeomFromText(
        'LINESTRING(77.5910 12.9710, 77.5914 12.9710, 77.5914 12.9714, 77.5910 12.9714, 77.5910 12.9710)'
      )), 4326)::geography, 3),

    -- Computer Science Block (center)
    (v_bld_cs, 'Computer Science Block',
      ST_SetSRID(ST_MakePoint(77.5900, 12.9700), 4326)::geography,
      ST_SetSRID(ST_MakePolygon(ST_GeomFromText(
        'LINESTRING(77.5898 12.9698, 77.5902 12.9698, 77.5902 12.9702, 77.5898 12.9702, 77.5898 12.9698)'
      )), 4326)::geography, 4),

    -- Library (center-west)
    (v_bld_library, 'Library',
      ST_SetSRID(ST_MakePoint(77.5888, 12.9700), 4326)::geography,
      ST_SetSRID(ST_MakePolygon(ST_GeomFromText(
        'LINESTRING(77.5886 12.9698, 77.5890 12.9698, 77.5890 12.9702, 77.5886 12.9702, 77.5886 12.9698)'
      )), 4326)::geography, 3),

    -- Boys Hostel (south-east)
    (v_bld_boys_hostel, 'Boys Hostel',
      ST_SetSRID(ST_MakePoint(77.5915, 12.9688), 4326)::geography,
      ST_SetSRID(ST_MakePolygon(ST_GeomFromText(
        'LINESTRING(77.5912 12.9685, 77.5918 12.9685, 77.5918 12.9691, 77.5912 12.9691, 77.5912 12.9685)'
      )), 4326)::geography, 5),

    -- Girls Hostel (south-west)
    (v_bld_girls_hostel, 'Girls Hostel',
      ST_SetSRID(ST_MakePoint(77.5885, 12.9688), 4326)::geography,
      ST_SetSRID(ST_MakePolygon(ST_GeomFromText(
        'LINESTRING(77.5882 12.9685, 77.5888 12.9685, 77.5888 12.9691, 77.5882 12.9691, 77.5882 12.9685)'
      )), 4326)::geography, 5),

    -- Sports Complex (south-center)
    (v_bld_sports, 'Sports Complex',
      ST_SetSRID(ST_MakePoint(77.5900, 12.9685), 4326)::geography,
      ST_SetSRID(ST_MakePolygon(ST_GeomFromText(
        'LINESTRING(77.5896 12.9682, 77.5904 12.9682, 77.5904 12.9688, 77.5896 12.9688, 77.5896 12.9682)'
      )), 4326)::geography, 2),

    -- Administrative Block (north-west)
    (v_bld_admin_block, 'Administrative Block',
      ST_SetSRID(ST_MakePoint(77.5888, 12.9712), 4326)::geography,
      ST_SetSRID(ST_MakePolygon(ST_GeomFromText(
        'LINESTRING(77.5886 12.9710, 77.5890 12.9710, 77.5890 12.9714, 77.5886 12.9714, 77.5886 12.9710)'
      )), 4326)::geography, 3);

  -- ==========================================================================
  -- 11. TIMETABLE SLOTS — Priya Sharma (CSE, 3rd year)
  -- ==========================================================================
  INSERT INTO timetable_slots (id, user_id, day, start_time, end_time, subject, building, room) VALUES
    -- Monday
    (gen_random_uuid(), v_student_priya, 'monday',    '09:00', '10:00', 'Data Structures',          'Computer Science Block', 'CSB-201'),
    (gen_random_uuid(), v_student_priya, 'monday',    '10:00', '11:00', 'Operating Systems',         'Computer Science Block', 'CSB-302'),
    (gen_random_uuid(), v_student_priya, 'monday',    '11:30', '12:30', 'Database Management',       'Computer Science Block', 'CSB-105'),
    (gen_random_uuid(), v_student_priya, 'monday',    '14:00', '15:00', 'Computer Networks Lab',     'Computer Science Block', 'CSB-Lab2'),
    -- Tuesday
    (gen_random_uuid(), v_student_priya, 'tuesday',   '09:00', '10:00', 'Operating Systems',         'Computer Science Block', 'CSB-302'),
    (gen_random_uuid(), v_student_priya, 'tuesday',   '10:00', '11:00', 'Data Structures',           'Computer Science Block', 'CSB-201'),
    (gen_random_uuid(), v_student_priya, 'tuesday',   '14:00', '15:00', 'Chemistry',                 'Chemistry Block',        'CHEM-Lab3'),
    (gen_random_uuid(), v_student_priya, 'tuesday',   '15:00', '16:00', 'Chemistry',                 'Chemistry Block',        'CHEM-Lab3'),
    -- Wednesday
    (gen_random_uuid(), v_student_priya, 'wednesday', '09:00', '10:00', 'Database Management',       'Computer Science Block', 'CSB-105'),
    (gen_random_uuid(), v_student_priya, 'wednesday', '10:00', '11:00', 'Computer Networks',         'Computer Science Block', 'CSB-203'),
    (gen_random_uuid(), v_student_priya, 'wednesday', '11:30', '12:30', 'Mathematics III',           'Main Academic Block',    'MAB-101'),
    -- Thursday
    (gen_random_uuid(), v_student_priya, 'thursday',  '09:00', '10:00', 'Data Structures',           'Computer Science Block', 'CSB-201'),
    (gen_random_uuid(), v_student_priya, 'thursday',  '10:00', '11:00', 'Operating Systems',         'Computer Science Block', 'CSB-302'),
    (gen_random_uuid(), v_student_priya, 'thursday',  '14:00', '15:00', 'Database Management Lab',   'Computer Science Block', 'CSB-Lab1'),
    (gen_random_uuid(), v_student_priya, 'thursday',  '15:00', '16:00', 'Database Management Lab',   'Computer Science Block', 'CSB-Lab1'),
    -- Friday
    (gen_random_uuid(), v_student_priya, 'friday',    '09:00', '10:00', 'Computer Networks',         'Computer Science Block', 'CSB-203'),
    (gen_random_uuid(), v_student_priya, 'friday',    '10:00', '11:00', 'Mathematics III',           'Main Academic Block',    'MAB-101'),
    (gen_random_uuid(), v_student_priya, 'friday',    '11:30', '12:30', 'Soft Skills',               'Main Academic Block',    'MAB-Seminar');

  -- ==========================================================================
  -- 12. TIMETABLE SLOTS — Arjun Patel (ECE, 2nd year)
  -- ==========================================================================
  INSERT INTO timetable_slots (id, user_id, day, start_time, end_time, subject, building, room) VALUES
    -- Monday
    (gen_random_uuid(), v_student_arjun, 'monday',    '09:00', '10:00', 'Signals & Systems',         'Main Academic Block', 'MAB-201'),
    (gen_random_uuid(), v_student_arjun, 'monday',    '10:00', '11:00', 'Analog Electronics',        'Main Academic Block', 'MAB-302'),
    (gen_random_uuid(), v_student_arjun, 'monday',    '11:30', '12:30', 'Engineering Mathematics',   'Main Academic Block', 'MAB-101'),
    (gen_random_uuid(), v_student_arjun, 'monday',    '14:00', '15:00', 'Electronics Lab',           'Main Academic Block', 'MAB-Lab1'),
    -- Tuesday
    (gen_random_uuid(), v_student_arjun, 'tuesday',   '09:00', '10:00', 'Digital Electronics',       'Main Academic Block', 'MAB-205'),
    (gen_random_uuid(), v_student_arjun, 'tuesday',   '10:00', '11:00', 'Signals & Systems',         'Main Academic Block', 'MAB-201'),
    (gen_random_uuid(), v_student_arjun, 'tuesday',   '14:00', '15:00', 'Analog Electronics Lab',    'Main Academic Block', 'MAB-Lab2'),
    -- Wednesday
    (gen_random_uuid(), v_student_arjun, 'wednesday', '09:00', '10:00', 'Analog Electronics',        'Main Academic Block', 'MAB-302'),
    (gen_random_uuid(), v_student_arjun, 'wednesday', '10:00', '11:00', 'Engineering Mathematics',   'Main Academic Block', 'MAB-101'),
    (gen_random_uuid(), v_student_arjun, 'wednesday', '11:30', '12:30', 'Digital Electronics',       'Main Academic Block', 'MAB-205'),
    -- Thursday
    (gen_random_uuid(), v_student_arjun, 'thursday',  '09:00', '10:00', 'Signals & Systems',         'Main Academic Block', 'MAB-201'),
    (gen_random_uuid(), v_student_arjun, 'thursday',  '10:00', '11:00', 'Digital Electronics Lab',   'Main Academic Block', 'MAB-Lab3'),
    (gen_random_uuid(), v_student_arjun, 'thursday',  '14:00', '15:00', 'Communication Systems',     'Main Academic Block', 'MAB-304'),
    -- Friday
    (gen_random_uuid(), v_student_arjun, 'friday',    '09:00', '10:00', 'Engineering Mathematics',   'Main Academic Block', 'MAB-101'),
    (gen_random_uuid(), v_student_arjun, 'friday',    '10:00', '11:00', 'Communication Systems',     'Main Academic Block', 'MAB-304'),
    (gen_random_uuid(), v_student_arjun, 'friday',    '11:30', '12:30', 'Environmental Science',     'Main Academic Block', 'MAB-Seminar');

  -- ==========================================================================
  -- 13. TIMETABLE SLOTS — Rohit Kumar (ME, 1st year)
  -- ==========================================================================
  INSERT INTO timetable_slots (id, user_id, day, start_time, end_time, subject, building, room) VALUES
    -- Monday
    (gen_random_uuid(), v_student_rohit, 'monday',    '09:00', '10:00', 'Engineering Drawing',       'Main Academic Block', 'MAB-401'),
    (gen_random_uuid(), v_student_rohit, 'monday',    '10:00', '11:00', 'Physics',                   'Main Academic Block', 'MAB-102'),
    (gen_random_uuid(), v_student_rohit, 'monday',    '14:00', '15:00', 'Workshop Practice',         'Main Academic Block', 'MAB-Workshop'),
    -- Tuesday
    (gen_random_uuid(), v_student_rohit, 'tuesday',   '09:00', '10:00', 'Mathematics I',             'Main Academic Block', 'MAB-103'),
    (gen_random_uuid(), v_student_rohit, 'tuesday',   '10:00', '11:00', 'Basic Electrical Engg',     'Main Academic Block', 'MAB-204'),
    (gen_random_uuid(), v_student_rohit, 'tuesday',   '11:30', '12:30', 'Chemistry',                 'Chemistry Block',     'CHEM-101'),
    (gen_random_uuid(), v_student_rohit, 'tuesday',   '14:00', '15:00', 'Chemistry Lab',             'Chemistry Block',     'CHEM-Lab1'),
    -- Wednesday
    (gen_random_uuid(), v_student_rohit, 'wednesday', '09:00', '10:00', 'Physics',                   'Main Academic Block', 'MAB-102'),
    (gen_random_uuid(), v_student_rohit, 'wednesday', '10:00', '11:00', 'Mathematics I',             'Main Academic Block', 'MAB-103'),
    (gen_random_uuid(), v_student_rohit, 'wednesday', '14:00', '15:00', 'Physics Lab',               'Main Academic Block', 'MAB-PhysLab'),
    -- Thursday
    (gen_random_uuid(), v_student_rohit, 'thursday',  '09:00', '10:00', 'Engineering Drawing',       'Main Academic Block', 'MAB-401'),
    (gen_random_uuid(), v_student_rohit, 'thursday',  '10:00', '11:00', 'Basic Electrical Engg',     'Main Academic Block', 'MAB-204'),
    (gen_random_uuid(), v_student_rohit, 'thursday',  '11:30', '12:30', 'English Communication',     'Main Academic Block', 'MAB-Seminar'),
    -- Friday
    (gen_random_uuid(), v_student_rohit, 'friday',    '09:00', '10:00', 'Mathematics I',             'Main Academic Block', 'MAB-103'),
    (gen_random_uuid(), v_student_rohit, 'friday',    '10:00', '11:00', 'Chemistry',                 'Chemistry Block',     'CHEM-101'),
    (gen_random_uuid(), v_student_rohit, 'friday',    '14:00', '15:00', 'Electrical Lab',            'Main Academic Block', 'MAB-ELab');

  -- ==========================================================================
  -- 14. INCIDENTS (1 resolved, 1 active Level 1, 1 resolved Level 2)
  -- ==========================================================================
  INSERT INTO incidents (id, reported_by, description, sos_level, location, location_source, fallback_building, fallback_room, fallback_subject, status, assigned_to, ai_classification, offline_triggered, created_at, resolved_at) VALUES
    -- Incident 1: Resolved Level 1 — medical emergency
    (v_incident_1, v_student_priya,
      'Feeling dizzy and having difficulty breathing during chemistry lab. Asthma attack triggered by chemical fumes.',
      'campus',
      ST_SetSRID(ST_MakePoint(77.5912, 12.9712), 4326)::geography,
      'timetable_fallback',
      'Chemistry Block', 'CHEM-Lab3', 'Chemistry',
      'resolved',
      v_guard_rajesh,
      'medical_emergency',
      false,
      now() - interval '3 days',
      now() - interval '3 days' + interval '8 minutes'),

    -- Incident 2: Active Level 1 — suspicious activity
    (v_incident_2, v_student_anita,
      'Group of unknown persons loitering near girls hostel entrance after 10 PM. Acting suspicious and making comments.',
      'campus',
      ST_SetSRID(ST_MakePoint(77.5885, 12.9688), 4326)::geography,
      'gps',
      null, null, null,
      'assigned',
      v_guard_manoj,
      'suspicious_activity',
      false,
      now() - interval '30 minutes',
      null),

    -- Incident 3: Resolved Level 2 — ragging
    (v_incident_3, v_student_rohit,
      'Seniors forcing first-year students to do physical exercises in hostel common room. Multiple students involved. Feeling threatened.',
      'police',
      ST_SetSRID(ST_MakePoint(77.5915, 12.9688), 4326)::geography,
      'gps',
      null, null, null,
      'resolved',
      v_guard_rajesh,
      'ragging',
      false,
      now() - interval '7 days',
      now() - interval '7 days' + interval '22 minutes');

  -- ==========================================================================
  -- 15. TIPS (5 anonymous tips with AI categories)
  -- ==========================================================================
  INSERT INTO tips (id, anonymous, text, ai_category, ai_severity, status, created_at) VALUES
    (v_tip_1, true,
      'Some seniors in BH block are forcing freshers to do push-ups and run errands after midnight. Happening for the past week.',
      'ragging', 'high', 'new',
      now() - interval '2 days'),

    (v_tip_2, true,
      'The fire extinguisher near CHEM-Lab2 has been expired for 3 months. Label shows last inspection was in January.',
      'infrastructure', 'medium', 'reviewed',
      now() - interval '5 days'),

    (v_tip_3, true,
      'A faculty member in the ME department is making inappropriate comments to female students during lab sessions.',
      'harassment', 'high', 'new',
      now() - interval '1 day'),

    (v_tip_4, false,
      'Street lights near the back gate (Gate 3) have not been working for 2 weeks. Very dark after 7 PM, feels unsafe walking there.',
      'infrastructure', 'medium', 'new',
      now() - interval '4 days'),

    (v_tip_5, true,
      'Second year students from ECE are collecting money from freshers under the pretense of "department contribution". This is forced.',
      'ragging', 'high', 'new',
      now() - interval '12 hours');

  -- ==========================================================================
  -- 16. TRUSTED CIRCLE — Priya and Anita
  -- ==========================================================================
  INSERT INTO trusted_circle (id, user_id, trusted_user_id, created_at) VALUES
    -- Priya's trusted circle
    (gen_random_uuid(), v_student_priya, v_student_sneha,    now()),
    (gen_random_uuid(), v_student_priya, v_student_anita,    now()),
    (gen_random_uuid(), v_student_priya, v_student_deepa,    now()),

    -- Anita's trusted circle
    (gen_random_uuid(), v_student_anita, v_student_priya,    now()),
    (gen_random_uuid(), v_student_anita, v_student_deepa,    now()),
    (gen_random_uuid(), v_student_anita, v_student_siddharth,now()),
    (gen_random_uuid(), v_student_anita, v_student_sneha,    now());

  -- ==========================================================================
  -- 17. OUTING REQUESTS (for off-campus location fallback)
  -- ==========================================================================
  INSERT INTO outing_requests (id, student_id, destination_name, destination_location, purpose, expected_departure, expected_return, status, approved_by, approved_at) VALUES
    -- Priya: active outing to Lalbagh Garden (approved, currently active)
    (gen_random_uuid(), v_student_priya, 'Lalbagh Botanical Garden',
     ST_SetSRID(ST_MakePoint(77.5846, 12.9507), 4326)::geography,
     'Weekend outing with friends',
     NOW() - INTERVAL '2 hours', NOW() + INTERVAL '4 hours',
     'active', v_admin_srinivas, NOW() - INTERVAL '1 day'),
    -- Arjun: approved outing to MG Road (future, not yet active)
    (gen_random_uuid(), v_student_arjun, 'MG Road Metro Station',
     ST_SetSRID(ST_MakePoint(77.6065, 12.9756), 4326)::geography,
     'Internship interview',
     NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 6 hours',
     'approved', v_admin_srinivas, NOW()),
    -- Sneha: completed outing (for history)
    (gen_random_uuid(), v_student_sneha, 'Forum Mall, Koramangala',
     ST_SetSRID(ST_MakePoint(77.6192, 12.9344), 4326)::geography,
     'Shopping',
     NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day 18 hours',
     'completed', v_admin_srinivas, NOW() - INTERVAL '3 days');

  -- ==========================================================================
  -- Done! Print summary
  -- ==========================================================================
  RAISE NOTICE '✅ Luminous seed data loaded successfully!';
  RAISE NOTICE '   👨‍🎓 10 students, 4 guards, 2 volunteers';
  RAISE NOTICE '   🧑‍⚕️ 3 therapists with profiles & slots';
  RAISE NOTICE '   👨‍💼 1 admin, 2 parents';
  RAISE NOTICE '   🏢 8 campus buildings with PostGIS geometry';
  RAISE NOTICE '   📅 Timetables for 3 students (Mon-Fri)';
  RAISE NOTICE '   🚨 3 incidents, 5 tips, 7 trusted circle entries';
  RAISE NOTICE '   🚶 3 outing requests (1 active, 1 approved, 1 completed)';

END $$;

-- Restore replication role
SET session_replication_role = 'origin';
