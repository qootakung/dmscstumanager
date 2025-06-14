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

  const renderReportPreview = () => {
    if (!reportOptions.academicYear) return null;

    const filteredTeachers = getFilteredTeachers();
    const previewTeachers = filteredTeachers.slice(0, 5);

    // สร้างคอลัมน์พื้นฐาน
    const baseColumns = [
      'ลำดับที่',
      'ชื่อ - นามสกุล',
      'ตำแหน่ง'
    ];

    // เพิ่มคอลัมน์เพิ่มเติมที่เลือก
    const additionalColumns = [];
    if (reportOptions.additionalFields.email) additionalColumns.push('Email');
    if (reportOptions.additionalFields.citizenId) additionalColumns.push('เลขบัตรประจำตัวประชาชน');
    if (reportOptions.additionalFields.salary) additionalColumns.push('เงินเดือน');
    if (reportOptions.additionalFields.birthDate) additionalColumns.push('วัน/เดือน/ปีเกิด');
    if (reportOptions.additionalFields.position) additionalColumns.push('ตำแหน่งเพิ่มเติม');
    if (reportOptions.additionalFields.education) additionalColumns.push('วุฒิการศึกษา');
    if (reportOptions.additionalFields.majorSubject) additionalColumns.push('วิชาเอก');
    if (reportOptions.additionalFields.phone) additionalColumns.push('เบอร์โทร');
    if (reportOptions.additionalFields.lineId) additionalColumns.push('ID Line');

    // เพิ่มคอลัมน์ว่างตามจำนวนที่ระบุ
    const customColumns = [];
    if (reportOptions.customColumns && reportOptions.customColumns > 0) {
      for (let i = 1; i <= reportOptions.customColumns; i++) {
        customColumns.push('');
      }
    }

    const allColumns = [...baseColumns, ...additionalColumns, ...customColumns];

    return (
      <div className="mt-6 border rounded-lg p-4 bg-white">
        <div className="text-center mb-4 font-sarabun">
          <h3 className="text-lg font-bold">
            {reportOptions.reportType === '1' 
              ? 'รายชื่อข้าราชการครูและบุคลากรทางการศึกษาโรงเรียนบ้านดอนมูล' 
              : 'แบบลงทะเบียนการประชุมข้าราชการครูและบุคลากรทางการศึกษาโรงเรียนบ้านดอนมูล'
            }
          </h3>
          <p className="text-sm">ปีการศึกษา {reportOptions.academicYear}</p>
          <p className="text-sm">วันที่ {new Date().toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long', 
            day: 'numeric'
          })}</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                {allColumns.map((column, index) => (
                  <th key={index} className="border border-gray-300 px-2 py-1 text-center font-medium">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewTeachers.map((teacher, index) => (
                <tr key={teacher.id}>
                  <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>
                  <td className="border border-gray-300 px-2 py-1">{teacher.firstName} {teacher.lastName}</td>
                  <td className="border border-gray-300 px-2 py-1">{teacher.position}</td>
                  
                  {/* Additional fields */}
                  {reportOptions.additionalFields.email && (
                    <td className="border border-gray-300 px-2 py-1">{teacher.email || ''}</td>
                  )}
                  {reportOptions.additionalFields.citizenId && (
                    <td className="border border-gray-300 px-2 py-1 text-center">{teacher.citizenId}</td>
                  )}
                  {reportOptions.additionalFields.salary && (
                    <td className="border border-gray-300 px-2 py-1 text-center">{teacher.salary}</td>
                  )}
                  {reportOptions.additionalFields.birthDate && (
                    <td className="border border-gray-300 px-2 py-1 text-center">{new Date(teacher.birthDate).toLocaleDateString('th-TH')}</td>
                  )}
                  {reportOptions.additionalFields.position && (
                    <td className="border border-gray-300 px-2 py-1">{teacher.position}</td>
                  )}
                  {reportOptions.additionalFields.education && (
                    <td className="border border-gray-300 px-2 py-1">{teacher.education}</td>
                  )}
                  {reportOptions.additionalFields.majorSubject && (
                    <td className="border border-gray-300 px-2 py-1">{teacher.majorSubject}</td>
                  )}
                  {reportOptions.additionalFields.phone && (
                    <td className="border border-gray-300 px-2 py-1 text-center">{teacher.phone}</td>
                  )}
                  {reportOptions.additionalFields.lineId && (
                    <td className="border border-gray-300 px-2 py-1">{teacher.lineId}</td>
                  )}
                  
                  {/* Custom empty columns */}
                  {customColumns.map((_, colIndex) => (
                    <td key={`custom-${colIndex}`} className="border border-gray-300 px-2 py-1"></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="text-sm text-gray-600 mt-2">
          แสดงตัวอย่าง {previewTeachers.length} รายการแรก จากทั้งหมด {filteredTeachers.length} รายการ
        </p>
      </div>
    );
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
            {renderReportPreview()}
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
