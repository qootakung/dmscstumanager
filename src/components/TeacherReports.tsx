
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTeachers } from '@/utils/teacherStorage';
import type { Teacher } from '@/types/teacher';
import type { TeacherReportOptions } from '@/types/teacherReport';
import { formatThaiDate } from '@/utils/teacherReportExcel';
import TeacherReportPreview from '@/components/teacher/TeacherReportPreview';

const TeacherReports: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Static options for the report, as per user request to simplify the view.
  const reportOptions: TeacherReportOptions = {
    reportType: '1',
    academicYear: '2568',
    additionalFields: {
      email: false,
      citizenId: false,
      salary: false,
      birthDate: false,
      position: true, // Show position by default for a more informative report
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
  };

  useEffect(() => {
    const fetchTeachers = async () => {
        const storedTeachers = await getTeachers();
        setTeachers(storedTeachers);
        console.log('Loaded teachers:', storedTeachers);
    };
    fetchTeachers();
  }, []);

  return (
    <Card className="print:border-none print:shadow-none">
      <CardHeader className="print:hidden">
        <CardTitle>รายงานข้อมูลครู</CardTitle>
      </CardHeader>
      <CardContent className="print:p-0">
        <TeacherReportPreview
          reportOptions={reportOptions}
          teachers={teachers}
          formatThaiDate={formatThaiDate}
        />
      </CardContent>
    </Card>
  );
};

export default TeacherReports;
