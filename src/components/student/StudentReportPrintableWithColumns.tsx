
import React from 'react';
import type { Student, ReportOptions } from '@/types/student';
import { getReportColumns, calculateAge, formatAddress, formatBirthDate } from '@/utils/studentReportUtils';
import { loadColumnWidths } from '@/utils/columnWidthStorage';

interface StudentReportPrintableWithColumnsProps {
  students: Student[];
  reportOptions: ReportOptions;
}

const StudentReportPrintableWithColumns: React.FC<StudentReportPrintableWithColumnsProps> = ({ 
  students, 
  reportOptions 
}) => {
  const allColumns = getReportColumns(reportOptions);
  
  // โหลดขนาดคอลัมน์ที่บันทึกไว้
  const reportKey = `student_${reportOptions.reportType}_${reportOptions.classLevel}_${reportOptions.academicYear}`;
  const defaultWidths = allColumns.map((_, index) => {
    if (index === 0) return 80; // ลำดับที่
    if (index === 1) return 120; // รหัสนักเรียน
    if (index === 2) return 200; // ชื่อ-สกุล
    return 120; // คอลัมน์อื่นๆ
  });
  const columnWidths = loadColumnWidths(reportKey, defaultWidths);

  const maleCount = students.filter(s => s.gender === 'ชาย').length;
  const femaleCount = students.filter(s => s.gender === 'หญิง').length;

  return (
    <div className="p-4 font-sarabun">
      <style>{`
        body { 
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        @media print {
          table, th, td {
            border: 1px solid #000 !important;
            border-collapse: collapse !important;
          }
          th {
            background-color: #f3f4f6 !important;
          }
        }
      `}</style>
      
      <div className="text-center mb-2 font-sarabun">
        {reportOptions.reportType === '3' ? (
          <>
            {reportOptions.customColumn1?.trim() && (
              <h3 className="text-lg font-bold">
                {reportOptions.customColumn1}
              </h3>
            )}
            {reportOptions.customColumn2?.trim() && (
              <p className="text-lg">
                {reportOptions.customColumn2}
              </p>
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
          {reportOptions.classLevel === 'all' ? 'ทุกระดับชั้น' : `ระดับชั้น ${reportOptions.classLevel}`} ปีการศึกษา {reportOptions.academicYear}
        </p>
      </div>

      <div className="text-sm flex justify-start gap-x-4 mb-2 font-sarabun">
        <span>จำนวนเพศชาย {maleCount} คน</span>
        <span>เพศหญิง {femaleCount} คน</span>
        <span>รวม {students.length} คน</span>
      </div>

      <div className="overflow-auto">
        <table className="w-full border-collapse border border-black text-sm" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr className="bg-gray-100">
              {allColumns.map((column, index) => (
                <th 
                  key={index} 
                  className="border border-black px-2 py-1 text-center font-medium"
                  style={{ width: `${columnWidths[index]}px`, minWidth: `${columnWidths[index]}px` }}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id}>
                <td className="border border-black px-2 py-1 text-center" style={{ width: `${columnWidths[0]}px` }}>{index + 1}</td>
                <td className="border border-black px-2 py-1 text-center" style={{ width: `${columnWidths[1]}px` }}>{student.studentId}</td>
                <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[2]}px` }}>{(student.titleTh || '')}{student.firstNameTh} {student.lastNameTh}</td>
                
                {/* For type 3, add the fixed columns */}
                {reportOptions.reportType === '3' && (
                  <>
                    <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[3]}px` }}></td>
                    <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[4]}px` }}></td>
                    <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[5]}px` }}></td>
                    <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[6]}px` }}></td>
                  </>
                )}
                
                {/* Additional fields for non-type-3 reports */}
                {reportOptions.reportType !== '3' && (
                  <>
                    {reportOptions.additionalFields.gradeLevel && (
                      <td className="border border-black px-2 py-1 text-center" style={{ width: `${columnWidths[allColumns.indexOf('ระดับชั้น')]}px` }}>{student.grade}</td>
                    )}
                    {reportOptions.additionalFields.gender && (
                      <td className="border border-black px-2 py-1 text-center" style={{ width: `${columnWidths[allColumns.indexOf('เพศ')]}px` }}>{student.gender === 'ชาย' ? 'ช' : 'ญ'}</td>
                    )}
                    {reportOptions.additionalFields.citizenId && (
                      <td className="border border-black px-2 py-1 text-center" style={{ width: `${columnWidths[allColumns.indexOf('เลขบัตรประจำตัวประชาชน')]}px` }}>{student.citizenId}</td>
                    )}
                    {reportOptions.additionalFields.birthDate && (
                      <td className="border border-black px-2 py-1 text-center" style={{ width: `${columnWidths[allColumns.indexOf('วันเดือนปีเกิด')]}px` }}>{formatBirthDate(student.birthDate)}</td>
                    )}
                    {reportOptions.additionalFields.age && (
                      <td className="border border-black px-2 py-1 text-center" style={{ width: `${columnWidths[allColumns.indexOf('อายุ')]}px` }}>{calculateAge(student.birthDate)}</td>
                    )}
                    {reportOptions.additionalFields.address && (
                      <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[allColumns.indexOf('ที่อยู่')]}px` }}>{formatAddress(student)}</td>
                    )}
                    {reportOptions.additionalFields.signature && (
                      <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[allColumns.indexOf('ลายมือชื่อ')]}px` }}></td>
                    )}
                    {reportOptions.additionalFields.guardianSignature && (
                      <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[allColumns.indexOf('ลายเซ็นผู้ปกครอง')]}px` }}></td>
                    )}
                    {reportOptions.additionalFields.timeIn && (
                      <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[allColumns.indexOf('เวลามา')]}px` }}></td>
                    )}
                    {reportOptions.additionalFields.timeOut && (
                      <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[allColumns.indexOf('เวลากลับ')]}px` }}></td>
                    )}
                    {reportOptions.additionalFields.phone && (
                      <td className="border border-black px-2 py-1 text-center" style={{ width: `${columnWidths[allColumns.indexOf('เบอร์โทร')]}px` }}>{student.guardianPhone}</td>
                    )}

                    {/* Custom empty columns */}
                    {Array.from({ length: reportOptions.customColumns || 0 }).map((_, colIndex) => {
                      const columnIndex = allColumns.length - (reportOptions.additionalFields.note ? 1 : 0) - (reportOptions.customColumns || 0) + colIndex;
                      return (
                        <td key={`custom-${colIndex}`} className="border border-black px-2 py-1" style={{ width: `${columnWidths[columnIndex]}px` }}></td>
                      );
                    })}

                    {/* Note column at the end */}
                    {reportOptions.additionalFields.note && (
                      <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[allColumns.length - 1]}px` }}></td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentReportPrintableWithColumns;
