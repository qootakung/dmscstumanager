import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudentHealthDetails, updateStudentHealthRecord } from '@/utils/healthStorage';
import { StudentHealthDetails } from '@/types/student';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HealthDataTable: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const currentAcademicYear = (new Date().getFullYear() + 543).toString();
  
  const [editingCell, setEditingCell] = useState<{ recordId: string; column: 'weight' | 'height' } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const { data: healthData, isLoading } = useQuery({
    queryKey: ['studentHealthDetails', currentAcademicYear, selectedMonth],
    queryFn: () => getStudentHealthDetails(currentAcademicYear, selectedMonth === 'all' ? undefined : parseInt(selectedMonth, 10)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ recordId, updates }: { recordId: string, updates: { weight_kg?: number | null, height_cm?: number | null } }) => 
        updateStudentHealthRecord(recordId, updates),
    onSuccess: () => {
      toast.success('อัปเดตข้อมูลสำเร็จ');
      queryClient.invalidateQueries({ queryKey: ['studentHealthDetails', currentAcademicYear, selectedMonth] });
    },
    onError: () => {
      toast.error('อัปเดตข้อมูลไม่สำเร็จ');
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
      finalValue = parsedValue;
    }

    const updates = editingCell.column === 'weight'
      ? { weight_kg: finalValue }
      : { height_cm: finalValue };
    
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

  const renderCell = (record: StudentHealthDetails, column: 'weight' | 'height') => {
    const isEditing = editingCell?.recordId === record.record_id && editingCell?.column === column;
    const value = column === 'weight' ? record.weight_kg : record.height_cm;

    if (isEditing) {
      return (
        <Input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleUpdate}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-24 h-8"
          disabled={updateMutation.isPending}
        />
      );
    }
    return (
      <div onClick={() => handleCellClick(record, column)} className="cursor-pointer min-h-[32px] flex items-center p-2 -m-2 rounded-md hover:bg-muted">
        {value !== null && value !== undefined ? value.toFixed(2) : <span className="text-muted-foreground">-</span>}
      </div>
    );
  };
  
  const monthOptions = [
    { value: 'all', label: 'ทุกเดือน' },
    ...Array.from({ length: 12 }, (_, i) => ({
      value: (i + 1).toString(),
      label: new Date(2000, i).toLocaleString('th-TH', { month: 'long' }),
    })),
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>ตารางข้อมูลสุขภาพนักเรียน</CardTitle>
        <div className="w-[200px]">
          <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกเดือน" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">รหัสนักเรียน</TableHead>
                <TableHead>ชื่อ-นามสกุล</TableHead>
                <TableHead className="w-[200px]">อายุ</TableHead>
                <TableHead className="w-[150px]">น้ำหนัก (กก.)</TableHead>
                <TableHead className="w-[150px]">ส่วนสูง (ซม.)</TableHead>
                <TableHead className="w-[180px]">วันที่ชั่ง</TableHead>
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
                    <TableCell>{record.student_code}</TableCell>
                    <TableCell>{record.full_name}</TableCell>
                    <TableCell className="text-center">{`${record.age_years} ปี ${record.age_months} เดือน ${record.age_days} วัน`}</TableCell>
                    <TableCell>{renderCell(record, 'weight')}</TableCell>
                    <TableCell>{renderCell(record, 'height')}</TableCell>
                    <TableCell>{new Date(record.measurement_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    ไม่พบข้อมูลสำหรับเดือนที่เลือก
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthDataTable;
