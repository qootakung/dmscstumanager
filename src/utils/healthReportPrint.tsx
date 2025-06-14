
import { createRoot } from 'react-dom/client';
import { toast } from 'sonner';
import { StudentHealthDetails } from '@/types/student';
import HealthReportPrintable from '@/components/student-health/HealthReportPrintable';

export const printHealthReport = (
  healthData: StudentHealthDetails[],
  grade: string,
  month: string,
  academicYear: string
) => {
    const printWindow = window.open('', '', 'height=800,width=1000');
    if (!printWindow) {
      toast.error("กรุณาอนุญาต pop-ups เพื่อพิมพ์รายงาน");
      return;
    }

    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'));
    stylesheets.forEach(style => {
      printWindow.document.head.appendChild(style.cloneNode(true));
    });

    printWindow.document.title = 'พิมพ์รายงานข้อมูลสุขภาพ';
    const printRootEl = printWindow.document.createElement('div');
    printWindow.document.body.appendChild(printRootEl);
    
    const root = createRoot(printRootEl);
    root.render(
      <HealthReportPrintable
        data={healthData}
        grade={grade}
        month={month}
        academicYear={academicYear}
      />
    );

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 1000); // Wait for content to render
};
