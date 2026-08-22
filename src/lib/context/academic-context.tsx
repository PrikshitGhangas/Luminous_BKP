'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Department,
  Course,
  StudentRecord,
  FacultyRecord,
  AttendanceRecord,
  ExamSchedule,
  TimetableSlot,
} from '../types/academic';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_COURSES,
  INITIAL_FACULTY,
  INITIAL_STUDENTS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_EXAMS,
  INITIAL_TIMETABLE_SLOTS,
} from '../constants/academic-demo-data';

interface AcademicContextType {
  departments: Department[];
  courses: Course[];
  faculty: FacultyRecord[];
  students: StudentRecord[];
  attendanceRecords: AttendanceRecord[];
  exams: ExamSchedule[];
  timetableSlots: TimetableSlot[];

  // Mutations
  addStudent: (data: Omit<StudentRecord, 'id'>) => StudentRecord;
  updateStudent: (id: string, updates: Partial<StudentRecord>) => void;
  addFaculty: (data: Omit<FacultyRecord, 'id'>) => FacultyRecord;
  updateFaculty: (id: string, updates: Partial<FacultyRecord>) => void;
  addCourse: (data: Omit<Course, 'id'>) => Course;
  addDepartment: (data: Omit<Department, 'id'>) => Department;
  submitAttendanceSession: (data: Omit<AttendanceRecord, 'id'>) => AttendanceRecord;
  scheduleExam: (data: Omit<ExamSchedule, 'id'>) => ExamSchedule;
  addTimetableSlot: (data: Omit<TimetableSlot, 'id'>) => TimetableSlot;
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

const STORAGE_KEYS = {
  DEPARTMENTS: 'luminous_academic_departments',
  COURSES: 'luminous_academic_courses',
  FACULTY: 'luminous_academic_faculty',
  STUDENTS: 'luminous_academic_students',
  ATTENDANCE: 'luminous_academic_attendance',
  EXAMS: 'luminous_academic_exams',
  TIMETABLE: 'luminous_academic_timetable',
};

function getStored<T>(key: string, fallback: T): T {
  if (typeof window !== 'undefined') {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed) && Array.isArray(fallback) && parsed.length < fallback.length) {
          return fallback;
        }
        return parsed as T;
      }
    } catch (err) {
      console.warn(`Failed to parse localStorage key "${key}":`, err);
    }
  }
  return fallback;
}

export function AcademicProvider({ children }: { children: React.ReactNode }) {
  const [departments, setDepartments] = useState<Department[]>(() =>
    getStored(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS)
  );
  const [courses, setCourses] = useState<Course[]>(() =>
    getStored(STORAGE_KEYS.COURSES, INITIAL_COURSES)
  );
  const [faculty, setFaculty] = useState<FacultyRecord[]>(() =>
    getStored(STORAGE_KEYS.FACULTY, INITIAL_FACULTY)
  );
  const [students, setStudents] = useState<StudentRecord[]>(() =>
    getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS)
  );
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() =>
    getStored(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE_RECORDS)
  );
  const [exams, setExams] = useState<ExamSchedule[]>(() =>
    getStored(STORAGE_KEYS.EXAMS, INITIAL_EXAMS)
  );
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(() =>
    getStored(STORAGE_KEYS.TIMETABLE, INITIAL_TIMETABLE_SLOTS)
  );

  // Sync state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
      localStorage.setItem(STORAGE_KEYS.FACULTY, JSON.stringify(faculty));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
      localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetableSlots));
    }
  }, [departments, courses, faculty, students, attendanceRecords, exams, timetableSlots]);

  const addStudent = useCallback((data: Omit<StudentRecord, 'id'>): StudentRecord => {
    const newStudent: StudentRecord = {
      ...data,
      id: `std-${Date.now()}`,
    };
    setStudents((prev) => [newStudent, ...prev]);
    return newStudent;
  }, []);

  const updateStudent = useCallback((id: string, updates: Partial<StudentRecord>) => {
    setStudents((prev) =>
      prev.map((std) => (std.id === id ? { ...std, ...updates } : std))
    );
  }, []);

  const addFaculty = useCallback((data: Omit<FacultyRecord, 'id'>): FacultyRecord => {
    const newFaculty: FacultyRecord = {
      ...data,
      id: `fac-${Date.now()}`,
    };
    setFaculty((prev) => [newFaculty, ...prev]);
    return newFaculty;
  }, []);

  const updateFaculty = useCallback((id: string, updates: Partial<FacultyRecord>) => {
    setFaculty((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

  const addCourse = useCallback((data: Omit<Course, 'id'>): Course => {
    const newCourse: Course = {
      ...data,
      id: `crs-${Date.now()}`,
    };
    setCourses((prev) => [newCourse, ...prev]);
    return newCourse;
  }, []);

  const addDepartment = useCallback((data: Omit<Department, 'id'>): Department => {
    const newDept: Department = {
      ...data,
      id: `dept-${Date.now()}`,
    };
    setDepartments((prev) => [newDept, ...prev]);
    return newDept;
  }, []);

  const submitAttendanceSession = useCallback((data: Omit<AttendanceRecord, 'id'>): AttendanceRecord => {
    const newRecord: AttendanceRecord = {
      ...data,
      id: `att-${Date.now()}`,
    };
    setAttendanceRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  }, []);

  const scheduleExam = useCallback((data: Omit<ExamSchedule, 'id'>): ExamSchedule => {
    const newExam: ExamSchedule = {
      ...data,
      id: `ex-${Date.now()}`,
    };
    setExams((prev) => [newExam, ...prev]);
    return newExam;
  }, []);

  const addTimetableSlot = useCallback((data: Omit<TimetableSlot, 'id'>): TimetableSlot => {
    const newSlot: TimetableSlot = {
      ...data,
      id: `tt-${Date.now()}`,
    };
    setTimetableSlots((prev) => [newSlot, ...prev]);
    return newSlot;
  }, []);

  return (
    <AcademicContext.Provider
      value={{
        departments,
        courses,
        faculty,
        students,
        attendanceRecords,
        exams,
        timetableSlots,
        addStudent,
        updateStudent,
        addFaculty,
        updateFaculty,
        addCourse,
        addDepartment,
        submitAttendanceSession,
        scheduleExam,
        addTimetableSlot,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic(): AcademicContextType {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
}
