import React from 'react';
import type { Student, ReportOptions } from '@/types/student';
import { getReportColumns } from '@/utils/studentReportUtils';

interface ReportPreviewProps {
  students: Student[];
  reportOptions: ReportOptions;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ students, reportOptions }) => {
  if (!reportOptions.classLevel || !reportOptions.academicYear) return null;

  const allColumns = getReportColumns(reportOptions);
  const maleCount = students.filter(s => s.gender === 'ชาย').length;
  const femaleCount = students.filter(s => s.gender === 'หญิง').length;
  const totalCount = students.length;

  return (
    <div className="mt-6 border rounded-lg p-4 bg-white">
      <div className="text-center mb-2 font-sarabun">
        {reportOptions.reportType === '3' ? (
          <>
            <h3 className="text-lg font-bold">
              {reportOptions.customColumn1?.trim() || 'แบบลงทะเบียนโครงการยกระดับผลสัมฤทธิ์ทางการเรียนรู้'}
            </h3>
            <p className="text-base">โรงเรียนบ้านดอนมูล</p>
            {reportOptions.customColumn2?.trim() && (
              <p className="text-sm">{reportOptions.customColumn2}</p>
            )}
          </>
        ) : reportOptions.reportType === '2' ? (
          <>
            <h3 className="text-lg font-bold">
              แบบลงทะเบียนโครงการยกระดับผลสัมฤทธิ์ทางการเรียนรู้
            </h3>
            <p className="text-base">โรงเรียนบ้านดอนมูล</p>
          </>
        ) : (
          <h3 className="text-lg font-bold">
            รายชื่อนักเรียนโรงเรียนบ้านดอนมูล
          </h3>
        )}
        
        <p className="text-sm">
          ระดับชั้น {reportOptions.classLevel === 'all' ? 'ทุกระดับชั้น' : reportOptions.classLevel} ปีการศึกษา {reportOptions.academicYear}
        </p>
      </div>

      <div className="text-sm flex justify-start gap-x-4 mb-2 font-sarabun">
        <span>จำนวนเพศชาย {maleCount} คน</span>
        <span>เพศหญิง {femaleCount} คน</span>
        <span>รวม {totalCount} คน</span>
      </div>

      <div className="overflow-auto max-h-96">
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-gray-100">
              {allColumns.map((column, index) => (
                <th key={index} className="border border-black px-2 py-1 text-center font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id}>
                <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
                <td className="border border-black px-2 py-1 text-center">{student.studentId}</td>
                <td className="border border-black px-2 py-1">{(student.titleTh || '')}{student.firstNameTh} {student.lastNameTh}</td>
                
                {/* For type 3, add the fixed columns */}
                {reportOptions.reportType === '3' && (
                  <>
                    <td className="border border-black px-2 py-1"></td>
                    <td className="border border-black px-2 py-1"></td>
                    <td className="border border-black px-2 py-1"></td>
                    <td className="border border-black px-2 py-1"></td>
                  </>
                )}
                
                {/* Additional fields for non-type-3 reports */}
                {reportOptions.reportType !== '3' && (
                  <>
                    {reportOptions.additionalFields.gender && (
                      <td className="border border-black px-2 py-1 text-center">{student.gender === 'ชาย' ? 'ช' : 'ญ'}</td>
                    )}
                    {reportOptions.additionalFields.citizenId && (
                      <td className="border border-black px-2 py-1 text-center">{student.citizenId}</td>
                    )}
                    {reportOptions.additionalFields.signature && (
                      <td className="border border-black px-2 py-1"></td>
                    )}
                    {reportOptions.additionalFields.guardianSignature && (
                      <td className="border border-black px-2 py-1"></td>
                    )}
                    {reportOptions.additionalFields.timeIn && (
                      <td className="border border-black px-2 py-1"></td>
                    )}
                    {reportOptions.additionalFields.timeOut && (
                      <td className="border border-black px-2 py-1"></td>
                    )}
                    {reportOptions.additionalFields.phone && (
                      <td className="border border-black px-2 py-1 text-center">{student.guardianPhone}</td>
                    )}

                    {/* Custom empty columns */}
                    {Array.from({ length: reportOptions.customColumns || 0 }).map((_, colIndex) => (
                      <td key={`custom-${colIndex}`} className="border border-black px-2 py-1"></td>
                    ))}

                    {/* Note column at the end */}
                    {reportOptions.additionalFields.note && (
                      <td className="border border-black px-2 py-1"></td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-600 mt-2">
        รวมทั้งหมด {students.length} รายการ
      </p>
    </div>
  );
};

export default ReportPreview;
