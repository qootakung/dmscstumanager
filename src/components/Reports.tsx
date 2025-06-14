
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { getStudents } from '@/utils/storage';
import type { Student, ReportOptions } from '@/types/student';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from "@/components/ui/use-toast";
import { createRoot } from 'react-dom/client';
import StudentReportPrintable from './student/StudentReportPrintable';
import ReportOptionsForm from './student/ReportOptionsForm';
import ReportPreview from './student/ReportPreview';
import { sortGrades } from '@/utils/studentReportUtils';


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
  
  useEffect(() => {
    const fetchStudents = async () => {
        const storedStudents = await getStudents();
        setStudents(storedStudents);
    };
    fetchStudents();
  }, []);

  const academicYears = useMemo(() => [...new Set(students.map(s => s.academicYear))].sort().reverse(), [students]);

  const classLevels = useMemo(() => {
    if (!reportOptions.academicYear) return [];
    const grades = students
      .filter(s => s.academicYear === reportOptions.academicYear)
      .map(s => s.grade);
    return sortGrades([...new Set(grades)]);
  }, [students, reportOptions.academicYear]);

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
        <ReportOptionsForm
            reportOptions={reportOptions}
            handleOptionChange={handleOptionChange}
            handleAdditionalFieldChange={handleAdditionalFieldChange}
            classLevels={classLevels}
            academicYears={academicYears}
        />

        <ReportPreview students={getFilteredStudents()} reportOptions={reportOptions} />

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
