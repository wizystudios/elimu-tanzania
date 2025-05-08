import { School, User, Student, Teacher, Class, Subject, TeacherRole } from '../types';

// Mock Schools
export const schools: School[] = [
  {
    id: '1',
    name: 'Mwenge Primary School',
    type: 'primary',
    address: {
      region: 'Dar es Salaam',
      district: 'Kinondoni',
      ward: 'Mwenge',
      street: 'Mwenge Street'
    },
    contactInfo: {
      email: 'info@mwengeprimary.edu.tz',
      phone: '+255 755 123 456'
    },
    description: 'A leading primary school in Dar es Salaam region',
    establishedDate: '1985-01-15',
    registrationNumber: 'DSM/PRM/0123/85'
  },
  {
    id: '2',
    name: 'Baobab Secondary School',
    type: 'secondary',
    address: {
      region: 'Mwanza',
      district: 'Ilemela',
      ward: 'Kiseke',
      street: 'Kiseke Street'
    },
    contactInfo: {
      email: 'admin@baobabsecondary.edu.tz',
      phone: '+255 715 987 654'
    },
    description: 'Quality secondary education in Mwanza region',
    establishedDate: '1998-05-20',
    registrationNumber: 'MWZ/SEC/0456/98'
  },
  {
    id: '3',
    name: 'Little Hearts Kindergarten',
    type: 'kindergarten',
    address: {
      region: 'Arusha',
      district: 'Arusha City',
      ward: 'Sakina',
      street: 'Sakina Street'
    },
    contactInfo: {
      email: 'info@littlehearts.edu.tz',
      phone: '+255 765 321 789'
    },
    description: 'Nurturing early childhood education in Arusha',
    establishedDate: '2010-03-10',
    registrationNumber: 'ARU/KG/0789/10'
  },
  {
    id: '4',
    name: 'Tanzania Advanced Academy',
    type: 'advanced',
    address: {
      region: 'Dodoma',
      district: 'Dodoma City',
      ward: 'Ipagala',
      street: 'Ipagala Road'
    },
    contactInfo: {
      email: 'principal@taacademy.edu.tz',
      phone: '+255 778 456 123'
    },
    description: 'Premier advanced level education in the capital city',
    establishedDate: '2005-08-25',
    registrationNumber: 'DDM/ADV/0234/05'
  }
];

// Mock Users
export const users: User[] = [
  {
    id: '1',
    firstName: 'James',
    lastName: 'Kimaro',
    email: 'james.kimaro@example.com',
    role: 'super_admin',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1374&auto=format&fit=crop',
    phoneNumber: '+255 712 345 678',
    isActive: true,
    createdAt: '2023-01-01'
  },
  {
    id: '2',
    firstName: 'Fatima',
    lastName: 'Hassan',
    email: 'fatima.hassan@example.com',
    role: 'admin',
    schoolId: '1',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1374&auto=format&fit=crop',
    phoneNumber: '+255 756 789 012',
    isActive: true,
    createdAt: '2023-01-15'
  },
  {
    id: '3',
    firstName: 'Emmanuel',
    lastName: 'Mwenda',
    email: 'emmanuel.mwenda@example.com',
    role: 'teacher',
    schoolId: '1',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1374&auto=format&fit=crop',
    phoneNumber: '+255 789 123 456',
    isActive: true,
    createdAt: '2023-02-01'
  },
  {
    id: '4',
    firstName: 'Grace',
    lastName: 'Makonjo',
    email: 'grace.makonjo@example.com',
    role: 'teacher',
    schoolId: '2',
    profileImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1374&auto=format&fit=crop',
    phoneNumber: '+255 723 456 789',
    isActive: true,
    createdAt: '2023-02-15'
  },
  {
    id: '5',
    firstName: 'John',
    lastName: 'Mbwambo',
    email: 'john.mbwambo@example.com',
    role: 'student',
    schoolId: '1',
    phoneNumber: '+255 765 432 109',
    isActive: true,
    createdAt: '2023-03-01'
  },
  {
    id: '6',
    firstName: 'Amina',
    lastName: 'Seif',
    email: 'amina.seif@example.com',
    role: 'student',
    schoolId: '3',
    phoneNumber: '+255 745 678 901',
    isActive: true,
    createdAt: '2023-03-15'
  },
  {
    id: '7',
    firstName: 'David',
    lastName: 'Munuo',
    email: 'david.munuo@example.com',
    role: 'parent',
    phoneNumber: '+255 787 654 321',
    isActive: true,
    createdAt: '2023-04-01'
  }
];

