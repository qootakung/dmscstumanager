
import React, { useState, useEffect } from 'react';
import type { Teacher } from '@/types/teacher';
import type { TeacherReportOptions } from '@/types/teacherReport';
import { ResizableTable, ResizableTh, ResizableTd } from '@/components/ui/resizable-table';
import { saveColumnWidths, loadColumnWidths } from '@/utils/columnWidthStorage';
import { sortTeachersByPosition } from '@/utils/teacherSortUtils';
import { cn } from '@/lib/utils';

interface ResizableTeacherReportPreviewProps {
  reportOptions: TeacherReportOptions;
  teachers: Teacher[];
  formatThaiDate: (dateString: string) => string;
  className?: string;
  showTotal?: boolean;
}

const ResizableTeacherReportPreview: React.FC<ResizableTeacherReportPreviewProps> = ({
  reportOptions,
  teachers,
  formatThaiDate,
  className,
  showTotal = true,
}) => {
  if (!reportOptions.academicYear) return null;

  const filteredTeachers = teachers
    .filter(teacher => teacher.academicYear === reportOptions.academicYear);
  
  const sortedTeachers = sortTeachersByPosition(filteredTeachers);

  // สร้างคอลัมน์พื้นฐาน
  const baseColumns = [
    'ลำดับที่',
    'ชื่อ - นามสกุล',
  ];

  // เพิ่มคอลัมน์เพิ่มเติมที่เลือก
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
  if (reportOptions.additionalFields.signature2) additionalColumns.push('ลายมือชื่อ 2');
  if (reportOptions.additionalFields.timeIn) additionalColumns.push('เวลามา');
  if (reportOptions.additionalFields.timeOut) additionalColumns.push('เวลากลับ');

  // เพิ่มคอลัมน์ว่างตามจำนวนที่ระบุ
  const customColumns = [];
  if (reportOptions.customColumns && reportOptions.customColumns > 0) {
    for (let i = 1; i <= reportOptions.customColumns; i++) {
      customColumns.push('');
    }
  }

  // เพิ่มคอลัมน์หมายเหตุท้ายสุด
  const noteColumn = [];
  if (reportOptions.additionalFields.note) {
    noteColumn.push('หมายเหตุ');
  }

  const allColumns = [...baseColumns, ...additionalColumns, ...customColumns, ...noteColumn];
  
  const getDefaultWidths = () => allColumns.map((_, index) => {
    if (index === 0) return 80; // ลำดับที่
    if (index === 1) return 200; // ชื่อ-สกุล
    return 120; // คอลัมน์อื่นๆ
  });

  const reportKey = `teacher_${reportOptions.reportType}_${reportOptions.academicYear}`;
  const [columnWidths, setColumnWidths] = useState<number[]>(() => 
    loadColumnWidths(reportKey, getDefaultWidths())
  );

  useEffect(() => {
    const defaultWidths = getDefaultWidths();
    const savedWidths = loadColumnWidths(reportKey, defaultWidths);
    setColumnWidths(savedWidths);
  }, [reportOptions.reportType, reportOptions.academicYear, allColumns.length]);

  const handleColumnResize = (columnIndex: number, newWidth: number) => {
    setColumnWidths(prev => {
      const updated = [...prev];
      updated[columnIndex] = newWidth;
      saveColumnWidths(reportKey, updated);
      return updated;
    });
  };

  return (
    <div className={cn("mt-6 border rounded-lg p-4 bg-white print:border-none print:shadow-none print:p-0 print:m-0", className)}>
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

      <div className="mb-2 text-sm text-blue-600 font-sarabun print:hidden">
        💡 เลื่อนขอบคอลัมน์เพื่อปรับขนาด (ค่าจะถูกบันทึกอัตโนมัติ)
      </div>
      
      <div className="overflow-x-auto">
        <ResizableTable className="text-sm">
          <thead>
            <tr className="bg-gray-100">
              {allColumns.map((column, index) => (
                <ResizableTh
                  key={index}
                  width={columnWidths[index]}
                  onResize={(width) => handleColumnResize(index, width)}
                >
                  {column}
                </ResizableTh>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTeachers.map((teacher, index) => (
              <tr key={teacher.id}>
                <ResizableTd width={columnWidths[0]} className="text-center">{index + 1}</ResizableTd>
                <ResizableTd width={columnWidths[1]}>{teacher.firstName} {teacher.lastName}</ResizableTd>
                
                {/* Additional fields */}
                {reportOptions.additionalFields.position && (
                  <ResizableTd width={columnWidths[allColumns.indexOf('ตำแหน่ง')]}>{teacher.position}</ResizableTd>
                )}
                {reportOptions.additionalFields.email && (
                  <ResizableTd width={columnWidths[allColumns.indexOf('Email')]}>{teacher.email || ''}</ResizableTd>
                )}
                {reportOptions.additionalFields.citizenId && (
                  <ResizableTd width={columnWidths[allColumns.indexOf('เลขบัตรประจำตัวประชาชน')]} className="text-center">{teacher.citizenId}</ResizableTd>
                )}
                {reportOptions.additionalFields.salary && (
                  <ResizableTd width={columnWidths[allColumns.indexOf('เงินเดือน')]} className="text-center">{teacher.salary}</ResizableTd>
                )}
                {reportOptions.additionalFields.birthDate && (
                  <ResizableTd width={columnWidths[allColumns.indexOf('วัน/เดือน/ปีเกิด')]} className="text-center">{formatThaiDate(teacher.birthDate)}</ResizableTd>
                )}
                {reportOptions.additionalFields.appointmentDate && (
                  <ResizableTd width={columnWidths[allColumns.indexOf('วันที่บรรจุ')]} className="text-center">{formatThaiDate(teacher.appointmentDate)}</ResizableTd>
                )}
                {reportOptions.additionalFields.education && (
                  <ResizableTd width={columnWidths[allColumns.indexOf('วุฒิการศึกษา')]}>{teacher.education}</ResizableTd>
                )}
                {reportOptions.additionalFields.major && (
                  <ResizableTd width={columnWidths[allColumns.indexOf('วิชาเอก')]}>{teacher.majorSubject}</ResizableTd>
                )}
                {reportOptions.additionalFields.phone && (
                  <ResizableTd width={columnWidths[allColumns.indexOf('เบอร์โทร')]} className="text-center">{teacher.phone}</ResizableTd>
                )}
                {reportOptions.additionalFields.lineId && (
                  <ResizableTd width={columnWidths[allColumns.indexOf('ID Line')]} className="text-center">{teacher.lineId}</ResizableTd>
                )}
                {reportOptions.additionalFields.signature && (
                  <ResizableTd width={columnWidths[allColumns.indexOf('ลายมือชื่อ')]}></ResizableTd>
                )}
                {reportOptions.additionalFields.signature2 && (
                  <ResizableTd width={columnWidths[allColumns.indexOf('ลายมือชื่อ 2')]}></ResizableTd>
                )}
                {reportOptions.additionalFields.timeIn && (
                  <ResizableTd width={columnWidths[allColumns.indexOf('เวลามา')]}></ResizableTd>
                )}
                {reportOptions.additionalFields.timeOut && (
                  <ResizableTd width={columnWidths[allColumns.indexOf('เวลากลับ')]}></ResizableTd>
                )}
                
                {/* Custom empty columns */}
                {customColumns.map((_, colIndex) => {
                  const columnIndex = baseColumns.length + additionalColumns.length + colIndex;
                  return (
                    <ResizableTd key={`custom-${colIndex}`} width={columnWidths[columnIndex]}></ResizableTd>
                  );
                })}

                {/* Note column */}
                {reportOptions.additionalFields.note && (
                  <ResizableTd width={columnWidths[allColumns.length - 1]}></ResizableTd>
                )}
              </tr>
            ))}
          </tbody>
        </ResizableTable>
      </div>
      
      {showTotal && (
        <p className="text-sm text-gray-600 mt-2 print:hidden">
          รวมทั้งหมด {sortedTeachers.length} รายการ
        </p>
      )}
    </div>
  );
};

export default ResizableTeacherReportPreview;
