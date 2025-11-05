
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
  
  // แมป field name กับชื่อคอลัมน์
  const fieldColumnMap: Record<string, string> = {
    position: 'ตำแหน่ง',
    email: 'Email',
    citizenId: 'เลขบัตรประจำตัวประชาชน',
    salary: 'เงินเดือน',
    birthDate: 'วัน/เดือน/ปีเกิด',
    appointmentDate: 'วันที่บรรจุ',
    education: 'วุฒิการศึกษา',
    major: 'วิชาเอก',
    phone: 'เบอร์โทร',
    lineId: 'ID Line',
    signature: 'ลายมือชื่อ',
    signature2: 'ลายมือชื่อ',
    timeIn: 'เวลามา',
    timeOut: 'เวลากลับ',
  };

  // สร้างคอลัมน์ตามลำดับที่เลือก
  const additionalColumns = reportOptions.fieldOrder
    .filter(field => field !== 'note' && reportOptions.additionalFields[field as keyof typeof reportOptions.additionalFields])
    .map(field => fieldColumnMap[field] || '');

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
            : reportOptions.reportType === '2'
            ? 'แบบลงทะเบียนการประชุมข้าราชการครูและบุคลากรทางการศึกษาโรงเรียนบ้านดอนมูล'
            : reportOptions.customTitle1 || 'แบบลงทะเบียน'
          }
        </h3>
        {reportOptions.reportType === '3' && reportOptions.customTitle2 && (
          <p className="text-sm">{reportOptions.customTitle2}</p>
        )}
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
                
                {/* Additional fields ตามลำดับที่เลือก */}
                {reportOptions.fieldOrder
                  .filter(field => field !== 'note' && reportOptions.additionalFields[field as keyof typeof reportOptions.additionalFields])
                  .map((field, fieldIndex) => {
                    const fieldMap: Record<string, any> = {
                      position: teacher.position,
                      email: teacher.email || '',
                      citizenId: teacher.citizenId,
                      salary: teacher.salary,
                      birthDate: formatThaiDate(teacher.birthDate),
                      appointmentDate: formatThaiDate(teacher.appointmentDate),
                      education: teacher.education,
                      major: teacher.majorSubject,
                      phone: teacher.phone,
                      lineId: teacher.lineId,
                      signature: '',
                      signature2: '',
                      timeIn: '',
                      timeOut: '',
                    };
                    
                    const isCenter = ['citizenId', 'salary', 'birthDate', 'appointmentDate', 'phone', 'lineId'].includes(field);
                    
                    return (
                      <td key={fieldIndex} className={`border border-black px-2 py-1 ${isCenter ? 'text-center' : ''}`} style={{ width: `${columnWidths[colIndex++]}px` }}>
                        {fieldMap[field]}
                      </td>
                    );
                  })}
                
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
