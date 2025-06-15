
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { StudentHealthDetails } from '@/types/student';
import { useReactToPrint } from 'react-to-print';
import HealthReportPrintable from './HealthReportPrintable';
import HealthReportAdvanced from './HealthReportAdvanced';

interface HealthDataActionsProps {
  healthData: StudentHealthDetails[];
  selectedGrade: string;
  selectedMonth: string;
  currentAcademicYear: string;
  isLoading: boolean;
}

const HealthDataActions: React.FC<HealthDataActionsProps> = ({
  healthData,
  selectedGrade,
  selectedMonth,
  currentAcademicYear,
  isLoading
}) => {
  const basicReportRef = useRef<HTMLDivElement>(null);
  const advancedReportRef = useRef<HTMLDivElement>(null);

  const handleBasicPrint = useReactToPrint({
    contentRef: basicReportRef,
    documentTitle: `health-report-basic-${selectedGrade}-${selectedMonth}-${currentAcademicYear}`,
  });

  const handleAdvancedPrint = useReactToPrint({
    contentRef: advancedReportRef,
    documentTitle: `health-report-advanced-${selectedGrade}-${selectedMonth}-${currentAcademicYear}`,
  });

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

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleExportExcel}
        disabled={isLoading || healthData.length === 0}
        variant="outline"
        size="sm"
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        ส่งออก Excel
      </Button>
      
      <Button
        onClick={handleBasicPrint}
        disabled={isLoading || healthData.length === 0}
        variant="outline"
        size="sm"
      >
        <Printer className="h-4 w-4 mr-2" />
        พิมพ์รายงานพื้นฐาน
      </Button>

      <Button
        onClick={handleAdvancedPrint}
        disabled={isLoading || healthData.length === 0}
        variant="outline"
        size="sm"
      >
        <Printer className="h-4 w-4 mr-2" />
        พิมพ์รายงาน BMI
      </Button>

      {/* Hidden components for printing */}
      <div style={{ display: 'none' }}>
        <div ref={basicReportRef}>
          <HealthReportPrintable
            data={healthData}
            grade={getGradeName(selectedGrade)}
            month={getMonthName(selectedMonth)}
            academicYear={currentAcademicYear}
          />
        </div>
      </div>

      <div style={{ display: 'none' }}>
        <div ref={advancedReportRef}>
          <HealthReportAdvanced
            data={healthData}
            grade={getGradeName(selectedGrade)}
            month={getMonthName(selectedMonth)}
            academicYear={currentAcademicYear}
          />
        </div>
      </div>
    </div>
  );
};

export default HealthDataActions;
