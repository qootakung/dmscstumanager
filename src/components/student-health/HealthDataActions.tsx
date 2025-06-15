import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { StudentHealthDetails } from '@/types/student';
import { Teacher } from '@/types/teacher';
import { useReactToPrint } from 'react-to-print';
import HealthReportPrintable from './HealthReportPrintable';
import HealthReportAdvanced from './HealthReportAdvanced';
import HealthReportStatistics from './HealthReportStatistics';
import TeacherSelectionDialog from './TeacherSelectionDialog';

interface HealthDataActionsProps {
  data: StudentHealthDetails[];
  selectedGrade: string;
  selectedMonth: string;
  currentAcademicYear: string;
  isLoading: boolean;
}

const HealthDataActions: React.FC<HealthDataActionsProps> = ({
  data,
  selectedGrade,
  selectedMonth,
  currentAcademicYear,
  isLoading
}) => {
  const basicReportRef = useRef<HTMLDivElement>(null);
  const advancedReportRef = useRef<HTMLDivElement>(null);
  const statisticsReportRef = useRef<HTMLDivElement>(null);
  
  const [showTeacherDialog, setShowTeacherDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const handleBasicPrint = useReactToPrint({
    contentRef: basicReportRef,
    documentTitle: `health-report-basic-${selectedGrade}-${selectedMonth}-${currentAcademicYear}`,
  });

  const handleAdvancedPrint = useReactToPrint({
    contentRef: advancedReportRef,
    documentTitle: `health-report-advanced-${selectedGrade}-${selectedMonth}-${currentAcademicYear}`,
  });

  const handleStatisticsPrint = useReactToPrint({
    contentRef: statisticsReportRef,
    documentTitle: `health-report-statistics-${selectedGrade}-${selectedMonth}-${currentAcademicYear}`,
  });

  const handleStatisticsButtonClick = () => {
    if (!data || data.length === 0) return;
    setShowTeacherDialog(true);
  };

  const handleTeacherSelected = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    // Trigger print after teacher is selected
    setTimeout(() => {
      handleStatisticsPrint();
    }, 100);
  };

  const getMonthName = (month: string) => {
    if (month === 'all') return 'ทุกเดือน';
    const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                       'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    return monthNames[parseInt(month) - 1] || month;
  };

  const getGradeName = (grade: string) => {
    return grade === 'all' ? 'ทุกระดับชั้น' : grade;
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export functionality
    console.log('Export Excel functionality to be implemented');
  };

  const hasData = data && data.length > 0;

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          onClick={handleExportExcel}
          disabled={isLoading || !hasData}
          variant="outline"
          size="sm"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          ส่งออก Excel
        </Button>
        
        <Button
          onClick={handleBasicPrint}
          disabled={isLoading || !hasData}
          variant="outline"
          size="sm"
        >
          <Printer className="h-4 w-4 mr-2" />
          พิมพ์รายงานพื้นฐาน
        </Button>

        <Button
          onClick={handleAdvancedPrint}
          disabled={isLoading || !hasData}
          variant="outline"
          size="sm"
        >
          <Printer className="h-4 w-4 mr-2" />
          พิมพ์รายงาน BMI
        </Button>

        <Button
          onClick={handleStatisticsButtonClick}
          disabled={isLoading || !hasData}
          variant="outline"
          size="sm"
        >
          <Printer className="h-4 w-4 mr-2" />
          พิมพ์รายงานสถิติ
        </Button>

        {/* Hidden components for printing - only render when we have data */}
        {hasData && (
          <>
            <div style={{ display: 'none' }}>
              <div ref={basicReportRef}>
                <HealthReportPrintable
                  data={data}
                  grade={getGradeName(selectedGrade)}
                  month={getMonthName(selectedMonth)}
                  academicYear={currentAcademicYear}
                />
              </div>
            </div>

            <div style={{ display: 'none' }}>
              <div ref={advancedReportRef}>
                <HealthReportAdvanced
                  data={data}
                  grade={getGradeName(selectedGrade)}
                  month={getMonthName(selectedMonth)}
                  academicYear={currentAcademicYear}
                />
              </div>
            </div>

            <div style={{ display: 'none' }}>
              <div ref={statisticsReportRef}>
                <HealthReportStatistics
                  data={data}
                  grade={getGradeName(selectedGrade)}
                  month={getMonthName(selectedMonth)}
                  academicYear={currentAcademicYear}
                  teacher={selectedTeacher}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <TeacherSelectionDialog
        open={showTeacherDialog}
        onOpenChange={setShowTeacherDialog}
        onConfirm={handleTeacherSelected}
      />
    </>
  );
};

export default HealthDataActions;
