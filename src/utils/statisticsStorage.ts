
import { getStudents } from './studentStorage';
import { gradeOptions } from './data';
import { Student } from '@/types/student';

// Statistics
export const getStudentStatistics = async () => {
  const students: Student[] = await getStudents();
  const currentYear = new Date().getFullYear() + 543; // Convert to Buddhist year
  const currentAcademicYear = currentYear.toString();
  
  const currentYearStudents = students.filter(s => s.academicYear === currentAcademicYear);
  
  const gradeStats = gradeOptions.reduce((acc, grade) => {
    acc[grade] = currentYearStudents.filter(s => s.grade === grade).length;
    return acc;
  }, {} as Record<string, number>);
  
  const genderStats = {
    ชาย: currentYearStudents.filter(s => {
      const gender = s.gender?.trim();
      return gender === 'ชาย' || gender === 'ช';
    }).length,
    หญิง: currentYearStudents.filter(s => {
      const gender = s.gender?.trim();
      return gender === 'หญิง' || gender === 'ญ';
    }).length,
  };
  
  return {
    total: currentYearStudents.length,
    byGrade: gradeStats,
    byGender: genderStats,
    academicYears: [...new Set(students.map(s => s.academicYear))].sort().reverse(),
  };
};
