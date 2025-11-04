import React from 'react';
import type { Teacher } from '@/types/teacher';
import type { TeacherReportOptions } from '@/types/teacherReport';
import { sortTeachersByPosition } from '@/utils/teacherSortUtils';
import { cn } from '@/lib/utils';

interface TeacherReportPreviewProps {
  reportOptions: TeacherReportOptions;
  teachers: Teacher[];
  formatThaiDate: (dateString: string) => string;
  className?: string;
  showTotal?: boolean;
}

const TeacherReportPreview: React.FC<TeacherReportPreviewProps> = ({
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

  const previewTeachers = sortedTeachers;

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
      
      <div className="overflow-x-auto">
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
            {previewTeachers.map((teacher, index) => (
              <tr key={teacher.id}>
                <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
                <td className="border border-black px-2 py-1">{teacher.firstName} {teacher.lastName}</td>
                
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
                      <td key={fieldIndex} className={`border border-black px-2 py-1 ${isCenter ? 'text-center' : ''}`}>
                        {fieldMap[field]}
                      </td>
                    );
                  })}
                
                {/* Custom empty columns */}
                {customColumns.map((_, colIndex) => (
                  <td key={`custom-${colIndex}`} className="border border-black px-2 py-1"></td>
                ))}

                {/* Note column */}
                {reportOptions.additionalFields.note && (
                  <td className="border border-black px-2 py-1"></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {showTotal && (
        <p className="text-sm text-gray-600 mt-2 print:hidden">
          รวมทั้งหมด {sortedTeachers.length} รายการ
        </p>
      )}
    </div>
  );
};

export default TeacherReportPreview;
