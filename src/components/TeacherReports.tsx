
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download } from 'lucide-react';
import { getTeachers } from '@/utils/teacherStorage';
import type { Teacher } from '@/types/teacher';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from "@/components/ui/use-toast"

interface TeacherReportOptions {
  reportType: '1' | '2';
  academicYear: string;
  additionalFields: {
    email: boolean;
    citizenId: boolean;
    salary: boolean;
    birthDate: boolean;
    position: boolean;
    education: boolean;
    major: boolean;
    phone: boolean;
    lineId: boolean;
  };
  customColumns: number;
  showDate: boolean;
  selectedDate: string;
}

const TeacherReports: React.FC = () => {
  const [reportOptions, setReportOptions] = useState<TeacherReportOptions>({
    reportType: '1',
    academicYear: new Date().getFullYear().toString(),
    additionalFields: {
      email: false,
      citizenId: false,
      salary: false,
      birthDate: false,
      position: false,
      education: false,
      major: false,
      phone: false,
      lineId: false,
    },
    customColumns: 0,
    showDate: false,
    selectedDate: '',
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const academicYears = [...new Set(teachers.map(t => t.academicYear))].sort().reverse();

  useEffect(() => {
    const storedTeachers = getTeachers();
    setTeachers(storedTeachers);
  }, []);

  const handleOptionChange = (field: keyof TeacherReportOptions, value: any) => {
    setReportOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleAdditionalFieldChange = (field: keyof TeacherReportOptions['additionalFields'], checked: boolean) => {
    setReportOptions(prev => ({
      ...prev,
      additionalFields: {
        ...prev.additionalFields,
        [field]: checked,
      },
    }));
  };

  const getFilteredTeachers = (): Teacher[] => {
    let filtered = [...teachers];
    if (reportOptions.academicYear) {
      filtered = filtered.filter(teacher => teacher.academicYear === reportOptions.academicYear);
    }
    
    // Sort by positionNumber from smallest to largest
    filtered.sort((a, b) => {
      const aNum = parseInt(a.positionNumber) || 0;
      const bNum = parseInt(b.positionNumber) || 0;
      return aNum - bNum;
    });
    
    return filtered;
  };

  const formatThaiDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
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
    if (reportOptions.additionalFields.position) additionalColumns.push('ตำแหน่ง');
    if (reportOptions.additionalFields.education) additionalColumns.push('วุฒิการศึกษา');
    if (reportOptions.additionalFields.major) additionalColumns.push('วิชาเอก');
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
          {reportOptions.showDate && reportOptions.selectedDate && (
            <p className="text-sm">วันที่ {formatThaiDate(reportOptions.selectedDate)}</p>
          )}
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
                    <td className="border border-gray-300 px-2 py-1 text-center">{teacher.birthDate}</td>
                  )}
                  {reportOptions.additionalFields.position && (
                    <td className="border border-gray-300 px-2 py-1">{teacher.position}</td>
                  )}
                  {reportOptions.additionalFields.education && (
                    <td className="border border-gray-300 px-2 py-1">{teacher.education}</td>
                  )}
                  {reportOptions.additionalFields.major && (
                    <td className="border border-gray-300 px-2 py-1">{teacher.majorSubject}</td>
                  )}
                  {reportOptions.additionalFields.phone && (
                    <td className="border border-gray-300 px-2 py-1 text-center">{teacher.phone}</td>
                  )}
                  {reportOptions.additionalFields.lineId && (
                    <td className="border border-gray-300 px-2 py-1 text-center">{teacher.lineId}</td>
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

  const generateExcel = () => {
    const filteredTeachers = getFilteredTeachers();

    // สร้างหัวเรื่อง
    const headerData = [
      [reportOptions.reportType === '1' 
        ? 'รายชื่อข้าราชการครูและบุคลากรทางการศึกษาโรงเรียนบ้านดอนมูล' 
        : 'แบบลงทะเบียนการประชุมข้าราชการครูและบุคลากรทางการศึกษาโรงเรียนบ้านดอนมูล'
      ],
      [`ปีการศึกษา ${reportOptions.academicYear}`],
    ];

    if (reportOptions.showDate && reportOptions.selectedDate) {
      headerData.push([`วันที่ ${formatThaiDate(reportOptions.selectedDate)}`]);
    }

    headerData.push([]);

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
    if (reportOptions.additionalFields.position) additionalColumns.push('ตำแหน่ง');
    if (reportOptions.additionalFields.education) additionalColumns.push('วุฒิการศึกษา');
    if (reportOptions.additionalFields.major) additionalColumns.push('วิชาเอก');
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

    // สร้างข้อมูลสำหรับ Excel
    const excelData = [
      ...headerData,
      allColumns,
      ...filteredTeachers.map((teacher, index) => {
        const row = [
          index + 1,
          `${teacher.firstName} ${teacher.lastName}`,
          teacher.position
        ];

        if (reportOptions.additionalFields.email) row.push(teacher.email || '');
        if (reportOptions.additionalFields.citizenId) row.push(teacher.citizenId);
        if (reportOptions.additionalFields.salary) row.push(teacher.salary);
        if (reportOptions.additionalFields.birthDate) row.push(teacher.birthDate);
        if (reportOptions.additionalFields.position) row.push(teacher.position);
        if (reportOptions.additionalFields.education) row.push(teacher.education);
        if (reportOptions.additionalFields.major) row.push(teacher.majorSubject);
        if (reportOptions.additionalFields.phone) row.push(teacher.phone);
        if (reportOptions.additionalFields.lineId) row.push(teacher.lineId);

        for (let i = 0; i < reportOptions.customColumns; i++) {
          row.push('');
        }

        return row;
      })
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, 'รายงานข้อมูลครู');
    const wbbuf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([new Uint8Array(wbbuf)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, `teacher-report-${Date.now()}.xlsx`);
    toast({
      title: "ดาวน์โหลดรายงานสำเร็จ!",
      description: "ไฟล์ Excel กำลังถูกดาวน์โหลด...",
    })
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>รายงานข้อมูลครู</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reportType">ประเภทรายงาน</Label>
            <Select onValueChange={(value) => handleOptionChange('reportType', value as '1' | '2')}>
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
            <Select onValueChange={(value) => handleOptionChange('academicYear', value)}>
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
            onCheckedChange={(checked) => handleOptionChange('showDate', Boolean(checked))}
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
              onChange={(e) => handleOptionChange('selectedDate', e.target.value)}
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
                onCheckedChange={(checked) => handleAdditionalFieldChange('email', Boolean(checked))}
              />
              <Label htmlFor="email">Email</Label>
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
                id="salary"
                checked={reportOptions.additionalFields.salary}
                onCheckedChange={(checked) => handleAdditionalFieldChange('salary', Boolean(checked))}
              />
              <Label htmlFor="salary">เงินเดือน</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="birthDate"
                checked={reportOptions.additionalFields.birthDate}
                onCheckedChange={(checked) => handleAdditionalFieldChange('birthDate', Boolean(checked))}
              />
              <Label htmlFor="birthDate">วัน/เดือน/ปีเกิด</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="education"
                checked={reportOptions.additionalFields.education}
                onCheckedChange={(checked) => handleAdditionalFieldChange('education', Boolean(checked))}
              />
              <Label htmlFor="education">วุฒิการศึกษา</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="major"
                checked={reportOptions.additionalFields.major}
                onCheckedChange={(checked) => handleAdditionalFieldChange('major', Boolean(checked))}
              />
              <Label htmlFor="major">วิชาเอก</Label>
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
                id="lineId"
                checked={reportOptions.additionalFields.lineId}
                onCheckedChange={(checked) => handleAdditionalFieldChange('lineId', Boolean(checked))}
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
            onChange={(e) => handleOptionChange('customColumns', parseInt(e.target.value) || 0)}
            className="w-24"
            min="0"
            max="10"
          />
        </div>

        {renderReportPreview()}

        <Button onClick={generateExcel} className="bg-green-500 text-white hover:bg-green-600 font-sarabun">
          <Download className="h-4 w-4 mr-2" />
          ส่งออก Excel
        </Button>
      </CardContent>
    </Card>
  );
};

export default TeacherReports;
