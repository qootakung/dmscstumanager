
import React from 'react';

interface ReportHeaderProps {
  grade: string;
  month: string;
  academicYear: string;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ grade, month, academicYear }) => {
  return (
    <header className="text-center mb-3 header-section">
      <h1 className="text-sm font-bold">อัตราความชุกของปัญหาโภชนาการ</h1>
      <h2 className="text-sm font-bold">โรงเรียนบ้านดอนมูล</h2>
      <p className="text-xs mt-1">ชั้น {grade} เดือน {month} ปีการศึกษา {academicYear}</p>
    </header>
  );
};

export default ReportHeader;
