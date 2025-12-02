import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { StudentHealthDetails } from '@/types/student';
import { Teacher } from '@/types/teacher';
import { useReactToPrint } from 'react-to-print';
import { exportToExcel } from '@/utils/excel';
import { toast } from 'sonner';
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
    if (!data || data.length === 0) {
      toast.error('ไม่มีข้อมูลให้ส่งออก');
      return;
    }

    try {
      // Prepare data for Excel export
      const exportData = data.map((record, index) => ({
        'ลำดับที่': index + 1,
        'รหัสนักเรียน': record.student_code || '-',
        'ชื่อ-สกุล': record.full_name || '-',
        'อายุ (ปี)': record.age_years || 0,
        'อายุ (เดือน)': record.age_months || 0,
        'น้ำหนัก (กก.)': record.weight_kg?.toFixed(2) || '-',
        'ส่วนสูง (ซม.)': record.height_cm?.toFixed(2) || '-',
        'วันที่วัด': record.measurement_date ? new Date(record.measurement_date).toLocaleDateString('th-TH') : '-',
      }));

      // Generate filename
      const gradeName = getGradeName(selectedGrade);
      const monthName = getMonthName(selectedMonth);
      const filename = `ข้อมูลสุขภาพนักเรียน_${gradeName}_${monthName}_${currentAcademicYear}`;

      exportToExcel(exportData, filename);
      toast.success('ส่งออกข้อมูลสำเร็จ');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
    }
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
