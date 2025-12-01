
import React from 'react';
import type { StudentScore } from '@/types/studentAnalysis';

interface SubjectReportPrintableProps {
  students: StudentScore[];
  selectedSubject: string;
  academicYear: string;
  semester?: string;
}

const SubjectReportPrintable = React.forwardRef<HTMLDivElement, SubjectReportPrintableProps>(
  ({ students, selectedSubject, academicYear, semester }, ref) => {
    if (students.length === 0 || !selectedSubject) {
      return <div ref={ref} className="hidden"></div>;
    }

    // Filter students who have scores for the selected subject
    const studentsWithSubject = students.filter(student => 
      student.scores[selectedSubject] !== undefined
    );

    // Group students by their score in the selected subject
    const analyzeSubjectGroup = (score: number): 'เก่ง' | 'ปานกลาง' | 'อ่อน' => {
      if (score >= 4.0) return 'เก่ง';
      if (score >= 2.0) return 'ปานกลาง';
      return 'อ่อน';
    };

    // Group students by grade and then by performance group
    const studentsByGrade: { [key: string]: { [key: string]: StudentScore[] } } = {};
    
    studentsWithSubject.forEach(student => {
      const grade = student.grade || 'ไม่ระบุชั้น';
      const subjectScore = student.scores[selectedSubject];
      const group = analyzeSubjectGroup(subjectScore);
      
      if (!studentsByGrade[grade]) {
        studentsByGrade[grade] = { 'เก่ง': [], 'ปานกลาง': [], 'อ่อน': [] };
      }
      studentsByGrade[grade][group].push({
        ...student,
        group: group
      });
    });

    const sortedGrades = Object.keys(studentsByGrade).sort((a, b) => {
      const aNum = parseInt(a.replace('ป.', ''));
      const bNum = parseInt(b.replace('ป.', ''));
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a.localeCompare(b);
    });

    return (
      <div ref={ref} className="hidden print:block p-4 font-sarabun text-base">
        {sortedGrades.map((grade, pageIndex) => (
          <div key={grade} className={pageIndex < sortedGrades.length - 1 ? 'break-after-page' : ''}>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-2">รายงานการวิเคราะห์ผู้เรียนรายวิชา</h2>
              <p className="text-lg mb-1">{semester ? `ภาคเรียนที่ ${semester} ` : ''}ปีการศึกษา {academicYear || '.........'} โรงเรียนบ้านดอนมูล</p>
              <p className="text-lg mb-1">วิชา: {selectedSubject}</p>
              <p className="text-lg">ระดับชั้น {grade}</p>
            </div>

            {/* Summary Statistics */}
            <div className="mb-4 text-center">
              <div className="inline-flex gap-6 text-sm">
                <span>จำนวนนักเรียนทั้งหมด: {Object.values(studentsByGrade[grade]).flat().length} คน</span>
                <span className="text-green-600">เก่ง: {studentsByGrade[grade]['เก่ง'].length} คน</span>
                <span className="text-yellow-600">ปานกลาง: {studentsByGrade[grade]['ปานกลาง'].length} คน</span>
                <span className="text-red-600">อ่อน: {studentsByGrade[grade]['อ่อน'].length} คน</span>
              </div>
            </div>

            {/* Students grouped by performance */}
            {['เก่ง', 'ปานกลาง', 'อ่อน'].map(group => {
              const groupStudents = studentsByGrade[grade][group];
              if (groupStudents.length === 0) return null;

              return (
                <div key={group} className="mb-6">
                  <h3 className="text-lg font-bold mb-2 text-center">
                    กลุ่ม{group} (คะแนน {group === 'เก่ง' ? '4.00' : group === 'ปานกลาง' ? '2.0-3.99' : 'ต่ำกว่า 2.0'})
                    <span className="ml-2 text-sm font-normal">จำนวน {groupStudents.length} คน</span>
                  </h3>
                  
                  <table className="w-full border-collapse border border-black text-sm mb-4">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-black px-2 py-1 text-center font-medium">ลำดับ</th>
                        <th className="border border-black px-2 py-1 text-center font-medium">รหัสนักเรียน</th>
                        <th className="border border-black px-2 py-1 text-center font-medium">ชื่อ-นามสกุล</th>
                        <th className="border border-black px-2 py-1 text-center font-medium">คะแนน {selectedSubject}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupStudents
                        .sort((a, b) => a.studentId.localeCompare(b.studentId))
                        .map((student, index) => (
                        <tr key={student.id}>
                          <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
                          <td className="border border-black px-2 py-1 text-center">{student.studentId}</td>
                          <td className="border border-black px-2 py-1 text-left">{student.studentName}</td>
                          <td className="border border-black px-2 py-1 text-center">
                            {student.scores[selectedSubject]?.toFixed(2) || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }
);

SubjectReportPrintable.displayName = 'SubjectReportPrintable';

export default SubjectReportPrintable;
