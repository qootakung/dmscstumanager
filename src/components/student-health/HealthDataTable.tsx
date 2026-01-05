

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudentHealthDetails, updateStudentHealthRecord } from '@/utils/healthStorage';
import { StudentHealthDetails } from '@/types/student';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HealthDataFilters from './HealthDataFilters';
import HealthDataActions from './HealthDataActions';
import HealthDataTableView from './HealthDataTableView';

// Calculate current semester based on date
const getCurrentSemester = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  if (month === 5) return day >= 16 ? '1' : '2';
  if (month >= 6 && month <= 10) return '1';
  return '2';
};

const HealthDataTable: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>(getCurrentSemester());
  const currentAcademicYear = (new Date().getFullYear() + 543).toString();
  
  const [editingCell, setEditingCell] = useState<{ recordId: string; column: 'weight' | 'height' } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  console.log('Current filters:', { currentAcademicYear, selectedMonth, selectedGrade, selectedSemester });

  const { data: rawHealthData, isLoading, error } = useQuery({
    queryKey: ['studentHealthDetails', currentAcademicYear, selectedMonth, selectedGrade, selectedSemester],
    queryFn: () => {
      // Convert 'all' to undefined for proper parameter passing
      const monthFilter = selectedMonth === 'all' ? undefined : parseInt(selectedMonth, 10);
      const gradeFilter = selectedGrade === 'all' ? undefined : selectedGrade;
      const semesterFilter = selectedSemester === 'all' ? undefined : selectedSemester;
      
      return getStudentHealthDetails(
        currentAcademicYear,
        monthFilter,
        gradeFilter,
        semesterFilter
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Use rawHealthData directly since semester filtering is now done in query
  const healthData = rawHealthData;

  console.log('Health data:', healthData);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);

  const updateMutation = useMutation({
    mutationFn: ({ recordId, updates }: { recordId: string, updates: { weight_kg?: number | null, height_cm?: number | null } }) => 
        updateStudentHealthRecord(recordId, updates),
    onSuccess: () => {
      toast.success('อัปเดตข้อมูลสำเร็จ');
      queryClient.invalidateQueries({ queryKey: ['studentHealthDetails', currentAcademicYear, selectedMonth, selectedGrade, selectedSemester] });
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast.error('อัปเดตข้อมูลไม่สำเร็จ: ' + (error.message || 'เกิดข้อผิดพลาด'));
    },
    onSettled: () => {
        setEditingCell(null);
        setEditValue('');
    }
  });

  const handleCellClick = (record: StudentHealthDetails, column: 'weight' | 'height') => {
    if (updateMutation.isPending) return;
    setEditingCell({ recordId: record.record_id, column });
    const value = column === 'weight' ? record.weight_kg : record.height_cm;
    setEditValue(value?.toString() || '');
  };

  const handleUpdate = () => {
    if (!editingCell) return;

    const trimmedValue = editValue.trim();
    let finalValue: number | null;

    if (trimmedValue === '') {
      finalValue = null;
    } else {
      const parsedValue = parseFloat(trimmedValue);
      if (isNaN(parsedValue)) {
        toast.error("กรุณาใส่ข้อมูลเป็นตัวเลขที่ถูกต้อง");
        return;
      }
      
      // Additional validation
      if (editingCell.column === 'weight' && (parsedValue < 0 || parsedValue > 300)) {
        toast.error("น้ำหนักต้องอยู่ระหว่าง 0-300 กิโลกรัม");
        return;
      }
      
      if (editingCell.column === 'height' && (parsedValue < 0 || parsedValue > 300)) {
        toast.error("ส่วนสูงต้องอยู่ระหว่าง 0-300 เซนติเมตร");
        return;
      }
      
      finalValue = parsedValue;
    }

    const updates = editingCell.column === 'weight'
      ? { weight_kg: finalValue }
      : { height_cm: finalValue };
    
    console.log('Updating record:', editingCell.recordId, 'with:', updates);
    updateMutation.mutate({ recordId: editingCell.recordId, updates });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <CardTitle>ตารางข้อมูลสุขภาพนักเรียน</CardTitle>
          <HealthDataActions
            data={healthData || []}
            selectedGrade={selectedGrade}
            selectedMonth={selectedMonth}
            currentAcademicYear={currentAcademicYear}
            isLoading={isLoading}
          />
        </div>
        <div className="pt-4">
          <HealthDataFilters
            selectedGrade={selectedGrade}
            selectedMonth={selectedMonth}
            selectedSemester={selectedSemester}
            onGradeChange={setSelectedGrade}
            onMonthChange={setSelectedMonth}
            onSemesterChange={setSelectedSemester}
            isLoading={isLoading}
          />
        </div>
      </CardHeader>
      <CardContent>
        <HealthDataTableView
          healthData={healthData}
          isLoading={isLoading}
          error={error}
          editingCell={editingCell}
          editValue={editValue}
          isPending={updateMutation.isPending}
          selectedMonth={selectedMonth}
          selectedGrade={selectedGrade}
          currentAcademicYear={currentAcademicYear}
          onCellClick={handleCellClick}
          onValueChange={setEditValue}
          onUpdate={handleUpdate}
          onKeyDown={handleKeyDown}
        />
      </CardContent>
    </Card>
  );
};

export default HealthDataTable;
