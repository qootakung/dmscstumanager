
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { gradeOptions as allGradeOptionsList } from '@/utils/data';

interface HealthDataFiltersProps {
  selectedGrade: string;
  selectedMonth: string;
  onGradeChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  isLoading: boolean;
}

const HealthDataFilters: React.FC<HealthDataFiltersProps> = ({
  selectedGrade,
  selectedMonth,
  onGradeChange,
  onMonthChange,
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
    ...allGradeOptionsList.map(g => ({ value: g, label: g })),
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="w-[200px]">
        <Select value={selectedGrade} onValueChange={onGradeChange} disabled={isLoading}>
          <SelectTrigger><SelectValue placeholder="เลือกระดับชั้น" /></SelectTrigger>
          <SelectContent>
            {gradeOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-[200px]">
        <Select value={selectedMonth} onValueChange={onMonthChange} disabled={isLoading}>
          <SelectTrigger><SelectValue placeholder="เลือกเดือน" /></SelectTrigger>
          <SelectContent>
            {monthOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default HealthDataFilters;
