
import { Exam } from '@/types';

// Helper function to create dates relative to today
const getRelativeDate = (days: number, hours: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
};

export const mockExams: Exam[] = [
  {
    id: '1',
    title: 'End Term Mathematics',
    subject: 'Mathematics',
    educationLevel: 'form2',
    date: getRelativeDate(3, 10),
    duration: 120,
    status: 'scheduled',
    totalMarks: 100,
    passingScore: 40,
    description: 'Cover chapters 1-6 from the curriculum textbook.'
  },
  {
    id: '2',
    title: 'Science Mid-Term',
    subject: 'Science',
    educationLevel: 'darasa5',
    date: getRelativeDate(1, 9),
    duration: 90,
    status: 'scheduled',
    totalMarks: 60,
    passingScore: 30,
    description: 'Focus on plants, animals, and basic human anatomy.'
  },
  {
    id: '3',
    title: 'English Comprehension',
    subject: 'English',
    educationLevel: 'form1',
    date: getRelativeDate(0, 14), // Today
    duration: 60,
    status: 'in_progress',
    totalMarks: 50,
    passingScore: 25,
    description: 'Reading comprehension, grammar, and vocabulary.'
  },
  {
    id: '4',
    title: 'Kiswahili Lugha',
    subject: 'Kiswahili',
    educationLevel: 'darasa7',
    date: getRelativeDate(0, 10), // Today
    duration: 90,
    status: 'in_progress',
    totalMarks: 80,
    passingScore: 40,
    description: 'Comprehensive test on grammar, vocabulary, and writing.'
  },
  {
    id: '5',
    title: 'History Final Exam',
    subject: 'History',
    educationLevel: 'form4',
    date: getRelativeDate(7, 8),
    duration: 150,
    status: 'scheduled',
    totalMarks: 120,
    passingScore: 60,
    description: 'Comprehensive examination covering the entire syllabus.'
  },
  {
    id: '6',
    title: 'Basic Number Skills',
    subject: 'Mathematics',
    educationLevel: 'chekechea',
    date: getRelativeDate(2, 9),
    duration: 30,
    status: 'scheduled',
    totalMarks: 20,
    passingScore: 10,
    description: 'Simple counting and basic number recognition assessment.'
  },
  {
    id: '7',
    title: 'Physics Practical',
    subject: 'Physics',
    educationLevel: 'form5',
    date: getRelativeDate(10, 13),
    duration: 180,
    status: 'scheduled',
    totalMarks: 60,
    passingScore: 30,
    description: 'Laboratory-based practical examination on electromagnetics.'
  },
  {
    id: '8',
    title: 'Chemistry Unit Test',
    subject: 'Chemistry',
    educationLevel: 'form3',
    date: getRelativeDate(-5, 10), // Past exam
    duration: 60,
    status: 'completed',
    totalMarks: 50,
    passingScore: 25,
    description: 'Unit test on organic chemistry fundamentals.'
  },
  {
    id: '9',
    title: 'Biology Mock Exam',
    subject: 'Biology',
    educationLevel: 'form6',
    date: getRelativeDate(-8, 8), // Past exam
    duration: 180,
    status: 'completed',
    totalMarks: 120,
    passingScore: 60,
    description: 'Full mock examination in preparation for final exams.'
  },
  {
    id: '10',
    title: 'Geography Quiz',
    subject: 'Geography',
    educationLevel: 'form2',
    date: getRelativeDate(-3, 11), // Past exam
    duration: 45,
    status: 'completed',
    totalMarks: 30,
    passingScore: 15,
    description: 'Quick assessment on map reading skills.'
  },
  {
    id: '11',
    title: 'Social Studies Quiz',
    subject: 'Social Studies',
    educationLevel: 'darasa4',
    date: getRelativeDate(0, 12), // Today
    duration: 45,
    status: 'scheduled',
    totalMarks: 30,
    passingScore: 15,
    description: 'Quiz on community and citizenship.'
  },
  {
    id: '12',
    title: 'Drawing Skills',
    subject: 'Art',
    educationLevel: 'darasa3',
    date: getRelativeDate(-1, 9), // Yesterday
    duration: 60,
    status: 'completed',
    totalMarks: 50,
    passingScore: 20,
    description: 'Assessment of basic drawing and coloring skills.'
  },
];
