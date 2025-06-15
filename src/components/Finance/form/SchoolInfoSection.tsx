
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

interface SchoolInfoSectionProps {
  principalName: string;
  onPrincipalNameChange: (value: string) => void;
  onAutoFillPrincipal: () => void;
}

const SchoolInfoSection: React.FC<SchoolInfoSectionProps> = ({
  principalName,
  onPrincipalNameChange,
  onAutoFillPrincipal,
}) => (
  <div>
    <Label htmlFor="principalName">ชื่อผู้อำนวยการ</Label>
    <div className="flex items-center gap-2">
      <Input
        id="principalName"
        value={principalName}
        onChange={(e) => onPrincipalNameChange(e.target.value)}
        placeholder="ชื่อผู้อำนวยการโรงเรียน"
      />
      <Button
        type="button"
        variant="outline"
        className="shrink-0"
        onClick={onAutoFillPrincipal}
        title="เติมชื่อผู้อำนวยการจากรายชื่อครู"
      >
        <User className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

export default SchoolInfoSection;
