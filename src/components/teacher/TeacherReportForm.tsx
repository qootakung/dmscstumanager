
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type { TeacherReportOptions } from '@/types/teacherReport';

interface TeacherReportFormProps {
  reportOptions: TeacherReportOptions;
  academicYears: string[];
  onOptionChange: (field: keyof TeacherReportOptions, value: any) => void;
  onAdditionalFieldChange: (field: keyof TeacherReportOptions['additionalFields'], checked: boolean) => void;
}

const TeacherReportForm: React.FC<TeacherReportFormProps> = ({
  reportOptions,
  academicYears,
  onOptionChange,
  onAdditionalFieldChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reportType">ประเภทรายงาน</Label>
          <Select onValueChange={(value) => onOptionChange('reportType', value as '1' | '2')}>
            <SelectTrigger id="reportType">
              <SelectValue placeholder="เลือกประเภทรายงาน" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">รายชื่อข้าราชการครูและบุคลากร</SelectItem>
              <SelectItem value="2">แบบลงทะเบียนการประชุม</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="academicYear">ปีการศึกษา</Label>
          <Select onValueChange={(value) => onOptionChange('academicYear', value)}>
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

      <div className="flex items-center space-x-2">
        <Checkbox
          id="showDate"
          checked={reportOptions.showDate}
          onCheckedChange={(checked) => onOptionChange('showDate', Boolean(checked))}
        />
        <Label htmlFor="showDate">แสดงวันที่ในรายงาน</Label>
      </div>

      {reportOptions.showDate && (
        <div>
          <Label htmlFor="selectedDate">เลือกวันที่</Label>
          <Input
            type="date"
            id="selectedDate"
            value={reportOptions.selectedDate}
            onChange={(e) => onOptionChange('selectedDate', e.target.value)}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>คอลัมน์เพิ่มเติม</Label>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="email"
              checked={reportOptions.additionalFields.email}
              onCheckedChange={(checked) => onAdditionalFieldChange('email', Boolean(checked))}
            />
            <Label htmlFor="email">Email</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="citizenId"
              checked={reportOptions.additionalFields.citizenId}
              onCheckedChange={(checked) => onAdditionalFieldChange('citizenId', Boolean(checked))}
            />
            <Label htmlFor="citizenId">เลขบัตรประจำตัวประชาชน</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="salary"
              checked={reportOptions.additionalFields.salary}
              onCheckedChange={(checked) => onAdditionalFieldChange('salary', Boolean(checked))}
            />
            <Label htmlFor="salary">เงินเดือน</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="birthDate"
              checked={reportOptions.additionalFields.birthDate}
              onCheckedChange={(checked) => onAdditionalFieldChange('birthDate', Boolean(checked))}
            />
            <Label htmlFor="birthDate">วัน/เดือน/ปีเกิด</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="education"
              checked={reportOptions.additionalFields.education}
              onCheckedChange={(checked) => onAdditionalFieldChange('education', Boolean(checked))}
            />
            <Label htmlFor="education">วุฒิการศึกษา</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="major"
              checked={reportOptions.additionalFields.major}
              onCheckedChange={(checked) => onAdditionalFieldChange('major', Boolean(checked))}
            />
            <Label htmlFor="major">วิชาเอก</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="phone"
              checked={reportOptions.additionalFields.phone}
              onCheckedChange={(checked) => onAdditionalFieldChange('phone', Boolean(checked))}
            />
            <Label htmlFor="phone">เบอร์โทร</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="lineId"
              checked={reportOptions.additionalFields.lineId}
              onCheckedChange={(checked) => onAdditionalFieldChange('lineId', Boolean(checked))}
            />
            <Label htmlFor="lineId">ID Line</Label>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Label htmlFor="customColumns">จำนวนคอลัมน์เพิ่มเติม:</Label>
        <Input
          type="number"
          id="customColumns"
          value={reportOptions.customColumns?.toString() || '0'}
          onChange={(e) => onOptionChange('customColumns', parseInt(e.target.value) || 0)}
          className="w-24"
          min="0"
          max="10"
        />
      </div>
    </div>
  );
};

export default TeacherReportForm;
