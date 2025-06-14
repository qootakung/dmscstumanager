
import type { Teacher } from '@/types/teacher';

const TEACHERS_STORAGE_KEY = 'school_teachers';

export const getTeachers = (): Teacher[] => {
  try {
    const teachers = localStorage.getItem(TEACHERS_STORAGE_KEY);
    return teachers ? JSON.parse(teachers) : [];
  } catch (error) {
    console.error('Error loading teachers:', error);
    return [];
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
