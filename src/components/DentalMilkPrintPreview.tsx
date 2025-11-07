import React, { forwardRef } from 'react';
import type { Student } from '@/types/student';

interface DentalMilkPrintPreviewProps {
  students: Student[];
  recordedData: {[key: string]: boolean};
  selectedMonth: number;
  selectedYear: number;
  selectedGrade: string;
  recordingMode: 'brushing' | 'milk';
}

const months = [
  { value: 1, label: 'มกราคม' },
  { value: 2, label: 'กุมภาพันธ์' },
  { value: 3, label: 'มีนาคม' },
  { value: 4, label: 'เมษายน' },
  { value: 5, label: 'พฤษภาคม' },
  { value: 6, label: 'มิถุนายน' },
  { value: 7, label: 'กรกฎาคม' },
  { value: 8, label: 'สิงหาคม' },
  { value: 9, label: 'กันยายน' },
  { value: 10, label: 'ตุลาคม' },
  { value: 11, label: 'พฤศจิกายน' },
  { value: 12, label: 'ธันวาคม' },
];

const getDaysInMonth = (month: number, year: number) => {
  const gregorianYear = year - 543;
  const daysInMonth = new Date(gregorianYear, month, 0).getDate();
  return daysInMonth;
};

const DentalMilkPrintPreview = forwardRef<HTMLDivElement, DentalMilkPrintPreviewProps>(({
  students,
  recordedData,
  selectedMonth,
  selectedYear,
  selectedGrade,
  recordingMode,
}, ref) => {
  const filteredStudents = selectedGrade === 'all' 
    ? students.sort((a, b) => {
        const gradeOrder = ['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];
        if (a.grade !== b.grade) {
          return gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade);
        }
        return parseInt(a.studentId) - parseInt(b.studentId);
      })
    : students.filter(s => s.grade === selectedGrade)
        .sort((a, b) => parseInt(a.studentId) - parseInt(b.studentId));

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const monthLabel = months.find(m => m.value === selectedMonth)?.label || '';

  return (
    <div ref={ref} className="p-4 font-sarabun">
      <style>{`
        body { 
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        @media print {
          @page { 
            size: A4 landscape; 
            margin: 15mm; 
          }
          body {
            font-size: 12px;
            margin: 0;
            padding: 0;
          }
          .p-4 {
            padding: 0 !important;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 10px;
          }
          th, td { 
            border: 1px solid #000 !important; 
            padding: 4px 2px !important; 
            text-align: center !important; 
            vertical-align: middle !important;
          }
          th { 
            background-color: #4CAF50 !important; 
            color: white !important;
            font-weight: bold !important; 
            font-size: 9px !important;
          }
          .student-no { 
            width: 30px !important; 
            background-color: #4CAF50 !important;
            color: white !important;
            font-weight: bold !important;
          }
          .student-name { 
            width: 120px !important; 
            text-align: left !important; 
            padding-left: 6px !important;
            background-color: #4CAF50 !important;
            color: white !important;
            font-weight: bold !important;
          }
          .day-header { 
            width: 22px !important; 
            font-size: 8px !important;
          }
          .weekend { 
            background-color: #ffebee !important; 
            color: #d32f2f !important;
          }
          .total-col {
            width: 40px !important;
            background-color: #4CAF50 !important;
            color: white !important;
            font-weight: bold !important;
          }
        }
      `}</style>
      
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold mb-2">
          บันทึกข้อมูลการ{recordingMode === 'brushing' ? 'แปรงฟัน' : 'ดื่มนม'}
        </h1>
        <p className="text-sm">
          {monthLabel} {selectedYear} {selectedGrade !== 'all' ? `- ${selectedGrade}` : ''}
        </p>
      </div>
      
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="border border-gray-900 p-1 bg-green-600 text-white font-bold" style={{width: '30px'}}>ที่</th>
            <th className="border border-gray-900 p-1 bg-green-600 text-white font-bold text-left pl-2" style={{width: '120px'}}>ชื่อ</th>
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              if (day <= daysInMonth) {
                const gregorianYear = selectedYear - 543;
                const date = new Date(gregorianYear, selectedMonth - 1, day);
                const dayOfWeek = date.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                
                return (
                  <th 
                    key={day} 
                    className={`border border-gray-900 p-1 bg-green-600 text-white font-bold ${isWeekend ? 'bg-red-100 text-red-700' : ''}`}
                    style={{width: '22px', fontSize: '8px'}}
                  >
                    {day}
                  </th>
                );
              } else {
                return <th key={day} style={{visibility: 'hidden', width: '22px'}}></th>;
              }
            })}
            <th className="border border-gray-900 p-1 bg-green-600 text-white font-bold" style={{width: '40px'}}>รวม</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student) => {
            const totalRecords = Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const recordKey = `${recordingMode}-${student.id}-${day}`;
              return recordedData[recordKey] ? 1 : 0;
            }).reduce((sum, val) => sum + val, 0);
            
            return (
              <tr key={student.id}>
                <td className="border border-gray-900 p-1 text-center bg-green-600 text-white font-bold">
                  {filteredStudents.indexOf(student) + 1}
                </td>
                <td className="border border-gray-900 p-1 text-left pl-2 bg-green-600 text-white font-bold">
                  {student.firstNameTh} {student.lastNameTh}
                </td>
                {Array.from({ length: 31 }, (_, i) => {
                  const day = i + 1;
                  if (day <= daysInMonth) {
                    const gregorianYear = selectedYear - 543;
                    const date = new Date(gregorianYear, selectedMonth - 1, day);
                    const dayOfWeek = date.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const recordKey = `${recordingMode}-${student.id}-${day}`;
                    const isRecorded = recordedData[recordKey];
                    
                    return (
                      <td 
                        key={day} 
                        className={`border border-gray-900 p-1 text-center ${isWeekend ? 'bg-red-50 text-red-700' : ''}`}
                      >
                        {isRecorded && !isWeekend ? (
                          <span className="text-green-600 font-bold" style={{fontSize: '16px'}}>✓</span>
                        ) : ''}
                      </td>
                    );
                  } else {
                    return <td key={day} style={{visibility: 'hidden'}}></td>;
                  }
                })}
                <td className="border border-gray-900 p-1 text-center bg-green-600 text-white font-bold">
                  {totalRecords}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

DentalMilkPrintPreview.displayName = 'DentalMilkPrintPreview';

export default DentalMilkPrintPreview;
