
import { createRoot } from 'react-dom/client';
import { toast } from "@/components/ui/use-toast";
import type { Teacher } from '@/types/teacher';
import type { TeacherReportOptions } from '@/types/teacherReport';
import TeacherReportPrintableWithColumns from '@/components/teacher/TeacherReportPrintableWithColumns';

export const printTeacherReport = (teachers: Teacher[], reportOptions: TeacherReportOptions) => {
    const printWindow = window.open('', '', 'height=800,width=1000');
    if (!printWindow) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณาอนุญาต pop-ups เพื่อพิมพ์รายงาน",
        variant: "destructive",
      });
      return;
    }

    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'));
    styles.forEach(style => {
      printWindow.document.head.appendChild(style.cloneNode(true));
    });

    printWindow.document.title = 'พิมพ์รายงานข้อมูลครู';
    const printRootEl = printWindow.document.createElement('div');
    printWindow.document.body.appendChild(printRootEl);
    
    const root = createRoot(printRootEl);
    root.render(<TeacherReportPrintableWithColumns teachers={teachers} reportOptions={reportOptions} />);

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 1000);
};
