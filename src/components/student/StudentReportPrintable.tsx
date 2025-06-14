
import React from 'react';
import type { Student, ReportOptions } from '@/types/student';

const gradeOrder = [
  'อนุบาล 1', 'อนุบาล 2', 'อนุบาล 3',
  'ประถมศึกษาปีที่ 1', 'ประถมศึกษาปีที่ 2', 'ประถมศึกษาปีที่ 3',
  'ประถมศึกษาปีที่ 4', 'ประถมศึกษาปีที่ 5', 'ประถมศึกษาปีที่ 6'
];

const sortGrades = (grades: string[]): string[] => {
  return [...grades].sort((a, b) => gradeOrder.indexOf(a) - gradeOrder.indexOf(b));
};

const getReportColumns = (reportOptions: ReportOptions) => {
  const baseColumns = ['ลำดับที่', 'รหัสนักเรียน', 'ชื่อ - นามสกุล', 'เพศ'];
  const additionalColumns = [];
  if (reportOptions.additionalFields.citizenId) additionalColumns.push('เลขบัตรประจำตัวประชาชน');
  if (reportOptions.additionalFields.signature) additionalColumns.push('ลายเซ็น');
  if (reportOptions.additionalFields.guardianSignature) additionalColumns.push('ลายเซ็นผู้ปกครอง');
  if (reportOptions.additionalFields.timeIn) additionalColumns.push('เวลาเข้า');
  if (reportOptions.additionalFields.timeOut) additionalColumns.push('เวลาออก');
  if (reportOptions.additionalFields.phone) additionalColumns.push('เบอร์โทร');
  if (reportOptions.additionalFields.note) additionalColumns.push('หมายเหตุ');

  const customColumns: string[] = [];
  if (reportOptions.customColumns && reportOptions.customColumns > 0) {
    for (let i = 1; i <= reportOptions.customColumns; i++) {
      customColumns.push('');
    }
  }

  return [...baseColumns, ...additionalColumns, ...customColumns];
};

const ReportPage: React.FC<{ students: Student[], reportOptions: ReportOptions, classLevel: string }> = ({ students, reportOptions, classLevel }) => {
  const allColumns = getReportColumns(reportOptions);

  return (
    <div className="p-4 font-sarabun">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold">
          {reportOptions.reportType === '1' ? 'รายชื่อนักเรียนโรงเรียนบ้านดอนมูล' : 'แบบลงทะเบียนการประชุมนักเรียนโรงเรียนบ้านดอนมูล'}
        </h3>
        <p className="text-sm">ปีการศึกษา {reportOptions.academicYear}</p>
        <p className="text-sm">
          {classLevel === 'all' ? 'ทุกระดับชั้น' : `ระดับชั้น ${classLevel}`}
        </p>
      </div>
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            {allColumns.map((column, index) => (
              <th key={index} className="border border-gray-300 px-2 py-1 text-center font-medium">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.id}>
              <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{student.studentId}</td>
              <td className="border border-gray-300 px-2 py-1">{student.firstNameTh} {student.lastNameTh}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{student.gender === 'ชาย' ? 'ช' : 'ญ'}</td>
              {reportOptions.additionalFields.citizenId && <td className="border border-gray-300 px-2 py-1 text-center">{student.citizenId}</td>}
              {reportOptions.additionalFields.signature && <td className="border border-gray-300 px-2 py-1"></td>}
              {reportOptions.additionalFields.guardianSignature && <td className="border border-gray-300 px-2 py-1"></td>}
              {reportOptions.additionalFields.timeIn && <td className="border border-gray-300 px-2 py-1"></td>}
              {reportOptions.additionalFields.timeOut && <td className="border border-gray-300 px-2 py-1"></td>}
              {reportOptions.additionalFields.phone && <td className="border border-gray-300 px-2 py-1 text-center">{student.guardianPhone}</td>}
              {reportOptions.additionalFields.note && <td className="border border-gray-300 px-2 py-1"></td>}
              {Array.from({ length: reportOptions.customColumns || 0 }).map((_, colIndex) => (
                <td key={`custom-${colIndex}`} className="border border-gray-300 px-2 py-1"></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


const StudentReportPrintable: React.FC<{ students: Student[], reportOptions: ReportOptions }> = ({ students, reportOptions }) => {
  const classLevelsToPrint = reportOptions.classLevel === 'all'
    ? sortGrades([...new Set(students.map(s => s.grade))])
    : [reportOptions.classLevel];

  return (
    <>
      {classLevelsToPrint.map((level, index) => (
        <div key={level} style={{ pageBreakAfter: index < classLevelsToPrint.length - 1 ? 'always' : 'auto' }}>
          <ReportPage
            students={students.filter(s => s.grade === level)}
            reportOptions={reportOptions}
            classLevel={level}
          />
        </div>
      ))}
    </>
  );
};

export default StudentReportPrintable;
