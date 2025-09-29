import React from 'react';
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
  teacher?: Teacher;
  subject?: Subject | null;
  gradeLevel: string;
  academicYear: string;
}

export const StudentScorePrintPreview: React.FC<StudentScorePrintPreviewProps> = ({
  scores,
  students,
  teacher,
  subject,
  gradeLevel,
  academicYear
}) => {
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

  if (!teacher || !subject || scores.length === 0) {
    return <div>ไม่มีข้อมูลที่จะพิมพ์</div>;
  }

  return (
    <div className="w-full bg-white text-black print-content" style={{ fontSize: '12px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="text-center mb-6">
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
          บันทึกคะแนนนักเรียน
        </div>
        <div style={{ fontSize: '14px', marginBottom: '4px' }}>
          โรงเรียนบ้านหนองตาไก้
        </div>
        <div style={{ fontSize: '12px' }}>
          อำเภอเมืองขอนแก่น จังหวัดขอนแก่น
        </div>
      </div>

      {/* Subject and Teacher Info */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <strong>รายวิชา:</strong> {subject.code} - {subject.name}
          </div>
          <div>
            <strong>ชั้น:</strong> {gradeLevel}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <strong>ครูผู้สอน:</strong> {teacher.firstName} {teacher.lastName}
          </div>
          <div>
            <strong>ปีการศึกษา:</strong> {academicYear}
          </div>
        </div>
        <div>
          <strong>วันที่พิมพ์:</strong> {formatDate()}
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse" style={{ border: '1px solid black' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '8%' }}>
              ลำดับ
            </th>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '15%' }}>
              รหัสนักเรียน
            </th>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left', width: '35%' }}>
              ชื่อ-นามสกุล
            </th>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '15%' }}>
              คะแนนเต็ม
            </th>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '15%' }}>
              คะแนนที่ได้
            </th>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '12%' }}>
              เปอร์เซ็นต์
            </th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score, index) => {
            const student = getStudentData(score.student_id);
            const percentage = score.max_score > 0 ? ((score.score / score.max_score) * 100).toFixed(2) : '0.00';
            
            if (!student) return null;

            return (
              <tr key={score.student_id}>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>
                  {index + 1}
                </td>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>
                  {student.studentId}
                </td>
                <td style={{ border: '1px solid black', padding: '6px' }}>
                  {student.titleTh}{student.firstNameTh} {student.lastNameTh}
                </td>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>
                  {score.max_score}
                </td>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>
                  {score.score}
                </td>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>
                  {percentage}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary */}
      <div className="mt-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <strong>จำนวนนักเรียนทั้งหมด:</strong> {scores.length} คน
          </div>
          <div>
            <strong>คะแนนเฉลีย:</strong> {
              scores.length > 0 
                ? (scores.reduce((sum, score) => sum + score.score, 0) / scores.length).toFixed(2)
                : '0.00'
            }
          </div>
          <div>
            <strong>ผ่านเกณฑ์ (≥50%):</strong> {
              scores.filter(score => score.max_score > 0 && (score.score / score.max_score) * 100 >= 50).length
            } คน
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="mt-12 text-right">
        <div className="inline-block text-center">
          <div style={{ marginBottom: '60px' }}>
            ลงชื่อ ......................................
          </div>
          <div>
            ({teacher.firstName} {teacher.lastName})
          </div>
          <div>
            ครูผู้สอน
          </div>
        </div>
      </div>
    </div>
  );
};