
export type SchoolType = 'kindergarten' | 'primary' | 'secondary' | 'advanced';

// Tanzania-specific education system types
export type TanzanianEducationLevel = 
  | 'chekechea' // Pre-primary
  | 'darasa1' | 'darasa2' | 'darasa3' | 'darasa4' | 'darasa5' | 'darasa6' | 'darasa7' // Primary (Standard I-VII)
  | 'form1' | 'form2' | 'form3' | 'form4' // Ordinary Level Secondary
  | 'form5' | 'form6'; // Advanced Level Secondary

export type TanzanianSchoolType = 'chekechea' | 'msingi' | 'secondary' | 'a_level';

export interface SchoolLocation {
  id: string;
  ward: string;
  region: string;
  street: string;
  district: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  registration_number: string;
  email: string;
  phone: string;
  type: SchoolType;
  subdomain: string;
  logo: string | null;
  established_date: string;
  description: string;
  created_at: string;
  updated_at: string;
  school_locations?: SchoolLocation[];
  // Add these properties for compatibility with existing code
  address?: {
    region: string;
    district: string;
    ward: string;
    street: string;
  };
  contactInfo?: {
    email: string;
    phone: string;
  };
  registrationNumber?: string;
  establishedDate?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  type: 'exam' | 'meeting' | 'holiday' | 'task' | 'other';
}

export interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: string;
  status?: 'pending' | 'completed' | 'failed';
}

// Add Exam type for exam related components
export interface Exam {
  id: string;
  title: string;
  subject: string;
  educationLevel: TanzanianEducationLevel;
  date: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  totalMarks: number;
  passingScore: number;
  description: string;
  examType: 'internal' | 'necta' | 'mock';
}

// NECTA-specific exam types
export interface NECTAExam {
  id: string;
  type: 'psle' | 'csee' | 'acsee'; // Primary School Leaving Exam, Certificate of Secondary Education Examination, Advanced Certificate of Secondary Education Examination
  year: number;
  subjects: string[];
  scheduled_date: string;
  registration_deadline: string;
}

// Add User related types
export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent' | 'headmaster' | 'vice_headmaster' | 'academic_teacher';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  schoolId?: string;
  teacherRole?: string;
}

export interface Student {
  id: string;
  userId: string;
  registrationNumber: string;
  educationLevel: TanzanianEducationLevel;
  dateOfBirth: string;
  gender: 'male' | 'female';
  guardianInfo: {
    name: string;
    relationship: string;
    contact: string;
  };
  enrollmentDate: string;
  currentClass: string;
  birthCertificateNumber: string;
  homeAddress: string;
  specialNeeds?: string;
  medicalConditions?: string;
}

export type TeacherRole = 'normal_teacher' | 'homeroom_teacher' | 'subject_teacher' | 'headmaster' | 'vice_headmaster' | 'academic_teacher';

export interface Teacher {
  id: string;
  userId: string;
  staffId: string;
  teacherRole: TeacherRole;
  subjects: string[];
  classesAssigned: string[];
  qualifications: string[];
  dateOfBirth: string;
  gender: 'male' | 'female';
  hireDate: string;
  nationalId: string;
  teachingLicense?: string;
  specialization: string;
  experience?: string;
  languages: string[];
}

export interface Class {
  id: string;
  name: string;
  educationLevel: TanzanianEducationLevel;
  academicYear: string;
  teacherId?: string;
  students: string[];
  subjects: string[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  applicableLevel: TanzanianEducationLevel[];
  swahili_name?: string;
  is_core_subject: boolean;
  necta_code?: string; // NECTA subject code for exams
}

// Academic Calendar and Holiday types
export interface AcademicCalendar {
  id: string;
  school_year: string;
  term_1_start: string;
  term_1_end: string;  
  term_2_start: string;
  term_2_end: string;
  term_3_start: string;
  term_3_end: string;
  holidays: Holiday[];
}

export interface Holiday {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  type: 'national' | 'school' | 'religious';
}

// Transfer and Fee types
export interface StudentTransfer {
  id: string;
  student_id: string;
  from_school_id: string;
  to_school_id: string;
  transfer_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: string[];
}

export interface FeeStructure {
  id: string;
  school_id: string;
  education_level: TanzanianEducationLevel;
  tuition_fee: number;
  development_fee: number;
  examination_fee: number;
  other_fees: { name: string; amount: number }[];
  currency: 'TZS'; // Tanzanian Shilling
}

// Add SenderType for compatibility
export interface SenderType {
  id: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
}

export interface AnnouncementType {
  id: string;
  title: string;
  content: string;
  created_at: string;
  sender: SenderType;
}

// Assignment and Communication types
export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject_id: string;
  class_id: string;
  teacher_id: string;
  due_date: string;
  total_marks: number;
  status: 'draft' | 'published' | 'closed';
  attachments?: string[];
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string;
  content: string;
  is_read: boolean;
  sent_at: string;
  message_type: 'individual' | 'group' | 'announcement';
}

// Performance and Analytics types
export interface StudentPerformance {
  student_id: string;
  subject_id: string;
  exam_id: string;
  marks_obtained: number;
  total_marks: number;
  grade: string;
  position_in_class: number;
  position_in_stream?: number;
  remarks?: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  marked_by: string;
}
