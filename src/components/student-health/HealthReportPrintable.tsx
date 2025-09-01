
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
    <div className="p-4 font-sarabun">
      <style>{`
        body { 
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        @media print {
          @page {
            size: A4;
            margin: 1.5cm;
          }
          body {
            font-size: 9pt;
          }
          .p-4 {
             padding: 0 !important;
          }
          header {
            margin-bottom: 1rem !important;
          }
          h1, h2, h3 {
            font-size: 12pt;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #000 !important;
            padding: 4px 6px !important;
            vertical-align: middle;
          }
          table {
            border: 1px solid #000 !important;
            border-collapse: collapse !important;
          }
          th {
            background-color: #f2f2f2 !important;
            text-align: center !important;
            font-weight: bold;
          }
          td.text-center {
            text-align: center;
          }
        }
      `}</style>
      <header className="text-center mb-4">
        <h1 className="text-base font-bold">ข้อมูลน้ำหนักและส่วนสูง</h1>
        <h2 className="text-base font-bold">ระดับชั้น {grade} โรงเรียนบ้านดอนมูล</h2>
        <h3 className="text-base font-bold">ประจำเดือน {month} ปีการศึกษา {academicYear}</h3>
      </header>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px] text-center">ที่</TableHead>
            <TableHead className="w-[90px] text-center">รหัสนักเรียน</TableHead>
            <TableHead className="text-center">ชื่อ-นามสกุล</TableHead>
            <TableHead className="w-[150px] text-center">อายุ</TableHead>
            <TableHead className="w-[90px] text-center">น้ำหนัก (กก.)</TableHead>
            <TableHead className="w-[90px] text-center">ส่วนสูง (ซม.)</TableHead>
            <TableHead className="w-[120px] text-center">วันที่ชั่ง</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record, index) => (
            <TableRow key={record.record_id}>
              <TableCell className="text-center">{index + 1}</TableCell>
              <TableCell className="text-center">{record.student_code}</TableCell>
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
