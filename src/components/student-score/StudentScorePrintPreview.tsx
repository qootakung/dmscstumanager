import React, { useMemo } from 'react';
import { Student } from '@/types/student';
import { Teacher } from '@/types/teacher';

interface StudentScore {
  id?: string;
  student_id: string;
  teacher_id: string;
  subject_code: string;
  subject_name: string;
  grade_level: string;
  max_score: number;
  score: number;
  academic_year: string;
}

interface Subject {
  code: string;
  name: string;
}

interface StudentScorePrintPreviewProps {
  scores: StudentScore[];
  students: Student[];
  teachers: Teacher[];
  gradeLevel: string;
  academicYear: string;
  principalName?: string;
  homeRoomTeacher?: Teacher;
  selectedStudent?: Student;
  logoUrl?: string;
}

export const StudentScorePrintPreview: React.FC<StudentScorePrintPreviewProps> = ({
  scores,
  students,
  teachers,
  gradeLevel,
  academicYear,
  principalName = "นายธนภูมิ ต๊ะสินธุ",
  homeRoomTeacher,
  selectedStudent,
  logoUrl
}) => {
  // Debug logs
  console.log('StudentScorePrintPreview - Received props:', {
    scoresCount: scores.length,
    studentsCount: students.length,
    gradeLevel,
    academicYear,
    selectedStudent: selectedStudent ? { 
      id: selectedStudent.id, 
      name: `${selectedStudent.titleTh}${selectedStudent.firstNameTh} ${selectedStudent.lastNameTh}`,
      grade: selectedStudent.grade 
    } : null
  });
  
  // Log all scores
  console.log('StudentScorePrintPreview - All scores:', scores.map(s => ({
    student_id: s.student_id,
    subject_code: s.subject_code,
    score: s.score,
    grade_level: s.grade_level
  })));
  
  // Debug: Filter scores for selected student
  if (selectedStudent) {
    const studentScores = scores.filter(s => s.student_id === selectedStudent.id);
    console.log('StudentScorePrintPreview - Scores for selected student:', {
      studentId: selectedStudent.id,
      studentName: `${selectedStudent.titleTh}${selectedStudent.firstNameTh} ${selectedStudent.lastNameTh}`,
      studentGrade: selectedStudent.grade,
      scoresCount: studentScores.length,
      scores: studentScores.map(s => ({ 
        subject_code: s.subject_code, 
        subject_name: s.subject_name,
        score: s.score,
        grade_level: s.grade_level 
      }))
    });
  }
  const getStudentData = (studentId: string) => {
    return students.find(s => s.id === studentId);
  };

  const formatDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  // Get unique subjects from actual scores data for this grade
  const allSubjectsFromScores = useMemo(() => {
    console.log('StudentScorePrintPreview - Processing subjects:', {
      totalScores: scores.length,
      gradeLevel,
      scoresForGrade: scores.filter(s => s.grade_level === gradeLevel).length
    });
    
    // Filter scores for the current grade level
    const gradeScores = scores.filter(s => s.grade_level === gradeLevel);
    
    console.log('StudentScorePrintPreview - Grade scores:', gradeScores.slice(0, 5));
    
    // Get unique subjects
    const uniqueSubjects = Array.from(
      new Map(
        gradeScores.map(s => [s.subject_code, { code: s.subject_code, name: s.subject_name }])
      ).values()
    );
    
    console.log('StudentScorePrintPreview - Unique subjects found:', uniqueSubjects);
    
    // Sort subjects: basic subjects (ending with 101) first, then others
    return uniqueSubjects.sort((a, b) => {
      const aCode = a.code.slice(-3);
      const bCode = b.code.slice(-3);
      
      // Basic subjects: 101 (not 102, as 102 can be basic or additional)
      const aIsBasic = aCode === '101';
      const bIsBasic = bCode === '101';
      
      if (aIsBasic && !bIsBasic) return -1;
      if (!aIsBasic && bIsBasic) return 1;
      
      // Within the same category, sort by code
      return a.code.localeCompare(b.code);
    });
  }, [scores, gradeLevel]);

  // Separate basic and additional subjects
  const basicSubjects = allSubjectsFromScores.filter(s => {
    const suffix = s.code.slice(-3);
    // Only 101 is definitely basic, 102 could be basic (history) or additional (computing)
    return suffix === '101';
  });

  const additionalSubjects = allSubjectsFromScores.filter(s => {
    const suffix = s.code.slice(-3);
    return suffix !== '101';
  });

  console.log('StudentScorePrintPreview - Subject breakdown:', {
    total: allSubjectsFromScores.length,
    basic: basicSubjects.length,
    additional: additionalSubjects.length,
    basicSubjects: basicSubjects.map(s => s.code),
    additionalSubjects: additionalSubjects.map(s => s.code)
  });

  if (scores.length === 0 && !gradeLevel) {
    return <div>ไม่มีข้อมูลที่จะพิมพ์</div>;
  }

  return (
    <div className="w-full bg-white text-black print-content" style={{ fontSize: '21px', fontFamily: "'TH SarabunPSK', 'TH Sarabun', 'Sarabun', Arial, sans-serif" }}>
      {/* Header */}
      <div className="text-center mb-6">
        {/* Logo Section */}
        {logoUrl && (
          <div className="flex justify-center mb-4">
            <img 
              src={logoUrl} 
              alt="โลโก้โรงเรียน" 
              style={{ 
                width: '97.92px',  // 1.02 inches * 96 DPI
                height: '96px',     // 1 inch * 96 DPI
                objectFit: 'contain',
                imageRendering: 'crisp-edges'
              }}
            />
          </div>
        )}
        
        <div style={{ fontSize: '21px', fontWeight: 'bold', marginBottom: '8px' }}>
          รายงานผลคะแนนผู้เรียนรายบุคคล
        </div>
        <div style={{ fontSize: '21px', marginBottom: '4px' }}>
          โรงเรียนบ้านดอนมูล ชั้นประถมศึกษาปีที่{gradeLevel.replace('ป.', '')} ปีการศึกษา {academicYear}
        </div>
        {selectedStudent && (
          <div style={{ fontSize: '21px', marginBottom: '16px', fontWeight: 'bold' }}>
            ชื่อ-สกุลนักเรียน: {selectedStudent.titleTh}{selectedStudent.firstNameTh} {selectedStudent.lastNameTh} 
            {selectedStudent.studentId && ` รหัสนักเรียน: ${selectedStudent.studentId}`}
          </div>
        )}
      </div>

      {/* Remove Info and Summary sections */}

      {/* Table */}
      <table className="w-full border-collapse" style={{ border: '1px solid black' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th rowSpan={2} style={{ border: '1px solid black', padding: '8px', textAlign: 'center', verticalAlign: 'middle', width: '15%' }}>
              รหัสวิชา
            </th>
            <th rowSpan={2} style={{ border: '1px solid black', padding: '8px', textAlign: 'center', verticalAlign: 'middle', width: '45%' }}>
              กลุ่มสาระการเรียนรู้
            </th>
            <th colSpan={2} style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '40%' }}>
              ผลการพัฒนาผู้เรียนรายบุคคล
            </th>
          </tr>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '20%' }}>
              คะแนนเต็ม
            </th>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '20%' }}>
              คะแนนที่ได้
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Show message if no subjects found */}
          {allSubjectsFromScores.length === 0 && (
            <tr>
              <td colSpan={4} style={{ border: '1px solid black', padding: '16px', textAlign: 'center', color: '#666' }}>
                ไม่พบข้อมูลคะแนนสำหรับชั้น {gradeLevel} ปีการศึกษา {academicYear}
              </td>
            </tr>
          )}
          
          {/* Basic subjects */}
          {basicSubjects.length > 0 && basicSubjects.map((subject) => {
            // Find score for this subject and selected student
            const subjectScore = selectedStudent 
              ? scores.find(s => s.subject_code === subject.code && s.student_id === selectedStudent.id)
              : scores.find(s => s.subject_code === subject.code);
            
            return (
              <tr key={subject.code}>
                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                  {subject.code}
                </td>
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  {subject.name}
                </td>
                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                  50
                </td>
                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                  {subjectScore ? subjectScore.score : '-'}
                </td>
              </tr>
            );
          })}
          
          {/* Additional Learning Areas Section */}
          {additionalSubjects.length > 0 && (
            <>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <td colSpan={4} style={{ border: '1px solid black', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>
                  สาระการเรียนรู้เพิ่มเติม
                </td>
              </tr>
              
              {additionalSubjects.map((subject) => {
                const subjectScore = selectedStudent 
                  ? scores.find(s => s.subject_code === subject.code && s.student_id === selectedStudent.id)
                  : scores.find(s => s.subject_code === subject.code);
                
                return (
                  <tr key={subject.code}>
                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                      {subject.code}
                    </td>
                    <td style={{ border: '1px solid black', padding: '8px' }}>
                      {subject.name}
                    </td>
                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                      50
                    </td>
                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                      {subjectScore ? subjectScore.score : '-'}
                    </td>
                  </tr>
                );
              })}
            </>
          )}
        </tbody>
      </table>


      {/* Signature Section */}
      <div className="mt-8" style={{ fontSize: '21px' }}>
        <div className="flex justify-between items-start">
          <div className="text-center">
            <p className="mb-6">รับรองข้อมูลถูกต้อง</p>
            <div className="mb-2">
              <span style={{ 
                borderBottom: "1px dotted #000",
                minWidth: "200px",
                display: "inline-block",
                paddingBottom: "2px"
              }}>
                {principalName ? ` ${principalName} ` : " ................................. "}
              </span>
            </div>
            <p>ผู้อำนวยการโรงเรียนบ้านดอนมูล</p>
          </div>
          <div className="text-center">
            <p className="mb-6">ตรวจสอบข้อมูลถูกต้อง</p>
            <div className="mb-2">
              <span style={{ 
                borderBottom: "1px dotted #000",
                minWidth: "200px",
                display: "inline-block",
                paddingBottom: "2px"
              }}>
                {homeRoomTeacher ? ` ${homeRoomTeacher.firstName} ${homeRoomTeacher.lastName} ` : " ................................. "}
              </span>
            </div>
            <p>ครูประจำชั้น</p>
          </div>
        </div>
      </div>
    </div>
  );
};