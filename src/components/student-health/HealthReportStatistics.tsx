
import React from 'react';
import { StudentHealthDetails } from '@/types/student';
import { Teacher } from '@/types/teacher';

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
  // Calculate BMI and categorize by weight status
  const calculateBMI = (weight: number | null, height: number | null) => {
    if (!weight || !height) return null;
    return weight / Math.pow(height / 100, 2);
  };

  // WHO BMI-for-age Z-score categories for children
  const getBMICategory = (bmi: number | null) => {
    if (!bmi) return 'no-data';
    
    if (bmi >= 30) return 'obese'; // >+2 SD
    if (bmi >= 25) return 'overweight'; // >+1.5 SD to +2 SD
    if (bmi >= 18.5) return 'normal'; // -1.5 SD to +1.5 SD
    if (bmi >= 16) return 'underweight'; // <-1.5 SD to -2 SD
    return 'severely-underweight'; // <-2 SD
  };

  // Height-for-age categories (simplified)
  const getHeightCategory = (height: number | null, age: number) => {
    if (!height) return 'no-data';
    
    // Simplified height categories based on age (would need proper growth charts)
    const expectedHeight = 100 + (age * 6); // Very simplified formula
    
    if (height > expectedHeight + 15) return 'very-tall'; // >+2 SD
    if (height > expectedHeight + 8) return 'tall'; // >+1.5 SD to +2 SD
    if (height >= expectedHeight - 8) return 'normal'; // -1.5 SD to +1.5 SD
    if (height >= expectedHeight - 15) return 'short'; // <-1.5 SD to -2 SD
    return 'very-short'; // <-2 SD
  };

  // Weight-for-height categories (BMI-based but for weight-for-height)
  const getWeightForHeightCategory = (weight: number | null, height: number | null) => {
    const bmi = calculateBMI(weight, height);
    if (!bmi) return 'no-data';
    
    if (bmi >= 27) return 'obese'; // โรคอ้วน
    if (bmi >= 23) return 'overweight'; // เกินเกณฑ์
    if (bmi >= 18.5) return 'normal'; // สมส่วน
    if (bmi >= 16) return 'thin'; // ค่อนข้างผอม
    return 'very-thin'; // ผอม
  };

  // Count students by categories with gender separation
  const countByCategory = (categoryFn: (item: StudentHealthDetails) => string) => {
    const categories: { [key: string]: { male: number, female: number, total: number } } = {};
    
    data.forEach(student => {
      const category = categoryFn(student);
      if (!categories[category]) {
        categories[category] = { male: 0, female: 0, total: 0 };
      }
      
      // Extract gender from full_name (เด็กชาย/เด็กหญิง)
      const isMale = student.full_name.includes('เด็กชาย');
      const isFemale = student.full_name.includes('เด็กหญิง');
      
      if (isMale) {
        categories[category].male++;
      } else if (isFemale) {
        categories[category].female++;
      }
      categories[category].total++;
    });
    
    return categories;
  };

  // Calculate gender totals
  const genderTotals = data.reduce((acc, student) => {
    const isMale = student.full_name.includes('เด็กชาย');
    const isFemale = student.full_name.includes('เด็กหญิง');
    
    if (isMale) acc.male++;
    if (isFemale) acc.female++;
    acc.total++;
    
    return acc;
  }, { male: 0, female: 0, total: 0 });

  const weightCategories = countByCategory((student) => {
    const bmi = calculateBMI(student.weight_kg, student.height_cm);
    return getBMICategory(bmi);
  });

  const heightCategories = countByCategory((student) => {
    return getHeightCategory(student.height_cm, student.age_years);
  });

  const weightForHeightCategories = countByCategory((student) => {
    return getWeightForHeightCategory(student.weight_kg, student.height_cm);
  });

  const totalStudents = data.length;
  const getPercentage = (count: number) => totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(2) : '0.00';

  const getCategoryCount = (categories: any, category: string) => categories[category] || { male: 0, female: 0, total: 0 };

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
          h1, h2, h3 {
            font-size: 12pt;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #000 !important;
            padding: 4px 6px !important;
            vertical-align: middle;
            font-size: 9pt;
          }
          th {
            background-color: #f2f2f2 !important;
            text-align: center;
            font-weight: bold;
          }
          td.text-center {
            text-align: center;
          }
          .highlight-row {
            background-color: #e6f3ff !important;
          }
        }
      `}</style>
      
      <header className="text-center mb-6">
        <h1 className="text-lg font-bold">อัตราความชุกของปัญหาโภชนาการ</h1>
        <h2 className="text-lg font-bold">โรงเรียนบ้านดอนมูล</h2>
        <p className="text-sm mt-2">ชั้น {grade} เดือน {month} ปีการศึกษา {academicYear}</p>
      </header>

      {/* น้ำหนักตามเกณฑ์อายุ */}
      <table className="w-full border-collapse border border-black mb-6 text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-2" rowSpan={2}>น้ำหนักตามเกณฑ์อายุ</th>
            <th className="border border-black p-2">ชาย<br/>(คน)</th>
            <th className="border border-black p-2">หญิง<br/>(คน)</th>
            <th className="border border-black p-2">รวม<br/>(คน)</th>
            <th className="border border-black p-2">ภาวะโภชนาการ<br/>(%)</th>
            <th className="border border-black p-2">ความ<br/>ครอบคลุม<br/>(%)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black p-2">- น้ำหนักมากกว่าเกณฑ์ ({'>+2 SD.'})</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightCategories, 'obese').male}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightCategories, 'obese').female}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightCategories, 'obese').total}</td>
            <td className="border border-black p-2 text-center">{getPercentage(getCategoryCount(weightCategories, 'obese').total)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">- น้ำหนักค่อนข้างมาก ({'>+1.5 SD. ถึง +2 SD.'})</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightCategories, 'overweight').male}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightCategories, 'overweight').female}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightCategories, 'overweight').total}</td>
            <td className="border border-black p-2 text-center">{getPercentage(getCategoryCount(weightCategories, 'overweight').total)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">- น้ำหนักตามเกณฑ์ (-1.5 SD. ถึง +1.5 SD.)</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightCategories, 'normal').male}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightCategories, 'normal').female}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightCategories, 'normal').total}</td>
            <td className="border border-black p-2 text-center">{getPercentage(getCategoryCount(weightCategories, 'normal').total)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">- น้ำหนักค่อนข้างน้อย ({'<-1.5 SD. ถึง -2 SD.'})</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightCategories, 'underweight').male}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightCategories, 'underweight').female}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightCategories, 'underweight').total}</td>
            <td className="border border-black p-2 text-center">{getPercentage(getCategoryCount(weightCategories, 'underweight').total)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">- น้ำหนักน้อยกว่าเกณฑ์ ({'<-2 SD.'}) ** ส่งรายงาน **</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightCategories, 'severely-underweight').male}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightCategories, 'severely-underweight').female}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightCategories, 'severely-underweight').total}</td>
            <td className="border border-black p-2 text-center">{getPercentage(getCategoryCount(weightCategories, 'severely-underweight').total)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr className="highlight-row">
            <td className="border border-black p-2 font-bold">จำนวนนักเรียนที่ ชั่ง นน./วัดส่วนสูง</td>
            <td className="border border-black p-2 text-center font-bold">{genderTotals.male}</td>
            <td className="border border-black p-2 text-center font-bold">{genderTotals.female}</td>
            <td className="border border-black p-2 text-center font-bold">{totalStudents}</td>
            <td className="border border-black p-2 text-center"></td>
            <td className="border border-black p-2 text-center font-bold">100.00</td>
          </tr>
          <tr>
            <td className="border border-black p-2">จำนวนนักเรียนที่ข้อมูลไม่ครบ</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0.00</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr className="highlight-row">
            <td className="border border-black p-2 font-bold">จำนวนนักเรียนทั้งหมด</td>
            <td className="border border-black p-2 text-center font-bold">{genderTotals.male}</td>
            <td className="border border-black p-2 text-center font-bold">{genderTotals.female}</td>
            <td className="border border-black p-2 text-center font-bold">{totalStudents}</td>
            <td className="border border-black p-2 text-center"></td>
            <td className="border border-black p-2 text-center font-bold">100.00</td>
          </tr>
        </tbody>
      </table>

      {/* ส่วนสูงตามเกณฑ์อายุ */}
      <table className="w-full border-collapse border border-black mb-6 text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-2" rowSpan={2}>ส่วนสูงตามเกณฑ์อายุ</th>
            <th className="border border-black p-2">ชาย<br/>(คน)</th>
            <th className="border border-black p-2">หญิง<br/>(คน)</th>
            <th className="border border-black p-2">รวม<br/>(คน)</th>
            <th className="border border-black p-2">ภาวะโภชนาการ<br/>(%)</th>
            <th className="border border-black p-2">ความ<br/>ครอบคลุม<br/>(%)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black p-2">- สูงกว่าเกณฑ์ ({'>+2 SD.'})</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(heightCategories, 'very-tall').male}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(heightCategories, 'very-tall').female}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(heightCategories, 'very-tall').total}</td>
            <td className="border border-black p-2 text-center">{getPercentage(getCategoryCount(heightCategories, 'very-tall').total)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">- ค่อนข้างสูง ({'>+1.5 SD. ถึง +2 SD.'})</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(heightCategories, 'tall').male}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(heightCategories, 'tall').female}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(heightCategories, 'tall').total}</td>
            <td className="border border-black p-2 text-center">{getPercentage(getCategoryCount(heightCategories, 'tall').total)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">- ส่วนสูงตามเกณฑ์ (-1.5 SD. ถึง +1.5 SD.)</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(heightCategories, 'normal').male}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(heightCategories, 'normal').female}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(heightCategories, 'normal').total}</td>
            <td className="border border-black p-2 text-center">{getPercentage(getCategoryCount(heightCategories, 'normal').total)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">- ค่อนข้างเตี้ย ({'<-1.5 SD. ถึง -2 SD.'})</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(heightCategories, 'short').male}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(heightCategories, 'short').female}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(heightCategories, 'short').total}</td>
            <td className="border border-black p-2 text-center">{getPercentage(getCategoryCount(heightCategories, 'short').total)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">- เตี้ย ({'<-2 SD.'}) ** ส่งรายงาน **</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(heightCategories, 'very-short').male}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(heightCategories, 'very-short').female}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(heightCategories, 'very-short').total}</td>
            <td className="border border-black p-2 text-center">{getPercentage(getCategoryCount(heightCategories, 'very-short').total)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr className="highlight-row">
            <td className="border border-black p-2 font-bold">จำนวนนักเรียนที่ ชั่ง นน./วัดส่วนสูง</td>
            <td className="border border-black p-2 text-center font-bold">{genderTotals.male}</td>
            <td className="border border-black p-2 text-center font-bold">{genderTotals.female}</td>
            <td className="border border-black p-2 text-center font-bold">{totalStudents}</td>
            <td className="border border-black p-2 text-center"></td>
            <td className="border border-black p-2 text-center font-bold">100.00</td>
          </tr>
          <tr>
            <td className="border border-black p-2">จำนวนนักเรียนที่ข้อมูลไม่ครบ</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0.00</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr className="highlight-row">
            <td className="border border-black p-2 font-bold">จำนวนนักเรียนทั้งหมด</td>
            <td className="border border-black p-2 text-center font-bold">{genderTotals.male}</td>
            <td className="border border-black p-2 text-center font-bold">{genderTotals.female}</td>
            <td className="border border-black p-2 text-center font-bold">{totalStudents}</td>
            <td className="border border-black p-2 text-center"></td>
            <td className="border border-black p-2 text-center font-bold">100.00</td>
          </tr>
        </tbody>
      </table>

      {/* น้ำหนักตามเกณฑ์ส่วนสูง */}
      <table className="w-full border-collapse border border-black mb-6 text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-2" rowSpan={2}>น้ำหนักตามเกณฑ์ส่วนสูง</th>
            <th className="border border-black p-2">ชาย<br/>(คน)</th>
            <th className="border border-black p-2">หญิง<br/>(คน)</th>
            <th className="border border-black p-2">รวม<br/>(คน)</th>
            <th className="border border-black p-2">ภาวะโภชนาการ<br/>(%)</th>
            <th className="border border-black p-2">ความ<br/>ครอบคลุม<br/>(%)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black p-2">- อ้วน ({'>+3 SD.'}) * รวมกัน *</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightForHeightCategories, 'obese').male}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightForHeightCategories, 'obese').female}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightForHeightCategories, 'obese').total}</td>
            <td className="border border-black p-2 text-center">{getPercentage(getCategoryCount(weightForHeightCategories, 'obese').total)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">- เกินเกณฑ์ ({'>+2 SD. ถึง +3 SD.'}) ** ส่งรายงาน **</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightForHeightCategories, 'overweight').male}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightForHeightCategories, 'overweight').female}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightForHeightCategories, 'overweight').total}</td>
            <td className="border border-black p-2 text-center">{getPercentage(getCategoryCount(weightForHeightCategories, 'overweight').total)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">- ปกติ ({'+1.5 SD. ถึง +2 SD.'})</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightForHeightCategories, 'normal').male}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightForHeightCategories, 'normal').female}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightForHeightCategories, 'normal').total}</td>
            <td className="border border-black p-2 text-center">{getPercentage(getCategoryCount(weightForHeightCategories, 'normal').total)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">- สมส่วน (-1.5 SD. ถึง +1.5 SD.)</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0.00</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">- ค่อนข้างผอม ({'<-1.5 SD. ถึง -2 SD.'})</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightForHeightCategories, 'thin').male}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightForHeightCategories, 'thin').female}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightForHeightCategories, 'thin').total}</td>
            <td className="border border-black p-2 text-center">{getPercentage(getCategoryCount(weightForHeightCategories, 'thin').total)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">- ผอม ({'<-2 SD.'}) ** ส่งรายงาน **</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightForHeightCategories, 'very-thin').male}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightForHeightCategories, 'very-thin').female}</td>
            <td className="border border-black p-2 text-center">{getCategoryCount(weightForHeightCategories, 'very-thin').total}</td>
            <td className="border border-black p-2 text-center">{getPercentage(getCategoryCount(weightForHeightCategories, 'very-thin').total)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr className="highlight-row">
            <td className="border border-black p-2 font-bold">จำนวนนักเรียนที่ ชั่ง นน./วัดส่วนสูง</td>
            <td className="border border-black p-2 text-center font-bold">{genderTotals.male}</td>
            <td className="border border-black p-2 text-center font-bold">{genderTotals.female}</td>
            <td className="border border-black p-2 text-center font-bold">{totalStudents}</td>
            <td className="border border-black p-2 text-center"></td>
            <td className="border border-black p-2 text-center font-bold">100.00</td>
          </tr>
          <tr>
            <td className="border border-black p-2">จำนวนนักเรียนที่ข้อมูลไม่ครบ</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0.00</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr className="highlight-row">
            <td className="border border-black p-2 font-bold">จำนวนนักเรียนทั้งหมด</td>
            <td className="border border-black p-2 text-center font-bold">{genderTotals.male}</td>
            <td className="border border-black p-2 text-center font-bold">{genderTotals.female}</td>
            <td className="border border-black p-2 text-center font-bold">{totalStudents}</td>
            <td className="border border-black p-2 text-center"></td>
            <td className="border border-black p-2 text-center font-bold">100.00</td>
          </tr>
        </tbody>
      </table>

      <div className="text-right mt-8">
        <p>(...............................................)</p>
        {teacher ? (
          <>
            <p>{teacher.firstName} {teacher.lastName}</p>
            <p>{teacher.position}</p>
          </>
        ) : (
          <>
            <p>นายธุปนนท์ ศรีสู่</p>
            <p>ครูประจำชั้น ป.4</p>
          </>
        )}
      </div>
    </div>
  );
};

export default HealthReportStatistics;
