
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { StudentHealthDetails } from '@/types/student';
import HealthEditableCell from './HealthEditableCell';

interface HealthDataTableViewProps {
  healthData: StudentHealthDetails[] | undefined;
  isLoading: boolean;
  error: Error | null;
  editingCell: { recordId: string; column: 'weight' | 'height' } | null;
  editValue: string;
  isPending: boolean;
  selectedMonth: string;
  selectedGrade: string;
  currentAcademicYear: string;
  onCellClick: (record: StudentHealthDetails, column: 'weight' | 'height') => void;
  onValueChange: (value: string) => void;
  onUpdate: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const HealthDataTableView: React.FC<HealthDataTableViewProps> = ({
  healthData,
  isLoading,
  error,
  editingCell,
  editValue,
  isPending,
  selectedMonth,
  selectedGrade,
  currentAcademicYear,
  onCellClick,
  onValueChange,
  onUpdate,
  onKeyDown
}) => {
  const renderCell = (record: StudentHealthDetails, column: 'weight' | 'height') => {
    const isEditing = editingCell?.recordId === record.record_id && editingCell?.column === column;
    
    return (
      <HealthEditableCell
        record={record}
        column={column}
        isEditing={isEditing}
        editValue={editValue}
        isPending={isPending}
        onCellClick={onCellClick}
        onValueChange={onValueChange}
        onUpdate={onUpdate}
        onKeyDown={onKeyDown}
      />
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      {error && (
        <div className="text-red-600 p-4 border border-red-200 rounded-md mb-4">
          เกิดข้อผิดพลาดในการโหลดข้อมูล: {error.message}
        </div>
      )}
      <div className="min-w-full">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">รหัสนักเรียน</TableHead>
              <TableHead className="min-w-[200px]">ชื่อ-นามสกุล</TableHead>
              <TableHead className="min-w-[180px]">อายุ</TableHead>
              <TableHead className="min-w-[130px]">น้ำหนัก (กก.)</TableHead>
              <TableHead className="min-w-[130px]">ส่วนสูง (ซม.)</TableHead>
              <TableHead className="min-w-[160px]">วันที่ชั่ง</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : healthData && healthData.length > 0 ? (
              healthData.map((record) => (
                <TableRow key={record.record_id}>
                  <TableCell className="font-medium">{record.student_code}</TableCell>
                  <TableCell>{record.full_name}</TableCell>
                  <TableCell className="text-center">{`${record.age_years} ปี ${record.age_months} เดือน ${record.age_days} วัน`}</TableCell>
                  <TableCell>{renderCell(record, 'weight')}</TableCell>
                  <TableCell>{renderCell(record, 'height')}</TableCell>
                  <TableCell className="text-center">{new Date(record.measurement_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  ไม่พบข้อมูลสำหรับตัวกรองที่เลือก
                  <br />
                  <small className="text-muted-foreground">
                    ปีการศึกษา: {currentAcademicYear} | เดือน: {selectedMonth} | ระดับชั้น: {selectedGrade}
                  </small>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default HealthDataTableView;
