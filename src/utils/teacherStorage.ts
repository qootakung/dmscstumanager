
import type { Teacher } from '@/types/teacher';

const TEACHERS_STORAGE_KEY = 'school_teachers';

// Sample teacher data for demonstration
const getSampleTeachers = (): Teacher[] => [
  {
    id: '1',
    positionNumber: '1',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    position: 'ผู้อำนวยการโรงเรียน',
    appointmentDate: '2020-05-15',
    education: 'ครุศาสตรมหาบัณฑิต',
    citizenId: '1234567890123',
    birthDate: '1980-03-20',
    scoutLevel: 'วู๊ดแบดจ์',
    majorSubject: 'การบริหารการศึกษา',
    salary: '45000',
    phone: '081-234-5678',
    lineId: 'director2024',
    email: 'director@school.ac.th',
    academicYear: '2568',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    positionNumber: '2',
    firstName: 'สมหญิง',
    lastName: 'รักเรียน',
    position: 'ครู วิทยฐานะครูชำนาญการ',
    appointmentDate: '2018-06-01',
    education: 'ครุศาสตรบัณฑิต',
    citizenId: '9876543210987',
    birthDate: '1985-07-12',
    scoutLevel: 'จิงโจ้',
    majorSubject: 'คณิตศาสตร์',
    salary: '35000',
    phone: '089-876-5432',
    lineId: 'mathteacher2024',
    email: 'math@school.ac.th',
    academicYear: '2568',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    positionNumber: '3',
    firstName: 'วิทยา',
    lastName: 'ภาษาดี',
    position: 'ครู ยังไม่มีวิทยฐานะ',
    appointmentDate: '2022-03-15',
    education: 'ศิลปศาสตรบัณฑิต',
    citizenId: '5555666677778',
    birthDate: '1990-11-08',
    scoutLevel: 'เสือ',
    majorSubject: 'ภาษาไทย',
    salary: '25000',
    phone: '092-345-6789',
    lineId: 'thaiteacher2024',
    email: 'thai@school.ac.th',
    academicYear: '2568',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    positionNumber: '4',
    firstName: 'สุรชัย',
    lastName: 'วิทยาศาสตร์',
    position: 'ครู วิทยฐานะครูชำนาญการพิเศษ',
    appointmentDate: '2015-08-01',
    education: 'วิทยาศาสตรบัณฑิต',
    citizenId: '1111222233334',
    birthDate: '1982-01-25',
    scoutLevel: 'ราชสีห์',
    majorSubject: 'วิทยาศาสตร์',
    salary: '40000',
    phone: '086-111-2222',
    lineId: 'science2024',
    email: 'science@school.ac.th',
    academicYear: '2568',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    positionNumber: '5',
    firstName: 'นันทนา',
    lastName: 'ศิลปะงาม',
    position: 'ครูผู้ช่วย',
    appointmentDate: '2023-05-01',
    education: 'ศิลปกรรมศาสตรบัณฑิต',
    citizenId: '7777888899990',
    birthDate: '1995-04-18',
    scoutLevel: 'ลูกเสือสำรอง',
    majorSubject: 'ศิลปะ',
    salary: '22000',
    phone: '094-777-8888',
    lineId: 'artteacher2024',
    email: 'art@school.ac.th',
    academicYear: '2568',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const getTeachers = (): Teacher[] => {
  try {
    const teachers = localStorage.getItem(TEACHERS_STORAGE_KEY);
    if (teachers) {
      return JSON.parse(teachers);
    } else {
      // Initialize with sample data if no data exists
      const sampleTeachers = getSampleTeachers();
      localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(sampleTeachers));
      return sampleTeachers;
    }
  } catch (error) {
    console.error('Error loading teachers:', error);
    // Return sample data if there's an error
    const sampleTeachers = getSampleTeachers();
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(sampleTeachers));
    return sampleTeachers;
  }
};

export const addTeacher = (teacherData: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>): Teacher => {
  const teachers = getTeachers();
  const newTeacher: Teacher = {
    ...teacherData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  teachers.push(newTeacher);
  localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(teachers));
  return newTeacher;
};

export const updateTeacher = (id: string, updates: Partial<Teacher>): Teacher | null => {
  const teachers = getTeachers();
  const teacherIndex = teachers.findIndex(t => t.id === id);
  
  if (teacherIndex === -1) return null;
  
  teachers[teacherIndex] = {
    ...teachers[teacherIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(teachers));
  return teachers[teacherIndex];
};

export const deleteTeacher = (id: string): boolean => {
  const teachers = getTeachers();
  const filteredTeachers = teachers.filter(t => t.id !== id);
  
  if (filteredTeachers.length === teachers.length) return false;
  
  localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(filteredTeachers));
  return true;
};

export const getTeacherStatistics = () => {
  const teachers = getTeachers();
  
  const byPosition = teachers.reduce((acc, teacher) => {
    acc[teacher.position] = (acc[teacher.position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const academicYears = [...new Set(teachers.map(t => t.academicYear))].sort().reverse();

  return {
    total: teachers.length,
    byPosition,
    academicYears,
  };
};
