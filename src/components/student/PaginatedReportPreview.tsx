import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Student, ReportOptions } from '@/types/student';
import { getReportColumns, calculateAge, formatAddress, formatBirthDate, sortGrades } from '@/utils/studentReportUtils';

interface PaginatedReportPreviewProps {
  students: Student[];
  reportOptions: ReportOptions;
}

const PaginatedReportPreview: React.FC<PaginatedReportPreviewProps> = ({ students, reportOptions }) => {
  const [currentPage, setCurrentPage] = useState(0);

  // Group students by grade level and sort grades
  const studentsByGrade = useMemo(() => {
    const grouped = students.reduce((acc, student) => {
      if (!acc[student.grade]) {
        acc[student.grade] = [];
      }
      acc[student.grade].push(student);
      return acc;
    }, {} as Record<string, Student[]>);

    // Sort each grade's students by studentId
    Object.keys(grouped).forEach(grade => {
      grouped[grade].sort((a, b) => {
        const aId = a.studentId;
        const bId = b.studentId;
        
        // Check if studentId is 3 digits or 4 digits
        const aIs3Digit = aId.length === 3;
        const bIs3Digit = bId.length === 3;
        
        // If one is 3 digits and other is 4 digits, 3 digits comes first
        if (aIs3Digit && !bIs3Digit) return -1;
        if (!aIs3Digit && bIs3Digit) return 1;
        
        // If both are same length, sort numerically
        return parseInt(aId) - parseInt(bId);
      });
    });

    return grouped;
  }, [students]);

  // Create pages: one page per grade level
  const pages = useMemo(() => {
    const sortedGrades = sortGrades(Object.keys(studentsByGrade));
    return sortedGrades.map(grade => ({
      grade,
      students: studentsByGrade[grade]
    }));
  }, [studentsByGrade]);

  if (!reportOptions.classLevel || !reportOptions.academicYear) return null;

  const allColumns = getReportColumns(reportOptions);
  const currentPageData = pages[currentPage];

  if (!currentPageData) {
    return (
      <div className="mt-6 border rounded-lg p-4 bg-white text-center text-gray-500">
        ไม่มีข้อมูลนักเรียนที่ตรงกับเงื่อนไข
      </div>
    );
  }

  const { grade, students: gradeStudents } = currentPageData;
  const maleCount = gradeStudents.filter(s => s.gender === 'ชาย').length;
  const femaleCount = gradeStudents.filter(s => s.gender === 'หญิง').length;
  const totalCount = gradeStudents.length;

  return (
    <div className="mt-6 border rounded-lg p-4 bg-white">
      {/* Header */}
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
          ระดับชั้น {grade} ปีการศึกษา {reportOptions.academicYear}
        </p>
      </div>

      {/* Student counts */}
      <div className="text-sm flex justify-start gap-x-4 mb-2 font-sarabun">
        <span>จำนวนเพศชาย {maleCount} คน</span>
        <span>เพศหญิง {femaleCount} คน</span>
        <span>รวม {totalCount} คน</span>
      </div>

      {/* Table */}
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
            {gradeStudents.map((student, index) => (
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
                
                {/* Additional fields for non-type-3 reports - Order matches form display */}
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
                    {reportOptions.additionalFields.signature2 && (
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
                    {reportOptions.additionalFields.gradeLevel && (
                      <td className="border border-black px-2 py-1 text-center">{student.grade}</td>
                    )}
                    {reportOptions.additionalFields.address && (
                      <td className="border border-black px-2 py-1">{formatAddress(student)}</td>
                    )}
                    {reportOptions.additionalFields.age && (
                      <td className="border border-black px-2 py-1 text-center">{calculateAge(student.birthDate)}</td>
                    )}
                    {reportOptions.additionalFields.birthDate && (
                      <td className="border border-black px-2 py-1 text-center">{formatBirthDate(student.birthDate)}</td>
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

      {/* Pagination controls */}
      {pages.length > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            หน้าก่อนหน้า
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              หน้า {currentPage + 1} จาก {pages.length}
            </span>
            <span className="text-sm text-gray-500">
              (ระดับชั้น {grade})
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(pages.length - 1, prev + 1))}
            disabled={currentPage === pages.length - 1}
            className="flex items-center gap-2"
          >
            หน้าถัดไป
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <p className="text-sm text-gray-600 mt-2">
        รวม {gradeStudents.length} รายการ (ระดับชั้น {grade})
      </p>
    </div>
  );
};

export default PaginatedReportPreview;