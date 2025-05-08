
// School Types
export type SchoolType = 'kindergarten' | 'primary' | 'secondary' | 'advanced';

export interface School {
  id: string;
  name: string;
  type: SchoolType;
  address: {
    region: string;
    district: string;
    ward: string;
    street: string;
  };
  contactInfo: {
    email: string;
    phone: string;
  };
  description?: string;
  logo?: string;
  establishedDate: string;
  registrationNumber: string;
  subdomain?: string;
  headmaster?: {
    name: string;
    email: string;
    phone: string;
  };
}

// User Types
export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent';

// Teacher Specific Roles
export type TeacherRole = 
  'normal_teacher' | 
  'headmaster' | 
  'vice_headmaster' | 
  'academic_teacher' | 
  'discipline_teacher' | 
  'sports_teacher' | 
  'environment_teacher';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  schoolId?: string;
  profileImage?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  // Teacher specific properties
  teacherRole?: TeacherRole;
  subjects?: string[];
  classes?: string[];
}

// Student Types
export type EducationLevel = 
  // Kindergarten
  'chekechea' | 
  // Primary
  'darasa1' | 'darasa2' | 'darasa3' | 'darasa4' | 'darasa5' | 'darasa6' | 'darasa7' | 
  // Secondary O-Level
  'form1' | 'form2' | 'form3' | 'form4' | 
  // Secondary A-Level
  'form5' | 'form6';

export interface Student {
  id: string;
  userId: string;
  registrationNumber: string;
  educationLevel: EducationLevel;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  guardianInfo: {
    name: string;
    relationship: string;
    contact: string;
  };
  enrollmentDate: string;
  currentClass: string;
}

// Teacher Types
export interface Teacher {
  id: string;
  userId: string;
  staffId: string;
  teacherRole: TeacherRole;
  subjects: string[];
  classesAssigned: string[];
  qualifications: string[];
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  hireDate: string;
}

// Class Types
export interface Class {
  id: string;
  name: string;
  educationLevel: EducationLevel;
  academicYear: string;
  teacherId?: string;
  students: string[];
  subjects: string[];
}

// Subject Types
export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  applicableLevel: EducationLevel[];
}

// Exam Types
export interface Exam {
  id: string;
  title: string;
  subject: string;
  educationLevel: EducationLevel;
  date: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  totalMarks: number;
  passingScore: number;
  description?: string;
}

// Assignment Types
export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  dueDate: string;
  createdAt: string;
  totalMarks: number;
  attachments?: string[];
}

// Attendance Types
export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

// School Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: 'exam' | 'holiday' | 'meeting' | 'event' | 'other';
  schoolId: string;
  classIds?: string[];
}
