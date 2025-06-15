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

  const getBMICategory = (bmi: number | null, age: number) => {
    if (!bmi) return 'no-data';
    
    // BMI categories for children (simplified)
    if (bmi < 16) return 'severely-underweight';
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  };

  const getHeightCategory = (height: number | null, age: number) => {
    if (!height) return 'no-data';
    
    // Simplified height categories (would need proper growth charts)
    if (height < 110) return 'very-short';
    if (height < 125) return 'short';
    if (height < 145) return 'normal';
    if (height < 160) return 'tall';
    return 'very-tall';
  };

  // Count students by categories
  const countByCategory = (categoryFn: (item: StudentHealthDetails) => string) => {
    const counts = { male: 0, female: 0, total: 0 };
    const categories: { [key: string]: typeof counts } = {};
    
    data.forEach(student => {
      const category = categoryFn(student);
      if (!categories[category]) {
        categories[category] = { male: 0, female: 0, total: 0 };
      }
      
      // We don't have gender info in the health data, so we'll count all as total
      categories[category].total++;
      counts.total++;
    });
    
    return categories;
  };

  const weightCategories = countByCategory((student) => {
    const bmi = calculateBMI(student.weight_kg, student.height_cm);
    return getBMICategory(bmi, student.age_years);
  });

  const heightCategories = countByCategory((student) => {
    return getHeightCategory(student.height_cm, student.age_years);
  });

  const totalStudents = data.length;

  const getPercentage = (count: number) => totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(2) : '0.00';

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
          }
          th, td {
            border: 1px solid #000 !important;
            padding: 4px 6px !important;
            vertical-align: middle;
          }
          th {
            background-color: #f2f2f2 !important;
            text-align: center;
          }
          td.text-center {
            text-align: center;
          }
        }
      `}</style>
      
      <header className="text-center mb-4">
        <h1 className="text-base font-bold">อัตราความชุกของปัญหาโภชนาการ</h1>
        <h2 className="text-base font-bold">โรงเรียนบ้านดอนมูล</h2>
      </header>

      {/* Weight Status Table */}
      <table className="w-full border-collapse border border-black mb-4 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-2">น้ำหนักตามเกณฑ์อายุ</th>
            <th className="border border-black p-2">ชาย<br/>(คน)</th>
            <th className="border border-black p-2">หญิง<br/>(คน)</th>
            <th className="border border-black p-2">รวม<br/>(คน)</th>
            <th className="border border-black p-2">ภาคโภชนาการ<br/>(%)</th>
            <th className="border border-black p-2">ความ<br/>ครอบคลุม<br/>(%)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black p-2">{'- น้ำหนักมากกว่าเกณฑ์ (>+2 SD.)'}</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">{weightCategories['obese']?.total || 0}</td>
            <td className="border border-black p-2 text-center">{getPercentage(weightCategories['obese']?.total || 0)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">{'- น้ำหนักค่อนข้างมาก (>+1.5 SD. ถึง +2 SD.)'}</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">{weightCategories['overweight']?.total || 0}</td>
            <td className="border border-black p-2 text-center">{getPercentage(weightCategories['overweight']?.total || 0)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">- น้ำหนักตามเกณฑ์ (-1.5 SD. ถึง +1.5 SD.)</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">{weightCategories['normal']?.total || 0}</td>
            <td className="border border-black p-2 text-center">{getPercentage(weightCategories['normal']?.total || 0)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">{'- น้ำหนักค่อนข้างน้อย (<-1.5 SD. ถึง -2 SD.)'}</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">{weightCategories['underweight']?.total || 0}</td>
            <td className="border border-black p-2 text-center">{getPercentage(weightCategories['underweight']?.total || 0)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">{'- น้ำหนักน้อยกว่าเกณฑ์ (<-2 SD.) ** ส่งรายงาน **'}</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">{weightCategories['severely-underweight']?.total || 0}</td>
            <td className="border border-black p-2 text-center">{getPercentage(weightCategories['severely-underweight']?.total || 0)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr className="bg-gray-50">
            <td className="border border-black p-2 font-bold">จำนวนนักเรียนที่ ชั่ง นน./วัดส่วนสูง</td>
            <td className="border border-black p-2 text-center font-bold">0</td>
            <td className="border border-black p-2 text-center font-bold">0</td>
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
          <tr className="bg-gray-50">
            <td className="border border-black p-2 font-bold">จำนวนนักเรียนทั้งหมด</td>
            <td className="border border-black p-2 text-center font-bold">0</td>
            <td className="border border-black p-2 text-center font-bold">0</td>
            <td className="border border-black p-2 text-center font-bold">{totalStudents}</td>
            <td className="border border-black p-2 text-center"></td>
            <td className="border border-black p-2 text-center font-bold">100.00</td>
          </tr>
        </tbody>
      </table>

      {/* Height Status Table */}
      <table className="w-full border-collapse border border-black mb-4 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-2">ส่วนสูงตามเกณฑ์อายุ</th>
            <th className="border border-black p-2">ชาย<br/>(คน)</th>
            <th className="border border-black p-2">หญิง<br/>(คน)</th>
            <th className="border border-black p-2">รวม<br/>(คน)</th>
            <th className="border border-black p-2">ภาคโภชนาการ<br/>(%)</th>
            <th className="border border-black p-2">ความ<br/>ครอบคลุม<br/>(%)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black p-2">{'- สูงกว่าเกณฑ์ (>+2 SD.)'}</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">{heightCategories['very-tall']?.total || 0}</td>
            <td className="border border-black p-2 text-center">{getPercentage(heightCategories['very-tall']?.total || 0)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">{'- ค่อนข้างสูง (>+1.5 SD. ถึง +2 SD.)'}</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">{heightCategories['tall']?.total || 0}</td>
            <td className="border border-black p-2 text-center">{getPercentage(heightCategories['tall']?.total || 0)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">- ส่วนสูงตามเกณฑ์ (-1.5 SD. ถึง +1.5 SD.)</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">{heightCategories['normal']?.total || 0}</td>
            <td className="border border-black p-2 text-center">{getPercentage(heightCategories['normal']?.total || 0)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">{'- ค่อนข้างเตี้ย (<-1.5 SD. ถึง -2 SD.)'}</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">{heightCategories['short']?.total || 0}</td>
            <td className="border border-black p-2 text-center">{getPercentage(heightCategories['short']?.total || 0)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr>
            <td className="border border-black p-2">{'- เตี้ย (<-2 SD.) ** ส่งรายงาน **'}</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">0</td>
            <td className="border border-black p-2 text-center">{heightCategories['very-short']?.total || 0}</td>
            <td className="border border-black p-2 text-center">{getPercentage(heightCategories['very-short']?.total || 0)}</td>
            <td className="border border-black p-2 text-center"></td>
          </tr>
          <tr className="bg-gray-50">
            <td className="border border-black p-2 font-bold">จำนวนนักเรียนที่ ชั่ง นน./วัดส่วนสูง</td>
            <td className="border border-black p-2 text-center font-bold">0</td>
            <td className="border border-black p-2 text-center font-bold">0</td>
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
          <tr className="bg-gray-50">
            <td className="border border-black p-2 font-bold">จำนวนนักเรียนทั้งหมด</td>
            <td className="border border-black p-2 text-center font-bold">0</td>
            <td className="border border-black p-2 text-center font-bold">0</td>
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
