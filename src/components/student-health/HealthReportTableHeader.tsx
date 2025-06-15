
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

const HealthReportTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead rowSpan={2} className="w-[40px] text-center">ลำดับ</TableHead>
        <TableHead rowSpan={2} className="w-[120px] text-center">ชื่อ-นามสกุล</TableHead>
        <TableHead rowSpan={2} className="w-[60px] text-center">เพศ</TableHead>
        <TableHead rowSpan={2} className="w-[60px] text-center">อายุ (ปี)</TableHead>
        <TableHead rowSpan={2} className="w-[80px] text-center">น้ำหนัก (กิโลกรัม)</TableHead>
        <TableHead rowSpan={2} className="w-[80px] text-center">ส่วนสูง (เซนติเมตร)</TableHead>
        <TableHead className="text-center bmi-header" colSpan={3}>น้ำหนักตามอายุ</TableHead>
        <TableHead className="text-center bmi-header" colSpan={2}>ส่วนสูงตามอายุ</TableHead>
        <TableHead className="text-center bmi-header" colSpan={2}>น้ำหนักตามส่วนสูง</TableHead>
      </TableRow>
      <TableRow>
        <TableHead className="text-center bmi-header">ดัชนีมวลกาย</TableHead>
        <TableHead className="text-center bmi-header">ความหมาย</TableHead>
        <TableHead className="text-center bmi-header">ประเมินผล</TableHead>
        <TableHead className="text-center bmi-header">ความหมาย</TableHead>
        <TableHead className="text-center bmi-header">ประเมินผล</TableHead>
        <TableHead className="text-center bmi-header">ความหมาย</TableHead>
        <TableHead className="text-center bmi-header">ประเมินผล</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default HealthReportTableHeader;
