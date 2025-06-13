
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileText, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { getStudents, gradeOptions, generateAcademicYears } from '@/utils/storage';
import type { ReportOptions } from '@/types/student';

const Reports: React.FC = () => {
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    reportType: '1',
    classLevel: 'all',
    academicYear: '2568',
    additionalFields: {
      citizenId: false,
      signature: false,
      guardianSignature: false,
      timeIn: false,
      timeOut: false,
      phone: false,
      note: false,
    }
  });
  const [selectedDate, setSelectedDate] = useState<Date>();

  const academicYears = generateAcademicYears();

  const handleReportOptionChange = (field: keyof ReportOptions, value: any) => {
    setReportOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleAdditionalFieldChange = (field: keyof ReportOptions['additionalFields'], checked: boolean) => {
    setReportOptions(prev => ({
      ...prev,
      additionalFields: {
        ...prev.additionalFields,
        [field]: checked
      }
    }));
  };

  const generateReport = () => {
    const students = getStudents();
    const filteredStudents = students.filter(student => {
      if (reportOptions.academicYear && student.academicYear !== reportOptions.academicYear) {
        return false;
      }
      if (reportOptions.classLevel !== 'all' && student.grade !== reportOptions.classLevel) {
        return false;
      }
      return true;
    });

    console.log('Generating report with options:', reportOptions);
    console.log('Filtered students:', filteredStudents);
    
    // Here we would implement the actual Excel generation
    // For now, we'll just show a success message
  };

  const printReport = () => {
    window.print();
  };

  const getReportTitle = () => {
    if (reportOptions.reportType === '1') {
      return 'ข้อมูลนักเรียนโรงเรียนบ้านดอนมูล';
    } else {
      return 'แบบลงทะเบียนการประชุมผู้ปกครองโรงเรียนบ้านดอนมูล';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-school-primary mb-2">
          ระบบรายงานข้อมูล
        </h2>
        <p className="text-muted-foreground">
          สร้างรายงานข้อมูลนักเรียนและแบบลงทะเบียนการประชุม
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Options */}
        <Card>
          <CardHeader>
            <CardTitle>ตัวเลือกรายงาน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">ประเภทรายงาน</label>
              <Select
                value={reportOptions.reportType}
                onValueChange={(value) => handleReportOptionChange('reportType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทรายงาน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">ข้อมูลนักเรียนโรงเรียนบ้านดอนมูล</SelectItem>
                  <SelectItem value="2">แบบลงทะเบียนการประชุมผู้ปกครอง</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">ปีการศึกษา</label>
              <Select
                value={reportOptions.academicYear}
                onValueChange={(value) => handleReportOptionChange('academicYear', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกปีการศึกษา" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">ระดับชั้น</label>
              <Select
                value={reportOptions.classLevel}
                onValueChange={(value) => handleReportOptionChange('classLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกระดับชั้น" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">นักเรียนทั้งหมด</SelectItem>
                  {gradeOptions.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">วันที่ (ไม่บังคับ)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP', { locale: th }) : "เลือกวันที่"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Additional Fields */}
        <Card>
          <CardHeader>
            <CardTitle>ฟิลด์เพิ่มเติม</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="citizenId"
                checked={reportOptions.additionalFields.citizenId}
                onCheckedChange={(checked) => handleAdditionalFieldChange('citizenId', checked as boolean)}
              />
              <label htmlFor="citizenId" className="text-sm">เลขบัตรประจำตัวประชาชน</label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="signature"
                checked={reportOptions.additionalFields.signature}
                onCheckedChange={(checked) => handleAdditionalFieldChange('signature', checked as boolean)}
              />
              <label htmlFor="signature" className="text-sm">ลายมือชื่อ</label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="guardianSignature"
                checked={reportOptions.additionalFields.guardianSignature}
                onCheckedChange={(checked) => handleAdditionalFieldChange('guardianSignature', checked as boolean)}
              />
              <label htmlFor="guardianSignature" className="text-sm">ลายมือชื่อผู้ปกครอง</label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="timeIn"
                checked={reportOptions.additionalFields.timeIn}
                onCheckedChange={(checked) => handleAdditionalFieldChange('timeIn', checked as boolean)}
              />
              <label htmlFor="timeIn" className="text-sm">เวลามา</label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="timeOut"
                checked={reportOptions.additionalFields.timeOut}
                onCheckedChange={(checked) => handleAdditionalFieldChange('timeOut', checked as boolean)}
              />
              <label htmlFor="timeOut" className="text-sm">เวลากลับ</label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="phone"
                checked={reportOptions.additionalFields.phone}
                onCheckedChange={(checked) => handleAdditionalFieldChange('phone', checked as boolean)}
              />
              <label htmlFor="phone" className="text-sm">เบอร์โทร</label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="note"
                checked={reportOptions.additionalFields.note}
                onCheckedChange={(checked) => handleAdditionalFieldChange('note', checked as boolean)}
              />
              <label htmlFor="note" className="text-sm">หมายเหตุ</label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>ตัวอย่างรายงาน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-6 border rounded-lg font-sarabun" style={{ fontSize: '16px' }}>
            <div className="text-center space-y-2">
              <h1 className="text-xl font-bold">{getReportTitle()}</h1>
              <h2 className="text-lg font-bold">
                ระดับชั้น {reportOptions.classLevel === 'all' ? 'ทั้งหมด' : reportOptions.classLevel} ปีการศึกษา {reportOptions.academicYear}
              </h2>
              {selectedDate && (
                <p className="text-base">
                  วันที่ {format(selectedDate, 'dd MMMM yyyy', { locale: th })}
                </p>
              )}
            </div>

            <div className="mt-6">
              <table className="w-full border-collapse border border-gray-400">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 p-2 text-center">ที่</th>
                    <th className="border border-gray-400 p-2 text-center">รหัสนักเรียน</th>
                    <th className="border border-gray-400 p-2 text-center">ชื่อ-นามสกุล</th>
                    {reportOptions.additionalFields.citizenId && (
                      <th className="border border-gray-400 p-2 text-center">เลขบัตรประชาชน</th>
                    )}
                    {reportOptions.additionalFields.phone && (
                      <th className="border border-gray-400 p-2 text-center">เบอร์โทร</th>
                    )}
                    {reportOptions.additionalFields.timeIn && (
                      <th className="border border-gray-400 p-2 text-center">เวลามา</th>
                    )}
                    {reportOptions.additionalFields.timeOut && (
                      <th className="border border-gray-400 p-2 text-center">เวลากลับ</th>
                    )}
                    {reportOptions.additionalFields.signature && (
                      <th className="border border-gray-400 p-2 text-center">ลายมือชื่อ</th>
                    )}
                    {reportOptions.additionalFields.guardianSignature && (
                      <th className="border border-gray-400 p-2 text-center">ลายมือชื่อผู้ปกครอง</th>
                    )}
                    {reportOptions.additionalFields.note && (
                      <th className="border border-gray-400 p-2 text-center">หมายเหตุ</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-2 text-center">1</td>
                    <td className="border border-gray-400 p-2 text-center">12345</td>
                    <td className="border border-gray-400 p-2">เด็กชาย ตัวอย่าง นามสกุลตัวอย่าง</td>
                    {reportOptions.additionalFields.citizenId && (
                      <td className="border border-gray-400 p-2 text-center">1-2345-67890-12-3</td>
                    )}
                    {reportOptions.additionalFields.phone && (
                      <td className="border border-gray-400 p-2 text-center"></td>
                    )}
                    {reportOptions.additionalFields.timeIn && (
                      <td className="border border-gray-400 p-2 text-center"></td>
                    )}
                    {reportOptions.additionalFields.timeOut && (
                      <td className="border border-gray-400 p-2 text-center"></td>
                    )}
                    {reportOptions.additionalFields.signature && (
                      <td className="border border-gray-400 p-2 text-center"></td>
                    )}
                    {reportOptions.additionalFields.guardianSignature && (
                      <td className="border border-gray-400 p-2 text-center"></td>
                    )}
                    {reportOptions.additionalFields.note && (
                      <td className="border border-gray-400 p-2 text-center"></td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={generateReport}
          className="bg-school-primary hover:bg-school-primary/90"
        >
          <FileText className="w-4 h-4 mr-2" />
          สร้างรายงาน Excel
        </Button>
        
        <Button
          onClick={printReport}
          variant="outline"
          className="border-school-primary text-school-primary hover:bg-school-primary hover:text-white"
        >
          <Printer className="w-4 h-4 mr-2" />
          พิมพ์รายงาน
        </Button>
      </div>
    </div>
  );
};

export default Reports;
