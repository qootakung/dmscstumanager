
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileText, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { getTeachers, generateAcademicYears } from '@/utils/storage';
import { exportToExcel } from '@/utils/excel';
import type { TeacherReportOptions, Teacher } from '@/types/teacher';
import Swal from 'sweetalert2';

const TeacherReports: React.FC = () => {
  const [reportOptions, setReportOptions] = useState<TeacherReportOptions>({
    reportType: '1',
    academicYear: '2568',
    additionalFields: {
      email: false,
      citizenId: false,
      salary: false,
      birthDate: false,
      position: false,
      education: false,
      majorSubject: false,
      phone: false,
      lineId: false,
    },
    customColumns: 0
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);

  const academicYears = generateAcademicYears();

  useEffect(() => {
    loadFilteredTeachers();
  }, [reportOptions.academicYear]);

  const loadFilteredTeachers = () => {
    const teachers = getTeachers();
    const filtered = teachers.filter(teacher => {
      if (reportOptions.academicYear && teacher.academicYear !== reportOptions.academicYear) {
        return false;
      }
      return true;
    });
    
    // เรียงลำดับตามเลขตำแหน่ง
    const sorted = filtered.sort((a, b) => {
      const numA = parseInt(a.positionNumber) || 0;
      const numB = parseInt(b.positionNumber) || 0;
      return numA - numB;
    });
    
    setFilteredTeachers(sorted);
  };

  const handleReportOptionChange = (field: keyof TeacherReportOptions, value: any) => {
    setReportOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleAdditionalFieldChange = (field: keyof TeacherReportOptions['additionalFields'], checked: boolean) => {
    setReportOptions(prev => ({
      ...prev,
      additionalFields: {
        ...prev.additionalFields,
        [field]: checked
      }
    }));
  };

  const generateExcelReport = async () => {
    if (filteredTeachers.length === 0) {
      await Swal.fire({
        title: 'ไม่มีข้อมูล!',
        text: 'ไม่พบข้อมูลครูตามเงื่อนไขที่เลือก',
        icon: 'warning',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    try {
      const reportData = filteredTeachers.map((teacher, index) => {
        const baseData: any = {
          'ที่': index + 1,
          'ชื่อ-นามสกุล': `${teacher.firstName} ${teacher.lastName}`,
          'ตำแหน่ง': teacher.position,
        };

        if (reportOptions.additionalFields.email) baseData['Email'] = teacher.email || '';
        if (reportOptions.additionalFields.citizenId) baseData['เลขบัตรประชาชน'] = teacher.citizenId || '';
        if (reportOptions.additionalFields.salary) baseData['เงินเดือน'] = teacher.salary || '';
        if (reportOptions.additionalFields.birthDate) baseData['วันเกิด'] = teacher.birthDate || '';
        if (reportOptions.additionalFields.education) baseData['วุฒิการศึกษา'] = teacher.education || '';
        if (reportOptions.additionalFields.majorSubject) baseData['วิชาเอก'] = teacher.majorSubject || '';
        if (reportOptions.additionalFields.phone) baseData['เบอร์โทร'] = teacher.phone || '';
        if (reportOptions.additionalFields.lineId) baseData['ID Line'] = teacher.lineId || '';

        // เพิ่มคอลัมน์ที่กำหนดเอง
        for (let i = 1; i <= reportOptions.customColumns; i++) {
          baseData[`คอลัมน์ ${i}`] = '';
        }

        return baseData;
      });

      const filename = `${getReportTitle()}_${reportOptions.academicYear}`;
      exportToExcel(reportData, filename);

      await Swal.fire({
        title: 'สร้างรายงานสำเร็จ!',
        text: 'ไฟล์ Excel ได้ถูกดาวน์โหลดแล้ว',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถสร้างรายงาน Excel ได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  const printReport = () => {
    const printContent = document.getElementById('teacher-report-preview');
    if (!printContent) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>พิมพ์รายงาน</title>
          <style>
            body { font-family: 'Sarabun', Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: center; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { font-size: 16px; margin: 5px 0; font-weight: bold; }
            .header h2 { font-size: 16px; margin: 5px 0; font-weight: bold; }
            .header p { font-size: 16px; margin: 5px 0; font-weight: bold; }
            @media print { 
              body { margin: 0; } 
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const getReportTitle = () => {
    if (reportOptions.reportType === '1') {
      return 'รายชื่อข้าราชการครูและบุคลากรทางการศึกษาโรงเรียนบ้านดอนมูล';
    } else {
      return 'แบบลงทะเบียนการประชุมข้าราชการครูและบุคลากรทางการศึกษาโรงเรียนบ้านดอนมูล';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-school-primary mb-2">
          ระบบรายงานข้อมูลครู
        </h2>
        <p className="text-muted-foreground">
          สร้างรายงานข้อมูลครูและแบบลงทะเบียนการประชุม
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
                  <SelectItem value="1">รายชื่อข้าราชการครูและบุคลากรทางการศึกษา</SelectItem>
                  <SelectItem value="2">แบบลงทะเบียนการประชุมครู</SelectItem>
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

            <div>
              <Label htmlFor="customColumns">จำนวนคอลัมน์เพิ่มเติม</Label>
              <Input
                id="customColumns"
                type="number"
                min="0"
                max="10"
                value={reportOptions.customColumns}
                onChange={(e) => handleReportOptionChange('customColumns', parseInt(e.target.value) || 0)}
                placeholder="ระบุจำนวนคอลัมน์"
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Fields */}
        <Card>
          <CardHeader>
            <CardTitle>ฟิลด์เพิ่มเติม</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="email"
                checked={reportOptions.additionalFields.email}
                onCheckedChange={(checked) => handleAdditionalFieldChange('email', checked as boolean)}
              />
              <label htmlFor="email" className="text-sm">Email</label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="citizenId"
                checked={reportOptions.additionalFields.citizenId}
                onCheckedChange={(checked) => handleAdditionalFieldChange('citizenId', checked as boolean)}
              />
              <label htmlFor="citizenId" className="text-sm">เลขบัตรประชาชน</label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="salary"
                checked={reportOptions.additionalFields.salary}
                onCheckedChange={(checked) => handleAdditionalFieldChange('salary', checked as boolean)}
              />
              <label htmlFor="salary" className="text-sm">เงินเดือน</label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="birthDate"
                checked={reportOptions.additionalFields.birthDate}
                onCheckedChange={(checked) => handleAdditionalFieldChange('birthDate', checked as boolean)}
              />
              <label htmlFor="birthDate" className="text-sm">วันเกิด</label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="position"
                checked={reportOptions.additionalFields.position}
                onCheckedChange={(checked) => handleAdditionalFieldChange('position', checked as boolean)}
              />
              <label htmlFor="position" className="text-sm">ตำแหน่ง</label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="education"
                checked={reportOptions.additionalFields.education}
                onCheckedChange={(checked) => handleAdditionalFieldChange('education', checked as boolean)}
              />
              <label htmlFor="education" className="text-sm">วุฒิการศึกษา</label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="majorSubject"
                checked={reportOptions.additionalFields.majorSubject}
                onCheckedChange={(checked) => handleAdditionalFieldChange('majorSubject', checked as boolean)}
              />
              <label htmlFor="majorSubject" className="text-sm">วิชาเอก</label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="phone"
                checked={reportOptions.additionalFields.phone}
                onCheckedChange={(checked) => handleAdditionalFieldChange('phone', checked as boolean)}
              />
              <label htmlFor="phone" className="text-sm">เบอร์โทร</label>
            </div>

            <div className="flex items-center space-x-2 col-span-2">
              <Checkbox
                id="lineId"
                checked={reportOptions.additionalFields.lineId}
                onCheckedChange={(checked) => handleAdditionalFieldChange('lineId', checked as boolean)}
              />
              <label htmlFor="lineId" className="text-sm">ID Line</label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>ตัวอย่างรายงาน ({filteredTeachers.length} คน)</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="teacher-report-preview" className="bg-white p-6 border rounded-lg font-sarabun" style={{ fontSize: '16px' }}>
            <div className="header text-center space-y-2">
              <h1 className="text-xl font-bold">{getReportTitle()}</h1>
              <h2 className="text-lg font-bold">
                ปีการศึกษา {reportOptions.academicYear}
              </h2>
              {selectedDate && (
                <p className="text-base font-bold">
                  วันที่ {format(selectedDate, 'dd MMMM yyyy', { locale: th })}
                </p>
              )}
            </div>

            <div className="mt-6">
              <table className="w-full border-collapse border border-gray-400">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 p-2 text-center">ที่</th>
                    <th className="border border-gray-400 p-2 text-center">ชื่อ-นามสกุล</th>
                    <th className="border border-gray-400 p-2 text-center">ตำแหน่ง</th>
                    {reportOptions.additionalFields.email && (
                      <th className="border border-gray-400 p-2 text-center">Email</th>
                    )}
                    {reportOptions.additionalFields.citizenId && (
                      <th className="border border-gray-400 p-2 text-center">เลขบัตรประชาชน</th>
                    )}
                    {reportOptions.additionalFields.salary && (
                      <th className="border border-gray-400 p-2 text-center">เงินเดือน</th>
                    )}
                    {reportOptions.additionalFields.birthDate && (
                      <th className="border border-gray-400 p-2 text-center">วันเกิด</th>
                    )}
                    {reportOptions.additionalFields.education && (
                      <th className="border border-gray-400 p-2 text-center">วุฒิการศึกษา</th>
                    )}
                    {reportOptions.additionalFields.majorSubject && (
                      <th className="border border-gray-400 p-2 text-center">วิชาเอก</th>
                    )}
                    {reportOptions.additionalFields.phone && (
                      <th className="border border-gray-400 p-2 text-center">เบอร์โทร</th>
                    )}
                    {reportOptions.additionalFields.lineId && (
                      <th className="border border-gray-400 p-2 text-center">ID Line</th>
                    )}
                    {Array.from({ length: reportOptions.customColumns }, (_, i) => (
                      <th key={i} className="border border-gray-400 p-2 text-center">คอลัมน์ {i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.length > 0 ? (
                    filteredTeachers.slice(0, 10).map((teacher, index) => (
                      <tr key={teacher.id}>
                        <td className="border border-gray-400 p-2 text-center">{index + 1}</td>
                        <td className="border border-gray-400 p-2">{teacher.firstName} {teacher.lastName}</td>
                        <td className="border border-gray-400 p-2 text-center">{teacher.position}</td>
                        {reportOptions.additionalFields.email && (
                          <td className="border border-gray-400 p-2 text-center">{teacher.email || ''}</td>
                        )}
                        {reportOptions.additionalFields.citizenId && (
                          <td className="border border-gray-400 p-2 text-center">{teacher.citizenId || ''}</td>
                        )}
                        {reportOptions.additionalFields.salary && (
                          <td className="border border-gray-400 p-2 text-center">{teacher.salary || ''}</td>
                        )}
                        {reportOptions.additionalFields.birthDate && (
                          <td className="border border-gray-400 p-2 text-center">{teacher.birthDate || ''}</td>
                        )}
                        {reportOptions.additionalFields.education && (
                          <td className="border border-gray-400 p-2 text-center">{teacher.education || ''}</td>
                        )}
                        {reportOptions.additionalFields.majorSubject && (
                          <td className="border border-gray-400 p-2 text-center">{teacher.majorSubject || ''}</td>
                        )}
                        {reportOptions.additionalFields.phone && (
                          <td className="border border-gray-400 p-2 text-center">{teacher.phone || ''}</td>
                        )}
                        {reportOptions.additionalFields.lineId && (
                          <td className="border border-gray-400 p-2 text-center">{teacher.lineId || ''}</td>
                        )}
                        {Array.from({ length: reportOptions.customColumns }, (_, i) => (
                          <td key={i} className="border border-gray-400 p-2 text-center"></td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3 + Object.values(reportOptions.additionalFields).filter(Boolean).length + reportOptions.customColumns} className="border border-gray-400 p-4 text-center text-gray-500">
                        ไม่พบข้อมูลครูตามเงื่อนไขที่เลือก
                      </td>
                    </tr>
                  )}
                  {filteredTeachers.length > 10 && (
                    <tr>
                      <td colSpan={3 + Object.values(reportOptions.additionalFields).filter(Boolean).length + reportOptions.customColumns} className="border border-gray-400 p-2 text-center text-gray-500">
                        ... และอีก {filteredTeachers.length - 10} คน
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={generateExcelReport}
          className="bg-school-primary hover:bg-school-primary/90"
          disabled={filteredTeachers.length === 0}
        >
          <FileText className="w-4 h-4 mr-2" />
          สร้างรายงาน Excel
        </Button>
        
        <Button
          onClick={printReport}
          variant="outline"
          className="border-school-primary text-school-primary hover:bg-school-primary hover:text-white"
          disabled={filteredTeachers.length === 0}
        >
          <Printer className="w-4 h-4 mr-2" />
          พิมพ์รายงาน
        </Button>
      </div>
    </div>
  );
};

export default TeacherReports;
