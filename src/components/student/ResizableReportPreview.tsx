
import React, { useState, useEffect } from 'react';
import type { Student, ReportOptions } from '@/types/student';
import { getReportColumns, calculateAge, formatAddress, formatBirthDate } from '@/utils/studentReportUtils';
import { ResizableTable, ResizableTh, ResizableTd } from '@/components/ui/resizable-table';
import { saveColumnWidths, loadColumnWidths } from '@/utils/columnWidthStorage';

interface ResizableReportPreviewProps {
  students: Student[];
  reportOptions: ReportOptions;
}

const ResizableReportPreview: React.FC<ResizableReportPreviewProps> = ({ students, reportOptions }) => {
  if (!reportOptions.classLevel || !reportOptions.academicYear) return null;

  const allColumns = getReportColumns(reportOptions);
  const getDefaultWidths = () => allColumns.map((_, index) => {
    if (index === 0) return 80; // ลำดับที่
    if (index === 1) return 120; // รหัสนักเรียน
    if (index === 2) return 200; // ชื่อ-สกุล
    return 120; // คอลัมน์อื่นๆ
  });

  const reportKey = `student_${reportOptions.reportType}_${reportOptions.classLevel}_${reportOptions.academicYear}`;
  const [columnWidths, setColumnWidths] = useState<number[]>(() => 
    loadColumnWidths(reportKey, getDefaultWidths())
  );

  useEffect(() => {
    const defaultWidths = getDefaultWidths();
    const savedWidths = loadColumnWidths(reportKey, defaultWidths);
    setColumnWidths(savedWidths);
  }, [reportOptions.reportType, reportOptions.classLevel, reportOptions.academicYear, allColumns.length]);

  const handleColumnResize = (columnIndex: number, newWidth: number) => {
    setColumnWidths(prev => {
      const updated = [...prev];
      updated[columnIndex] = newWidth;
      saveColumnWidths(reportKey, updated);
      return updated;
    });
  };

  const maleCount = students.filter(s => s.gender === 'ชาย').length;
  const femaleCount = students.filter(s => s.gender === 'หญิง').length;
  const totalCount = students.length;

  return (
    <div className="mt-6 border rounded-lg p-4 bg-white">
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
        <span>รวม {totalCount} คน</span>
      </div>

      <div className="mb-2 text-sm text-blue-600 font-sarabun">
        💡 เลื่อนขอบคอลัมน์เพื่อปรับขนาด (ค่าจะถูกบันทึกอัตโนมัติ)
      </div>

      <div className="overflow-auto max-h-96">
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
            {students.map((student, index) => (
              <tr key={student.id}>
                <ResizableTd width={columnWidths[0]} className="text-center">{index + 1}</ResizableTd>
                <ResizableTd width={columnWidths[1]} className="text-center">{student.studentId}</ResizableTd>
                <ResizableTd width={columnWidths[2]}>{(student.titleTh || '')}{student.firstNameTh} {student.lastNameTh}</ResizableTd>
                
                {/* For type 3, add the fixed columns */}
                {reportOptions.reportType === '3' && (
                  <>
                    <ResizableTd width={columnWidths[3]}></ResizableTd>
                    <ResizableTd width={columnWidths[4]}></ResizableTd>
                    <ResizableTd width={columnWidths[5]}></ResizableTd>
                    <ResizableTd width={columnWidths[6]}></ResizableTd>
                  </>
                )}
                
                {/* Additional fields for non-type-3 reports */}
                {reportOptions.reportType !== '3' && (
                  <>
                    {reportOptions.additionalFields.gradeLevel && (
                      <ResizableTd width={columnWidths[allColumns.indexOf('ระดับชั้น')]} className="text-center">{student.grade}</ResizableTd>
                    )}
                    {reportOptions.additionalFields.gender && (
                      <ResizableTd width={columnWidths[allColumns.indexOf('เพศ')]} className="text-center">{student.gender === 'ชาย' ? 'ช' : 'ญ'}</ResizableTd>
                    )}
                    {reportOptions.additionalFields.citizenId && (
                      <ResizableTd width={columnWidths[allColumns.indexOf('เลขบัตรประจำตัวประชาชน')]} className="text-center">{student.citizenId}</ResizableTd>
                    )}
                    {reportOptions.additionalFields.birthDate && (
                      <ResizableTd width={columnWidths[allColumns.indexOf('วันเดือนปีเกิด')]} className="text-center">{formatBirthDate(student.birthDate)}</ResizableTd>
                    )}
                    {reportOptions.additionalFields.age && (
                      <ResizableTd width={columnWidths[allColumns.indexOf('อายุ')]} className="text-center">{calculateAge(student.birthDate)}</ResizableTd>
                    )}
                    {reportOptions.additionalFields.address && (
                      <ResizableTd width={columnWidths[allColumns.indexOf('ที่อยู่')]}>{formatAddress(student)}</ResizableTd>
                    )}
                    {reportOptions.additionalFields.signature && (
                      <ResizableTd width={columnWidths[allColumns.indexOf('ลายมือชื่อ')]}></ResizableTd>
                    )}
                    {reportOptions.additionalFields.signature2 && (() => {
                      const firstIndex = allColumns.indexOf('ลายมือชื่อ');
                      const secondIndex = allColumns.indexOf('ลายมือชื่อ', firstIndex + 1);
                      return <ResizableTd width={columnWidths[secondIndex]}></ResizableTd>;
                    })()}
                    {reportOptions.additionalFields.guardianSignature && (
                      <ResizableTd width={columnWidths[allColumns.indexOf('ลายเซ็นผู้ปกครอง')]}></ResizableTd>
                    )}
                    {reportOptions.additionalFields.timeIn && (
                      <ResizableTd width={columnWidths[allColumns.indexOf('เวลามา')]}></ResizableTd>
                    )}
                    {reportOptions.additionalFields.timeOut && (
                      <ResizableTd width={columnWidths[allColumns.indexOf('เวลากลับ')]}></ResizableTd>
                    )}
                    {reportOptions.additionalFields.phone && (
                      <ResizableTd width={columnWidths[allColumns.indexOf('เบอร์โทร')]} className="text-center">{student.guardianPhone}</ResizableTd>
                    )}

                    {/* Custom empty columns */}
                    {Array.from({ length: reportOptions.customColumns || 0 }).map((_, colIndex) => {
                      const columnIndex = allColumns.length - (reportOptions.additionalFields.note ? 1 : 0) - (reportOptions.customColumns || 0) + colIndex;
                      return (
                        <ResizableTd key={`custom-${colIndex}`} width={columnWidths[columnIndex]}></ResizableTd>
                      );
                    })}

                    {/* Note column at the end */}
                    {reportOptions.additionalFields.note && (
                      <ResizableTd width={columnWidths[allColumns.length - 1]}></ResizableTd>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </ResizableTable>
      </div>

      <p className="text-sm text-gray-600 mt-2">
        รวมทั้งหมด {students.length} รายการ
      </p>
    </div>
  );
};

export default ResizableReportPreview;
