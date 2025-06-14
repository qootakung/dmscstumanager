import React from 'react';
import type { Student, ReportOptions } from '@/types/student';
import { sortGrades, getReportColumns } from '@/utils/studentReportUtils';

const ReportPage: React.FC<{ students: Student[], reportOptions: ReportOptions, classLevel: string }> = ({ students, reportOptions, classLevel }) => {
  const allColumns = getReportColumns(reportOptions);
  const maleCount = students.filter(s => s.gender === 'ชาย').length;
  const femaleCount = students.filter(s => s.gender === 'หญิง').length;
  const totalCount = students.length;

  return (
    <div className="p-4 font-sarabun">
      <div className="text-center mb-2">
        <h3 className="text-lg font-bold">
          {reportOptions.reportType === '1' ? 'รายชื่อนักเรียนโรงเรียนบ้านดอนมูล' : 'แบบลงทะเบียนการประชุมนักเรียนโรงเรียนบ้านดอนมูล'}
        </h3>
        <p className="text-sm">ปีการศึกษา {reportOptions.academicYear}</p>
        <p className="text-sm">
          {classLevel === 'all' ? 'ทุกระดับชั้น' : `ระดับชั้น ${classLevel}`}
        </p>
      </div>
      <div className="text-sm flex justify-start gap-x-4 mb-2">
        <span>จำนวนเพศชาย {maleCount} คน</span>
        <span>เพศหญิง {femaleCount} คน</span>
        <span>รวม {totalCount} คน</span>
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
              <td className="border border-gray-300 px-2 py-1">{(student.titleTh || '')}{student.firstNameTh} {student.lastNameTh}</td>
              {reportOptions.additionalFields.gender && <td className="border border-gray-300 px-2 py-1 text-center">{student.gender === 'ชาย' ? 'ช' : 'ญ'}</td>}
              {reportOptions.additionalFields.citizenId && <td className="border border-gray-300 px-2 py-1 text-center">{student.citizenId}</td>}
              {reportOptions.additionalFields.signature && <td className="border border-gray-300 px-2 py-1"></td>}
              {reportOptions.additionalFields.guardianSignature && <td className="border border-gray-300 px-2 py-1"></td>}
              {reportOptions.additionalFields.timeIn && <td className="border border-gray-300 px-2 py-1"></td>}
              {reportOptions.additionalFields.timeOut && <td className="border border-gray-300 px-2 py-1"></td>}
              {reportOptions.additionalFields.phone && <td className="border border-gray-300 px-2 py-1 text-center">{student.guardianPhone}</td>}
              {Array.from({ length: reportOptions.customColumns || 0 }).map((_, colIndex) => (
                <td key={`custom-${colIndex}`} className="border border-gray-300 px-2 py-1"></td>
              ))}
              {reportOptions.additionalFields.note && <td className="border border-gray-300 px-2 py-1"></td>}
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
