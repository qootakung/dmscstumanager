import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type { ReportOptions } from '@/types/student';

interface ReportOptionsFormProps {
  reportOptions: ReportOptions;
  academicYears: string[];
  classLevels: string[];
  onOptionChange: (field: keyof ReportOptions, value: any) => void;
  onAdditionalFieldChange: (field: keyof ReportOptions['additionalFields'], checked: boolean) => void;
}

const ReportOptionsForm: React.FC<ReportOptionsFormProps> = ({
  reportOptions,
  academicYears,
  classLevels,
  onOptionChange,
  onAdditionalFieldChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ตัวเลือกรายงาน</CardTitle>
        <CardDescription>เลือกประเภทรายงานและข้อมูลที่ต้องการแสดง</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium">ประเภทรายงาน</Label>
          <Select
            value={reportOptions.reportType}
            onValueChange={(value) => onOptionChange('reportType', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">รายชื่อนักเรียน</SelectItem>
              <SelectItem value="2">แบบลงทะเบียนการประชุม</SelectItem>
              <SelectItem value="3">แบบลงทะเบียนอื่นๆ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {reportOptions.reportType === '3' && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <Label className="text-base font-medium">ข้อมูลเพิ่มเติมสำหรับแบบลงทะเบียนอื่นๆ</Label>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="customColumn1">หัวข้อบรรทัดที่ 1</Label>
                <Input
                  id="customColumn1"
                  value={reportOptions.customColumn1 || ''}
                  onChange={(e) => onOptionChange('customColumn1', e.target.value)}
                  placeholder="เช่น แบบลงทะเบียนโครงการยกระดับผลสัมฤทธิ์ทางการเรียนรู้"
                />
              </div>
              <div>
                <Label htmlFor="customColumn2">หัวข้อบรรทัดที่ 2</Label>
                <Input
                  id="customColumn2"
                  value={reportOptions.customColumn2 || ''}
                  onChange={(e) => onOptionChange('customColumn2', e.target.value)}
                  placeholder="เช่น กิจกรรม ส่งเสริมความเป็นเลิศทางวิชาการ"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <Label className="text-base font-medium">ปีการศึกษา</Label>
          <Select
            value={reportOptions.academicYear}
            onValueChange={(value) => onOptionChange('academicYear', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-medium">ระดับชั้น</Label>
          <Select
            value={reportOptions.classLevel}
            onValueChange={(value) => onOptionChange('classLevel', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกระดับชั้น</SelectItem>
              {classLevels.map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(reportOptions.reportType === '1' || reportOptions.reportType === '2') && (
          <>
            <div>
              <Label className="text-base font-medium mb-3 block">ข้อมูลเพิ่มเติม</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gender"
                    checked={reportOptions.additionalFields.gender}
                    onCheckedChange={(checked) => onAdditionalFieldChange('gender', !!checked)}
                  />
                  <Label htmlFor="gender" className="text-sm">เพศ</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="citizenId"
                    checked={reportOptions.additionalFields.citizenId}
                    onCheckedChange={(checked) => onAdditionalFieldChange('citizenId', !!checked)}
                  />
                  <Label htmlFor="citizenId" className="text-sm">เลขบัตรประจำตัวประชาชน</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="signature"
                    checked={reportOptions.additionalFields.signature}
                    onCheckedChange={(checked) => onAdditionalFieldChange('signature', !!checked)}
                  />
                  <Label htmlFor="signature" className="text-sm">ลายมือชื่อ</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="guardianSignature"
                    checked={reportOptions.additionalFields.guardianSignature}
                    onCheckedChange={(checked) => onAdditionalFieldChange('guardianSignature', !!checked)}
                  />
                  <Label htmlFor="guardianSignature" className="text-sm">ลายเซ็นผู้ปกครอง</Label>
                </div>
                {reportOptions.reportType === '2' && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="timeIn"
                        checked={reportOptions.additionalFields.timeIn}
                        onCheckedChange={(checked) => onAdditionalFieldChange('timeIn', !!checked)}
                      />
                      <Label htmlFor="timeIn" className="text-sm">เวลามา</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="timeOut"
                        checked={reportOptions.additionalFields.timeOut}
                        onCheckedChange={(checked) => onAdditionalFieldChange('timeOut', !!checked)}
                      />
                      <Label htmlFor="timeOut" className="text-sm">เวลากลับ</Label>
                    </div>
                  </>
                )}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="phone"
                    checked={reportOptions.additionalFields.phone}
                    onCheckedChange={(checked) => onAdditionalFieldChange('phone', !!checked)}
                  />
                  <Label htmlFor="phone" className="text-sm">เบอร์โทร</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="note"
                    checked={reportOptions.additionalFields.note}
                    onCheckedChange={(checked) => onAdditionalFieldChange('note', !!checked)}
                  />
                  <Label htmlFor="note" className="text-sm">หมายเหตุ</Label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="customColumns" className="text-base font-medium">จำนวนคอลัมน์เพิ่มเติม</Label>
              <Input
                id="customColumns"
                type="number"
                min="0"
                max="10"
                value={reportOptions.customColumns}
                onChange={(e) => onOptionChange('customColumns', parseInt(e.target.value) || 0)}
                className="mt-2"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportOptionsForm;
