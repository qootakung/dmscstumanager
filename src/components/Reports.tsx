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
import { getStudents, gradeOptions, generateAcademicYears } from '@/utils/storage';
import { exportToExcel } from '@/utils/excel';
import type { ReportOptions, Student } from '@/types/student';
import Swal from 'sweetalert2';

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
    },
    customColumns: 0
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  const academicYears = generateAcademicYears();

  useEffect(() => {
    loadFilteredStudents();
  }, [reportOptions.academicYear, reportOptions.classLevel]);

  const loadFilteredStudents = () => {
    const students = getStudents();
    const filtered = students.filter(student => {
      if (reportOptions.academicYear && student.academicYear !== reportOptions.academicYear) {
        return false;
      }
      if (reportOptions.classLevel !== 'all' && student.grade !== reportOptions.classLevel) {
        return false;
      }
      return true;
    });
    
    // เรียงลำดับตามรหัสนักเรียน (จากน้อยไปมาก)
    const sorted = filtered.sort((a, b) => {
      const numA = parseInt(a.studentId) || 0;
      const numB = parseInt(b.studentId) || 0;
      return numA - numB;
    });
    
    setFilteredStudents(sorted);
  };

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

  const generateExcelReport = async () => {
    if (filteredStudents.length === 0) {
      await Swal.fire({
        title: 'ไม่มีข้อมูล!',
        text: 'ไม่พบข้อมูลนักเรียนตามเงื่อนไขที่เลือก',
        icon: 'warning',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    try {
      const reportData = filteredStudents.map((student, index) => {
        const baseData: any = {
          'ที่': index + 1,
          'รหัสนักเรียน': student.studentId,
          'ชื่อ-นามสกุล': `${student.titleTh} ${student.firstNameTh} ${student.lastNameTh}`,
          'เพศ': student.gender === 'ชาย' ? 'ช' : 'ญ',
        };

        if (reportOptions.additionalFields.citizenId) baseData['เลขบัตรประชาชน'] = student.citizenId;
        if (reportOptions.additionalFields.phone) baseData['เบอร์โทร'] = student.guardianPhone || '';
        if (reportOptions.additionalFields.timeIn) baseData['เวลามา'] = '';
        if (reportOptions.additionalFields.timeOut) baseData['เวลากลับ'] = '';
        if (reportOptions.additionalFields.signature) baseData['ลายมือชื่อ'] = '';
        if (reportOptions.additionalFields.guardianSignature) baseData['ลายมือชื่อผู้ปกครอง'] = '';
        if (reportOptions.additionalFields.note) baseData['หมายเหตุ'] = '';

        // เพิ่มคอลัมน์ที่กำหนดเอง
        for (let i = 1; i <= (reportOptions.customColumns || 0); i++) {
          baseData[`คอลัมน์ ${i}`] = '';
        }

        return baseData;
      });

      const filename = `${getReportTitle()}_${reportOptions.classLevel === 'all' ? 'ทั้งหมด' : reportOptions.classLevel}_${reportOptions.academicYear}`;
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
    const printContent = document.getElementById('report-preview');
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
            .header h1 { font-size: 18px; margin: 5px 0; }
            .header h2 { font-size: 16px; margin: 5px 0; }
            .header p { font-size: 14px; margin: 5px 0; }
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
      return 'ข้อมูลนักเรียนโรงเรียนบ้านดอนมูล';
    } else {
      return 'แบบลงทะเบียนการประชุมผู้ปกครองโรงเรียนบ้านดอนมูล';
    }
  };

  const getClassDisplayText = () => {
    if (reportOptions.classLevel === 'all') {
      const gradeGroups = filteredStudents.reduce((acc, student) => {
        acc[student.grade] = (acc[student.grade] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(gradeGroups)
        .map(([grade, count]) => `${grade} (${count} คน)`)
        .join(', ');
    }
    return `${reportOptions.classLevel} (${filteredStudents.length} คน)`;
  };

  const getGenderStats = () => {
    const maleCount = filteredStudents.filter(s => s.gender === 'ชาย').length;
    const femaleCount = filteredStudents.filter(s => s.gender === 'หญิง').length;
    return `ช ${maleCount} คน, ญ ${femaleCount} คน`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-school-primary mb-2">
          ระบบรายงานข้อมูลนักเรียน
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

            <div>
              <Label htmlFor="customColumns">จำนวนคอลัมน์เพิ่มเติม</Label>
              <Input
                id="customColumns"
                type="number"
                min="0"
                max="10"
                value={reportOptions.customColumns || 0}
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
                id="citizenId"
                checked={reportOptions.additionalFields.citizenId}
                onCheckedChange={(checked) => handleAdditionalFieldChange('citizenId', checked as boolean)}
              />
              <label htmlFor="citizenId" className="text-sm">เลขบัตรประชาชน</label>
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

            <div className="flex items-center space-x-2 col-span-2">
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
          <CardTitle>ตัวอย่างรายงาน ({filteredStudents.length} คน)</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="report-preview" className="bg-white p-6 border rounded-lg font-sarabun" style={{ fontSize: '16px' }}>
            <div className="header text-center space-y-2">
              <h1 className="text-xl font-bold">{getReportTitle()}</h1>
              <h2 className="text-lg font-bold">
                ระดับชั้น {getClassDisplayText()} ปีการศึกษา {reportOptions.academicYear}
              </h2>
              <p className="text-base">
                {getGenderStats()}
              </p>
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
                    <th className="border border-gray-400 p-2 text-center">เพศ</th>
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
                    {Array.from({ length: reportOptions.customColumns || 0 }, (_, i) => (
                      <th key={i} className="border border-gray-400 p-2 text-center">คอลัมน์ {i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.slice(0, 10).map((student, index) => (
                      <tr key={student.id}>
                        <td className="border border-gray-400 p-2 text-center">{index + 1}</td>
                        <td className="border border-gray-400 p-2 text-center">{student.studentId}</td>
                        <td className="border border-gray-400 p-2">{student.titleTh} {student.firstNameTh} {student.lastNameTh}</td>
                        <td className="border border-gray-400 p-2 text-center">{student.gender === 'ชาย' ? 'ช' : 'ญ'}</td>
                        {reportOptions.additionalFields.citizenId && (
                          <td className="border border-gray-400 p-2 text-center">{student.citizenId}</td>
                        )}
                        {reportOptions.additionalFields.phone && (
                          <td className="border border-gray-400 p-2 text-center">{student.guardianPhone || ''}</td>
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
                        {Array.from({ length: reportOptions.customColumns || 0 }, (_, i) => (
                          <td key={i} className="border border-gray-400 p-2 text-center"></td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4 + Object.values(reportOptions.additionalFields).filter(Boolean).length + (reportOptions.customColumns || 0)} className="border border-gray-400 p-4 text-center text-gray-500">
                        ไม่พบข้อมูลนักเรียนตามเงื่อนไขที่เลือก
                      </td>
                    </tr>
                  )}
                  {filteredStudents.length > 10 && (
                    <tr>
                      <td colSpan={4 + Object.values(reportOptions.additionalFields).filter(Boolean).length + (reportOptions.customColumns || 0)} className="border border-gray-400 p-2 text-center text-gray-500">
                        ... และอีก {filteredStudents.length - 10} คน
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
          disabled={filteredStudents.length === 0}
        >
          <FileText className="w-4 h-4 mr-2" />
          สร้างรายงาน Excel
        </Button>
        
        <Button
          onClick={printReport}
          variant="outline"
          className="border-school-primary text-school-primary hover:bg-school-primary hover:text-white"
          disabled={filteredStudents.length === 0}
        >
          <Printer className="w-4 h-4 mr-2" />
          พิมพ์รายงาน
        </Button>
      </div>
    </div>
  );
};

export default Reports;
