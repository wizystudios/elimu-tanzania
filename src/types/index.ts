
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
}

// User Types
export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent';

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
}

// Student Types
export type EducationLevel = 'chekechea' | 'darasa1' | 'darasa2' | 'darasa3' | 'darasa4' | 'darasa5' | 'darasa6' | 'darasa7' | 'form1' | 'form2' | 'form3' | 'form4' | 'form5' | 'form6';

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
