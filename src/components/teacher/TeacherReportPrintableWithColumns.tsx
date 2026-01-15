
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
  
  // โหลดขนาดคอลัมน์ที่บันทึกไว้ - ค่าเริ่มต้นที่เหมาะสมกับเนื้อหา
  const reportKey = `teacher_${reportOptions.reportType}_${reportOptions.academicYear}`;
  const defaultWidths = allColumns.map((column, index) => {
    if (index === 0) return 40; // ลำดับที่ - บีบให้แคบมาก
    if (index === 1) return 140; // ชื่อ-สกุล - บีบลง
    if (column === 'ตำแหน่ง') return 140; // ตำแหน่ง - ขยายให้กว้างขึ้น
    if (column === 'ลายมือชื่อ') return 80;
    if (column === 'เวลามา' || column === 'เวลากลับ') return 55;
    if (column === 'เบอร์โทร') return 85;
    if (column === 'เลขบัตรประจำตัวประชาชน') return 115;
    if (column === 'Email') return 130;
    if (column === 'วุฒิการศึกษา') return 110;
    if (column === 'วิชาเอก') return 100;
    if (column === 'วัน/เดือน/ปีเกิด') return 90;
    if (column === 'วันที่บรรจุ') return 85;
    if (column === 'เงินเดือน') return 70;
    if (column === 'ID Line') return 80;
    if (column === 'หมายเหตุ') return 70;
    return 90; // คอลัมน์อื่นๆ
  });
  const columnWidths = loadColumnWidths(reportKey, defaultWidths);

  return (
    <div className="p-4 font-sarabun">
      <style>{`
        body { 
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        @page {
          size: A4 landscape;
          margin: 10mm;
        }
        @media print {
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            overflow: visible !important;
          }
          .print-table {
            width: 100% !important;
            table-layout: auto !important;
            font-size: 16pt !important;
            font-family: 'TH SarabunPSK', 'TH Sarabun', 'Sarabun', sans-serif !important;
          }
          .print-table th,
          .print-table td {
            width: auto !important;
            min-width: unset !important;
            max-width: none !important;
            padding: 4px 6px !important;
            white-space: normal !important;
            word-break: keep-all !important;
            overflow-wrap: break-word !important;
            hyphens: none !important;
          }
          table, th, td {
            border: 1px solid #000 !important;
            border-collapse: collapse !important;
          }
          th {
            background-color: #f3f4f6 !important;
          }
          thead {
            display: table-header-group !important;
          }
          .report-header {
            display: block !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
        }
      `}</style>
      
      <div className="text-center mb-4 font-sarabun report-header print:text-[18pt] print:font-['TH_SarabunPSK','TH_Sarabun','Sarabun',sans-serif]">
        <h3 className="text-base font-bold print:text-[18pt]">
          {reportOptions.reportType === '1' 
            ? 'รายชื่อข้าราชการครูและบุคลากรทางการศึกษาโรงเรียนบ้านดอนมูล' 
            : reportOptions.reportType === '2'
            ? 'แบบลงทะเบียนการประชุมข้าราชการครูและบุคลากรทางการศึกษาโรงเรียนบ้านดอนมูล'
            : reportOptions.customTitle1 || 'แบบลงทะเบียน'
          }
        </h3>
        {reportOptions.reportType === '3' && reportOptions.customTitle2 && (
          <p className="text-sm print:text-[16pt]">{reportOptions.customTitle2}</p>
        )}
        <p className="text-sm print:text-[16pt]">ปีการศึกษา {reportOptions.academicYear}</p>
        {reportOptions.showDate && reportOptions.selectedDate && (
          <p className="text-sm print:text-[16pt]">วันที่ {formatThaiDate(reportOptions.selectedDate)}</p>
        )}
      </div>
      
      <div className="overflow-x-auto print-container">
        <table className="w-full border-collapse border border-black text-sm print-table" style={{ tableLayout: 'fixed' }}>
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
                <td className="border border-black px-2 py-1 text-center overflow-hidden" style={{ width: `${columnWidths[colIndex++]}px`, wordBreak: 'break-all' }}>{index + 1}</td>
                <td className="border border-black px-2 py-1 overflow-hidden" style={{ width: `${columnWidths[colIndex++]}px`, wordBreak: 'break-all' }}>{teacher.firstName} {teacher.lastName}</td>
                
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
                      <td key={fieldIndex} className={`border border-black px-2 py-1 overflow-hidden ${isCenter ? 'text-center' : ''}`} style={{ width: `${columnWidths[colIndex++]}px`, wordBreak: 'break-all' }}>
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
