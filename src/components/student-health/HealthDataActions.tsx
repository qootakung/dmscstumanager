
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Printer } from 'lucide-react';
import { StudentHealthDetails } from '@/types/student';
import HealthReportStatistics from './HealthReportStatistics';
import TeacherSelectionDialog from './TeacherSelectionDialog';
import { getTeachers } from '@/utils/teacherStorage';

interface HealthDataActionsProps {
  data: StudentHealthDetails[];
  onImport: () => void;
  onExport: () => void;
  selectedGrade: string;
  selectedMonth: string;
  selectedYear: string;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
}

const HealthDataActions: React.FC<HealthDataActionsProps> = ({
  data,
  onImport,
  onExport,
  selectedGrade,
  selectedMonth,
  selectedYear,
}) => {
  const [showTeacherDialog, setShowTeacherDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teachers] = useState<Teacher[]>(() => {
    // Get teachers from storage and map to required format
    const storedTeachers = getTeachers();
    return storedTeachers.map(teacher => ({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      position: teacher.position,
    }));
  });

  const handlePrintStatistics = () => {
    if (teachers.length === 0) {
      // If no teachers available, print with default teacher info
      printStatisticsReport();
      return;
    }
    
    // Show teacher selection dialog
    setShowTeacherDialog(true);
  };

  const printStatisticsReport = () => {
    const printWindow = window.open('', '', 'height=800,width=1000');
    if (!printWindow) {
      alert('กรุณาอนุญาต pop-ups เพื่อพิมพ์รายงาน');
      return;
    }

    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'));
    styles.forEach(style => {
      printWindow.document.head.appendChild(style.cloneNode(true));
    });

    printWindow.document.title = 'รายงานสถิติสุขภาพนักเรียน';
    const printRootEl = printWindow.document.createElement('div');
    printWindow.document.body.appendChild(printRootEl);
    
    // Create React root and render the statistics component
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(printRootEl);
      root.render(
        React.createElement(HealthReportStatistics, {
          data: data,
          grade: selectedGrade,
          month: selectedMonth,
          academicYear: selectedYear,
          selectedTeacher: selectedTeacher,
        })
      );

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 1000);
    });
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button onClick={onImport} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          นำเข้าข้อมูล
        </Button>
        <Button onClick={onExport} variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          ส่งออกข้อมูล
        </Button>
        <Button onClick={handlePrintStatistics} variant="outline" size="sm">
          <Printer className="w-4 h-4 mr-2" />
          พิมพ์รายงานสถิติ
        </Button>
      </div>

      <TeacherSelectionDialog
        open={showTeacherDialog}
        onOpenChange={setShowTeacherDialog}
        teachers={teachers}
        selectedTeacher={selectedTeacher}
        onTeacherSelect={setSelectedTeacher}
        onPrint={printStatisticsReport}
      />
    </>
  );
};

export default HealthDataActions;
