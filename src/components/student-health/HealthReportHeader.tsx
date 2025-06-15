
import React from 'react';

interface HealthReportHeaderProps {
  grade: string;
}

const HealthReportHeader: React.FC<HealthReportHeaderProps> = ({ grade }) => {
  return (
    <header className="text-center mb-4">
      <h1 className="text-base font-bold">การแปลผลภาวะโภชนาการของเด็กนักเรียน</h1>
      <h2 className="text-base font-bold">ระดับชั้น {grade} โรงเรียนบ้านดอนมูล</h2>
      <h3 className="text-base font-bold">อันดับขนาดร่างกายของเด็กวัยเรียนรายบุคคล</h3>
    </header>
  );
};

export default HealthReportHeader;
