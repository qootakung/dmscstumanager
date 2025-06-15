import React from 'react';
import { StudentHealthDetails } from '@/types/student';
import { Teacher } from '@/types/teacher';
import { useHealthStatistics } from './hooks/useHealthStatistics';
import HealthStatisticsTable from './components/HealthStatisticsTable';
import SignatureSection from './components/SignatureSection';
import ReportHeader from './components/ReportHeader';

interface HealthReportStatisticsProps {
  data: StudentHealthDetails[];
  grade: string;
  month: string;
  academicYear: string;
  teacher?: Teacher;
}

const HealthReportStatistics: React.FC<HealthReportStatisticsProps> = ({ 
  data, 
  grade, 
  month, 
  academicYear,
  teacher 
}) => {
  const {
    weightCategories,
    heightCategories,
    weightForHeightCategories,
    genderTotals,
    totalStudents
  } = useHealthStatistics(data);

  // Category definitions
  const weightCategoryLabels = [
    { key: 'obese', label: '- น้ำหนักมากกว่าเกณฑ์', sdRange: '>+2 SD.' },
    { key: 'overweight', label: '- น้ำหนักค่อนข้างมาก', sdRange: '>+1.5 SD. ถึง +2 SD.' },
    { key: 'normal', label: '- น้ำหนักตามเกณฑ์', sdRange: '-1.5 SD. ถึง +1.5 SD.' },
    { key: 'underweight', label: '- น้ำหนักค่อนข้างน้อย', sdRange: '<-1.5 SD. ถึง -2 SD.' },
    { key: 'severely-underweight', label: '- น้ำหนักน้อยกว่าเกณฑ์', sdRange: '<-2 SD.', highlight: false },
    { key: 'measured', label: 'จำนวนนักเรียนที่ ชั่ง นน./วัดส่วนสูง', highlight: true },
    { key: 'incomplete', label: 'จำนวนนักเรียนที่ข้อมูลไม่ครบ', highlight: false },
    { key: 'total', label: 'จำนวนนักเรียนทั้งหมด', highlight: true }
  ];

  const heightCategoryLabels = [
    { key: 'very-tall', label: '- สูงกว่าเกณฑ์', sdRange: '>+2 SD.' },
    { key: 'tall', label: '- ค่อนข้างสูง', sdRange: '>+1.5 SD. ถึง +2 SD.' },
    { key: 'normal', label: '- ส่วนสูงตามเกณฑ์', sdRange: '-1.5 SD. ถึง +1.5 SD.' },
    { key: 'short', label: '- ค่อนข้างเตี้ย', sdRange: '<-1.5 SD. ถึง -2 SD.' },
    { key: 'very-short', label: '- เตี้ย', sdRange: '<-2 SD.', highlight: false },
    { key: 'measured', label: 'จำนวนนักเรียนที่ ชั่ง นน./วัดส่วนสูง', highlight: true },
    { key: 'incomplete', label: 'จำนวนนักเรียนที่ข้อมูลไม่ครบ', highlight: false },
    { key: 'total', label: 'จำนวนนักเรียนทั้งหมด', highlight: true }
  ];

  const weightForHeightCategoryLabels = [
    { key: 'obese', label: '- อ้วน', sdRange: '>+3 SD.' },
    { key: 'overweight', label: '- เกินเกณฑ์', sdRange: '>+2 SD. ถึง +3 SD.' },
    { key: 'normal', label: '- ปกติ', sdRange: '+1.5 SD. ถึง +2 SD.' },
    { key: 'proportional', label: '- สมส่วน', sdRange: '-1.5 SD. ถึง +1.5 SD.' },
    { key: 'thin', label: '- ค่อนข้างผอม', sdRange: '<-1.5 SD. ถึง -2 SD.' },
    { key: 'very-thin', label: '- ผอม', sdRange: '<-2 SD.' },
    { key: 'measured', label: 'จำนวนนักเรียนที่ ชั่ง นน./วัดส่วนสูง', highlight: true },
    { key: 'incomplete', label: 'จำนวนนักเรียนที่ข้อมูลไม่ครบ', highlight: false },
    { key: 'total', label: 'จำนวนนักเรียนทั้งหมด', highlight: true }
  ];

  // Add special handling for measured, incomplete, and total rows
  const getAdjustedCategories = (categories: any, genderTotals: any) => {
    return {
      ...categories,
      'measured': genderTotals,
      'incomplete': { male: 0, female: 0, total: 0 },
      'total': genderTotals,
      'proportional': { male: 0, female: 0, total: 0 } // For weight-for-height proportional category
    };
  };

  return (
    <div className="p-2 font-sarabun text-xs">
      <style>{`
        body { 
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        @media print {
          @page {
            size: A4;
            margin: 0.4cm 0.6cm 0.6cm 1.0cm;
          }
          body {
            font-size: 8pt;
          }
          .p-2 {
             padding: 0 !important;
          }
          h1, h2, h3 {
            font-size: 10pt;
            margin-bottom: 6px;
            line-height: 1.3;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
            font-size: 8pt;
            line-height: 1.4;
          }
          th, td {
            border: 1px solid #000 !important;
            padding: 3px 4px !important;
            vertical-align: middle;
            line-height: 1.4;
          }
          th {
            background-color: #f2f2f2 !important;
            text-align: center !important;
            font-weight: bold;
            line-height: 1.3;
          }
          td.text-center {
            text-align: center;
          }
          .highlight-row {
            background-color: #e6f3ff !important;
          }
          .signature-section {
            margin-top: 20px;
            font-size: 8pt;
            line-height: 1.4;
          }
          .header-section {
            margin-bottom: 8px;
            line-height: 1.4;
          }
          .header-section p {
            margin: 3px 0;
          }
          .category-col {
            width: 26% !important;
          }
          .gender-col {
            width: 12% !important;
          }
          .total-col {
            width: 12% !important;
          }
          .percent-col {
            width: 12% !important;
          }
          .coverage-col {
            width: 12% !important;
          }
          .signature-dots {
            position: relative;
            display: inline-block;
            width: 250px;
            text-align: center;
          }
          .signature-name {
            position: absolute;
            top: 48px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 0 8px;
            font-size: 8pt;
            line-height: 1.3;
          }
        }
      `}</style>
      
      <ReportHeader grade={grade} month={month} academicYear={academicYear} />

      {/* น้ำหนักตามเกณฑ์อายุ */}
      <HealthStatisticsTable
        title="น้ำหนักตามเกณฑ์อายุ"
        data={data}
        categories={getAdjustedCategories(weightCategories, genderTotals)}
        categoryLabels={weightCategoryLabels}
        genderTotals={genderTotals}
        totalStudents={totalStudents}
      />

      {/* ส่วนสูงตามเกณฑ์อายุ */}
      <HealthStatisticsTable
        title="ส่วนสูงตามเกณฑ์อายุ"
        data={data}
        categories={getAdjustedCategories(heightCategories, genderTotals)}
        categoryLabels={heightCategoryLabels}
        genderTotals={genderTotals}
        totalStudents={totalStudents}
      />

      {/* น้ำหนักตามเกณฑ์ส่วนสูง */}
      <HealthStatisticsTable
        title="น้ำหนักตามเกณฑ์ส่วนสูง"
        data={data}
        categories={getAdjustedCategories(weightForHeightCategories, genderTotals)}
        categoryLabels={weightForHeightCategoryLabels}
        genderTotals={genderTotals}
        totalStudents={totalStudents}
      />

      <SignatureSection teacher={teacher} />
    </div>
  );
};

export default HealthReportStatistics;
