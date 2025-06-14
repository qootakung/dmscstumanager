
import React from 'react';
import { StudentHealthDetails } from '@/types/student';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface HealthReportPrintableProps {
  data: StudentHealthDetails[];
  grade: string;
  month: string;
  academicYear: string;
}

const HealthReportPrintable: React.FC<HealthReportPrintableProps> = ({ data, grade, month, academicYear }) => {
  return (
    <div className="p-8 font-sarabun">
      <header className="text-center mb-6">
        <h1 className="text-base font-bold">ข้อมูลน้ำหนักและส่วนสูง</h1>
        <h2 className="text-base font-bold">ระดับชั้น {grade} โรงเรียนบ้านดอนมูล</h2>
        <h3 className="text-base font-bold">ประจำเดือน {month} ปีการศึกษา {academicYear}</h3>
      </header>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">ที่</TableHead>
            <TableHead className="w-[120px]">รหัสนักเรียน</TableHead>
            <TableHead>ชื่อ-นามสกุล</TableHead>
            <TableHead className="w-[200px]">อายุ</TableHead>
            <TableHead className="w-[150px]">น้ำหนัก (กก.)</TableHead>
            <TableHead className="w-[150px]">ส่วนสูง (ซม.)</TableHead>
            <TableHead className="w-[180px]">วันที่ชั่ง</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record, index) => (
            <TableRow key={record.record_id}>
              <TableCell className="text-center">{index + 1}</TableCell>
              <TableCell>{record.student_code}</TableCell>
              <TableCell>{record.full_name}</TableCell>
              <TableCell className="text-center">{`${record.age_years} ปี ${record.age_months} เดือน ${record.age_days} วัน`}</TableCell>
              <TableCell className="text-center">{record.weight_kg?.toFixed(2) ?? '-'}</TableCell>
              <TableCell className="text-center">{record.height_cm?.toFixed(2) ?? '-'}</TableCell>
              <TableCell className="text-center">{new Date(record.measurement_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default HealthReportPrintable;
