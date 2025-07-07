
import { createRoot } from 'react-dom/client';
import { toast } from "@/components/ui/use-toast";
import type { Student, ReportOptions } from '@/types/student';
import StudentReportPrintableWithColumns from '@/components/student/StudentReportPrintableWithColumns';

export const printStudentReport = (studentsToPrint: Student[], reportOptions: ReportOptions) => {
    const printWindow = window.open('', '', 'height=800,width=1000');
    if (!printWindow) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณาอนุญาต pop-ups เพื่อพิมพ์รายงาน",
        variant: "destructive",
      });
      return;
    }

    document.querySelectorAll('link[rel="stylesheet"], style').forEach(style => {
      printWindow.document.head.appendChild(style.cloneNode(true));
    });

    printWindow.document.title = 'พิมพ์รายงานนักเรียน';
    const printRootEl = printWindow.document.createElement('div');
    printWindow.document.body.appendChild(printRootEl);
    
    const root = createRoot(printRootEl);
    root.render(<StudentReportPrintableWithColumns students={studentsToPrint} reportOptions={reportOptions} />);

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 1000);
};
