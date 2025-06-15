
import React from 'react';
import type { Teacher } from '@/types/teacher';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SignatureFieldsProps {
  teachers: Teacher[];
  payerName: string;
  selectedTeacher: Teacher | null;
  onPayerNameChange: (value: string) => void;
  onTeacherChange: (teacherId: string) => void;
}

const SignatureFields: React.FC<SignatureFieldsProps> = ({
  teachers,
  payerName,
  selectedTeacher,
  onPayerNameChange,
  onTeacherChange,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <Label htmlFor="payerName">ชื่อผู้จ่ายเงิน</Label>
      <Select value={payerName} onValueChange={onPayerNameChange}>
        <SelectTrigger>
          <SelectValue
            placeholder="เลือกผู้จ่ายเงิน"
            {...(payerName ? { children: payerName } : {})}
          />
        </SelectTrigger>
        <SelectContent>
          {teachers.map((teacher) => (
            <SelectItem
              key={teacher.id}
              value={`${teacher.firstName} ${teacher.lastName}`}
            >
              {teacher.firstName} {teacher.lastName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div>
      <Label htmlFor="teacher">ครูประจำชั้น</Label>
      <Select
        value={selectedTeacher ? selectedTeacher.id : ''}
        onValueChange={onTeacherChange}
      >
        <SelectTrigger>
          <SelectValue
            placeholder="เลือกครูประจำชั้น"
            {...(selectedTeacher
              ? {
                  children: `${selectedTeacher.firstName} ${selectedTeacher.lastName}`
                }
              : {})}
          />
        </SelectTrigger>
        <SelectContent>
          {teachers.map((teacher) => (
            <SelectItem key={teacher.id} value={teacher.id}>
              {teacher.firstName} {teacher.lastName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

export default SignatureFields;
