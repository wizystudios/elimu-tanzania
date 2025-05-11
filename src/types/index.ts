
export type SchoolType = 'kindergarten' | 'primary' | 'secondary' | 'advanced';

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
  educationLevel: EducationLevel;
  date: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  totalMarks: number;
  passingScore: number;
  description: string;
}

// Add EducationLevel type
export type EducationLevel = 
  | 'chekechea'
  | 'darasa1' | 'darasa2' | 'darasa3' | 'darasa4' | 'darasa5' | 'darasa6' | 'darasa7'
  | 'form1' | 'form2' | 'form3' | 'form4' | 'form5' | 'form6';

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
}

export interface Student {
  id: string;
  userId: string;
  registrationNumber: string;
  educationLevel: EducationLevel;
  dateOfBirth: string;
  gender: 'male' | 'female';
  guardianInfo: {
    name: string;
    relationship: string;
    contact: string;
  };
  enrollmentDate: string;
  currentClass: string;
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
}

export interface Class {
  id: string;
  name: string;
  educationLevel: EducationLevel;
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
  applicableLevel: EducationLevel[];
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
