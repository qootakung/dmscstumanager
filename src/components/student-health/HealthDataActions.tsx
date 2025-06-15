
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { StudentHealthDetails } from '@/types/student';
import { exportToExcel } from '@/utils/excel';
import { printHealthReport } from '@/utils/healthReportPrint.tsx';
import { toast } from 'sonner';

interface HealthDataActionsProps {
  healthData: StudentHealthDetails[] | undefined;
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
  const monthOptions = [
    { value: 'all', label: 'ทุกเดือน' },
    ...Array.from({ length: 12 }, (_, i) => ({
      value: (i + 1).toString(),
      label: new Date(2000, i).toLocaleString('th-TH', { month: 'long' }),
    })),
  ];

  const gradeOptions = [
    { value: 'all', label: 'ทุกระดับชั้น' },
    { value: 'ป.1', label: 'ป.1' },
    { value: 'ป.2', label: 'ป.2' },
    { value: 'ป.3', label: 'ป.3' },
    { value: 'ป.4', label: 'ป.4' },
    { value: 'ป.5', label: 'ป.5' },
    { value: 'ป.6', label: 'ป.6' },
  ];

  const handleExport = () => {
    if (!healthData || healthData.length === 0) {
      toast.info('ไม่มีข้อมูลสำหรับส่งออก');
      return;
    }
    const dataForExport = healthData.map(record => ({
      'รหัสนักเรียน': record.student_code,
      'ชื่อ-นามสกุล': record.full_name,
      'อายุ': `${record.age_years} ปี ${record.age_months} เดือน ${record.age_days} วัน`,
      'น้ำหนัก (กก.)': record.weight_kg,
      'ส่วนสูง (ซม.)': record.height_cm,
      'วันที่ชั่ง': new Date(record.measurement_date).toLocaleDateString('th-TH'),
    }));
    exportToExcel(dataForExport, `ข้อมูลสุขภาพ-${selectedGrade}-${selectedMonth}-${currentAcademicYear}`);
  };

  const handlePrint = () => {
    if (!healthData || healthData.length === 0) {
      toast.info('ไม่มีข้อมูลสำหรับพิมพ์');
      return;
    }
    printHealthReport(
      healthData,
      gradeOptions.find(g => g.value === selectedGrade)?.label || 'ทุกระดับชั้น',
      monthOptions.find(m => m.value === selectedMonth)?.label || 'ทุกเดือน',
      currentAcademicYear
    );
  };

  const isDisabled = isLoading || !healthData || healthData.length === 0;

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleExport} variant="outline" disabled={isDisabled}>
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        ส่งออก Excel
      </Button>
      <Button onClick={handlePrint} variant="outline" disabled={isDisabled}>
        <Printer className="mr-2 h-4 w-4" />
        พิมพ์รายงาน
      </Button>
    </div>
  );
};

export default HealthDataActions;
