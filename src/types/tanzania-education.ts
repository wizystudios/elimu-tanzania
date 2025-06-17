
// Tanzania-specific education system types
export type TanzanianEducationLevel = 
  | 'chekechea' // Pre-primary
  | 'darasa1' | 'darasa2' | 'darasa3' | 'darasa4' | 'darasa5' | 'darasa6' | 'darasa7' // Primary (Standard I-VII)
  | 'form1' | 'form2' | 'form3' | 'form4' // Ordinary Level Secondary
  | 'form5' | 'form6'; // Advanced Level Secondary

export type TanzanianSchoolType = 'chekechea' | 'msingi' | 'secondary' | 'a_level';

export type TeacherSpecialization = 
  | 'normal_teacher'
  | 'homeroom_teacher' 
  | 'subject_teacher'
  | 'headmaster'
  | 'vice_headmaster'
  | 'academic_teacher'
  | 'discipline_teacher';

export interface TanzanianSubject {
  id: string;
  name: string;
  code: string;
  swahili_name?: string;
  applicable_levels: TanzanianEducationLevel[];
  is_core_subject: boolean;
  necta_code?: string; // NECTA subject code for exams
}

export interface NECTAExam {
  id: string;
  type: 'psle' | 'csee' | 'acsee'; // Primary School Leaving Exam, Certificate of Secondary Education Examination, Advanced Certificate of Secondary Education Examination
  year: number;
  subjects: string[];
  scheduled_date: string;
  registration_deadline: string;
}

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
