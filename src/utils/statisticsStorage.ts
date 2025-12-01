
import { getStudents } from './studentStorage';
import { gradeOptions } from './data';
import { Student } from '@/types/student';

// Statistics
export const getStudentStatistics = async (semester?: string) => {
  const students: Student[] = await getStudents();
  const currentYear = new Date().getFullYear() + 543; // Convert to Buddhist year
  const currentAcademicYear = currentYear.toString();
  
  // Filter by current academic year and semester if provided
  let filteredStudents = students.filter(s => s.academicYear === currentAcademicYear);
  if (semester) {
    filteredStudents = filteredStudents.filter(s => s.semester === semester);
  }
  
  const gradeStats = gradeOptions.reduce((acc, grade) => {
    acc[grade] = filteredStudents.filter(s => s.grade === grade).length;
    return acc;
  }, {} as Record<string, number>);
  
  const genderStats = {
    ชาย: filteredStudents.filter(s => {
      const gender = s.gender?.trim();
      return gender === 'ชาย' || gender === 'ช';
    }).length,
    หญิง: filteredStudents.filter(s => {
      const gender = s.gender?.trim();
      return gender === 'หญิง' || gender === 'ญ';
    }).length,
  };
  
  return {
    total: filteredStudents.length,
    byGrade: gradeStats,
    byGender: genderStats,
    academicYears: [...new Set(students.map(s => s.academicYear))].sort().reverse(),
  };
};
