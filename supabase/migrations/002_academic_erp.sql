-- ==============================================================================
-- CampusShield AI — Migration 002: Academic ERP Schema
-- ==============================================================================

-- 1. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    degree_type VARCHAR(50) NOT NULL CHECK (degree_type IN ('B.Tech', 'M.Tech', 'B.Sc', 'M.Sc', 'BBA', 'MBA', 'Ph.D', 'Diploma')),
    duration_years INT NOT NULL DEFAULT 4 CHECK (duration_years BETWEEN 1 AND 6),
    total_semesters INT NOT NULL DEFAULT 8 CHECK (total_semesters BETWEEN 2 AND 12),
    total_credits INT NOT NULL DEFAULT 160 CHECK (total_credits > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    enrollment_no VARCHAR(50) UNIQUE NOT NULL,
    roll_no VARCHAR(50) NOT NULL,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    current_semester INT NOT NULL CHECK (current_semester BETWEEN 1 AND 12),
    section VARCHAR(10) NOT NULL DEFAULT 'A',
    batch_year INT NOT NULL CHECK (batch_year >= 2000),
    academic_standing VARCHAR(50) NOT NULL DEFAULT 'Good Standing' CHECK (academic_standing IN ('Good Standing', 'Academic Probation', 'Dean List', 'Suspended', 'Graduated')),
    cgpa NUMERIC(4,2) NOT NULL DEFAULT 0.00 CHECK (cgpa BETWEEN 0.00 AND 10.00),
    attendance_percentage NUMERIC(5,2) NOT NULL DEFAULT 100.00 CHECK (attendance_percentage BETWEEN 0.00 AND 100.00),
    blood_group VARCHAR(10),
    medical_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 3. Faculty Table
CREATE TABLE IF NOT EXISTS faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    designation VARCHAR(100) NOT NULL CHECK (designation IN ('Professor', 'Associate Professor', 'Assistant Professor', 'Dean', 'HOD', 'Visiting Faculty', 'Lecturer')),
    specialization VARCHAR(150),
    highest_qualification VARCHAR(100),
    office_room VARCHAR(50),
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 4. Parents Table
CREATE TABLE IF NOT EXISTS parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    occupation VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    alternate_phone VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5. Parent-Student Links Table
CREATE TABLE IF NOT EXISTS parent_student_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    relationship VARCHAR(50) NOT NULL CHECK (relationship IN ('father', 'mother', 'guardian', 'other')),
    is_primary_contact BOOLEAN NOT NULL DEFAULT true,
    can_view_grades BOOLEAN NOT NULL DEFAULT true,
    can_view_attendance BOOLEAN NOT NULL DEFAULT true,
    can_view_safety_alerts BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    UNIQUE(parent_id, student_id)
);

-- 6. Timetable Table
CREATE TABLE IF NOT EXISTS timetable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 12),
    section VARCHAR(10) NOT NULL DEFAULT 'A',
    subject_code VARCHAR(30) NOT NULL,
    subject_name VARCHAR(150) NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday ... 7=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    faculty_id UUID REFERENCES faculty(id) ON DELETE SET NULL,
    location_id UUID REFERENCES campus_locations(id) ON DELETE SET NULL,
    room_number VARCHAR(50),
    academic_year VARCHAR(20) NOT NULL DEFAULT '2025-2026',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT chk_timetable_time CHECK (start_time < end_time)
);

-- 7. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    subject_code VARCHAR(30) NOT NULL,
    date DATE NOT NULL,
    status attendance_status NOT NULL DEFAULT 'present',
    marked_by_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    UNIQUE(student_id, subject_code, date)
);

-- 8. Exams Table
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 12),
    exam_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(30) NOT NULL,
    subject_name VARCHAR(150) NOT NULL,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_marks NUMERIC(5,2) NOT NULL DEFAULT 100.00 CHECK (max_marks > 0),
    passing_marks NUMERIC(5,2) NOT NULL DEFAULT 40.00 CHECK (passing_marks >= 0 AND passing_marks <= max_marks),
    location_id UUID REFERENCES campus_locations(id) ON DELETE SET NULL,
    room_number VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT chk_exam_time CHECK (start_time < end_time)
);

-- 9. Exam Results Table
CREATE TABLE IF NOT EXISTS exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    marks_obtained NUMERIC(5,2) NOT NULL CHECK (marks_obtained >= 0),
    grade VARCHAR(5),
    is_absent BOOLEAN NOT NULL DEFAULT false,
    remarks TEXT,
    graded_by_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    UNIQUE(exam_id, student_id)
);

-- 10. Hostels Table
CREATE TABLE IF NOT EXISTS hostels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(30) UNIQUE NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('boys', 'girls', 'co-ed', 'faculty')),
    warden_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    total_floors INT NOT NULL DEFAULT 4 CHECK (total_floors > 0),
    total_rooms INT NOT NULL DEFAULT 100 CHECK (total_rooms > 0),
    location_id UUID REFERENCES campus_locations(id) ON DELETE SET NULL,
    contact_phone VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 11. Hostel Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    floor INT NOT NULL CHECK (floor >= 0),
    capacity INT NOT NULL DEFAULT 2 CHECK (capacity > 0),
    current_occupancy INT NOT NULL DEFAULT 0 CHECK (current_occupancy >= 0 AND current_occupancy <= capacity),
    status VARCHAR(30) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
    amenities JSONB DEFAULT '["bed", "desk", "wardrobe", "fan", "lan_port", "wifi"]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    UNIQUE(hostel_id, room_number)
);

-- 12. Hostel Allocations Table
CREATE TABLE IF NOT EXISTS hostel_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_out_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'vacated', 'transferred')),
    allocated_by_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 13. Placements Table
CREATE TABLE IF NOT EXISTS placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(150) NOT NULL,
    company_logo_url TEXT,
    role_title VARCHAR(150) NOT NULL,
    package_lpa NUMERIC(6,2) NOT NULL CHECK (package_lpa > 0),
    job_location VARCHAR(100) NOT NULL,
    drive_date DATE NOT NULL,
    application_deadline TIMESTAMPTZ NOT NULL,
    min_cgpa NUMERIC(4,2) NOT NULL DEFAULT 6.00 CHECK (min_cgpa BETWEEN 0.00 AND 10.00),
    job_description TEXT NOT NULL,
    eligibility_criteria JSONB DEFAULT '{"branches": ["CSE", "ECE", "IT", "ME", "EE"], "max_backlogs": 0}'::jsonb,
    status placement_status NOT NULL DEFAULT 'upcoming',
    created_by_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 14. Placement Applications Table
CREATE TABLE IF NOT EXISTS placement_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES placements(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    resume_url TEXT,
    status application_status NOT NULL DEFAULT 'applied',
    rounds_cleared INT NOT NULL DEFAULT 0 CHECK (rounds_cleared >= 0),
    feedback TEXT,
    interview_scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    UNIQUE(placement_id, student_id)
);
