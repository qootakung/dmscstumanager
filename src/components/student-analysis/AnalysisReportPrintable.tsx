
import React from 'react';
import type { StudentScore } from '@/types/studentAnalysis';

interface AnalysisReportPrintableProps {
  students: StudentScore[];
  academicYear: string;
}

const AnalysisReportPrintable = React.forwardRef<HTMLDivElement, AnalysisReportPrintableProps>(({ students, academicYear }, ref) => {
  if (students.length === 0) {
    return <div ref={ref} className="hidden"></div>;
  }

  const studentsByGrade: { [key: string]: StudentScore[] } = students.reduce((acc, student) => {
    const grade = student.grade || 'ไม่ระบุชั้น';
    if (!acc[grade]) {
      acc[grade] = [];
    }
    acc[grade].push(student);
    return acc;
  }, {} as { [key: string]: StudentScore[] });

  const sortedGrades = Object.keys(studentsByGrade).sort((a, b) => {
    const aNum = parseInt(a.replace('ป.', ''));
    const bNum = parseInt(b.replace('ป.', ''));
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    return a.localeCompare(b);
  });

  return (
    <div ref={ref} className="hidden print:block p-4" style={{ fontFamily: "'TH SarabunPSK', 'Sarabun', sans-serif", fontSize: '16px' }}>
      {sortedGrades.map((grade, pageIndex) => (
        <div key={grade} className={pageIndex < sortedGrades.length - 1 ? 'break-after-page' : ''}>
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold">สรุปผลการวิเคราะห์ผู้เรียนรายบุคคล</h2>
            <p className="text-lg">ปีการศึกษา {academicYear || '.........'} โรงเรียนบ้านดอนมูล</p>
          </div>
          
          <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">ระดับชั้น {grade}</h3>
              <p className="text-sm">จำนวน {studentsByGrade[grade].length} คน</p>
          </div>

          <table className="w-full border-collapse border border-black">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black px-2 py-1 text-center font-normal">ลำดับ</th>
                <th className="border border-black px-2 py-1 text-center font-normal">รหัสนักเรียน</th>
                <th className="border border-black px-2 py-1 text-center font-normal">ชื่อ-นามสกุล</th>
                <th className="border border-black px-2 py-1 text-center font-normal">คะแนนเฉลี่ย</th>
                <th className="border border-black px-2 py-1 text-center font-normal">กลุ่ม</th>
                <th className="border border-black px-2 py-1 text-center font-normal">จำนวนวิชาที่ประเมิน</th>
              </tr>
            </thead>
            <tbody style={{ fontWeight: 'normal' }}>
              {studentsByGrade[grade].map((student, index) => (
                <tr key={student.id}>
                  <td className="border border-black px-2 py-1 text-center font-normal">{index + 1}</td>
                  <td className="border border-black px-2 py-1 text-center font-normal">{student.studentId}</td>
                  <td className="border border-black px-2 py-1 text-left font-normal">{student.studentName}</td>
                  <td className="border border-black px-2 py-1 text-center font-normal">{student.averageScore.toFixed(2)}</td>
                  <td className="border border-black px-2 py-1 text-center font-normal">{student.group}</td>
                  <td className="border border-black px-2 py-1 text-center font-normal">{Object.keys(student.scores).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
});

AnalysisReportPrintable.displayName = 'AnalysisReportPrintable';

export default AnalysisReportPrintable;