// Mock Students
export const students: Student[] = [
  {
    id: '1',
    userId: '5',
    registrationNumber: 'STD/2023/001',
    educationLevel: 'darasa4',
    dateOfBirth: '2013-05-12',
    gender: 'male',
    guardianInfo: {
      name: 'David Mbwambo',
      relationship: 'Father',
      contact: '+255 787 654 321'
    },
    enrollmentDate: '2023-01-10',
    currentClass: 'Class 4A'
  },
  {
    id: '2',
    userId: '6',
    registrationNumber: 'STD/2023/002',
    educationLevel: 'chekechea',
    dateOfBirth: '2018-08-23',
    gender: 'female',
    guardianInfo: {
      name: 'Fatima Seif',
      relationship: 'Mother',
      contact: '+255 756 123 789'
    },
    enrollmentDate: '2023-01-15',
    currentClass: 'Chekechea A'
  }
];

// Mock Teachers
export const teachers: Teacher[] = [
  {
    id: '1',
    userId: '3',
    staffId: 'TCH/2023/001',
    teacherRole: 'normal_teacher',
    subjects: ['Mathematics', 'Science'],
    classesAssigned: ['Class 4A', 'Class 4B'],
    qualifications: ['B.Ed in Education', 'Diploma in Mathematics'],
    dateOfBirth: '1988-03-15',
    gender: 'male',
    hireDate: '2023-01-05'
  },
  {
    id: '2',
    userId: '4',
    staffId: 'TCH/2023/002',
    teacherRole: 'normal_teacher',
    subjects: ['Biology', 'Chemistry'],
    classesAssigned: ['Form 1A', 'Form 2B'],
    qualifications: ['B.Sc in Biology', 'M.Ed in Education'],
    dateOfBirth: '1985-11-20',
    gender: 'female',
    hireDate: '2023-01-10'
  }
];

// Mock Classes
export const classes: Class[] = [
  {
    id: '1',
    name: 'Class 4A',
    educationLevel: 'darasa4',
    academicYear: '2023',
    teacherId: '1',
    students: ['1'],
    subjects: ['Mathematics', 'Science', 'Kiswahili', 'English']
  },
  {
    id: '2',
    name: 'Chekechea A',
    educationLevel: 'chekechea',
    academicYear: '2023',
    students: ['2'],
    subjects: ['Basic Numeracy', 'Basic Literacy', 'Arts & Crafts']
  },
  {
    id: '3',
    name: 'Form 1A',
    educationLevel: 'form1',
    academicYear: '2023',
    teacherId: '2',
    students: [],
    subjects: ['Biology', 'Chemistry', 'Physics', 'Mathematics']
  }
];

// Mock Subjects
export const subjects: Subject[] = [
  {
    id: '1',
    name: 'Mathematics',
    code: 'MATH',
    description: 'Basic mathematics and numeracy skills',
    applicableLevel: ['darasa1', 'darasa2', 'darasa3', 'darasa4', 'darasa5', 'darasa6', 'darasa7']
  },
  {
    id: '2',
    name: 'Science',
    code: 'SCI',
    description: 'Basic science concepts and knowledge',
    applicableLevel: ['darasa1', 'darasa2', 'darasa3', 'darasa4', 'darasa5', 'darasa6', 'darasa7']
  },
  {
    id: '3',
    name: 'Biology',
    code: 'BIO',
    description: 'Study of living organisms and their interactions',
    applicableLevel: ['form1', 'form2', 'form3', 'form4', 'form5', 'form6']
  },
  {
    id: '4',
    name: 'Chemistry',
    code: 'CHEM',
    description: 'Study of matter, its properties, and reactions',
    applicableLevel: ['form1', 'form2', 'form3', 'form4', 'form5', 'form6']
  },
  {
    id: '5',
    name: 'Basic Numeracy',
    code: 'BNUM',
    description: 'Fundamental counting and number recognition',
    applicableLevel: ['chekechea']
  },
  {
    id: '6',
    name: 'Basic Literacy',
    code: 'BLIT',
    description: 'Introduction to letters, words, and reading',
    applicableLevel: ['chekechea']
  }
];
