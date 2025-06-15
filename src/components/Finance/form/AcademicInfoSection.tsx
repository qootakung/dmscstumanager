
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AcademicInfoSectionProps {
  academicYear: string;
  semester: string;
  onAcademicYearChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
}

const AcademicInfoSection: React.FC<AcademicInfoSectionProps> = ({
  academicYear,
  semester,
  onAcademicYearChange,
  onSemesterChange,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <Label htmlFor="academicYear">ปีการศึกษา</Label>
      <Input
        id="academicYear"
        value={academicYear}
        onChange={(e) => onAcademicYearChange(e.target.value)}
      />
    </div>
    <div>
      <Label htmlFor="semester">ภาคเรียนที่</Label>
      <Select value={semester} onValueChange={onSemesterChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1</SelectItem>
          <SelectItem value="2">2</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

export default AcademicInfoSection;
