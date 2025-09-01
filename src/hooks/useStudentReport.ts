
import { useState, useEffect, useMemo } from 'react';
import type { Student, ReportOptions } from '@/types/student';
import { getStudents } from '@/utils/storage';
import { sortGrades } from '@/utils/studentReportUtils';

export const useStudentReport = () => {
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    reportType: '1',
    classLevel: 'all',
    academicYear: new Date().getFullYear().toString(),
    additionalFields: {
      gender: false,
      citizenId: false,
      signature: false,
      guardianSignature: false,
      timeIn: false,
      timeOut: false,
      phone: false,
      note: false,
      gradeLevel: false,
      address: false,
      age: false,
    },
    customColumns: 0,
  });
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const storedStudents = await getStudents();
      setStudents(storedStudents);
    };
    fetchStudents();
  }, []);

  const academicYears = useMemo(() => [...new Set(students.map(s => s.academicYear))].sort().reverse(), [students]);

  const classLevels = useMemo(() => {
    if (!reportOptions.academicYear) return [];
    const grades = students
      .filter(s => s.academicYear === reportOptions.academicYear)
      .map(s => s.grade);
    return sortGrades([...new Set(grades)]);
  }, [students, reportOptions.academicYear]);

  const handleOptionChange = (field: keyof ReportOptions, value: any) => {
    setReportOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleAdditionalFieldChange = (field: keyof ReportOptions['additionalFields'], checked: boolean) => {
    setReportOptions(prev => ({
      ...prev,
      additionalFields: {
        ...prev.additionalFields,
        [field]: checked,
      },
    }));
  };

  const filteredStudents = useMemo(() => {
    let filtered = [...students];
    if (reportOptions.academicYear) {
      filtered = filtered.filter(student => student.academicYear === reportOptions.academicYear);
    }
    if (reportOptions.classLevel !== 'all') {
      filtered = filtered.filter(student => student.grade === reportOptions.classLevel);
    }
    
    // Sort by studentId: 3 digits first, then 4 digits
    filtered.sort((a, b) => {
      const aId = a.studentId;
      const bId = b.studentId;
      
      // Check if studentId is 3 digits or 4 digits
      const aIs3Digit = aId.length === 3;
      const bIs3Digit = bId.length === 3;
      
      // If one is 3 digits and other is 4 digits, 3 digits comes first
      if (aIs3Digit && !bIs3Digit) return -1;
      if (!aIs3Digit && bIs3Digit) return 1;
      
      // If both are same length, sort numerically
      return parseInt(aId) - parseInt(bId);
    });
    
    return filtered;
  }, [students, reportOptions]);

  return {
    reportOptions,
    academicYears,
    classLevels,
    handleOptionChange,
    handleAdditionalFieldChange,
    filteredStudents,
  };
};
