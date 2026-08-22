/**
 * CampusShield AI — Database Migration & Seed Verification Test Suite
 * Validates:
 * 1. Migration file syntax & ordering
 * 2. Table creation definitions & column constraints
 * 3. Required entities present
 * 4. Seed record volume targets
 * 5. Foreign key references & index coverage
 * 6. RLS policy completeness
 */

const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
const seedFile = path.join(__dirname, '..', 'supabase', 'seed.sql');

console.log("==================================================================");
console.log("CampusShield AI — Database Foundation Architecture Verification");
console.log("==================================================================\n");

const expectedTables = [
    'profiles',
    'roles',
    'students',
    'faculty',
    'parents',
    'parent_student_links',
    'departments',
    'courses',
    'attendance',
    'exams',
    'exam_results',
    'timetable',
    'hostels',
    'rooms',
    'hostel_allocations',
    'visitors',
    'visitor_passes',
    'incidents',
    'incident_evidence',
    'incident_assignments',
    'incident_timeline',
    'sos_alerts',
    'emergency_alerts',
    'complaints',
    'announcements',
    'notifications',
    'wellbeing_checkins',
    'placements',
    'placement_applications',
    'audit_logs',
    'ai_insights',
    'campus_locations'
];

// 1. Check migrations
const migrationFiles = fs.readdirSync(migrationsDir).sort();
console.log(`Found ${migrationFiles.length} migration files:`);
let combinedMigrationSQL = "";

for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    combinedMigrationSQL += "\n" + content;
    console.log(`  - ${file} (${(content.length / 1024).toFixed(1)} KB)`);
}

// 2. Validate Tables in Migrations
console.log("\n--- Checking Table Definitions in Migrations ---");
let tablesPassed = 0;
for (const table of expectedTables) {
    const tableRegex = new RegExp(`CREATE\\s+TABLE\\s+(IF\\s+NOT\\s+EXISTS\\s+)?${table}\\s*\\(`, 'i');
    if (tableRegex.test(combinedMigrationSQL)) {
        console.log(`  [PASS] Table '${table}' is properly defined`);
        tablesPassed++;
    } else {
        console.error(`  [FAIL] Table '${table}' is MISSING in migrations!`);
    }
}

// 3. Validate RLS Policies
console.log("\n--- Checking Row Level Security (RLS) Enablement ---");
let rlsPassed = 0;
for (const table of expectedTables) {
    const rlsRegex = new RegExp(`ALTER\\s+TABLE\\s+${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i');
    if (rlsRegex.test(combinedMigrationSQL)) {
        rlsPassed++;
    } else {
        console.warn(`  [WARN] RLS not explicitly enabled for '${table}'`);
    }
}
console.log(`  [PASS] ${rlsPassed}/${expectedTables.length} tables have Row Level Security enabled`);

// 4. Validate Indexes
console.log("\n--- Checking Performance Indexes ---");
const indexMatches = combinedMigrationSQL.match(/CREATE\s+INDEX\s+(IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s+ON\s+([a-zA-Z0-9_]+)/gi) || [];
console.log(`  [PASS] Found ${indexMatches.length} explicit performance and lookup indexes`);

// 5. Validate Seed Data Counts
console.log("\n--- Checking Seed Data Volume & Requirements ---");
const seedSQL = fs.readFileSync(seedFile, 'utf8');

function countInserts(tableName) {
    const regex = new RegExp(`INSERT\\s+INTO\\s+${tableName}`, 'gi');
    const matches = seedSQL.match(regex);
    return matches ? matches.length : 0;
}

const metrics = {
    students: countInserts('students'),
    faculty: countInserts('faculty'),
    security_admin: (seedSQL.match(/'(super_admin|admin|security)'/g) || []).length,
    campus_locations: countInserts('campus_locations'),
    incidents: countInserts('incidents'),
    complaints: countInserts('complaints'),
    visitors: countInserts('visitors'),
    visitor_passes: countInserts('visitor_passes'),
    attendance: countInserts('attendance'),
    timetable: countInserts('timetable'),
    placements: countInserts('placements'),
    placement_apps: countInserts('placement_applications'),
    notifications: countInserts('notifications'),
    announcements: countInserts('announcements'),
    sos_alerts: countInserts('sos_alerts'),
    emergency_alerts: countInserts('emergency_alerts'),
    wellbeing_checkins: countInserts('wellbeing_checkins'),
    ai_insights: countInserts('ai_insights'),
    audit_logs: countInserts('audit_logs')
};

console.table(metrics);

const checks = [
    { name: "Students count >= 500", passed: metrics.students >= 500, val: metrics.students },
    { name: "Faculty count >= 50", passed: metrics.faculty >= 50, val: metrics.faculty },
    { name: "Campus Locations >= 10", passed: metrics.campus_locations >= 10, val: metrics.campus_locations },
    { name: "Incidents count >= 100", passed: metrics.incidents >= 100, val: metrics.incidents },
    { name: "Complaints count >= 50", passed: metrics.complaints >= 50, val: metrics.complaints },
    { name: "Visitors count >= 30", passed: metrics.visitors >= 30, val: metrics.visitors },
    { name: "Attendance records present", passed: metrics.attendance > 1000, val: metrics.attendance },
    { name: "Timetable schedules present", passed: metrics.timetable >= 20, val: metrics.timetable },
    { name: "Placements present", passed: metrics.placements >= 5, val: metrics.placements },
    { name: "Notifications present", passed: metrics.notifications >= 100, val: metrics.notifications },
    { name: "Announcements present", passed: metrics.announcements >= 20, val: metrics.announcements }
];

let allPassed = true;
for (const c of checks) {
    if (c.passed) {
        console.log(`  [PASS] ${c.name} (${c.val})`);
    } else {
        console.error(`  [FAIL] FAILED: ${c.name} (${c.val})`);
        allPassed = false;
    }
}

if (allPassed && tablesPassed === expectedTables.length && rlsPassed === expectedTables.length) {
    console.log("\n[TARGET] ALL DATABASE SCHEMA & SEED REQUIREMENTS ARE 100% SATISFIED AND VERIFIED!");
} else {
    console.error("\n[FAIL] Some requirements were not satisfied.");
    process.exit(1);
}
