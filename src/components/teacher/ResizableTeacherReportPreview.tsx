
import React, { useState, useEffect } from 'react';
import type { Teacher } from '@/types/teacher';
import type { TeacherReportOptions } from '@/types/teacherReport';
import { ResizableTable, ResizableTh, ResizableTd } from '@/components/ui/resizable-table';
import { saveColumnWidths, loadColumnWidths, saveColumnsLocked, loadColumnsLocked } from '@/utils/columnWidthStorage';
import { sortTeachersByPosition } from '@/utils/teacherSortUtils';
import { cn } from '@/lib/utils';
import { Lock, Unlock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  
  const getDefaultWidths = () => allColumns.map((column, index) => {
    if (index === 0) return 45; // ลำดับที่ - บีบให้แคบ
    if (index === 1) return 180; // ชื่อ-สกุล
    if (column === 'ลายมือชื่อ') return 90;
    if (column === 'เวลามา' || column === 'เวลากลับ') return 60;
    if (column === 'เบอร์โทร') return 90;
    if (column === 'เลขบัตรประจำตัวประชาชน') return 120;
    if (column === 'ตำแหน่ง') return 100;
    if (column === 'วุฒิการศึกษา') return 100;
    if (column === 'วิชาเอก') return 100;
    if (column === 'หมายเหตุ') return 80;
    return 100; // คอลัมน์อื่นๆ
  });

  const reportKey = `teacher_${reportOptions.reportType}_${reportOptions.academicYear}`;
  const [columnWidths, setColumnWidths] = useState<number[]>(() => 
    loadColumnWidths(reportKey, getDefaultWidths())
  );
  const [isLocked, setIsLocked] = useState<boolean>(() => 
    loadColumnsLocked(reportKey)
  );

  useEffect(() => {
    const defaultWidths = getDefaultWidths();
    const savedWidths = loadColumnWidths(reportKey, defaultWidths);
    setColumnWidths(savedWidths);
    setIsLocked(loadColumnsLocked(reportKey));
  }, [reportOptions.reportType, reportOptions.academicYear, allColumns.length]);

  const handleColumnResize = (columnIndex: number, newWidth: number) => {
    if (isLocked) return;
    setColumnWidths(prev => {
      const updated = [...prev];
      updated[columnIndex] = newWidth;
      saveColumnWidths(reportKey, updated);
      return updated;
    });
  };

  const toggleLock = () => {
    const newLocked = !isLocked;
    setIsLocked(newLocked);
    saveColumnsLocked(reportKey, newLocked);
  };

  const resetColumnWidths = () => {
    const defaultWidths = getDefaultWidths();
    setColumnWidths(defaultWidths);
    saveColumnWidths(reportKey, defaultWidths);
  };

  return (
    <div className={cn("mt-6 border rounded-lg p-4 bg-white print:border-none print:shadow-none print:p-0 print:m-0", className)}>
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

      <div className="mb-2 flex items-center gap-2 print:hidden">
        <span className="text-sm text-blue-600 font-sarabun">
          💡 เลื่อนขอบคอลัมน์เพื่อปรับขนาด (ค่าจะถูกบันทึกอัตโนมัติ)
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLock}
          className={cn("ml-auto", isLocked && "bg-green-100 border-green-500")}
        >
          {isLocked ? <Lock className="h-4 w-4 mr-1" /> : <Unlock className="h-4 w-4 mr-1" />}
          {isLocked ? 'ปลดล็อก' : 'ล็อกคอลัมน์'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={resetColumnWidths}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          รีเซ็ตคอลัมน์
        </Button>
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
                  isLocked={isLocked}
                >
                  {column}
                </ResizableTh>
              ))}
            </tr>
          </thead>
           <tbody>
            {sortedTeachers.map((teacher, index) => {
              let colIndex = 0;
              
              return (
              <tr key={teacher.id}>
                <ResizableTd width={columnWidths[colIndex++]} className="text-center">{index + 1}</ResizableTd>
                <ResizableTd width={columnWidths[colIndex++]}>{teacher.firstName} {teacher.lastName}</ResizableTd>
                
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
                      <ResizableTd key={fieldIndex} width={columnWidths[colIndex++]} className={isCenter ? 'text-center' : ''}>
                        {fieldMap[field]}
                      </ResizableTd>
                    );
                  })}
                
                {/* Custom empty columns */}
                {customColumns.map((_, customColIndex) => {
                  return (
                    <ResizableTd key={`custom-${customColIndex}`} width={columnWidths[colIndex++]}></ResizableTd>
                  );
                })}

                {/* Note column */}
                {reportOptions.additionalFields.note && (
                  <ResizableTd width={columnWidths[colIndex++]}></ResizableTd>
                )}
              </tr>
              );
            })}
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
