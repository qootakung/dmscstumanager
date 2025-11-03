
import React from 'react';
import type { Teacher } from '@/types/teacher';
import type { TeacherReportOptions } from '@/types/teacherReport';
import { sortTeachersByPosition } from '@/utils/teacherSortUtils';
import { loadColumnWidths } from '@/utils/columnWidthStorage';
import { formatThaiDate } from '@/utils/teacherReportExcel';
import { cn } from '@/lib/utils';

interface TeacherReportPrintableWithColumnsProps {
  teachers: Teacher[];
  reportOptions: TeacherReportOptions;
}

const TeacherReportPrintableWithColumns: React.FC<TeacherReportPrintableWithColumnsProps> = ({ 
  teachers, 
  reportOptions 
}) => {
  const filteredTeachers = teachers
    .filter(teacher => teacher.academicYear === reportOptions.academicYear);
  
  const sortedTeachers = sortTeachersByPosition(filteredTeachers);

  // สร้างคอลัมน์เหมือนกับ ResizableTeacherReportPreview
  const baseColumns = ['ลำดับที่', 'ชื่อ - นามสกุล'];
  const additionalColumns = [];
  if (reportOptions.additionalFields.position) additionalColumns.push('ตำแหน่ง');
  if (reportOptions.additionalFields.email) additionalColumns.push('Email');
  if (reportOptions.additionalFields.citizenId) additionalColumns.push('เลขบัตรประจำตัวประชาชน');
  if (reportOptions.additionalFields.salary) additionalColumns.push('เงินเดือน');
  if (reportOptions.additionalFields.birthDate) additionalColumns.push('วัน/เดือน/ปีเกิด');
  if (reportOptions.additionalFields.appointmentDate) additionalColumns.push('วันที่บรรจุ');
  if (reportOptions.additionalFields.education) additionalColumns.push('วุฒิการศึกษา');
  if (reportOptions.additionalFields.major) additionalColumns.push('วิชาเอก');
  if (reportOptions.additionalFields.phone) additionalColumns.push('เบอร์โทร');
  if (reportOptions.additionalFields.lineId) additionalColumns.push('ID Line');
  if (reportOptions.additionalFields.signature) additionalColumns.push('ลายมือชื่อ');
  if (reportOptions.additionalFields.signature2) additionalColumns.push('ลายมือชื่อ');
  if (reportOptions.additionalFields.timeIn) additionalColumns.push('เวลามา');
  if (reportOptions.additionalFields.timeOut) additionalColumns.push('เวลากลับ');

  const customColumns = [];
  if (reportOptions.customColumns && reportOptions.customColumns > 0) {
    for (let i = 1; i <= reportOptions.customColumns; i++) {
      customColumns.push('');
    }
  }

  const noteColumn = [];
  if (reportOptions.additionalFields.note) {
    noteColumn.push('หมายเหตุ');
  }

  const allColumns = [...baseColumns, ...additionalColumns, ...customColumns, ...noteColumn];
  
  // โหลดขนาดคอลัมน์ที่บันทึกไว้
  const reportKey = `teacher_${reportOptions.reportType}_${reportOptions.academicYear}`;
  const defaultWidths = allColumns.map((_, index) => {
    if (index === 0) return 80; // ลำดับที่
    if (index === 1) return 200; // ชื่อ-สกุล
    return 120; // คอลัมน์อื่นๆ
  });
  const columnWidths = loadColumnWidths(reportKey, defaultWidths);

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
      
      <div className="text-center mb-4 font-sarabun">
        <h3 className="text-base font-bold">
          {reportOptions.reportType === '1' 
            ? 'รายชื่อข้าราชการครูและบุคลากรทางการศึกษาโรงเรียนบ้านดอนมูล' 
            : 'แบบลงทะเบียนการประชุมข้าราชการครูและบุคลากรทางการศึกษาโรงเรียนบ้านดอนมูล'
          }
        </h3>
        <p className="text-sm">ปีการศึกษา {reportOptions.academicYear}</p>
        {reportOptions.showDate && reportOptions.selectedDate && (
          <p className="text-sm">วันที่ {formatThaiDate(reportOptions.selectedDate)}</p>
        )}
      </div>
      
      <div className="overflow-x-auto">
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
            {sortedTeachers.map((teacher, index) => {
              let colIndex = 0;
              
              return (
              <tr key={teacher.id}>
                <td className="border border-black px-2 py-1 text-center" style={{ width: `${columnWidths[colIndex++]}px` }}>{index + 1}</td>
                <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[colIndex++]}px` }}>{teacher.firstName} {teacher.lastName}</td>
                
                {/* Additional fields with respective widths */}
                {reportOptions.additionalFields.position && (
                  <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[colIndex++]}px` }}>{teacher.position}</td>
                )}
                {reportOptions.additionalFields.email && (
                  <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[colIndex++]}px` }}>{teacher.email || ''}</td>
                )}
                {reportOptions.additionalFields.citizenId && (
                  <td className="border border-black px-2 py-1 text-center" style={{ width: `${columnWidths[colIndex++]}px` }}>{teacher.citizenId}</td>
                )}
                {reportOptions.additionalFields.salary && (
                  <td className="border border-black px-2 py-1 text-center" style={{ width: `${columnWidths[colIndex++]}px` }}>{teacher.salary}</td>
                )}
                {reportOptions.additionalFields.birthDate && (
                  <td className="border border-black px-2 py-1 text-center" style={{ width: `${columnWidths[colIndex++]}px` }}>{formatThaiDate(teacher.birthDate)}</td>
                )}
                {reportOptions.additionalFields.appointmentDate && (
                  <td className="border border-black px-2 py-1 text-center" style={{ width: `${columnWidths[colIndex++]}px` }}>{formatThaiDate(teacher.appointmentDate)}</td>
                )}
                {reportOptions.additionalFields.education && (
                  <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[colIndex++]}px` }}>{teacher.education}</td>
                )}
                {reportOptions.additionalFields.major && (
                  <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[colIndex++]}px` }}>{teacher.majorSubject}</td>
                )}
                {reportOptions.additionalFields.phone && (
                  <td className="border border-black px-2 py-1 text-center" style={{ width: `${columnWidths[colIndex++]}px` }}>{teacher.phone}</td>
                )}
                {reportOptions.additionalFields.lineId && (
                  <td className="border border-black px-2 py-1 text-center" style={{ width: `${columnWidths[colIndex++]}px` }}>{teacher.lineId}</td>
                )}
                {reportOptions.additionalFields.signature && (
                  <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[colIndex++]}px` }}></td>
                )}
                {reportOptions.additionalFields.signature2 && (
                  <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[colIndex++]}px` }}></td>
                )}
                {reportOptions.additionalFields.timeIn && (
                  <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[colIndex++]}px` }}></td>
                )}
                {reportOptions.additionalFields.timeOut && (
                  <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[colIndex++]}px` }}></td>
                )}
                
                {/* Custom empty columns */}
                {customColumns.map((_, customColIndex) => {
                  return (
                    <td key={`custom-${customColIndex}`} className="border border-black px-2 py-1" style={{ width: `${columnWidths[colIndex++]}px` }}></td>
                  );
                })}

                {/* Note column */}
                {reportOptions.additionalFields.note && (
                  <td className="border border-black px-2 py-1" style={{ width: `${columnWidths[colIndex++]}px` }}></td>
                )}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherReportPrintableWithColumns;
