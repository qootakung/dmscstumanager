
import { getStudents } from './studentStorage';
import { gradeOptions } from './data';
import { Student } from '@/types/student';

// Get current academic year based on Thai school calendar
// Academic year starts May 16, so before that it's previous year
const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear() + 543; // Convert to Buddhist year
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  // If before May 16, still previous academic year
  if (month < 5 || (month === 5 && day < 16)) {
    return (year - 1).toString();
  }
  return year.toString();
};

// Statistics
export const getStudentStatistics = async (semester?: string) => {
  const students: Student[] = await getStudents();
  const currentAcademicYear = getCurrentAcademicYear();
  
  // Filter by current academic year and semester
  let filteredStudents = students.filter(s => {
    const matchYear = s.academicYear === currentAcademicYear;
    if (semester) {
      return matchYear && s.semester === semester;
    }
    return matchYear;
  });
  
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
