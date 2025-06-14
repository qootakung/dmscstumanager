
import React from 'react';
import type { Teacher } from '@/types/teacher';
import type { TeacherReportOptions } from '@/types/teacherReport';
import { cn } from '@/lib/utils';

interface TeacherReportPreviewProps {
  reportOptions: TeacherReportOptions;
  teachers: Teacher[];
  formatThaiDate: (dateString: string) => string;
  className?: string;
}

const TeacherReportPreview: React.FC<TeacherReportPreviewProps> = ({
  reportOptions,
  teachers,
  formatThaiDate,
  className,
}) => {
  if (!reportOptions.academicYear) return null;

  const filteredTeachers = teachers
    .filter(teacher => teacher.academicYear === reportOptions.academicYear)
    .sort((a, b) => {
      const aNum = parseInt(a.positionNumber) || 0;
      const bNum = parseInt(b.positionNumber) || 0;
      return aNum - bNum;
    });

  const previewTeachers = filteredTeachers;

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

  return (
    <div className={cn("mt-6 border rounded-lg p-4 bg-white print:border-none print:shadow-none print:p-0 print:m-0", className)}>
      <div className="text-center mb-4 font-sarabun">
        <h3 className="text-lg font-bold">
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
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              {allColumns.map((column, index) => (
                <th key={index} className="border border-gray-300 px-2 py-1 text-center font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewTeachers.map((teacher, index) => (
              <tr key={teacher.id}>
                <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>
                <td className="border border-gray-300 px-2 py-1">{teacher.firstName} {teacher.lastName}</td>
                
                {/* Additional fields */}
                {reportOptions.additionalFields.position && (
                  <td className="border border-gray-300 px-2 py-1">{teacher.position}</td>
                )}
                {reportOptions.additionalFields.email && (
                  <td className="border border-gray-300 px-2 py-1">{teacher.email || ''}</td>
                )}
                {reportOptions.additionalFields.citizenId && (
                  <td className="border border-gray-300 px-2 py-1 text-center">{teacher.citizenId}</td>
                )}
                {reportOptions.additionalFields.salary && (
                  <td className="border border-gray-300 px-2 py-1 text-center">{teacher.salary}</td>
                )}
                {reportOptions.additionalFields.birthDate && (
                  <td className="border border-gray-300 px-2 py-1 text-center">{formatThaiDate(teacher.birthDate)}</td>
                )}
                {reportOptions.additionalFields.appointmentDate && (
                  <td className="border border-gray-300 px-2 py-1 text-center">{formatThaiDate(teacher.appointmentDate)}</td>
                )}
                {reportOptions.additionalFields.education && (
                  <td className="border border-gray-300 px-2 py-1">{teacher.education}</td>
                )}
                {reportOptions.additionalFields.major && (
                  <td className="border border-gray-300 px-2 py-1">{teacher.majorSubject}</td>
                )}
                {reportOptions.additionalFields.phone && (
                  <td className="border border-gray-300 px-2 py-1 text-center">{teacher.phone}</td>
                )}
                {reportOptions.additionalFields.lineId && (
                  <td className="border border-gray-300 px-2 py-1 text-center">{teacher.lineId}</td>
                )}
                {reportOptions.additionalFields.signature && (
                  <td className="border border-gray-300 px-2 py-1"></td>
                )}
                {reportOptions.additionalFields.timeIn && (
                  <td className="border border-gray-300 px-2 py-1"></td>
                )}
                {reportOptions.additionalFields.timeOut && (
                  <td className="border border-gray-300 px-2 py-1"></td>
                )}
                
                {/* Custom empty columns */}
                {customColumns.map((_, colIndex) => (
                  <td key={`custom-${colIndex}`} className="border border-gray-300 px-2 py-1"></td>
                ))}

                {/* Note column */}
                {reportOptions.additionalFields.note && (
                  <td className="border border-gray-300 px-2 py-1"></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <p className="text-sm text-gray-600 mt-2 print:hidden">
        รวมทั้งหมด {filteredTeachers.length} รายการ
      </p>
    </div>
  );
};

export default TeacherReportPreview;
