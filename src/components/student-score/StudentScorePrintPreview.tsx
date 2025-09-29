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
  teachers: Teacher[];
  gradeLevel: string;
  academicYear: string;
  principalName?: string;
  homeRoomTeacher?: Teacher;
}

export const StudentScorePrintPreview: React.FC<StudentScorePrintPreviewProps> = ({
  scores,
  students,
  teachers,
  gradeLevel,
  academicYear,
  principalName = "นางสาวสุทิตา ใจดี",
  homeRoomTeacher
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

  // Group scores by student
  const studentScoresBySubject = scores.reduce((acc, score) => {
    if (!acc[score.student_id]) {
      acc[score.student_id] = [];
    }
    acc[score.student_id].push(score);
    return acc;
  }, {} as Record<string, StudentScore[]>);

  // Get unique subjects
  const subjects = Array.from(new Set(scores.map(s => s.subject_code)))
    .map(code => {
      const score = scores.find(s => s.subject_code === code);
      return { code, name: score?.subject_name || '' };
    });

  if (scores.length === 0) {
    return <div>ไม่มีข้อมูลที่จะพิมพ์</div>;
  }

  return (
    <div className="w-full bg-white text-black print-content" style={{ fontSize: '12px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="text-center mb-6">
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
          บันทึกคะแนนนักเรียน 50%
        </div>
        <div style={{ fontSize: '14px', marginBottom: '4px' }}>
          โรงเรียนบ้านหนองตาไก้
        </div>
        <div style={{ fontSize: '12px' }}>
          อำเภอเมืองขอนแก่น จังหวัดขอนแก่น
        </div>
      </div>

      {/* Info */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <strong>ชั้น:</strong> {gradeLevel}
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
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '5%' }}>
              ลำดับ
            </th>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '12%' }}>
              รหัสนักเรียน
            </th>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left', width: '25%' }}>
              ชื่อ-นามสกุล
            </th>
            {subjects.map(subject => (
              <th key={subject.code} style={{ border: '1px solid black', padding: '4px', textAlign: 'center', fontSize: '10px' }}>
                {subject.name}
              </th>
            ))}
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '8%' }}>
              รวม
            </th>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '8%' }}>
              เฉลี่ย
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(studentScoresBySubject).map(([studentId, studentScores], index) => {
            const student = getStudentData(studentId);
            if (!student) return null;

            const totalScore = studentScores.reduce((sum, score) => sum + score.score, 0);
            const averageScore = studentScores.length > 0 ? (totalScore / studentScores.length).toFixed(2) : '0.00';

            return (
              <tr key={studentId}>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>
                  {index + 1}
                </td>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>
                  {student.studentId}
                </td>
                <td style={{ border: '1px solid black', padding: '6px' }}>
                  {student.titleTh}{student.firstNameTh} {student.lastNameTh}
                </td>
                {subjects.map(subject => {
                  const subjectScore = studentScores.find(s => s.subject_code === subject.code);
                  return (
                    <td key={subject.code} style={{ border: '1px solid black', padding: '4px', textAlign: 'center', fontSize: '10px' }}>
                      {subjectScore ? subjectScore.score : '-'}
                    </td>
                  );
                })}
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>
                  {totalScore}
                </td>
                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>
                  {averageScore}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary */}
      <div className="mt-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>จำนวนนักเรียนทั้งหมด:</strong> {Object.keys(studentScoresBySubject).length} คน
          </div>
          <div>
            <strong>จำนวนวิชาทั้งหมด:</strong> {subjects.length} วิชา
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="mt-16">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <div style={{ marginBottom: '60px' }}>
              ลงชื่อ ......................................
            </div>
            <div>
              ({principalName})
            </div>
            <div>
              ผู้อำนวยการโรงเรียน
            </div>
          </div>
          <div className="text-center">
            <div style={{ marginBottom: '60px' }}>
              ลงชื่อ ......................................
            </div>
            <div>
              ({homeRoomTeacher ? `${homeRoomTeacher.firstName} ${homeRoomTeacher.lastName}` : '.....................................'})
            </div>
            <div>
              ครูประจำชั้น
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};