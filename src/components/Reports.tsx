import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';
import { getStudents } from '@/utils/storage';
import type { Student, ReportOptions } from '@/types/student';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from "@/components/ui/use-toast"

interface AdditionalFieldOptions {
  citizenId: boolean;
  signature: boolean;
  guardianSignature: boolean;
  timeIn: boolean;
  timeOut: boolean;
  phone: boolean;
  note: boolean;
}

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
    return filtered;
  };

  const renderReportPreview = () => {
    if (!reportOptions.classLevel || !reportOptions.academicYear) return null;

    const filteredStudents = getFilteredStudents();
    const previewStudents = filteredStudents.slice(0, 5);

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
              ? 'รายชื่อนักเรียน' 
              : 'แบบลงทะเบียนการประชุมนักเรียน'
            }
          </h3>
          <p className="text-sm">
            {reportOptions.classLevel === 'all' ? 'ทุกระดับชั้น' : `ระดับชั้น ${reportOptions.classLevel}`}
          </p>
          <p className="text-sm">ปีการศึกษา {reportOptions.academicYear}</p>
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
          แสดงตัวอย่าง {previewStudents.length} รายการแรก จากทั้งหมด {filteredStudents.length} รายการ
        </p>
      </div>
    );
  };

  const generateExcel = () => {
    const filteredStudents = getFilteredStudents();

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

    const data = filteredStudents.map((student, index) => {
      const row: any = {
        [allColumns[0]]: index + 1,
        [allColumns[1]]: student.studentId,
        [allColumns[2]]: `${student.firstNameTh} ${student.lastNameTh}`,
        [allColumns[3]]: student.gender === 'ชาย' ? 'ช' : 'ญ',
      };

      let columnIndex = 4;
      if (reportOptions.additionalFields.citizenId) {
        row[allColumns[columnIndex++]] = student.citizenId;
      }
      if (reportOptions.additionalFields.signature) {
        row[allColumns[columnIndex++]] = '';
      }
      if (reportOptions.additionalFields.guardianSignature) {
        row[allColumns[columnIndex++]] = '';
      }
      if (reportOptions.additionalFields.timeIn) {
        row[allColumns[columnIndex++]] = '';
      }
      if (reportOptions.additionalFields.timeOut) {
        row[allColumns[columnIndex++]] = '';
      }
      if (reportOptions.additionalFields.phone) {
        row[allColumns[columnIndex++]] = student.guardianPhone;
      }
      if (reportOptions.additionalFields.note) {
        row[allColumns[columnIndex++]] = '';
      }

      for (let i = 0; i < reportOptions.customColumns; i++) {
        row[allColumns[columnIndex++]] = '';
      }

      return row;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data, { header: allColumns });
    XLSX.utils.book_append_sheet(wb, ws, 'รายงานข้อมูลนักเรียน');
    const wbbuf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([new Uint8Array(wbbuf)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, `report-${Date.now()}.xlsx`);
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
            <Select onValueChange={(value) => handleOptionChange('reportType', value)}>
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
            <Select onValueChange={(value) => handleOptionChange('classLevel', value)}>
              <SelectTrigger id="classLevel">
                <SelectValue placeholder="เลือกระดับชั้น" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกระดับชั้น</SelectItem>
                <SelectItem value="1">อนุบาล 1</SelectItem>
                <SelectItem value="2">อนุบาล 2</SelectItem>
                <SelectItem value="3">อนุบาล 3</SelectItem>
                <SelectItem value="1">ประถมศึกษาปีที่ 1</SelectItem>
                <SelectItem value="2">ประถมศึกษาปีที่ 2</SelectItem>
                <SelectItem value="3">ประถมศึกษาปีที่ 3</SelectItem>
                <SelectItem value="4">ประถมศึกษาปีที่ 4</SelectItem>
                <SelectItem value="5">ประถมศึกษาปีที่ 5</SelectItem>
                <SelectItem value="6">ประถมศึกษาปีที่ 6</SelectItem>
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

        <div className="space-y-2">
          <Label>คอลัมน์เพิ่มเติม</Label>
          <div className="flex flex-wrap gap-4">
            <div>
              <Checkbox
                id="citizenId"
                checked={reportOptions.additionalFields.citizenId}
                onCheckedChange={(checked) => handleAdditionalFieldChange('citizenId', checked!)}
              />
              <Label htmlFor="citizenId" className="ml-2">เลขบัตรประจำตัวประชาชน</Label>
            </div>
            <div>
              <Checkbox
                id="signature"
                checked={reportOptions.additionalFields.signature}
                onCheckedChange={(checked) => handleAdditionalFieldChange('signature', checked!)}
              />
              <Label htmlFor="signature" className="ml-2">ลายเซ็น</Label>
            </div>
            <div>
              <Checkbox
                id="guardianSignature"
                checked={reportOptions.additionalFields.guardianSignature}
                onCheckedChange={(checked) => handleAdditionalFieldChange('guardianSignature', checked!)}
              />
              <Label htmlFor="guardianSignature" className="ml-2">ลายเซ็นผู้ปกครอง</Label>
            </div>
            <div>
              <Checkbox
                id="timeIn"
                checked={reportOptions.additionalFields.timeIn}
                onCheckedChange={(checked) => handleAdditionalFieldChange('timeIn', checked!)}
              />
              <Label htmlFor="timeIn" className="ml-2">เวลาเข้า</Label>
            </div>
            <div>
              <Checkbox
                id="timeOut"
                checked={reportOptions.additionalFields.timeOut}
                onCheckedChange={(checked) => handleAdditionalFieldChange('timeOut', checked!)}
              />
              <Label htmlFor="timeOut" className="ml-2">เวลาออก</Label>
            </div>
            <div>
              <Checkbox
                id="phone"
                checked={reportOptions.additionalFields.phone}
                onCheckedChange={(checked) => handleAdditionalFieldChange('phone', checked!)}
              />
              <Label htmlFor="phone" className="ml-2">เบอร์โทร</Label>
            </div>
            <div>
              <Checkbox
                id="note"
                checked={reportOptions.additionalFields.note}
                onCheckedChange={(checked) => handleAdditionalFieldChange('note', checked!)}
              />
              <Label htmlFor="note" className="ml-2">หมายเหตุ</Label>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="customColumns">จำนวนคอลัมน์ว่างที่ต้องการเพิ่ม</Label>
          <Input
            type="number"
            id="customColumns"
            value={reportOptions.customColumns?.toString() || '0'}
            onChange={(e) => handleOptionChange('customColumns', parseInt(e.target.value))}
            className="w-24"
          />
        </div>

        {renderReportPreview()}

        <Button onClick={generateExcel} className="bg-green-500 text-white hover:bg-green-600 font-sarabun">
          <Download className="h-4 w-4 mr-2" />
          สร้าง Excel
        </Button>
      </CardContent>
    </Card>
  );
};

export default Reports;
