
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { StudentHealthDetails } from '@/types/student';
import { useReactToPrint } from 'react-to-print';
import HealthReportPrintable from './HealthReportPrintable';
import HealthReportAdvanced from './HealthReportAdvanced';

interface HealthDataActionsProps {
  data: StudentHealthDetails[];
  selectedGrade: string;
  selectedMonth: string;
  academicYear: string;
  onExportExcel: () => void;
  isLoading: boolean;
}

const HealthDataActions: React.FC<HealthDataActionsProps> = ({
  data,
  selectedGrade,
  selectedMonth,
  academicYear,
  onExportExcel,
  isLoading
}) => {
  const basicReportRef = useRef<HTMLDivElement>(null);
  const advancedReportRef = useRef<HTMLDivElement>(null);

  const handleBasicPrint = useReactToPrint({
    content: () => basicReportRef.current,
    documentTitle: `health-report-basic-${selectedGrade}-${selectedMonth}-${academicYear}`,
  });

  const handleAdvancedPrint = useReactToPrint({
    content: () => advancedReportRef.current,
    documentTitle: `health-report-advanced-${selectedGrade}-${selectedMonth}-${academicYear}`,
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

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={onExportExcel}
        disabled={isLoading || data.length === 0}
        variant="outline"
        size="sm"
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        ส่งออก Excel
      </Button>
      
      <Button
        onClick={handleBasicPrint}
        disabled={isLoading || data.length === 0}
        variant="outline"
        size="sm"
      >
        <Printer className="h-4 w-4 mr-2" />
        พิมพ์รายงานพื้นฐาน
      </Button>

      <Button
        onClick={handleAdvancedPrint}
        disabled={isLoading || data.length === 0}
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
            data={data}
            grade={getGradeName(selectedGrade)}
            month={getMonthName(selectedMonth)}
            academicYear={academicYear}
          />
        </div>
      </div>

      <div style={{ display: 'none' }}>
        <div ref={advancedReportRef}>
          <HealthReportAdvanced
            data={data}
            grade={getGradeName(selectedGrade)}
            month={getMonthName(selectedMonth)}
            academicYear={academicYear}
          />
        </div>
      </div>
    </div>
  );
};

export default HealthDataActions;
