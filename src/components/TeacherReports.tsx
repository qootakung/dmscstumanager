
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { getTeachers } from '@/utils/teacherStorage';
import type { Teacher } from '@/types/teacher';
import type { TeacherReportOptions } from '@/types/teacherReport';
import { generateTeacherExcel, formatThaiDate } from '@/utils/teacherReportExcel';
import TeacherReportForm from '@/components/teacher/TeacherReportForm';
import TeacherReportPreview from '@/components/teacher/TeacherReportPreview';
import { toast } from "@/components/ui/use-toast";
import { printTeacherReport } from '@/utils/teacherReportPrint';

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
      major: false,
      phone: false,
      lineId: false,
      appointmentDate: false,
      signature: false,
      timeIn: false,
      timeOut: false,
      note: false,
    },
    customColumns: 0,
    showDate: false,
    selectedDate: '',
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    const fetchTeachers = async () => {
        const storedTeachers = await getTeachers();
        setTeachers(storedTeachers);
        console.log('Loaded teachers:', storedTeachers);
    };
    fetchTeachers();
  }, []);

  const academicYears = useMemo(() => [...new Set(teachers.map(t => t.academicYear).filter(Boolean) as string[])].sort().reverse(), [teachers]);

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

  const handleGenerateExcel = () => {
    generateTeacherExcel(teachers, reportOptions);
    toast({
      title: "ดาวน์โหลดรายงานสำเร็จ!",
      description: "ไฟล์ Excel กำลังถูกดาวน์โหลด...",
    });
  };

  const handlePrint = () => {
    printTeacherReport(teachers, reportOptions);
  };

  return (
    <Card className="print:border-none print:shadow-none">
      <CardHeader className="print:hidden">
        <CardTitle>รายงานข้อมูลครู</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 print:p-0 print:space-y-0">
        <div className="print:hidden">
          <TeacherReportForm
            reportOptions={reportOptions}
            academicYears={academicYears}
            onOptionChange={handleOptionChange}
            onAdditionalFieldChange={handleAdditionalFieldChange}
          />
        </div>

        <TeacherReportPreview
          reportOptions={reportOptions}
          teachers={teachers}
          formatThaiDate={formatThaiDate}
        />

        <div className="flex flex-wrap gap-4 print:hidden">
          <Button onClick={handleGenerateExcel} className="bg-green-500 text-white hover:bg-green-600 font-sarabun">
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

export default TeacherReports;
