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
  console.log('StudentScorePrintPreview - All props:', {
    scoresCount: scores.length,
    studentsCount: students.length,
    gradeLevel,
    selectedStudent: selectedStudent ? { id: selectedStudent.id, name: `${selectedStudent.firstNameTh} ${selectedStudent.lastNameTh}` } : null
  });
  console.log('StudentScorePrintPreview - All scores:', scores);
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

  // Get standard subjects for the grade level
  const getSubjectsForGrade = (grade: string) => {
    const gradeSubjects = {
      'ป.1': [
        { code: 'ท11101', name: 'ภาษาไทย' },
        { code: 'ค11101', name: 'คณิตศาสตร์' },
        { code: 'ว11101', name: 'วิทยาศาสตร์และเทคโนโลยี' },
        { code: 'ส11101', name: 'สังคมศึกษา ศาสนาและวัฒนธรรม' },
        { code: 'ส11102', name: 'ประวัติศาสตร์' },
        { code: 'พ11101', name: 'สุขศึกษาและพลศึกษา' },
        { code: 'ศ11101', name: 'ศิลปะ' },
        { code: 'ง11101', name: 'การงานอาชีพ' },
        { code: 'อ11101', name: 'ภาษาอังกฤษ' }
      ],
      'ป.2': [
        { code: 'ท12101', name: 'ภาษาไทย' },
        { code: 'ค12101', name: 'คณิตศาสตร์' },
        { code: 'ว12101', name: 'วิทยาศาสตร์และเทคโนโลยี' },
        { code: 'ส12101', name: 'สังคมศึกษา ศาสนาและวัฒนธรรม' },
        { code: 'ส12102', name: 'ประวัติศาสตร์' },
        { code: 'พ12101', name: 'สุขศึกษาและพลศึกษา' },
        { code: 'ศ12101', name: 'ศิลปะ' },
        { code: 'ง12101', name: 'การงานอาชีพ' },
        { code: 'อ12101', name: 'ภาษาอังกฤษ' }
      ],
      'ป.3': [
        { code: 'ท13101', name: 'ภาษาไทย' },
        { code: 'ค13101', name: 'คณิตศาสตร์' },
        { code: 'ว13101', name: 'วิทยาศาสตร์และเทคโนโลยี' },
        { code: 'ส13101', name: 'สังคมศึกษา ศาสนาและวัฒนธรรม' },
        { code: 'ส13102', name: 'ประวัติศาสตร์' },
        { code: 'พ13101', name: 'สุขศึกษาและพลศึกษา' },
        { code: 'ศ13101', name: 'ศิลปะ' },
        { code: 'ง13101', name: 'การงานอาชีพ' },
        { code: 'อ13101', name: 'ภาษาอังกฤษ' }
      ],
      'ป.4': [
        { code: 'ท14101', name: 'ภาษาไทย' },
        { code: 'ค14101', name: 'คณิตศาสตร์' },
        { code: 'ว14101', name: 'วิทยาศาสตร์และเทคโนโลยี' },
        { code: 'ส14101', name: 'สังคมศึกษา ศาสนาและวัฒนธรรม' },
        { code: 'ส14102', name: 'ประวัติศาสตร์' },
        { code: 'พ14101', name: 'สุขศึกษาและพลศึกษา' },
        { code: 'ศ14101', name: 'ศิลปะ' },
        { code: 'ง14101', name: 'การงานอาชีพ' },
        { code: 'อ14101', name: 'ภาษาอังกฤษ' }
      ],
      'ป.5': [
        { code: 'ท15101', name: 'ภาษาไทย' },
        { code: 'ค15101', name: 'คณิตศาสตร์' },
        { code: 'ว15101', name: 'วิทยาศาสตร์และเทคโนโลยี' },
        { code: 'ส15101', name: 'สังคมศึกษา ศาสนาและวัฒนธรรม' },
        { code: 'ส15102', name: 'ประวัติศาสตร์' },
        { code: 'พ15101', name: 'สุขศึกษาและพลศึกษา' },
        { code: 'ศ15101', name: 'ศิลปะ' },
        { code: 'ง15101', name: 'การงานอาชีพ' },
        { code: 'อ15101', name: 'ภาษาอังกฤษ' }
      ],
      'ป.6': [
        { code: 'ท16101', name: 'ภาษาไทย' },
        { code: 'ค16101', name: 'คณิตศาสตร์' },
        { code: 'ว16101', name: 'วิทยาศาสตร์และเทคโนโลยี' },
        { code: 'ส16101', name: 'สังคมศึกษา ศาสนาและวัฒนธรรม' },
        { code: 'ส16102', name: 'ประวัติศาสตร์' },
        { code: 'พ16101', name: 'สุขศึกษาและพลศึกษา' },
        { code: 'ศ16101', name: 'ศิลปะ' },
        { code: 'ง16101', name: 'การงานอาชีพ' },
        { code: 'อ16101', name: 'ภาษาอังกฤษ' }
      ]
    };
    return gradeSubjects[grade as keyof typeof gradeSubjects] || [];
  };

  const subjects = getSubjectsForGrade(gradeLevel);

  const getAdditionalSubjects = (grade: string) => {
    const gradeNumber = grade.replace('ป.', '');
    const baseSubjects = [
      { code: `อ1${gradeNumber}201`, name: 'ภาษาอังกฤษเพื่อการสื่อสาร' },
      { code: `ว1${gradeNumber}102`, name: 'วิทยาการคำนวณ' },
      { code: `ส1${gradeNumber}202`, name: 'ป้องกันการทุจริต' }
    ];
    
    // Add "วิทย์พลังสิบ" for grades 4-6
    if (['4', '5', '6'].includes(gradeNumber)) {
      baseSubjects.push({ code: `ว1${gradeNumber}202`, name: 'วิทย์พลังสิบ' });
    }
    
    return baseSubjects;
  };

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
            ชื่อ-สกุลนักเรียน: {selectedStudent.firstNameTh} {selectedStudent.lastNameTh} 
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
          {subjects.map((subject) => {
            // Find score for this subject and selected student
            const subjectScore = selectedStudent 
              ? scores.find(s => s.subject_code === subject.code && s.student_id === selectedStudent.id)
              : scores.find(s => s.subject_code === subject.code);
            
            // Log for debugging
            console.log('Subject:', subject.code, 'Score found:', subjectScore);
            
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
                  {subjectScore ? subjectScore.score : ''}
                </td>
              </tr>
            );
          })}
          
          {/* Additional Learning Areas Section */}
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <td colSpan={4} style={{ border: '1px solid black', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>
              สาระการเรียนรู้เพิ่มเติม
            </td>
          </tr>
          
          {/* Additional subjects based on grade */}
          {getAdditionalSubjects(gradeLevel).map((subject) => {
            const subjectScore = selectedStudent 
              ? scores.find(s => s.subject_code === subject.code && s.student_id === selectedStudent.id)
              : scores.find(s => s.subject_code === subject.code);
            
            // Log for debugging
            console.log('Additional Subject:', subject.code, 'Score found:', subjectScore);
            
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
                  {subjectScore ? subjectScore.score : ''}
                </td>
              </tr>
            );
          })}
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