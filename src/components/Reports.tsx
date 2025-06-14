
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import ReportOptionsForm from './student/ReportOptionsForm';
import ReportPreview from './student/ReportPreview';
import { useStudentReport } from '@/hooks/useStudentReport';
import { generateStudentExcel } from '@/utils/studentReportExcel';
import { printStudentReport } from '@/utils/studentReportPrint';

const Reports: React.FC = () => {
  const {
    reportOptions,
    academicYears,
    classLevels,
    handleOptionChange,
    handleAdditionalFieldChange,
    filteredStudents,
  } = useStudentReport();

  const handleGenerateExcel = () => {
    generateStudentExcel(filteredStudents, reportOptions);
  }

  const handlePrint = () => {
    printStudentReport(filteredStudents, reportOptions);
  }

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

        <ReportPreview students={filteredStudents} reportOptions={reportOptions} />

        <div className="flex items-center gap-2">
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

export default Reports;
