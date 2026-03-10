
import React from 'react';
import type { Student } from '@/types/student';
import { getEmptyRowData } from '@/utils/pp5PrintUtils';

interface DayColumn {
  day: number;
  date: Date;
  dayAbbr: string;
  weekend: boolean;
  holiday: string | null;
}

interface PP5AttendancePrintProps {
  students: Student[];
  grade: string;
  semester: string;
  academicYear: string;
  monthName: string;
  dayColumns: DayColumn[];
  attendanceData: Record<string, string>;
  ceYear: number;
  month: number;
}

const PP5AttendancePrint: React.FC<PP5AttendancePrintProps> = ({
  students,
  grade,
  semester,
  academicYear,
  monthName,
  dayColumns,
  attendanceData,
  ceYear,
  month,
}) => {
  // Calculate summary
  const schoolDays = dayColumns.filter(d => !d.weekend && !d.holiday);
  
  return (
    <div style={{ fontFamily: "'TH SarabunPSK', 'TH Sarabun', 'Sarabun', sans-serif", padding: '5mm' }}>
      <style>{`
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        @page {
          size: A4 landscape;
          margin: 5mm;
        }
        @media print {
          table, th, td {
            border: 1px solid #000 !important;
            border-collapse: collapse !important;
          }
          th {
            background-color: #fff3e0 !important;
          }
          .weekend-col {
            background-color: #e0e0e0 !important;
          }
          .holiday-col {
            background-color: #ffebee !important;
          }
          thead {
            display: table-header-group !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '18pt', fontWeight: 'bold', margin: '0' }}>
          แบบบันทึกเวลาเรียน ชั้นประถมศึกษาปีที่ {grade.replace('ป.', '')} ภาคเรียนที่ {semester}/{academicYear}
        </h3>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13pt', tableLayout: 'fixed' }}>
        <thead>
          {/* Row 1: Month header */}
          <tr>
            <th rowSpan={3} style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'center', width: '30px', backgroundColor: '#fff3e0' }}>
              เลข<br/>ที่
            </th>
            <th rowSpan={3} style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'center', width: '140px', backgroundColor: '#fff3e0' }}>
              ชื่อ-นามสกุล
            </th>
            <th rowSpan={2} style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', width: '25px', fontSize: '10pt', backgroundColor: '#fff3e0' }}>
              เดือน<br/>วันที่
            </th>
            <th colSpan={dayColumns.length} style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'center', fontWeight: 'bold', color: '#d84315', fontSize: '14pt', backgroundColor: '#fff3e0' }}>
              {monthName}
            </th>
          </tr>
          {/* Row 2: Day numbers */}
          <tr>
            {dayColumns.map(({ day, weekend, holiday }) => (
              <th
                key={day}
                className={weekend ? 'weekend-col' : holiday ? 'holiday-col' : ''}
                style={{
                  border: '1px solid #000',
                  padding: '1px',
                  textAlign: 'center',
                  fontSize: '10pt',
                  width: '18px',
                  backgroundColor: weekend ? '#e0e0e0' : holiday ? '#ffebee' : '#fff3e0',
                }}
              >
                {day}
              </th>
            ))}
          </tr>
          {/* Row 3: Day abbreviations */}
          <tr>
            <th style={{ border: '1px solid #000', padding: '1px', textAlign: 'center', fontSize: '10pt', backgroundColor: '#fff3e0' }}>
              วัน
            </th>
            {dayColumns.map(({ day, dayAbbr, weekend, holiday }) => (
              <th
                key={day}
                className={weekend ? 'weekend-col' : holiday ? 'holiday-col' : ''}
                style={{
                  border: '1px solid #000',
                  padding: '1px',
                  textAlign: 'center',
                  fontSize: '10pt',
                  backgroundColor: weekend ? '#e0e0e0' : holiday ? '#ffebee' : '#fff3e0',
                }}
              >
                {dayAbbr}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.id}>
              <td style={{ border: '1px solid #000', padding: '1px 4px', textAlign: 'center', fontSize: '12pt' }}>
                {index + 1}
              </td>
              <td style={{ border: '1px solid #000', padding: '1px 4px', fontSize: '12pt', whiteSpace: 'nowrap' }}>
                {student.titleTh}{student.firstNameTh} {student.lastNameTh}
              </td>
              <td style={{ border: '1px solid #000', padding: '1px', textAlign: 'center' }}></td>
              {dayColumns.map(({ day, weekend, holiday }) => {
                const dateStr = `${ceYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const key = `${student.id}_${dateStr}`;
                const status = attendanceData[key] || '';
                const isDisabled = weekend || !!holiday;

                return (
                  <td
                    key={day}
                    className={isDisabled ? (weekend ? 'weekend-col' : 'holiday-col') : ''}
                    style={{
                      border: '1px solid #000',
                      padding: '0',
                      textAlign: 'center',
                      fontSize: '12pt',
                      backgroundColor: weekend ? '#e0e0e0' : holiday ? '#ffebee' : undefined,
                      color: status === '/' ? '#2e7d32' :
                             status === 'ป' ? '#c62828' :
                             status === 'ล' ? '#1565c0' :
                             status === 'ข' ? '#e65100' : undefined,
                      fontWeight: status ? 'bold' : undefined,
                    }}
                  >
                    {status}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PP5AttendancePrint;
