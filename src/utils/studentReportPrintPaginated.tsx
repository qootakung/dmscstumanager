import { createRoot } from 'react-dom/client';
import { toast } from "@/components/ui/use-toast";
import type { Student, ReportOptions } from '@/types/student';
import { sortGrades } from '@/utils/studentReportUtils';
import StudentReportPrintableWithColumns from '@/components/student/StudentReportPrintableWithColumns';

export const printStudentReportPaginated = (studentsToPrint: Student[], reportOptions: ReportOptions) => {
  const printWindow = window.open('', '', 'height=800,width=1000');
  if (!printWindow) {
    toast({
      title: "เกิดข้อผิดพลาด",
      description: "กรุณาอนุญาต pop-ups เพื่อพิมพ์รายงาน",
      variant: "destructive",
    });
    return;
  }

  // Copy all stylesheets
  document.querySelectorAll('link[rel="stylesheet"], style').forEach(style => {
    printWindow.document.head.appendChild(style.cloneNode(true));
  });

  printWindow.document.title = 'พิมพ์รายงานนักเรียนแยกหน้า';
  
  // Group students by grade level
  const studentsByGrade = studentsToPrint.reduce((acc, student) => {
    if (!acc[student.grade]) {
      acc[student.grade] = [];
    }
    acc[student.grade].push(student);
    return acc;
  }, {} as Record<string, Student[]>);

  // Sort each grade's students by studentId
  Object.keys(studentsByGrade).forEach(grade => {
    studentsByGrade[grade].sort((a, b) => {
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

  // Sort grades in proper order
  const sortedGrades = sortGrades(Object.keys(studentsByGrade));

  // Create container for all pages
  const printRootEl = printWindow.document.createElement('div');
  printWindow.document.body.appendChild(printRootEl);
  
  // Add page break styles
  const pageStyle = printWindow.document.createElement('style');
  pageStyle.textContent = `
    .page-break {
      page-break-after: always;
    }
    .page-break:last-child {
      page-break-after: auto;
    }
    @media print {
      .page-break {
        page-break-after: always;
      }
      .page-break:last-child {
        page-break-after: auto;
      }
    }
  `;
  printWindow.document.head.appendChild(pageStyle);

  const root = createRoot(printRootEl);
  
  // Create JSX for all pages
  const allPages = (
    <>
      {sortedGrades.map((grade, index) => (
        <div key={grade} className={index < sortedGrades.length - 1 ? 'page-break' : ''}>
          <StudentReportPrintableWithColumns 
            students={studentsByGrade[grade]} 
            reportOptions={{
              ...reportOptions,
              classLevel: grade // Override to show specific grade
            }} 
          />
        </div>
      ))}
    </>
  );

  root.render(allPages);

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, 1000);
};