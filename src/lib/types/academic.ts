export interface Department {
  id: string;
  code: string;
  name: string;
  headOfDepartment: string;
  headFacultyId?: string;
  facultyCount: number;
  studentCount: number;
  coursesCount: number;
  budget: string;
  labCount: number;
  establishedYear: number;
  description: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  departmentCode: string;
  credits: number;
  semester: number;
  instructorId: string;
  instructorName: string;
  capacity: number;
  enrolledCount: number;
  description: string;
  syllabus: string[];
  scheduleDays: string[];
  scheduleTime: string;
  room: string;
  status: 'active' | 'upcoming' | 'completed';
}

export interface StudentRecord {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  section: string;
  cgpa: number;
  attendancePercentage: number;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  status: 'Active' | 'On Leave' | 'Graduated' | 'Suspended';
  enrolledCourses: string[];
  avatarUrl?: string;
  medicalNotes?: string;
  address?: string;
  activeBacklogs?: number;
}

export interface FacultyRecord {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: 'Head of Department' | 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Visiting Lecturer';
  specialization: string;
  officeRoom: string;
  phone: string;
  status: 'Active' | 'On Leave' | 'Sabbatical';
  coursesTaught: string[];
  publicationsCount: number;
  rating: number;
  avatarUrl?: string;
}

export interface AttendanceStudentLog {
  studentId: string;
  rollNumber: string;
  studentName: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  courseCode: string;
  courseName: string;
  batch: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  markedBy: string;
  status: 'Submitted' | 'Draft';
  studentLogs: AttendanceStudentLog[];
}

export interface StudentGrade {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  courseCode: string;
  score: number;
  maxScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  remarks?: string;
}

export interface ExamSchedule {
  id: string;
  examCode: string;
  courseCode: string;
  courseName: string;
  department: string;
  type: 'Mid-Term' | 'Final Semester' | 'Quiz' | 'Practical';
  date: string;
  timeSlot: string;
  duration: string;
  room: string;
  totalMarks: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Grades Published';
  grades?: StudentGrade[];
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  timeSlot: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  room: string;
  batch: string;
  type: 'Lecture' | 'Lab' | 'Tutorial';
}
