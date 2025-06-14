import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { ReportOptions } from '@/types/student';

// This interface is local to this component as it's not in the global types
interface AdditionalFieldOptions {
  citizenId: boolean;
  signature: boolean;
  guardianSignature: boolean;
  timeIn: boolean;
  timeOut: boolean;
  phone: boolean;
  note: boolean;
}

interface ReportOptionsFormProps {
  reportOptions: ReportOptions;
  handleOptionChange: (field: keyof ReportOptions, value: any) => void;
  handleAdditionalFieldChange: (field: keyof ReportOptions['additionalFields'], checked: boolean) => void;
  classLevels: string[];
  academicYears: string[];
}

const ReportOptionsForm: React.FC<ReportOptionsFormProps> = ({
  reportOptions,
  handleOptionChange,
  handleAdditionalFieldChange,
  classLevels,
  academicYears,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="reportType">ประเภทรายงาน</Label>
          <Select onValueChange={(value) => handleOptionChange('reportType', value)} defaultValue={reportOptions.reportType}>
            <SelectTrigger id="reportType">
              <SelectValue placeholder="เลือกประเภทรายงาน" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">รายชื่อนักเรียน</SelectItem>
              <SelectItem value="2">แบบลงทะเบียนการประชุม</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="classLevel">ระดับชั้น</Label>
          <Select onValueChange={(value) => handleOptionChange('classLevel', value)} value={reportOptions.classLevel}>
            <SelectTrigger id="classLevel">
              <SelectValue placeholder="เลือกระดับชั้น" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกระดับชั้น</SelectItem>
              {classLevels.map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="academicYear">ปีการศึกษา</Label>
          <Select onValueChange={(value) => handleOptionChange('academicYear', value)} value={reportOptions.academicYear}>
            <SelectTrigger id="academicYear">
              <SelectValue placeholder="เลือกปีการศึกษา" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>คอลัมน์เพิ่มเติม</Label>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="gender"
              checked={reportOptions.additionalFields.gender}
              onCheckedChange={(checked) => handleAdditionalFieldChange('gender', Boolean(checked))}
            />
            <Label htmlFor="gender">เพศ</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="citizenId"
              checked={reportOptions.additionalFields.citizenId}
              onCheckedChange={(checked) => handleAdditionalFieldChange('citizenId', Boolean(checked))}
            />
            <Label htmlFor="citizenId">เลขบัตรประจำตัวประชาชน</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="signature"
              checked={reportOptions.additionalFields.signature}
              onCheckedChange={(checked) => handleAdditionalFieldChange('signature', Boolean(checked))}
            />
            <Label htmlFor="signature">ลายเซ็น</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="guardianSignature"
              checked={reportOptions.additionalFields.guardianSignature}
              onCheckedChange={(checked) => handleAdditionalFieldChange('guardianSignature', Boolean(checked))}
            />
            <Label htmlFor="guardianSignature">ลายเซ็นผู้ปกครอง</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="timeIn"
              checked={reportOptions.additionalFields.timeIn}
              onCheckedChange={(checked) => handleAdditionalFieldChange('timeIn', Boolean(checked))}
            />
            <Label htmlFor="timeIn">เวลาเข้า</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="timeOut"
              checked={reportOptions.additionalFields.timeOut}
              onCheckedChange={(checked) => handleAdditionalFieldChange('timeOut', Boolean(checked))}
            />
            <Label htmlFor="timeOut">เวลาออก</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="phone"
              checked={reportOptions.additionalFields.phone}
              onCheckedChange={(checked) => handleAdditionalFieldChange('phone', Boolean(checked))}
            />
            <Label htmlFor="phone">เบอร์โทร</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="note"
              checked={reportOptions.additionalFields.note}
              onCheckedChange={(checked) => handleAdditionalFieldChange('note', Boolean(checked))}
            />
            <Label htmlFor="note">หมายเหตุ</Label>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Label htmlFor="customColumns">จำนวนคอลัมน์เพิ่มเติม:</Label>
        <Input
          type="number"
          id="customColumns"
          value={reportOptions.customColumns?.toString() || '0'}
          onChange={(e) => handleOptionChange('customColumns', parseInt(e.target.value) || 0)}
          className="w-24"
          min="0"
          max="10"
        />
      </div>
    </>
  );
};

export default ReportOptionsForm;
