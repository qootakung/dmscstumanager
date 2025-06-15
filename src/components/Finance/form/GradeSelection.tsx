
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GradeSelectionProps {
  grades: string[];
  selectedGrade: string;
  onGradeChange: (grade: string) => void;
}

const GradeSelection: React.FC<GradeSelectionProps> = ({
  grades,
  selectedGrade,
  onGradeChange,
}) => (
  <div>
    <Label htmlFor="grade">เลือกชั้นเรียน</Label>
    <Select value={selectedGrade} onValueChange={onGradeChange}>
      <SelectTrigger>
        <SelectValue placeholder="เลือกชั้นเรียน" />
      </SelectTrigger>
      <SelectContent>
        {grades.map((grade) => (
          <SelectItem key={grade} value={grade}>
            {grade}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default GradeSelection;
