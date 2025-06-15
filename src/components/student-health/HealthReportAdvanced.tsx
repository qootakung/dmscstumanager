
import React from 'react';
import { StudentHealthDetails } from '@/types/student';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface HealthReportAdvancedProps {
  data: StudentHealthDetails[];
  grade: string;
  month: string;
  academicYear: string;
}

const HealthReportAdvanced: React.FC<HealthReportAdvancedProps> = ({ data, grade, month, academicYear }) => {
  // ฟังก์ชันคำนวณ BMI
  const calculateBMI = (weight: number | null, height: number | null): number | null => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  // ฟังก์ชันประเมิน BMI
  const evaluateBMI = (bmi: number | null): string => {
    if (!bmi) return '-';
    if (bmi < 18.5) return 'น้ำหนักน้อย';
    if (bmi < 23) return 'น้ำหนักปกติ';
    if (bmi < 25) return 'น้ำหนักเกิน';
    if (bmi < 30) return 'อ้วนระดับ 1';
    return 'อ้วนระดับ 2';
  };

  // ฟังก์ชันคำนวณส่วนสูงตามอายุ ตามสูตร Excel ที่ให้มา
  const calculateHeightForAge = (ageYears: number, height: number | null): string => {
    if (!height || ageYears <= 0) return '-';
    
    // สูตรจาก Excel: =IF(D15="","",IF(OR(OR(OR(OR(OR(D15=0),D15>2),H15=0),H15=999),N15=0),"ไม่พบฐานส",IF(OR(H15<AL15,N15>120),"*** ตรวจสอบข้อมูล ***",IF(H15>AM15,"ข้อมูลสูงกว่าใจนเกณฑ์",IF(H15>=AL15,"สูงตามเกณฑ์","เตี้ยกว่าเกณฑ์")))))
    
    // กำหนดเกณฑ์ส่วนสูงตามช่วงอายุ (ตัวอย่าง - ควรปรับตามเกณฑ์จริง)
    let minHeight = 0;
    let maxHeight = 0;
    
    if (ageYears >= 6 && ageYears <= 12) {
      // เกณฑ์สำหรับเด็กประถม
      minHeight = 100 + (ageYears - 6) * 6; // ตัวอย่าง
      maxHeight = 120 + (ageYears - 6) * 8; // ตัวอย่าง
    } else if (ageYears >= 13 && ageYears <= 18) {
      // เกณฑ์สำหรับเด็กมัธยม
      minHeight = 140 + (ageYears - 13) * 5; // ตัวอย่าง
      maxHeight = 160 + (ageYears - 13) * 6; // ตัวอย่าง
    } else {
      return 'ไม่พบฐานส';
    }
    
    if (height > 200) {
      return '*** ตรวจสอบข้อมูล ***';
    } else if (height > maxHeight) {
      return 'สูงเกินเกณฑ์';
    } else if (height >= minHeight) {
      return 'สูงตามเกณฑ์';
    } else {
      return 'เตี้ยกว่าเกณฑ์';
    }
  };

  // ฟังก์ชันคำนวณน้ำหนักตามอายุ ตามสูตร Excel ที่ให้มา
  const calculateWeightForAge = (ageYears: number, weight: number | null, height: number | null): string => {
    // สูตรจาก Excel: =IF(D15="","",IF(OR(OR(OR(OR(OR(D15=0),D15>2),G15=0),H15=0),R15=0),"ไม่พบฐานส",IF(AND(OR(G15<AP15,G15>AU15),E15=999),"*** ตรวจสอบข้อมูล ***",IF(G15>AU15,"อ้วน",IF(G15>AT15,"เริ่มอ้วน",IF(G15>=AR15,"ดีมาก",IF(G15>=AQ15,"ดีอ่อน","ผอม")))))))
    
    if (!weight || !height || ageYears <= 0) return '-';
    
    // กำหนดเกณฑ์น้ำหนักตามช่วงอายุ (ตัวอย่าง - ควรปรับตามเกณฑ์จริง)
    let minWeight = 0;
    let normalMinWeight = 0;
    let normalMaxWeight = 0;
    let overweightWeight = 0;
    let obeseWeight = 0;
    
    if (ageYears >= 6 && ageYears <= 12) {
      // เกณฑ์สำหรับเด็กประถม
      minWeight = 15 + (ageYears - 6) * 3; // ตัวอย่าง
      normalMinWeight = 18 + (ageYears - 6) * 3.5; // ตัวอย่าง
      normalMaxWeight = 25 + (ageYears - 6) * 4; // ตัวอย่าง
      overweightWeight = 30 + (ageYears - 6) * 4.5; // ตัวอย่าง
      obeseWeight = 35 + (ageYears - 6) * 5; // ตัวอย่าง
    } else if (ageYears >= 13 && ageYears <= 18) {
      // เกณฑ์สำหรับเด็กมัธยม
      minWeight = 35 + (ageYears - 13) * 4; // ตัวอย่าง
      normalMinWeight = 40 + (ageYears - 13) * 4.5; // ตัวอย่าง
      normalMaxWeight = 55 + (ageYears - 13) * 5; // ตัวอย่าง
      overweightWeight = 65 + (ageYears - 13) * 5.5; // ตัวอย่าง
      obeseWeight = 75 + (ageYears - 13) * 6; // ตัวอย่าง
    } else {
      return 'ไม่พบฐานส';
    }
    
    // ตรวจสอบข้อมูลผิดปกติ
    if (weight > 200 || (weight < 10 && ageYears > 5)) {
      return '*** ตรวจสอบข้อมูล ***';
    } else if (weight >= obeseWeight) {
      return 'อ้วน';
    } else if (weight >= overweightWeight) {
      return 'เริ่มอ้วน';
    } else if (weight >= normalMaxWeight) {
      return 'ดีมาก';
    } else if (weight >= normalMinWeight) {
      return 'ดีอ่อน';
    } else {
      return 'ผอม';
    }
  };

  // ฟังก์ชันประเมินสุขภาพตามอายุ (ตัวอย่าง)
  const evaluateHealthByAge = (bmi: number | null, age: number): string => {
    if (!bmi) return '-';
    // เกณฑ์การประเมินสำหรับเด็ก (ตัวอย่าง)
    if (age <= 12) {
      if (bmi < 16) return 'น้ำหนักน้อยกว่าเกณฑ์';
      if (bmi < 20) return 'น้ำหนักปกติ';
      if (bmi < 22) return 'น้ำหนักเกินเกณฑ์';
      return 'น้ำหนักเกินมากกว่าเกณฑ์';
    } else {
      // เกณฑ์สำหรับวัยรุ่น
      if (bmi < 18.5) return 'น้ำหนักน้อยกว่าเกณฑ์';
      if (bmi < 23) return 'น้ำหนักปกติ';
      if (bmi < 25) return 'น้ำหนักเกินเกณฑ์';
      return 'น้ำหนักเกินมากกว่าเกณฑ์';
    }
  };

  return (
    <div className="p-4 font-sarabun">
      <style>{`
        body { 
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        @media print {
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
          body {
            font-size: 8pt;
          }
          .p-4 {
             padding: 0 !important;
          }
          header {
            margin-bottom: 1rem !important;
          }
          h1, h2, h3 {
            font-size: 10pt;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #000 !important;
            padding: 2px 4px !important;
            vertical-align: middle;
            font-size: 8pt !important;
          }
          th {
            background-color: #90EE90 !important;
            text-align: center;
            font-weight: bold;
          }
          td.text-center {
            text-align: center;
          }
          .bmi-header {
            background-color: #FFB6C1 !important;
          }
        }
      `}</style>
      
      <header className="text-center mb-4">
        <h1 className="text-base font-bold">การแปลผลภาวะโภชนาการของเด็กนักเรียน</h1>
        <h2 className="text-base font-bold">ระดับชั้น {grade} โรงเรียนบ้านดอนมูล</h2>
        <h3 className="text-base font-bold">อันดับขนาดร่างกายของเด็กวัยเรียนรายบุคคล</h3>
      </header>

      <Table>
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
        <TableBody>
          {data.map((record, index) => {
            const bmi = calculateBMI(record.weight_kg, record.height_cm);
            const bmiEvaluation = evaluateBMI(bmi);
            const healthEvaluation = evaluateHealthByAge(bmi, record.age_years);
            const heightForAgeEvaluation = calculateHeightForAge(record.age_years, record.height_cm);
            const weightForAgeEvaluation = calculateWeightForAge(record.age_years, record.weight_kg, record.height_cm);
            
            return (
              <TableRow key={record.record_id}>
                <TableCell className="text-center">{index + 1}</TableCell>
                <TableCell>{record.full_name}</TableCell>
                <TableCell className="text-center">-</TableCell>
                <TableCell className="text-center">{record.age_years}</TableCell>
                <TableCell className="text-center">{record.weight_kg?.toFixed(2) ?? '-'}</TableCell>
                <TableCell className="text-center">{record.height_cm?.toFixed(2) ?? '-'}</TableCell>
                <TableCell className="text-center">{bmi ? bmi.toFixed(2) : '-'}</TableCell>
                <TableCell className="text-center">{weightForAgeEvaluation}</TableCell>
                <TableCell className="text-center">{healthEvaluation}</TableCell>
                <TableCell className="text-center">{heightForAgeEvaluation}</TableCell>
                <TableCell className="text-center">-</TableCell>
                <TableCell className="text-center">-</TableCell>
                <TableCell className="text-center">-</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="mt-4 text-sm">
        <p><strong>หมายเหตุ:</strong></p>
        <p>- ดัชนีมวลกาย (BMI) = น้ำหนัก (กก.) ÷ ส่วนสูง² (ม.)</p>
        <p>- เกณฑ์การประเมิน: น้ำหนักน้อย (BMI &lt; 18.5), ปกติ (18.5-22.9), เกิน (23-24.9), อ้วน (≥ 25)</p>
        <p>- ส่วนสูงตามอายุ: ประเมินตามเกณฑ์มาตรฐานของเด็กไทย</p>
        <p>- น้ำหนักตามอายุ: ผอม, ดีอ่อน, ดีมาก, เริ่มอ้วน, อ้วน</p>
      </div>
    </div>
  );
};

export default HealthReportAdvanced;
