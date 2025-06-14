
import React from 'react';
import type { Teacher } from '@/types/teacher';
import type { TeacherReportOptions } from '@/types/teacherReport';
import TeacherReportPreview from '@/components/teacher/TeacherReportPreview';
import { formatThaiDate } from '@/utils/teacherReportExcel';

interface TeacherReportPrintableProps {
  teachers: Teacher[];
  reportOptions: TeacherReportOptions;
}

const TeacherReportPrintable: React.FC<TeacherReportPrintableProps> = ({ teachers, reportOptions }) => {
  return (
    <div className="p-4 font-sarabun">
      <style>{`
        body { 
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `}</style>
      <TeacherReportPreview
        reportOptions={reportOptions}
        teachers={teachers}
        formatThaiDate={formatThaiDate}
        className="!m-0 !p-0 !border-none !shadow-none"
      />
    </div>
  );
};

export default TeacherReportPrintable;
