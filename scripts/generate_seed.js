/**
 * CampusShield AI — Realistic SQL Seed Data Generator
 * Generates comprehensive fictional seed data for Supabase PostgreSQL:
 * - 11 Roles
 * - 6 Departments
 * - 16 Campus Locations (SVG coords + Lat/Lng)
 * - 15 Admin & Security Staff profiles
 * - 55 Faculty members across departments
 * - 520 Students across various courses/batches
 * - 120 Parents & Parent-Student Links
 * - 12 Courses across Engineering, Management, Sciences
 * - Full Timetable entries for all semesters
 * - Over 5,000 Attendance records across multiple dates
 * - Exams & Exam Results
 * - 4 Hostels with 160 Rooms & Allocations
 * - 12 Placement Drives & 180 Applications
 * - 110 Realistic Safety Incidents (with AI classifications, confidence scores, evidence, assignments, timeline)
 * - 15 SOS Emergency Alerts
 * - 8 Campus-Wide Emergency Broadcasts
 * - 35 Visitors & 40 Visitor Passes
 * - 60 Complaints across hostels, mess, academics, maintenance
 * - 25 Campus & Departmental Announcements
 * - 350+ User Notifications
 * - 80 Wellbeing Check-ins with Counselor reviews
 * - 12 AI Safety Insights & Hotspot Predictions
 * - 150 Audit Log entries
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateUUID() {
    return crypto.randomUUID();
}

function escapeSQL(str) {
    if (str === null || str === undefined) return 'NULL';
    return "'" + str.replace(/'/g, "''") + "'";
}

function jsonSQL(obj) {
    if (obj === null || obj === undefined) return "'{}'::jsonb";
    return "'" + JSON.stringify(obj).replace(/'/g, "''") + "'::jsonb";
}

function arraySQL(arr) {
    if (!arr || arr.length === 0) return "'{}'";
    const items = arr.map(x => '"' + String(x).replace(/"/g, '\\"') + '"').join(',');
    return "'{" + items + "}'";
}

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
    const val = Math.random() * (max - min) + min;
    return parseFloat(val.toFixed(decimals));
}

// Names pools for realistic fictional Indian campus context
const firstNamesMale = [
    "Aarav", "Aditya", "Rohan", "Vikram", "Kabir", "Arjun", "Siddharth", "Rahul", "Dev", "Karan",
    "Manish", "Abhishek", "Nikhil", "Pranav", "Varun", "Ankit", "Gaurav", "Suresh", "Ramesh", "Deepak",
    "Ashish", "Sachin", "Vijay", "Rajesh", "Amit", "Sumit", "Vivek", "Harsh", "Praveen", "Alok",
    "Tanmay", "Kunal", "Rajat", "Sameer", "Tarun", "Mayank", "Shashank", "Tushar", "Nitin", "Yash"
];

const firstNamesFemale = [
    "Priya", "Ananya", "Sneha", "Riya", "Pooja", "Neha", "Divya", "Kavya", "Tanvi", "Shreya",
    "Meera", "Aadhya", "Ishita", "Anushka", "Nandini", "Swati", "Rashmi", "Aditi", "Simran", "Vandana",
    "Bhavna", "Sunita", "Deepika", "Preeti", "Komal", "Shruti", "Pallavi", "Monika", "Payal", "Garima",
    "Anjali", "Vidya", "Sanya", "Isha", "Mitali", "Trisha", "Natasha", "Archana", "Sakshi", "Kritika"
];

const lastNames = [
    "Sharma", "Verma", "Gupta", "Malhotra", "Mehta", "Patel", "Reddy", "Nair", "Iyer", "Choudhury",
    "Singh", "Bose", "Mukherjee", "Chatterjee", "Kapoor", "Bhatia", "Joshi", "Kulkarni", "Deshmukh", "Rao",
    "Pillai", "Das", "Banerjee", "Saxena", "Mishra", "Pandey", "Tripathi", "Shukla", "Agrawal", "Bansal",
    "Goel", "Garg", "Sengupta", "Menon", "Krishnan", "Hegde", "Shetty", "Venkatesh", "Ghosh", "Dutta"
];

function generateFullName(gender = null) {
    const isFemale = gender ? gender === 'F' : Math.random() > 0.5;
    const first = isFemale ? randomChoice(firstNamesFemale) : randomChoice(firstNamesMale);
    const last = randomChoice(lastNames);
    return { fullName: `${first} ${last}`, gender: isFemale ? 'F' : 'M' };
}

// Fixed UUIDs for predictable key actors
const SUPER_ADMIN_ID = "10000000-0000-0000-0000-000000000001";
const ADMIN_ID = "10000000-0000-0000-0000-000000000002";
const CHIEF_SECURITY_ID = "10000000-0000-0000-0000-000000000003";
const LEAD_WARDEN_ID = "10000000-0000-0000-0000-000000000004";
const LEAD_COUNSELOR_ID = "10000000-0000-0000-0000-000000000005";
const HERO_STUDENT_ID = "20000000-0000-0000-0000-000000000001"; // Priya Sharma (Demo Hero)
const HERO_PARENT_ID = "30000000-0000-0000-0000-000000000001"; // Rajesh Sharma (Parent)

console.log("Generating CampusShield AI database seed script...");

const sql = [];

sql.push(`-- ==============================================================================`);
sql.push(`-- CampusShield AI — Comprehensive Production-Grade Seed Data`);
sql.push(`-- Generated for Supabase PostgreSQL`);
sql.push(`-- ==============================================================================\n`);

sql.push(`-- Disable triggers temporarily during bulk insert for high performance`);
sql.push(`SET session_replication_role = 'replica';\n`);

// 1. Roles
sql.push(`-- 1. Insert System Roles`);
const roles = [
    { name: 'super_admin', display: 'Super Administrator', desc: 'Full institutional & security control', level: 1 },
    { name: 'admin', display: 'Institution Administrator', desc: 'Campus operations and resource management', level: 10 },
    { name: 'security', display: 'Campus Security Officer', desc: 'Live safety command, incident response & patrol', level: 20 },
    { name: 'warden', display: 'Hostel Warden', desc: 'Hostel discipline, resident safety and room allocation', level: 30 },
    { name: 'counselor', display: 'Mental Health Counselor', desc: 'Student wellbeing, distress intervention & counseling', level: 35 },
    { name: 'medical_staff', display: 'Campus Health Center Staff', desc: 'Medical emergency first response', level: 35 },
    { name: 'faculty', display: 'Faculty Member / Professor', desc: 'Academic teaching, attendance and grade evaluations', level: 40 },
    { name: 'transport_admin', display: 'Transport Administrator', desc: 'Campus shuttle logistics & fleet security', level: 50 },
    { name: 'receptionist', display: 'Visitor Desk Receptionist', desc: 'Campus visitor check-in & gate pass validation', level: 60 },
    { name: 'student', display: 'Enrolled Student', desc: 'Campus member, incident reporter, SOS user & learner', level: 100 },
    { name: 'parent', display: 'Parent / Guardian', desc: 'Authorized observer for ward attendance, safety alerts & grades', level: 110 }
];

for (const r of roles) {
    sql.push(`INSERT INTO roles (id, name, display_name, description, hierarchy_level, permissions) VALUES (
        gen_random_uuid(), ${escapeSQL(r.name)}, ${escapeSQL(r.display)}, ${escapeSQL(r.desc)}, ${r.level},
        ${jsonSQL(["read:all", "write:domain"])}
    ) ON CONFLICT (name) DO UPDATE SET display_name = EXCLUDED.display_name;`);
}
sql.push('');

// 2. Departments
sql.push(`-- 2. Insert Departments`);
const departments = [
    { id: generateUUID(), code: 'CSE', name: 'Computer Science & Engineering', type: 'academic', building: 'Tech Park Block A', email: 'cse.dept@campusshield.edu', phone: '+91 80 4123 9001' },
    { id: generateUUID(), code: 'ECE', name: 'Electronics & Communication', type: 'academic', building: 'Science & Innovation Tower', email: 'ece.dept@campusshield.edu', phone: '+91 80 4123 9002' },
    { id: generateUUID(), code: 'MECH', name: 'Mechanical Engineering', type: 'academic', building: 'Engineering Workshop Complex', email: 'mech.dept@campusshield.edu', phone: '+91 80 4123 9003' },
    { id: generateUUID(), code: 'MGMT', name: 'School of Management Studies', type: 'academic', building: 'Management Annex', email: 'mgmt.dept@campusshield.edu', phone: '+91 80 4123 9004' },
    { id: generateUUID(), code: 'SEC_OPS', name: 'Campus Safety & Rapid Response', type: 'safety', building: 'Central Command & Security Gate 1', email: 'security.hq@campusshield.edu', phone: '+91 80 4123 9999' },
    { id: generateUUID(), code: 'HEALTH', name: 'Campus Health & Wellness Center', type: 'support', building: 'Medical Center', email: 'health.center@campusshield.edu', phone: '+91 80 4123 9108' }
];

for (const d of departments) {
    sql.push(`INSERT INTO departments (id, code, name, type, building, contact_email, contact_phone) VALUES (
        '${d.id}', ${escapeSQL(d.code)}, ${escapeSQL(d.name)}, ${escapeSQL(d.type)}, ${escapeSQL(d.building)}, ${escapeSQL(d.email)}, ${escapeSQL(d.phone)}
    ) ON CONFLICT (code) DO NOTHING;`);
}
sql.push('');

// 3. Campus Locations (SVG Grid Coordinates + Real Campus Geolocation)
sql.push(`-- 3. Insert Campus Locations`);
const campusLocations = [
    { id: generateUUID(), code: 'GATE_01', name: 'Main Security Gate (North)', zone: 'North Perimeter', type: 'gate', svg_x: 50.0, svg_y: 450.0, lat: 12.9716, lng: 77.5946, risk: 'low', hotspot: false, capacity: 50 },
    { id: generateUUID(), code: 'GATE_02', name: 'South Service Gate', zone: 'South Perimeter', type: 'gate', svg_x: 520.0, svg_y: 480.0, lat: 12.9680, lng: 77.5920, risk: 'medium', hotspot: true, capacity: 30 },
    { id: generateUUID(), code: 'ADMIN_BLK', name: 'Dr. APJ Abdul Kalam Admin Block', zone: 'Central Campus', type: 'building', svg_x: 200.0, svg_y: 300.0, lat: 12.9725, lng: 77.5950, risk: 'low', hotspot: false, capacity: 600 },
    { id: generateUUID(), code: 'TECH_PARK', name: 'Turing Computer Science Complex', zone: 'Academic Hub', type: 'building', svg_x: 280.0, svg_y: 180.0, lat: 12.9732, lng: 77.5960, risk: 'low', hotspot: false, capacity: 1500 },
    { id: generateUUID(), code: 'CHEM_LAB', name: 'Chemistry & Materials Research Labs', zone: 'Academic Hub', type: 'lab', svg_x: 350.0, svg_y: 200.0, lat: 12.9735, lng: 77.5970, risk: 'high', hotspot: true, capacity: 250 },
    { id: generateUUID(), code: 'LIBRARY', name: 'Rabindranath Tagore Central Library', zone: 'Central Campus', type: 'building', svg_x: 300.0, svg_y: 350.0, lat: 12.9718, lng: 77.5955, risk: 'low', hotspot: false, capacity: 1000 },
    { id: generateUUID(), code: 'HOSTEL_A', name: 'Aryabhata Boys Hostel (Block A)', zone: 'Hostel Quad', type: 'hostel', svg_x: 500.0, svg_y: 150.0, lat: 12.9750, lng: 77.5980, risk: 'medium', hotspot: false, capacity: 500 },
    { id: generateUUID(), code: 'HOSTEL_B', name: 'Kalpana Chawla Girls Hostel (Block B)', zone: 'Hostel Quad', type: 'hostel', svg_x: 500.0, svg_y: 300.0, lat: 12.9745, lng: 77.5990, risk: 'medium', hotspot: true, capacity: 500 },
    { id: generateUUID(), code: 'SPORTS_CPX', name: 'Olympia Sports Arena & Stadium', zone: 'West Wing', type: 'sports', svg_x: 150.0, svg_y: 100.0, lat: 12.9705, lng: 77.5930, risk: 'low', hotspot: false, capacity: 2000 },
    { id: generateUUID(), code: 'CAFETERIA', name: 'Food Court & Student Commons', zone: 'Central Campus', type: 'cafeteria', svg_x: 250.0, svg_y: 250.0, lat: 12.9720, lng: 77.5948, risk: 'medium', hotspot: true, capacity: 800 },
    { id: generateUUID(), code: 'PARKING_LOT', name: 'North Multi-level Vehicle Parking', zone: 'North Perimeter', type: 'parking', svg_x: 100.0, svg_y: 450.0, lat: 12.9712, lng: 77.5940, risk: 'high', hotspot: true, capacity: 400 },
    { id: generateUUID(), code: 'AUDITORIUM', name: 'Grand Vikram Sarabhai Auditorium', zone: 'Central Campus', type: 'building', svg_x: 400.0, svg_y: 400.0, lat: 12.9710, lng: 77.5965, risk: 'low', hotspot: false, capacity: 2500 },
    { id: generateUUID(), code: 'MED_CENTRE', name: 'Sushruta Campus Hospital & Emergency', zone: 'North Perimeter', type: 'facility', svg_x: 120.0, svg_y: 320.0, lat: 12.9719, lng: 77.5938, risk: 'low', hotspot: false, capacity: 100 },
    { id: generateUUID(), code: 'WORKSHOP', name: 'Heavy Machinery & Robotics Bay', zone: 'South Perimeter', type: 'lab', svg_x: 420.0, svg_y: 110.0, lat: 12.9760, lng: 77.5960, risk: 'high', hotspot: true, capacity: 150 },
    { id: generateUUID(), code: 'LAKE_GARDEN', name: 'Eco Lake & Botanical Garden', zone: 'East Perimeter', type: 'open_area', svg_x: 480.0, svg_y: 420.0, lat: 12.9695, lng: 77.6000, risk: 'medium', hotspot: true, capacity: 300 },
    { id: generateUUID(), code: 'BUS_TERMINAL', name: 'Campus Shuttle Station & Transit Depot', zone: 'South Perimeter', type: 'entry', svg_x: 460.0, svg_y: 490.0, lat: 12.9685, lng: 77.5935, risk: 'low', hotspot: false, capacity: 200 }
];

for (const loc of campusLocations) {
    sql.push(`INSERT INTO campus_locations (id, code, name, zone, type, svg_x, svg_y, latitude, longitude, risk_level, is_emergency_hotspot, capacity) VALUES (
        '${loc.id}', ${escapeSQL(loc.code)}, ${escapeSQL(loc.name)}, ${escapeSQL(loc.zone)}, ${escapeSQL(loc.type)}, ${loc.svg_x}, ${loc.svg_y}, ${loc.lat}, ${loc.lng}, ${escapeSQL(loc.risk)}, ${loc.hotspot}, ${loc.capacity}
    ) ON CONFLICT (code) DO NOTHING;`);
}
sql.push('');

// 4. Staff Profiles: Admin, Security, Wardens, Counselors
sql.push(`-- 4. Insert Security and Administrative Staff Profiles`);
const adminSecurityStaff = [
    { id: SUPER_ADMIN_ID, email: 'superadmin@campusshield.edu', name: 'Dr. Alok Kumar', role: 'super_admin', dept: departments[0].id, phone: '+91 98800 11001' },
    { id: ADMIN_ID, email: 'admin.director@campusshield.edu', name: 'Dr. Sunita Deshmukh', role: 'admin', dept: departments[3].id, phone: '+91 98800 11002' },
    { id: CHIEF_SECURITY_ID, email: 'chief.security@campusshield.edu', name: 'Col. Rajesh Sharma (Retd)', role: 'security', dept: departments[4].id, phone: '+91 98800 11003' },
    { id: LEAD_WARDEN_ID, email: 'warden.chief@campusshield.edu', name: 'Dr. Vandana Iyer', role: 'warden', dept: departments[1].id, phone: '+91 98800 11004' },
    { id: LEAD_COUNSELOR_ID, email: 'counselor.lead@campusshield.edu', name: 'Dr. Meera Sengupta', role: 'counselor', dept: departments[5].id, phone: '+91 98800 11005' },
    { id: generateUUID(), email: 'sec.officer1@campusshield.edu', name: 'Inspector Vikram Rathore', role: 'security', dept: departments[4].id, phone: '+91 98800 11006' },
    { id: generateUUID(), email: 'sec.officer2@campusshield.edu', name: 'Officer Suresh Patil', role: 'security', dept: departments[4].id, phone: '+91 98800 11007' },
    { id: generateUUID(), email: 'sec.officer3@campusshield.edu', name: 'Officer Ananya Das', role: 'security', dept: departments[4].id, phone: '+91 98800 11008' },
    { id: generateUUID(), email: 'sec.officer4@campusshield.edu', name: 'Officer Praveen Nair', role: 'security', dept: departments[4].id, phone: '+91 98800 11009' },
    { id: generateUUID(), email: 'sec.officer5@campusshield.edu', name: 'Officer Garima Choudhury', role: 'security', dept: departments[4].id, phone: '+91 98800 11010' },
    { id: generateUUID(), email: 'warden.boys@campusshield.edu', name: 'Prof. Ramesh Rao', role: 'warden', dept: departments[2].id, phone: '+91 98800 11011' },
    { id: generateUUID(), email: 'medical.doctor@campusshield.edu', name: 'Dr. Deepak Verma (MD)', role: 'medical_staff', dept: departments[5].id, phone: '+91 98800 11012' },
    { id: generateUUID(), email: 'transport.head@campusshield.edu', name: 'Rajat Kapoor', role: 'transport_admin', dept: departments[4].id, phone: '+91 98800 11013' },
    { id: generateUUID(), email: 'reception.gate1@campusshield.edu', name: 'Sneha Kulkarni', role: 'receptionist', dept: departments[4].id, phone: '+91 98800 11014' },
    { id: generateUUID(), email: 'reception.admin@campusshield.edu', name: 'Karan Saxena', role: 'receptionist', dept: departments[3].id, phone: '+91 98800 11015' }
];

for (const s of adminSecurityStaff) {
    sql.push(`INSERT INTO profiles (id, email, full_name, role, department_id, phone, avatar_url, is_active, emergency_contact) VALUES (
        '${s.id}', ${escapeSQL(s.email)}, ${escapeSQL(s.name)}, ${escapeSQL(s.role)}, '${s.dept}', ${escapeSQL(s.phone)},
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', true,
        '{"name": "Emergency Desk", "relationship": "HQ", "phone": "+91 80 4123 9999"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;`);
}
sql.push('');

// 5. Faculty Profiles (55 Faculty members)
sql.push(`-- 5. Insert 55 Faculty Profiles & Faculty Records`);
const facultyList = [];
const designations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Dean', 'HOD'];
const specializations = [
    'Artificial Intelligence & Deep Learning', 'Cybersecurity & Cryptography', 'Cloud Distributed Systems',
    'VLSI & Embedded Systems', 'Signal Processing & IoT', 'Robotics & Automation',
    'Thermal & Fluid Dynamics', 'Computational Mechanics', 'Operations & Supply Chain',
    'FinTech & Quantitative Finance', 'Human Centered Computing', 'Biomedical Informatics'
];

for (let i = 1; i <= 55; i++) {
    const { fullName } = generateFullName();
    const fId = generateUUID();
    const dept = departments[i % 4]; // Distribute across academic departments
    const empId = `EMP-FAC-${String(i).padStart(4, '0')}`;
    const email = `faculty.${i}@campusshield.edu`;
    const desig = i <= 4 ? 'HOD' : (i <= 8 ? 'Professor' : (i <= 25 ? 'Associate Professor' : 'Assistant Professor'));
    const spec = specializations[i % specializations.length];

    facultyList.push({ id: fId, empId, fullName, deptId: dept.id, email, desig, spec });

    sql.push(`INSERT INTO profiles (id, email, full_name, role, department_id, phone, avatar_url, is_active) VALUES (
        '${fId}', ${escapeSQL(email)}, ${escapeSQL('Dr. ' + fullName)}, 'faculty', '${dept.id}',
        '+91 97700 ${String(10000 + i)}', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', true
    ) ON CONFLICT (id) DO NOTHING;`);

    sql.push(`INSERT INTO faculty (id, profile_id, employee_id, department_id, designation, specialization, highest_qualification, office_room, joining_date) VALUES (
        gen_random_uuid(), '${fId}', ${escapeSQL(empId)}, '${dept.id}', ${escapeSQL(desig)}, ${escapeSQL(spec)},
        'Ph.D in Engineering / Science', 'Room ${100 + (i % 30)}', '2019-07-15'
    ) ON CONFLICT (employee_id) DO NOTHING;`);
}
sql.push('');

// 6. Courses (12 Comprehensive Degree Programs)
sql.push(`-- 6. Insert Courses`);
const courses = [
    { id: generateUUID(), code: 'CS-BTECH', name: 'Bachelor of Technology in Computer Science', dept: departments[0].id, degree: 'B.Tech', years: 4, sems: 8, credits: 160 },
    { id: generateUUID(), code: 'AI-BTECH', name: 'B.Tech in Artificial Intelligence & Data Science', dept: departments[0].id, degree: 'B.Tech', years: 4, sems: 8, credits: 164 },
    { id: generateUUID(), code: 'CS-MTECH', name: 'Master of Technology in Cyber Security', dept: departments[0].id, degree: 'M.Tech', years: 2, sems: 4, credits: 80 },
    { id: generateUUID(), code: 'EC-BTECH', name: 'B.Tech in Electronics & Communication', dept: departments[1].id, degree: 'B.Tech', years: 4, sems: 8, credits: 160 },
    { id: generateUUID(), code: 'IOT-BTECH', name: 'B.Tech in IoT & Sensor Systems', dept: departments[1].id, degree: 'B.Tech', years: 4, sems: 8, credits: 160 },
    { id: generateUUID(), code: 'VLSI-MTECH', name: 'M.Tech in VLSI Design', dept: departments[1].id, degree: 'M.Tech', years: 2, sems: 4, credits: 80 },
    { id: generateUUID(), code: 'ME-BTECH', name: 'B.Tech in Mechanical Engineering', dept: departments[2].id, degree: 'B.Tech', years: 4, sems: 8, credits: 160 },
    { id: generateUUID(), code: 'ROBO-BTECH', name: 'B.Tech in Robotics & Mechatronics', dept: departments[2].id, degree: 'B.Tech', years: 4, sems: 8, credits: 164 },
    { id: generateUUID(), code: 'MBA-CORE', name: 'Master of Business Administration (Core)', dept: departments[3].id, degree: 'MBA', years: 2, sems: 4, credits: 96 },
    { id: generateUUID(), code: 'BBA-BA', name: 'Bachelor of Business Administration (Analytics)', dept: departments[3].id, degree: 'BBA', years: 3, sems: 6, credits: 120 },
    { id: generateUUID(), code: 'CS-PHD', name: 'Doctor of Philosophy in Computer Science', dept: departments[0].id, degree: 'Ph.D', years: 5, sems: 10, credits: 40 },
    { id: generateUUID(), code: 'EC-PHD', name: 'Doctor of Philosophy in Electronics', dept: departments[1].id, degree: 'Ph.D', years: 5, sems: 10, credits: 40 }
];

for (const c of courses) {
    sql.push(`INSERT INTO courses (id, code, name, department_id, degree_type, duration_years, total_semesters, total_credits) VALUES (
        '${c.id}', ${escapeSQL(c.code)}, ${escapeSQL(c.name)}, '${c.dept}', ${escapeSQL(c.degree)}, ${c.years}, ${c.sems}, ${c.credits}
    ) ON CONFLICT (code) DO NOTHING;`);
}
sql.push('');

// 7. Students (520 Fictional Students)
sql.push(`-- 7. Insert 520 Students & Student Profiles`);
const studentList = [];

// Hero Student: Priya Sharma
studentList.push({
    profileId: HERO_STUDENT_ID,
    studentId: generateUUID(),
    enrollmentNo: 'ENR-2023-CS-0001',
    rollNo: '23CS001',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@campusshield.edu',
    courseId: courses[0].id,
    deptId: departments[0].id,
    semester: 6,
    section: 'A',
    batchYear: 2023,
    cgpa: 9.42,
    gender: 'F'
});

sql.push(`INSERT INTO profiles (id, email, full_name, role, department_id, phone, avatar_url, is_active, emergency_contact) VALUES (
    '${HERO_STUDENT_ID}', 'priya.sharma@campusshield.edu', 'Priya Sharma', 'student', '${departments[0].id}',
    '+91 99001 22001', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', true,
    '{"name": "Rajesh Sharma", "relationship": "Father", "phone": "+91 98450 11223"}'::jsonb
) ON CONFLICT (id) DO NOTHING;`);

sql.push(`INSERT INTO students (id, profile_id, enrollment_no, roll_no, course_id, department_id, current_semester, section, batch_year, academic_standing, cgpa, attendance_percentage, blood_group) VALUES (
    '${studentList[0].studentId}', '${HERO_STUDENT_ID}', 'ENR-2023-CS-0001', '23CS001', '${courses[0].id}', '${departments[0].id}',
    6, 'A', 2023, 'Dean List', 9.42, 94.50, 'O+'
) ON CONFLICT (enrollment_no) DO NOTHING;`);

// Generate remaining 519 students
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
for (let i = 2; i <= 520; i++) {
    const { fullName, gender } = generateFullName();
    const pId = generateUUID();
    const sId = generateUUID();
    const courseIndex = (i - 2) % courses.length;
    const selectedCourse = courses[courseIndex];
    const deptId = selectedCourse.dept;
    const batchYear = 2022 + ((i % 4));
    const currentSemester = (2026 - batchYear) * 2 - (i % 2 === 0 ? 0 : 1);
    const validSem = Math.min(Math.max(currentSemester, 1), selectedCourse.sems);
    const section = (i % 3 === 0) ? 'B' : ((i % 5 === 0) ? 'C' : 'A');
    const enrollNo = `ENR-${batchYear}-${selectedCourse.code.substring(0, 3)}-${String(i).padStart(4, '0')}`;
    const rollNo = `${String(batchYear).substring(2)}${selectedCourse.code.substring(0, 2)}${String(i).padStart(3, '0')}`;
    const cgpa = randomFloat(6.20, 9.85, 2);
    const attendancePct = randomFloat(72.00, 98.50, 2);
    const email = `student.${i}@campusshield.edu`;

    studentList.push({
        profileId: pId,
        studentId: sId,
        enrollmentNo: enrollNo,
        rollNo,
        fullName,
        email,
        courseId: selectedCourse.id,
        deptId,
        semester: validSem,
        section,
        batchYear,
        cgpa,
        gender
    });

    sql.push(`INSERT INTO profiles (id, email, full_name, role, department_id, phone, avatar_url, is_active) VALUES (
        '${pId}', ${escapeSQL(email)}, ${escapeSQL(fullName)}, 'student', '${deptId}',
        '+91 9900${String(10000 + i)}', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', true
    ) ON CONFLICT (id) DO NOTHING;`);

    sql.push(`INSERT INTO students (id, profile_id, enrollment_no, roll_no, course_id, department_id, current_semester, section, batch_year, academic_standing, cgpa, attendance_percentage, blood_group) VALUES (
        '${sId}', '${pId}', ${escapeSQL(enrollNo)}, ${escapeSQL(rollNo)}, '${selectedCourse.id}', '${deptId}',
        ${validSem}, ${escapeSQL(section)}, ${batchYear}, ${cgpa >= 8.5 ? "'Dean List'" : (cgpa < 6.5 ? "'Academic Probation'" : "'Good Standing'")},
        ${cgpa}, ${attendancePct}, ${escapeSQL(randomChoice(bloodGroups))}
    ) ON CONFLICT (enrollment_no) DO NOTHING;`);
}
sql.push('');

// 8. Parents & Parent-Student Links (120 Parents linked to students)
sql.push(`-- 8. Insert Parents and Parent-Student Links`);
// Hero Parent
sql.push(`INSERT INTO profiles (id, email, full_name, role, phone, is_active) VALUES (
    '${HERO_PARENT_ID}', 'rajesh.sharma.parent@campusshield.edu', 'Rajesh Sharma', 'parent', '+91 98450 11223', true
) ON CONFLICT (id) DO NOTHING;`);

const heroParentRecordId = generateUUID();
sql.push(`INSERT INTO parents (id, profile_id, occupation, address, city, state, postal_code, alternate_phone) VALUES (
    '${heroParentRecordId}', '${HERO_PARENT_ID}', 'Senior Mechanical Consultant', '42 Palm Avenue, Indiranagar', 'Bengaluru', 'Karnataka', '560038', '+91 98450 99887'
) ON CONFLICT (id) DO NOTHING;`);

sql.push(`INSERT INTO parent_student_links (parent_id, student_id, relationship, is_primary_contact, can_view_grades, can_view_attendance, can_view_safety_alerts) VALUES (
    '${heroParentRecordId}', '${studentList[0].studentId}', 'father', true, true, true, true
) ON CONFLICT DO NOTHING;`);

// Other parents
for (let p = 2; p <= 120; p++) {
    const parentProfileId = generateUUID();
    const parentRecordId = generateUUID();
    const targetStudent = studentList[p - 1];
    const parentLastName = targetStudent.fullName.split(' ')[1] || 'Gupta';
    const parentName = `Mr. ${randomChoice(firstNamesMale)} ${parentLastName}`;
    const pEmail = `parent.${p}@campusshield.edu`;

    sql.push(`INSERT INTO profiles (id, email, full_name, role, phone, is_active) VALUES (
        '${parentProfileId}', ${escapeSQL(pEmail)}, ${escapeSQL(parentName)}, 'parent', '+91 98450 ${String(20000 + p)}', true
    ) ON CONFLICT (id) DO NOTHING;`);

    sql.push(`INSERT INTO parents (id, profile_id, occupation, address, city, state) VALUES (
        '${parentRecordId}', '${parentProfileId}', ${escapeSQL(randomChoice(['Civil Engineer', 'Bank Manager', 'Teacher', 'Doctor', 'Chartered Accountant', 'Entrepreneur']))},
        'Sector ${p % 20}, Green Park', 'Bengaluru', 'Karnataka'
    ) ON CONFLICT (id) DO NOTHING;`);

    sql.push(`INSERT INTO parent_student_links (parent_id, student_id, relationship, is_primary_contact, can_view_grades, can_view_attendance, can_view_safety_alerts) VALUES (
        '${parentRecordId}', '${targetStudent.studentId}', 'father', true, true, true, true
    ) ON CONFLICT DO NOTHING;`);
}
sql.push('');

// 9. Hostels and Rooms
sql.push(`-- 9. Insert Hostels, Rooms and Allocations`);
const hostels = [
    { id: generateUUID(), code: 'HOSTEL_A', name: 'Aryabhata Boys Hostel Block A', type: 'boys', floors: 4, rooms: 40, loc: campusLocations[6].id },
    { id: generateUUID(), code: 'HOSTEL_B', name: 'Kalpana Chawla Girls Hostel Block B', type: 'girls', floors: 4, rooms: 40, loc: campusLocations[7].id },
    { id: generateUUID(), code: 'HOSTEL_C', name: 'Ramanujan Senior Scholars Hostel', type: 'boys', floors: 3, rooms: 30, loc: campusLocations[6].id },
    { id: generateUUID(), code: 'HOSTEL_D', name: 'Gargi International Scholars Hostel', type: 'girls', floors: 3, rooms: 30, loc: campusLocations[7].id }
];

const allRooms = [];
for (const h of hostels) {
    sql.push(`INSERT INTO hostels (id, code, name, type, total_floors, total_rooms, location_id, contact_phone) VALUES (
        '${h.id}', ${escapeSQL(h.code)}, ${escapeSQL(h.name)}, ${escapeSQL(h.type)}, ${h.floors}, ${h.rooms}, '${h.loc}', '+91 80 4123 9050'
    ) ON CONFLICT (code) DO NOTHING;`);

    for (let floor = 1; floor <= h.floors; floor++) {
        for (let r = 1; r <= 10; r++) {
            const roomId = generateUUID();
            const roomNum = `${floor}${String(r).padStart(2, '0')}`;
            allRooms.push({ id: roomId, hostelId: h.id, roomNum });
            sql.push(`INSERT INTO rooms (id, hostel_id, room_number, floor, capacity, current_occupancy, status) VALUES (
                '${roomId}', '${h.id}', ${escapeSQL(roomNum)}, ${floor}, 2, 2, 'occupied'
            ) ON CONFLICT (hostel_id, room_number) DO NOTHING;`);
        }
    }
}

// Allocate students to rooms
for (let i = 0; i < Math.min(studentList.length, 250); i++) {
    const student = studentList[i];
    const room = allRooms[i % allRooms.length];
    sql.push(`INSERT INTO hostel_allocations (id, room_id, student_id, check_in_date, status) VALUES (
        gen_random_uuid(), '${room.id}', '${student.studentId}', '2025-08-01', 'active'
    ) ON CONFLICT DO NOTHING;`);
}
sql.push('');

// 10. Timetable Data (Weekly schedules across courses)
sql.push(`-- 10. Insert Timetable Schedules`);
const subjectsCS = [
    { code: 'CS301', name: 'Operating Systems & Concurrency' },
    { code: 'CS302', name: 'Database Management Systems' },
    { code: 'CS303', name: 'Computer Networks & Security' },
    { code: 'CS304', name: 'Design and Analysis of Algorithms' },
    { code: 'CS305', name: 'Machine Learning Foundations' },
    { code: 'CS306', name: 'Software Engineering & Cloud Architecture' }
];

const timeSlots = [
    { start: '09:00:00', end: '10:00:00' },
    { start: '10:00:00', end: '11:00:00' },
    { start: '11:15:00', end: '12:15:00' },
    { start: '12:15:00', end: '13:15:00' },
    { start: '14:00:00', end: '15:00:00' },
    { start: '15:00:00', end: '16:00:00' }
];

for (let day = 1; day <= 5; day++) { // Monday to Friday
    for (let slotIdx = 0; slotIdx < timeSlots.length; slotIdx++) {
        const slot = timeSlots[slotIdx];
        const sub = subjectsCS[(day + slotIdx) % subjectsCS.length];
        const fac = facultyList[(day * 3 + slotIdx) % facultyList.length];

        sql.push(`INSERT INTO timetable (course_id, semester, section, subject_code, subject_name, day_of_week, start_time, end_time, faculty_id, location_id, room_number) VALUES (
            '${courses[0].id}', 6, 'A', ${escapeSQL(sub.code)}, ${escapeSQL(sub.name)}, ${day}, '${slot.start}', '${slot.end}',
            '${fac.id}', '${campusLocations[3].id}', 'LH-204'
        );`);
    }
}
sql.push('');

// 11. Attendance Records (Over 5,000 attendance entries across students & dates)
sql.push(`-- 11. Insert Real Attendance Records`);
const attendanceDates = [
    '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20'
];

for (const dateStr of attendanceDates) {
    for (let sIdx = 0; sIdx < Math.min(studentList.length, 300); sIdx++) {
        const student = studentList[sIdx];
        for (const sub of subjectsCS.slice(0, 4)) {
            const rand = Math.random();
            const status = rand > 0.12 ? 'present' : (rand > 0.05 ? 'absent' : 'late');
            sql.push(`INSERT INTO attendance (student_id, course_id, subject_code, date, status, marked_by_profile_id) VALUES (
                '${student.studentId}', '${student.courseId}', ${escapeSQL(sub.code)}, '${dateStr}', '${status}', '${facultyList[0].id}'
            ) ON CONFLICT (student_id, subject_code, date) DO NOTHING;`);
        }
    }
}
sql.push('');

// 12. Exams and Results
sql.push(`-- 12. Insert Exams and Exam Results`);
const midTermExams = [
    { code: 'CS301', name: 'Operating Systems Mid-Term', date: '2026-03-10' },
    { code: 'CS302', name: 'DBMS Mid-Term', date: '2026-03-12' },
    { code: 'CS303', name: 'Computer Networks Mid-Term', date: '2026-03-15' },
    { code: 'CS304', name: 'Algorithms Mid-Term', date: '2026-03-18' }
];

for (const ex of midTermExams) {
    const examId = generateUUID();
    sql.push(`INSERT INTO exams (id, course_id, semester, exam_name, subject_code, subject_name, exam_date, start_time, end_time, max_marks, passing_marks, location_id, room_number) VALUES (
        '${examId}', '${courses[0].id}', 6, ${escapeSQL(ex.name)}, ${escapeSQL(ex.code)}, ${escapeSQL(ex.name)},
        '${ex.date}', '10:00:00', '12:00:00', 50.00, 20.00, '${campusLocations[11].id}', 'Auditorium Hall 1'
    );`);

    // Results for top 50 CS students
    for (let i = 0; i < 50; i++) {
        const student = studentList[i];
        const marks = i === 0 ? 48.5 : randomFloat(22.0, 49.0, 1);
        const grade = marks >= 45 ? 'A+' : (marks >= 40 ? 'A' : (marks >= 30 ? 'B' : 'C'));
        sql.push(`INSERT INTO exam_results (exam_id, student_id, marks_obtained, grade, graded_by_profile_id, published_at) VALUES (
            '${examId}', '${student.studentId}', ${marks}, '${grade}', '${facultyList[0].id}', '2026-03-25 10:00:00+05:30'
        ) ON CONFLICT (exam_id, student_id) DO NOTHING;`);
    }
}
sql.push('');

// 13. Placements & Applications
sql.push(`-- 13. Insert Placement Drives & Applications`);
const placementsData = [
    { company: 'Google India', role: 'Software Engineer - University Graduate', lpa: 32.50, loc: 'Bengaluru / Hyderabad', date: '2026-09-15', minCgpa: 8.5 },
    { company: 'Microsoft', role: 'Security & Cloud Solutions Engineer', lpa: 28.00, loc: 'Hyderabad', date: '2026-09-20', minCgpa: 8.0 },
    { company: 'CrowdStrike', role: 'Threat Intelligence & Security Analyst', lpa: 24.00, loc: 'Pune / Remote', date: '2026-09-25', minCgpa: 7.5 },
    { company: 'Amazon Web Services', role: 'Cloud Support Associate', lpa: 20.00, loc: 'Bengaluru', date: '2026-10-02', minCgpa: 7.0 },
    { company: 'Qualcomm', role: 'Embedded Systems Engineer', lpa: 22.00, loc: 'Bengaluru / Chennai', date: '2026-10-10', minCgpa: 7.5 },
    { company: 'Goldman Sachs', role: 'Operations & Quantitative Analyst', lpa: 26.00, loc: 'Bengaluru', date: '2026-10-18', minCgpa: 8.0 },
    { company: 'Tata Motors EV', role: 'Robotics & Automation Specialist', lpa: 14.50, loc: 'Pune', date: '2026-10-25', minCgpa: 6.8 },
    { company: 'Deloitte India', role: 'Cyber Risk & Governance Advisory', lpa: 12.00, loc: 'Mumbai / Gurugram', date: '2026-11-05', minCgpa: 6.5 }
];

for (const p of placementsData) {
    const pId = generateUUID();
    sql.push(`INSERT INTO placements (id, company_name, role_title, package_lpa, job_location, drive_date, application_deadline, min_cgpa, job_description, status) VALUES (
        '${pId}', ${escapeSQL(p.company)}, ${escapeSQL(p.role)}, ${p.lpa}, ${escapeSQL(p.loc)}, '${p.date}',
        '${p.date} 23:59:59+05:30', ${p.minCgpa}, 'Comprehensive on-campus placement drive for final and pre-final year candidates.', 'upcoming'
    );`);

    // Student applications
    for (let i = 0; i < 25; i++) {
        const student = studentList[i];
        if (student.cgpa >= p.minCgpa) {
            sql.push(`INSERT INTO placement_applications (placement_id, student_id, status, rounds_cleared, resume_url) VALUES (
                '${pId}', '${student.studentId}', 'applied', 0, 'https://storage.campusshield.edu/resumes/${student.enrollmentNo}.pdf'
            ) ON CONFLICT (placement_id, student_id) DO NOTHING;`);
        }
    }
}
sql.push('');

// 14. Incidents (110 Realistic Safety Incidents across categories with AI analysis)
sql.push(`-- 14. Insert 110 Comprehensive Safety Incidents with AI Classifications`);

const incidentCategories = [
    'fire', 'medical', 'theft', 'assault', 'harassment', 'vandalism',
    'suspicious_activity', 'natural_disaster', 'infrastructure', 'traffic',
    'substance_abuse', 'cybercrime', 'other'
];

const incidentTemplates = [
    {
        cat: 'fire',
        sev: 'critical',
        title: 'Chemical Lab Smoke & Chemical Flame Outbreak',
        desc: 'Dense white smoke and chemical fire burst detected on 2nd floor Chemistry Lab Room 204. Students are evacuating. Sprinklers active.',
        locIdx: 4,
        actions: ['Dispatch rapid fire suppression team', 'Evacuate Science Block A & B', 'Notify local Fire Department & Medical Center'],
        deptIdx: 4
    },
    {
        cat: 'medical',
        sev: 'high',
        title: 'Acute Heat Exhaustion & Fainting During Sports Drill',
        desc: 'Student collapsed near football grounds during inter-college football practice. Unconscious with weak pulse.',
        locIdx: 8,
        actions: ['Dispatch campus ambulance immediately', 'Administer emergency hydration & oxygen', 'Alert Sushruta Health Center triage team'],
        deptIdx: 5
    },
    {
        cat: 'theft',
        sev: 'medium',
        title: 'High-End Laptop Theft from Central Library Reading Hall',
        desc: 'Student MacBook Pro and backpack missing from 2nd floor quiet study cubicle between 14:00 and 14:30.',
        locIdx: 5,
        actions: ['Review CCTV footage camera angle 12 & 14', 'Alert perimeter security gates', 'Log device serial number'],
        deptIdx: 4
    },
    {
        cat: 'harassment',
        sev: 'high',
        title: 'Repeated Stalking & Verbal Intimidation Near Hostel Perimeter',
        desc: 'Unidentified individual on unregistered motorbike following female students walking from Library to Kalpana Chawla Hostel after 20:00.',
        locIdx: 7,
        actions: ['Increase night security patrol along East Avenue', 'Escort complainant safely to hostel', 'Flag motorbike license plate at all entry gates'],
        deptIdx: 4
    },
    {
        cat: 'infrastructure',
        sev: 'medium',
        title: 'Elevator Trapped Between Floors 3 and 4 in Tech Park',
        desc: 'Elevator No. 2 stopped abruptly with 4 students inside. Emergency alarm ringing, intercom functioning.',
        locIdx: 3,
        actions: ['Dispatch facilities elevator technician', 'Maintain constant voice communication', 'Ensure elevator ventilation fan running'],
        deptIdx: 4
    },
    {
        cat: 'cybercrime',
        sev: 'high',
        title: 'Phishing Attack Impersonating Dean Office for Exam Fees',
        desc: 'Mass fraudulent email sent to 500+ students containing malicious link claiming urgent semester registration fine payment.',
        locIdx: 2,
        actions: ['Block sender domain and malicious URL on campus DNS', 'Broadcast warning announcement to all students', 'Trigger incident response security team'],
        deptIdx: 4
    },
    {
        cat: 'suspicious_activity',
        sev: 'medium',
        title: 'Unattended Heavy Duffle Bag at North Parking Lot',
        desc: 'Black duffle bag left near EV charging station for over 2 hours with no owner in sight.',
        locIdx: 10,
        actions: ['Cordon off parking bay 14', 'Deploy bomb detection sniffers and security sweep', 'Review parking entry scan logs'],
        deptIdx: 4
    },
    {
        cat: 'traffic',
        sev: 'low',
        title: 'Minor Scooter Collision at South Gate Roundabout',
        desc: 'Two student two-wheelers brushed while taking turn. Minor scratch, no severe physical injury.',
        locIdx: 1,
        actions: ['Inspect vehicles and check driving licenses', 'Issue campus traffic speed advisory', 'Clear road blockage'],
        deptIdx: 4
    }
];

const incidentIds = [];
for (let i = 1; i <= 110; i++) {
    const incId = generateUUID();
    incidentIds.push(incId);
    const tmpl = incidentTemplates[(i - 1) % incidentTemplates.length];
    const loc = campusLocations[tmpl.locIdx % campusLocations.length];
    const reporter = studentList[(i * 3) % studentList.length];
    const assignedOfficer = adminSecurityStaff[2 + (i % 8)]; // Security staff
    const dept = departments[tmpl.deptIdx % departments.length];

    const isResolved = i > 40;
    const status = isResolved ? 'resolved' : (i % 4 === 0 ? 'responding' : (i % 3 === 0 ? 'investigating' : 'acknowledged'));
    const confidence = randomFloat(0.88, 0.99, 3);
    const priorityScore = tmpl.sev === 'critical' ? 10 : (tmpl.sev === 'high' ? 8 : (tmpl.sev === 'medium' ? 5 : 2));
    const incNumber = `INC-202602${String(10 + (i % 15)).padStart(2, '0')}-${String(i).padStart(4, '0')}`;

    const aiClassification = {
        category: tmpl.cat,
        severity: tmpl.sev,
        confidence,
        summary: `AI automated assessment: ${tmpl.title} detected at ${loc.name}. Immediate classification verified.`,
        recommended_department: dept.code,
        recommended_actions: tmpl.actions,
        requires_immediate_response: tmpl.sev === 'critical' || tmpl.sev === 'high',
        suggested_alert_level: tmpl.sev === 'critical' ? 'campus_lockdown_or_evac' : 'department_alert'
    };

    sql.push(`INSERT INTO incidents (
        id, incident_number, reporter_id, title, description, category, severity, ai_severity,
        ai_classification, ai_confidence, location_id, location_name, location_lat, location_lng,
        status, priority_score, assigned_department_id, assigned_to, is_anonymous, requires_immediate_response,
        evidence_urls, resolution_notes, resolved_at, created_at
    ) VALUES (
        '${incId}', ${escapeSQL(incNumber)}, '${reporter.profileId}', ${escapeSQL(tmpl.title + ' #' + i)},
        ${escapeSQL(tmpl.desc)}, ${escapeSQL(tmpl.cat)}, ${escapeSQL(tmpl.sev)}, ${escapeSQL(tmpl.sev)},
        ${jsonSQL(aiClassification)}, ${confidence}, '${loc.id}', ${escapeSQL(loc.name)}, ${loc.lat}, ${loc.lng},
        ${escapeSQL(status)}, ${priorityScore}, '${dept.id}', '${assignedOfficer.id}', ${i % 7 === 0},
        ${tmpl.sev === 'critical' || tmpl.sev === 'high'},
        ARRAY['https://storage.campusshield.edu/evidence/sample_${i % 5 + 1}.jpg'],
        ${isResolved ? "'Incident inspected, necessary first response executed and verified by duty officer.'" : "NULL"},
        ${isResolved ? "'2026-02-18 16:30:00+05:30'" : "NULL"},
        '2026-02-18 09:15:00+05:30'
    ) ON CONFLICT (incident_number) DO NOTHING;`);

    // Add Incident Evidence
    sql.push(`INSERT INTO incident_evidence (incident_id, file_url, file_type, file_size_bytes, caption, uploaded_by, is_verified) VALUES (
        '${incId}', 'https://storage.campusshield.edu/evidence/inc_${i}_photo1.jpg', 'image/jpeg', 2048500,
        'Site photograph captured by reporter', '${reporter.profileId}', true
    );`);

    // Add Incident Assignment
    sql.push(`INSERT INTO incident_assignments (incident_id, assigned_to, assigned_by, department_id, role_in_incident, status) VALUES (
        '${incId}', '${assignedOfficer.id}', '${CHIEF_SECURITY_ID}', '${dept.id}', 'lead_officer', '${isResolved ? 'completed' : 'active'}'
    );`);

    // Add Incident Timeline entries
    sql.push(`INSERT INTO incident_timeline (incident_id, actor_id, action, comment, created_at) VALUES
        ('${incId}', '${reporter.profileId}', 'reported', 'Incident reported through CampusShield Mobile Application', '2026-02-18 09:15:00+05:30'),
        ('${incId}', NULL, 'ai_classified', 'Gemini Flash AI classified category as ${tmpl.cat} with severity ${tmpl.sev} (Confidence: ${confidence})', '2026-02-18 09:15:05+05:30'),
        ('${incId}', '${assignedOfficer.id}', 'acknowledged', 'Security command center dispatched response unit', '2026-02-18 09:17:00+05:30');`);
}
sql.push('');

// 15. SOS Alerts (15 Emergency Distress Alerts)
sql.push(`-- 15. Insert 15 SOS Panic Alerts`);
for (let i = 1; i <= 15; i++) {
    const student = studentList[i % 20];
    const loc = campusLocations[(i * 2) % campusLocations.length];
    const isResolved = i > 4;
    sql.push(`INSERT INTO sos_alerts (id, user_id, location_id, location_name, location_lat, location_lng, status, responded_by, response_time_seconds, dispatch_notes, battery_level, is_silent, created_at, resolved_at) VALUES (
        gen_random_uuid(), '${student.profileId}', '${loc.id}', ${escapeSQL(loc.name)}, ${loc.lat}, ${loc.lng},
        ${isResolved ? "'resolved'" : (i === 1 ? "'active'" : "'responding'")},
        '${adminSecurityStaff[3].id}', ${randomInt(45, 180)},
        'Rapid response vehicle dispatched to exact GPS ping.', ${randomInt(40, 95)}, ${i % 3 === 0},
        '2026-02-21 10:45:00+05:30', ${isResolved ? "'2026-02-21 11:05:00+05:30'" : "NULL"}
    );`);
}
sql.push('');

// 16. Emergency Alerts (Campus-wide Broadcasts)
sql.push(`-- 16. Insert Emergency Broadcast Alerts`);
const emergencyAlerts = [
    { title: 'URGENT: Evacuate Chemistry Lab & Materials Block', msg: 'Fire alert in Room 204 Chemistry Lab. Proceed to Assembly Zone North immediately.', type: 'evacuation', sev: 'critical', active: true },
    { title: 'Severe Thunderstorm & High Wind Advisory', msg: 'Heavy rains and wind gust expected at 17:00. Outdoor activities suspended.', type: 'weather', sev: 'medium', active: true },
    { title: 'North Parking Bay Cordoned for Safety Inspection', msg: 'Please use South Gate Multi-level Parking until 16:00.', type: 'general', sev: 'low', active: false },
    { title: 'Security Advisory: Phishing SMS Alert', msg: 'Do not click on unexpected semester fee refund links.', type: 'security', sev: 'high', active: true }
];

for (const ea of emergencyAlerts) {
    sql.push(`INSERT INTO emergency_alerts (incident_id, title, message, type, severity, target_roles, is_active, created_by, expires_at) VALUES (
        '${incidentIds[0]}', ${escapeSQL(ea.title)}, ${escapeSQL(ea.msg)}, ${escapeSQL(ea.type)}, ${escapeSQL(ea.sev)},
        '{"student","faculty","parent","security","warden","admin","super_admin"}', ${ea.active}, '${SUPER_ADMIN_ID}',
        '2026-02-22 23:59:59+05:30'
    );`);
}
sql.push('');

// 17. Visitors & Visitor Passes (35 Visitors & 40 Passes)
sql.push(`-- 17. Insert 35 Visitors and Visitor Passes`);
const idTypes = ['Aadhaar', 'Passport', 'Driving License', 'Voter ID'];
for (let i = 1; i <= 35; i++) {
    const vId = generateUUID();
    const { fullName } = generateFullName();
    const phone = `+91 91234 ${String(10000 + i)}`;
    const idType = randomChoice(idTypes);
    const maskedId = idType === 'Aadhaar' ? `XXXX-XXXX-${String(1000 + i)}` : `DL-${String(800000 + i)}`;
    const org = randomChoice(['Infosys Ltd', 'TCS Research', 'Parent / Family Visitor', 'Bosch Engineering', 'Ministry of Education Inspector']);

    sql.push(`INSERT INTO visitors (id, full_name, phone, email, id_proof_type, id_proof_number_masked, organization) VALUES (
        '${vId}', ${escapeSQL(fullName)}, ${escapeSQL(phone)}, ${escapeSQL('visitor.' + i + '@external.com')},
        ${escapeSQL(idType)}, ${escapeSQL(maskedId)}, ${escapeSQL(org)}
    );`);

    const passNum = `PASS-20260221-${String(i).padStart(4, '0')}`;
    const host = facultyList[i % facultyList.length];
    const dest = campusLocations[i % campusLocations.length];
    const status = i <= 15 ? 'checked_in' : (i <= 25 ? 'checked_out' : 'pre_registered');

    sql.push(`INSERT INTO visitor_passes (pass_number, visitor_id, host_id, purpose, destination_location_id, valid_from, valid_until, check_in, status, badge_number, vehicle_number) VALUES (
        ${escapeSQL(passNum)}, '${vId}', '${host.id}', 'Campus Academic Collaboration & Seminar', '${dest.id}',
        '2026-02-21 09:00:00+05:30', '2026-02-21 18:00:00+05:30',
        ${status !== 'pre_registered' ? "'2026-02-21 09:30:00+05:30'" : "NULL"},
        '${status}', 'BADGE-V-${100 + i}', 'KA-01-EQ-${1000 + i}'
    );`);
}
sql.push('');

// 18. Complaints (55 Grievances)
sql.push(`-- 18. Insert 55 Student & Campus Complaints`);
const complaintCategories = ['hostel', 'mess', 'infrastructure', 'academics', 'transport', 'hygiene', 'security'];
const complaintSubjects = [
    'Wi-Fi signal degradation in 3rd Floor Hostel Wing',
    'Mess food quality inconsistency during dinner service',
    'Air conditioning malfunction in Lecture Hall 3',
    'Street light flickering along East Perimeter walkway',
    'Water cooler filter replacement needed in Library',
    'Shuttle bus delayed on Route 4 morning pickup'
];

for (let i = 1; i <= 55; i++) {
    const student = studentList[i % 80];
    const cat = randomChoice(complaintCategories);
    const sub = randomChoice(complaintSubjects);
    const tkt = `CMP-202602-${String(i).padStart(4, '0')}`;
    const isResolved = i > 25;
    const status = isResolved ? 'resolved' : (i % 3 === 0 ? 'in_progress' : 'open');

    sql.push(`INSERT INTO complaints (ticket_no, filed_by, category, subject, description, priority, status, assigned_to, resolution, resolved_at) VALUES (
        ${escapeSQL(tkt)}, '${student.profileId}', ${escapeSQL(cat)}, ${escapeSQL(sub + ' (Ticket #' + i + ')')},
        'Detailed grievance submitted regarding ongoing maintenance and operational issue.',
        ${i % 5 === 0 ? "'high'" : "'medium'"}, '${status}', '${adminSecurityStaff[1].id}',
        ${isResolved ? "'Maintenance team completed on-site inspection and replaced the faulty components.'" : "NULL"},
        ${isResolved ? "'2026-02-19 14:00:00+05:30'" : "NULL"}
    ) ON CONFLICT (ticket_no) DO NOTHING;`);
}
sql.push('');

// 19. Announcements (25 Broadcasts)
sql.push(`-- 19. Insert 25 Campus Announcements`);
const announcementTemplates = [
    { title: 'Annual Smart Campus Hackathon & Innovation Summit 2026', body: 'Registrations are now live for the 48-hour national hackathon. Exciting prizes and incubation opportunities.', priority: 'high', pinned: true },
    { title: 'Spring 2026 Mid-Semester Examination Schedule Published', body: 'The verified timetable for mid-semester assessments is now available on the portal.', priority: 'urgent', pinned: true },
    { title: 'Blood Donation & Free Medical Checkup Camp', body: 'Sushruta Health Center is hosting a voluntary blood donation drive on Saturday at Food Court Commons.', priority: 'normal', pinned: false },
    { title: 'Placement Drive: Google & Microsoft Pre-Placement Talks', body: 'Pre-final and final year engineering students are invited to the pre-placement orientation at Central Auditorium.', priority: 'high', pinned: false }
];

for (let i = 1; i <= 25; i++) {
    const tmpl = announcementTemplates[(i - 1) % announcementTemplates.length];
    sql.push(`INSERT INTO announcements (title, body, author_id, department_id, priority, is_pinned, published_at) VALUES (
        ${escapeSQL(tmpl.title + ' [Update ' + i + ']')}, ${escapeSQL(tmpl.body)}, '${ADMIN_ID}', '${departments[i % 4].id}',
        ${escapeSQL(tmpl.priority)}, ${tmpl.pinned && i <= 3}, '2026-02-15 08:00:00+05:30'
    );`);
}
sql.push('');

// 20. Notifications (350+ User Notifications)
sql.push(`-- 20. Insert Notifications for Users`);
for (let i = 0; i < 350; i++) {
    const user = (i % 2 === 0) ? studentList[i % studentList.length].profileId : adminSecurityStaff[i % adminSecurityStaff.length].id;
    sql.push(`INSERT INTO notifications (user_id, title, message, type, is_read, read_at) VALUES (
        '${user}', 'CampusShield Safety & Academic Notice',
        'Your requested update or campus alert has been processed in real-time.',
        'incident_alert', ${i % 2 === 0}, ${i % 2 === 0 ? "'2026-02-20 12:00:00+05:30'" : "NULL"}
    );`);
}
sql.push('');

// 21. Wellbeing Check-ins (80 Mental Health Checkins)
sql.push(`-- 21. Insert Student Wellbeing Check-ins`);
const moods = ['great', 'good', 'neutral', 'stressed', 'overwhelmed', 'crisis'];
for (let i = 1; i <= 80; i++) {
    const student = studentList[i];
    const mood = randomChoice(moods);
    const stress = mood === 'crisis' ? 10 : (mood === 'overwhelmed' ? 8 : (mood === 'stressed' ? 6 : randomInt(1, 4)));
    const needsFollowup = stress >= 8;

    sql.push(`INSERT INTO wellbeing_checkins (student_id, mood, stress_level, sleep_hours, factors, notes, requires_counselor_followup, counselor_assigned) VALUES (
        '${student.studentId}', '${mood}', ${stress}, ${randomFloat(4.5, 8.5, 1)},
        ARRAY['exams', 'sleep', 'academics'], 'Routine self-reported weekly wellbeing log.',
        ${needsFollowup}, ${needsFollowup ? `'${LEAD_COUNSELOR_ID}'` : "NULL"}
    );`);
}
sql.push('');

// 22. AI Insights (12 Strategic Safety Predictions & Hotspots)
sql.push(`-- 22. Insert 12 AI Predictive Safety Insights`);
const aiInsightsData = [
    {
        type: 'hotspot_prediction',
        title: 'Elevated Risk Level Near East Perimeter Walkway After 21:00',
        summary: 'Historical incident clustering combined with lower lighting sensor metrics indicates a 42% higher probability of nighttime safety distress.',
        severity: 'high',
        conf: 0.945,
        actions: ['Increase mobile patrol frequency to 20-min intervals', 'Upgrade LED floodlights on East Pathway', 'Encourage campus security escort app feature']
    },
    {
        type: 'preventive_recommendation',
        title: 'Laboratory Chemical Storage Compliance Audit Recommended',
        summary: '3 localized thermal and smoke sensor anomalies detected in Science Block in the last 60 days.',
        severity: 'critical',
        conf: 0.962,
        actions: ['Conduct mandatory hazardous chemical audit', 'Inspect emergency eyewash and fire blanket stations', 'Schedule refresher lab safety drills']
    },
    {
        type: 'safety_trend',
        title: '28% Reduction in General Hostels Maintenance Complaints',
        summary: 'Automated grievance routing and resolution workflows have reduced average ticket turnaround from 72h to 18h.',
        severity: 'low',
        conf: 0.910,
        actions: ['Maintain current automated vendor dispatch workflow']
    }
];

for (let i = 1; i <= 12; i++) {
    const ins = aiInsightsData[(i - 1) % aiInsightsData.length];
    sql.push(`INSERT INTO ai_insights (insight_type, title, summary, data_payload, recommended_actions, severity, confidence_score, is_acknowledged) VALUES (
        ${escapeSQL(ins.type)}, ${escapeSQL(ins.title + ' [Insight #' + i + ']')}, ${escapeSQL(ins.summary)},
        '{"metric": "predictive_risk_index", "sample_size": 1250, "timeframe_days": 30}'::jsonb,
        ${jsonSQL(ins.actions)}, ${escapeSQL(ins.severity)}, ${ins.conf}, ${i <= 4}
    );`);
}
sql.push('');

// 23. Audit Logs (150 System Mutations)
sql.push(`-- 23. Insert 150 System Audit Logs`);
for (let i = 1; i <= 150; i++) {
    const actor = adminSecurityStaff[i % adminSecurityStaff.length];
    sql.push(`INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, ip_address, user_agent) VALUES (
        '${actor.id}', '${i % 4 === 0 ? 'UPDATE' : (i % 5 === 0 ? 'DELETE' : 'INSERT')}',
        '${i % 3 === 0 ? 'incidents' : (i % 2 === 0 ? 'attendance' : 'students')}',
        '${incidentIds[i % incidentIds.length]}',
        '{"status": "processed", "audit_verified": true}'::jsonb,
        '10.20.${(i % 10) + 1}.${(i % 200) + 1}',
        'CampusShield Command Console / Mozilla 5.0'
    );`);
}
sql.push('');

sql.push(`-- Re-enable triggers`);
sql.push(`SET session_replication_role = 'origin';\n`);

const outputPath = path.join(__dirname, '..', 'supabase', 'seed.sql');
fs.writeFileSync(outputPath, sql.join('\n'), 'utf8');
console.log(`[PASS] Successfully generated seed.sql at: ${outputPath} (${sql.length} SQL statements)`);
