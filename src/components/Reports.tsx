import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Printer } from 'lucide-react';
import { getStudents } from '@/utils/storage';
import type { Student, ReportOptions } from '@/types/student';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from "@/components/ui/use-toast";
import { createRoot } from 'react-dom/client';
import StudentReportPrintable from './student/StudentReportPrintable';

interface AdditionalFieldOptions {
  citizenId: boolean;
  signature: boolean;
  guardianSignature: boolean;
  timeIn: boolean;
  timeOut: boolean;
  phone: boolean;
  note: boolean;
}

const gradeOrder = [
  'อนุบาล 1', 'อนุบาล 2', 'อนุบาล 3',
  'ประถมศึกษาปีที่ 1', 'ประถมศึกษาปีที่ 2', 'ประถมศึกษาปีที่ 3',
  'ประถมศึกษาปีที่ 4', 'ประถมศึกษาปีที่ 5', 'ประถมศึกษาปีที่ 6'
];

const sortGrades = (grades: string[]): string[] => {
  return [...grades].sort((a, b) => gradeOrder.indexOf(a) - gradeOrder.indexOf(b));
};

const Reports: React.FC = () => {
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    reportType: '1',
    classLevel: 'all',
    academicYear: new Date().getFullYear().toString(),
    additionalFields: {
      citizenId: false,
      signature: false,
      guardianSignature: false,
      timeIn: false,
      timeOut: false,
      phone: false,
      note: false,
    },
    customColumns: 0,
  });
  const [students, setStudents] = useState<Student[]>([]);
  const academicYears = [...new Set(students.map(s => s.academicYear))].sort().reverse();

  const classLevels = useMemo(() => {
    if (!reportOptions.academicYear) return [];
    const grades = students
      .filter(s => s.academicYear === reportOptions.academicYear)
      .map(s => s.grade);
    return sortGrades([...new Set(grades)]);
  }, [students, reportOptions.academicYear]);

  useEffect(() => {
    const storedStudents = getStudents();
    setStudents(storedStudents);
  }, []);

  const handleOptionChange = (field: keyof ReportOptions, value: any) => {
    setReportOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleAdditionalFieldChange = (field: keyof AdditionalFieldOptions, checked: boolean) => {
    setReportOptions(prev => ({
      ...prev,
      additionalFields: {
        ...prev.additionalFields,
        [field]: checked,
      },
    }));
  };

  const getFilteredStudents = (): Student[] => {
    let filtered = [...students];
    if (reportOptions.academicYear) {
      filtered = filtered.filter(student => student.academicYear === reportOptions.academicYear);
    }
    if (reportOptions.classLevel !== 'all') {
      filtered = filtered.filter(student => student.grade === reportOptions.classLevel);
    }
    
    // Sort by studentId (รหัสนักเรียน) from smallest to largest
    filtered.sort((a, b) => {
      const aId = parseInt(a.studentId) || 0;
      const bId = parseInt(b.studentId) || 0;
      return aId - bId;
    });
    
    return filtered;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=1000');
    if (!printWindow) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณาอนุญาต pop-ups เพื่อพิมพ์รายงาน",
        variant: "destructive",
      });
      return;
    }

    document.querySelectorAll('link[rel="stylesheet"], style').forEach(style => {
      printWindow.document.head.appendChild(style.cloneNode(true));
    });

    printWindow.document.title = 'พิมพ์รายงานนักเรียน';
    const printRootEl = printWindow.document.createElement('div');
    printWindow.document.body.appendChild(printRootEl);
    
    const studentsToPrint = getFilteredStudents();
    
    const root = createRoot(printRootEl);
    root.render(<StudentReportPrintable students={studentsToPrint} reportOptions={reportOptions} />);

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 1000);
  };

  const renderReportPreview = () => {
    if (!reportOptions.classLevel || !reportOptions.academicYear) return null;

    const filteredStudents = getFilteredStudents();
    const previewStudents = filteredStudents;

    // สร้างคอลัมน์พื้นฐาน
    const baseColumns = [
      'ลำดับที่',
      'รหัสนักเรียน', 
      'ชื่อ - นามสกุล',
      'เพศ'
    ];

    // เพิ่มคอลัมน์เพิ่มเติมที่เลือก
    const additionalColumns = [];
    if (reportOptions.additionalFields.citizenId) additionalColumns.push('เลขบัตรประจำตัวประชาชน');
    if (reportOptions.additionalFields.signature) additionalColumns.push('ลายเซ็น');
    if (reportOptions.additionalFields.guardianSignature) additionalColumns.push('ลายเซ็นผู้ปกครอง');
    if (reportOptions.additionalFields.timeIn) additionalColumns.push('เวลาเข้า');
    if (reportOptions.additionalFields.timeOut) additionalColumns.push('เวลาออก');
    if (reportOptions.additionalFields.phone) additionalColumns.push('เบอร์โทร');
    if (reportOptions.additionalFields.note) additionalColumns.push('หมายเหตุ');

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
              ? 'รายชื่อนักเรียนโรงเรียนบ้านดอนมูล' 
              : 'แบบลงทะเบียนการประชุมนักเรียนโรงเรียนบ้านดอนมูล'
            }
          </h3>
          <p className="text-sm">ปีการศึกษา {reportOptions.academicYear}</p>
          <p className="text-sm">
            {reportOptions.classLevel === 'all' ? 'ทุกระดับชั้น' : `ระดับชั้น ${reportOptions.classLevel}`}
          </p>
        </div>
        
        <div className="overflow-auto max-h-96">
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
              {previewStudents.map((student, index) => (
                <tr key={student.id}>
                  <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>
                  <td className="border border-gray-300 px-2 py-1 text-center">{student.studentId}</td>
                  <td className="border border-gray-300 px-2 py-1">{student.firstNameTh} {student.lastNameTh}</td>
                  <td className="border border-gray-300 px-2 py-1 text-center">{student.gender === 'ชาย' ? 'ช' : 'ญ'}</td>
                  
                  {/* Additional fields */}
                  {reportOptions.additionalFields.citizenId && (
                    <td className="border border-gray-300 px-2 py-1 text-center">{student.citizenId}</td>
                  )}
                  {reportOptions.additionalFields.signature && (
                    <td className="border border-gray-300 px-2 py-1"></td>
                  )}
                  {reportOptions.additionalFields.guardianSignature && (
                    <td className="border border-gray-300 px-2 py-1"></td>
                  )}
                  {reportOptions.additionalFields.timeIn && (
                    <td className="border border-gray-300 px-2 py-1"></td>
                  )}
                  {reportOptions.additionalFields.timeOut && (
                    <td className="border border-gray-300 px-2 py-1"></td>
                  )}
                  {reportOptions.additionalFields.phone && (
                    <td className="border border-gray-300 px-2 py-1 text-center">{student.guardianPhone}</td>
                  )}
                  {reportOptions.additionalFields.note && (
                    <td className="border border-gray-300 px-2 py-1"></td>
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
          รวมทั้งหมด {filteredStudents.length} รายการ
        </p>
      </div>
    );
  };

  const generateExcel = () => {
    const filteredStudents = getFilteredStudents();

    // สร้างหัวเรื่อง
    const headerData = [
      [reportOptions.reportType === '1' 
        ? 'รายชื่อนักเรียนโรงเรียนบ้านดอนมูล' 
        : 'แบบลงทะเบียนการประชุมนักเรียนโรงเรียนบ้านดอนมูล'
      ],
      [`ปีการศึกษา ${reportOptions.academicYear}`],
      [reportOptions.classLevel === 'all' ? 'ทุกระดับชั้น' : `ระดับชั้น ${reportOptions.classLevel}`],
      []
    ];

    // สร้างคอลัมน์พื้นฐาน
    const baseColumns = [
      'ลำดับที่',
      'รหัสนักเรียน', 
      'ชื่อ - นามสกุล',
      'เพศ'
    ];

    // เพิ่มคอลัมน์เพิ่มเติมที่เลือก
    const additionalColumns = [];
    if (reportOptions.additionalFields.citizenId) additionalColumns.push('เลขบัตรประจำตัวประชาชน');
    if (reportOptions.additionalFields.signature) additionalColumns.push('ลายเซ็น');
    if (reportOptions.additionalFields.guardianSignature) additionalColumns.push('ลายเซ็นผู้ปกครอง');
    if (reportOptions.additionalFields.timeIn) additionalColumns.push('เวลาเข้า');
    if (reportOptions.additionalFields.timeOut) additionalColumns.push('เวลาออก');
    if (reportOptions.additionalFields.phone) additionalColumns.push('เบอร์โทร');
    if (reportOptions.additionalFields.note) additionalColumns.push('หมายเหตุ');

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
      ...filteredStudents.map((student, index) => {
        const row = [
          index + 1,
          student.studentId,
          `${student.firstNameTh} ${student.lastNameTh}`,
          student.gender === 'ชาย' ? 'ช' : 'ญ'
        ];

        if (reportOptions.additionalFields.citizenId) row.push(student.citizenId);
        if (reportOptions.additionalFields.signature) row.push('');
        if (reportOptions.additionalFields.guardianSignature) row.push('');
        if (reportOptions.additionalFields.timeIn) row.push('');
        if (reportOptions.additionalFields.timeOut) row.push('');
        if (reportOptions.additionalFields.phone) row.push(student.guardianPhone);
        if (reportOptions.additionalFields.note) row.push('');

        for (let i = 0; i < reportOptions.customColumns; i++) {
          row.push('');
        }

        return row;
      })
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, 'รายงานข้อมูลนักเรียน');
    const wbbuf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([new Uint8Array(wbbuf)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, `student-report-${Date.now()}.xlsx`);
    toast({
      title: "ดาวน์โหลดรายงานสำเร็จ!",
      description: "ไฟล์ Excel กำลังถูกดาวน์โหลด...",
    })
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>รายงานข้อมูลนักเรียน</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        {renderReportPreview()}

        <div className="flex items-center gap-2">
          <Button onClick={generateExcel} className="bg-green-500 text-white hover:bg-green-600 font-sarabun">
            <Download className="h-4 w-4 mr-2" />
            ส่งออก Excel
          </Button>
          <Button onClick={handlePrint} variant="outline" className="font-sarabun">
            <Printer className="h-4 w-4 mr-2" />
            พิมพ์รายงาน
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Reports;
