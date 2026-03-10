
import React from 'react';
import type { Student } from '@/types/student';
import type { MonthSummary, StudentMonthAttendance, ReportType } from './PP5AttendanceHoursSummary';
import { getEmptyRowData } from '@/utils/pp5PrintUtils';
import { getSemesterMonths, getThaiMonthName } from '@/utils/thaiHolidays';

interface ThaiHoliday {
  date: Date;
  name: string;
}

interface PP5AttendanceHoursPrintProps {
  students: Student[];
  grade: string;
  academicYear: string;
  reportType: ReportType;
  monthSummaries: MonthSummary[];
  totalSchoolDays: number;
  minRequiredDays: number;
  attendanceData: Record<string, string>;
  holidays: ThaiHoliday[];
  getStudentMonthAttendance: (studentId: string, m: MonthSummary) => StudentMonthAttendance;
}

const PP5AttendanceHoursPrint: React.FC<PP5AttendanceHoursPrintProps> = ({
  students,
  grade,
  academicYear,
  reportType,
  monthSummaries,
  totalSchoolDays,
  minRequiredDays,
  attendanceData,
  holidays,
  getStudentMonthAttendance,
}) => {
  const gradeNum = grade.replace('ป.', '');

  const getTitle = () => {
    if (reportType === 'semester1') return `แบบสรุปเวลาเรียน ชั้นประถมศึกษาปีที่ ${gradeNum} ภาคเรียนที่ 1/${academicYear}`;
    if (reportType === 'semester2') return `แบบสรุปเวลาเรียน ชั้นประถมศึกษาปีที่ ${gradeNum} ภาคเรียนที่ 2/${academicYear}`;
    return `แบบสรุปเวลาเรียน ชั้นประถมศึกษาปีที่ ${gradeNum} ปีการศึกษา ${academicYear}`;
  };

  const getSubTitle = () => {
    if (reportType === 'fullYear') {
      return `เวลาเรียนตลอดปีการศึกษาจำนวน ${totalSchoolDays} วัน เวลาเรียนร้อยละ 80 คิดเป็นเวลาเรียนจริง ${minRequiredDays} วัน`;
    }
    return `เวลาเรียนตลอดภาคเรียนจำนวน ${totalSchoolDays} วัน เวลาเรียนร้อยละ 80 คิดเป็นเวลาเรียนจริง ${minRequiredDays} วัน`;
  };

  const renderSemesterReport = () => {
    const semLabel = reportType === 'semester1' ? 'รวมภาค 1' : 'รวมภาค 2';
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12pt', tableLayout: 'auto' }}>
        <thead>
          <tr>
            <th rowSpan={3} style={thStyle({ width: '25px' })}>ที่</th>
            <th rowSpan={3} style={thStyle({ width: '130px', textAlign: 'left' as const })}>ชื่อ - นามสกุล</th>
            <th rowSpan={2} style={thStyle({ width: '45px', fontSize: '9pt' })}>เวลาเรียน<br/>(วัน)</th>
            <th style={thStyle({ fontSize: '8pt', padding: '1px' })}>เดือน</th>
            {monthSummaries.map((m, i) => (
              <th key={i} colSpan={4} style={thStyle({ fontSize: '10pt', color: '#e65100' })}>
                {m.monthName}
              </th>
            ))}
            <th colSpan={5} rowSpan={1} style={thStyle({ fontSize: '10pt', color: '#2e7d32' })}>
              {semLabel}
            </th>
          </tr>
          <tr>
            <th style={thStyle({ fontSize: '8pt' })}>เวลาเรียน(วัน)</th>
            {monthSummaries.map((m, i) => (
              <th key={i} colSpan={4} style={thStyle({ fontSize: '9pt' })}>{m.schoolDays}</th>
            ))}
            <th style={thStyle({ fontSize: '9pt' })}>{totalSchoolDays}</th>
            <th colSpan={4} style={thStyle({ fontSize: '8pt' })}></th>
          </tr>
          <tr>
            <th style={thStyle({ fontSize: '8pt' })}></th>
            <th style={thStyle({ fontSize: '8pt' })}>สถานะ</th>
            {monthSummaries.map((_, i) => (
              <React.Fragment key={i}>
                <th style={subThStyle}>มา</th>
                <th style={subThStyle}>ป</th>
                <th style={subThStyle}>ล</th>
                <th style={subThStyle}>ข</th>
              </React.Fragment>
            ))}
            <th style={subThStyle}>มา</th>
            <th style={subThStyle}>ป</th>
            <th style={subThStyle}>ล</th>
            <th style={subThStyle}>ข</th>
            <th style={subThStyle}>%</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => {
            const monthData = monthSummaries.map(m => getStudentMonthAttendance(student.id, m));
            const totals = monthData.reduce((a, d) => ({
              present: a.present + d.present, sick: a.sick + d.sick,
              leave: a.leave + d.leave, absent: a.absent + d.absent,
            }), { present: 0, sick: 0, leave: 0, absent: 0 });
            const pct = totalSchoolDays > 0 ? ((totals.present / totalSchoolDays) * 100).toFixed(2) : '0.00';

            return (
              <tr key={student.id}>
                <td style={tdStyle({ textAlign: 'center' as const })}>{index + 1}</td>
                <td style={tdStyle({ whiteSpace: 'nowrap' as const })}>{student.titleTh}{student.firstNameTh} {student.lastNameTh}</td>
                <td style={tdStyle({ textAlign: 'center' as const, fontWeight: 'bold' })}>{totals.present}</td>
                <td style={tdStyle({ textAlign: 'center' as const })}></td>
                {monthData.map((d, i) => (
                  <React.Fragment key={i}>
                    <td style={tdStyle({ textAlign: 'center' as const, color: '#2e7d32' })}>{d.present || ''}</td>
                    <td style={tdStyle({ textAlign: 'center' as const, color: '#c62828' })}>{d.sick || ''}</td>
                    <td style={tdStyle({ textAlign: 'center' as const, color: '#1565c0' })}>{d.leave || ''}</td>
                    <td style={tdStyle({ textAlign: 'center' as const, color: '#e65100' })}>{d.absent || ''}</td>
                  </React.Fragment>
                ))}
                <td style={tdStyle({ textAlign: 'center' as const, color: '#2e7d32', fontWeight: 'bold' })}>{totals.present || ''}</td>
                <td style={tdStyle({ textAlign: 'center' as const, color: '#c62828' })}>{totals.sick || ''}</td>
                <td style={tdStyle({ textAlign: 'center' as const, color: '#1565c0' })}>{totals.leave || ''}</td>
                <td style={tdStyle({ textAlign: 'center' as const, color: '#e65100' })}>{totals.absent || ''}</td>
                <td style={tdStyle({ textAlign: 'center' as const, fontWeight: 'bold' })}>{pct}</td>
              </tr>
            );
          {/* Empty rows to fill A4 */}
          {Array.from({ length: getEmptyRowData(students.length).count }).map((_, i) => {
            const totalCols = 4 + monthSummaries.length * 4 + 5;
            return (
              <tr key={`empty-${i}`}>
                <td style={tdStyle({ textAlign: 'center' as const, color: '#ccc' })}>{students.length + i + 1}</td>
                <td style={tdStyle({ whiteSpace: 'nowrap' as const })}>&nbsp;</td>
                {Array.from({ length: totalCols - 2 }).map((_, j) => (
                  <td key={j} style={tdStyle({ textAlign: 'center' as const })}></td>
                ))}
              </tr>
            );
          })}
        </tbody>

  const renderFullYearReport = () => {
    const sem1Months = getSemesterMonths('1', academicYear);
    const sem2Months = getSemesterMonths('2', academicYear);

    const sem1Summaries = monthSummaries.filter((_, i) => i < sem1Months.length);
    const sem2Summaries = monthSummaries.filter((_, i) => i >= sem1Months.length);
    const sem1Total = sem1Summaries.reduce((s, m) => s + m.schoolDays, 0);
    const sem2Total = sem2Summaries.reduce((s, m) => s + m.schoolDays, 0);

    return (
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12pt', tableLayout: 'auto' }}>
        <thead>
          <tr>
            <th rowSpan={2} style={thStyle({ width: '25px' })}>ที่</th>
            <th rowSpan={2} style={thStyle({ width: '130px', textAlign: 'left' as const })}>ชื่อ - นามสกุล</th>
            <th rowSpan={2} style={thStyle({ width: '45px', fontSize: '9pt' })}>เวลาเรียน<br/>(วัน)</th>
            <th colSpan={5} style={thStyle({ fontSize: '10pt', color: '#e65100' })}>รวมภาค 1</th>
            <th colSpan={5} style={thStyle({ fontSize: '10pt', color: '#1565c0' })}>รวมภาค 2</th>
            <th colSpan={5} style={thStyle({ fontSize: '10pt', color: '#2e7d32' })}>รวมทั้งปี</th>
          </tr>
          <tr>
            {/* Sem 1 */}
            <th style={subThStyle}>{sem1Total}</th>
            <th style={subThStyle}>%</th>
            <th style={subThStyle}>มา</th>
            <th style={subThStyle}>ป</th>
            <th style={subThStyle}>ล</th>
            <th style={subThStyle}>ข</th>
            {/* Sem 2 */}
            <th style={subThStyle}>{sem2Total}</th>
            <th style={subThStyle}>%</th>
            <th style={subThStyle}>มา</th>
            <th style={subThStyle}>ป</th>
            <th style={subThStyle}>ล</th>
            <th style={subThStyle}>ข</th>
            {/* Full year */}
            <th style={subThStyle}>{totalSchoolDays}</th>
            <th style={subThStyle}>%</th>
            <th style={subThStyle}>มา</th>
            <th style={subThStyle}>ป</th>
            <th style={subThStyle}>ล</th>
            <th style={subThStyle}>ข</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => {
            const sem1Data = sem1Summaries.map(m => getStudentMonthAttendance(student.id, m));
            const sem2Data = sem2Summaries.map(m => getStudentMonthAttendance(student.id, m));

            const s1 = sem1Data.reduce((a, d) => ({ present: a.present + d.present, sick: a.sick + d.sick, leave: a.leave + d.leave, absent: a.absent + d.absent }), { present: 0, sick: 0, leave: 0, absent: 0 });
            const s2 = sem2Data.reduce((a, d) => ({ present: a.present + d.present, sick: a.sick + d.sick, leave: a.leave + d.leave, absent: a.absent + d.absent }), { present: 0, sick: 0, leave: 0, absent: 0 });
            const total = { present: s1.present + s2.present, sick: s1.sick + s2.sick, leave: s1.leave + s2.leave, absent: s1.absent + s2.absent };

            const s1Pct = sem1Total > 0 ? ((s1.present / sem1Total) * 100).toFixed(2) : '0.00';
            const s2Pct = sem2Total > 0 ? ((s2.present / sem2Total) * 100).toFixed(2) : '0.00';
            const totalPct = totalSchoolDays > 0 ? ((total.present / totalSchoolDays) * 100).toFixed(2) : '0.00';

            return (
              <tr key={student.id}>
                <td style={tdStyle({ textAlign: 'center' as const })}>{index + 1}</td>
                <td style={tdStyle({ whiteSpace: 'nowrap' as const })}>{student.titleTh}{student.firstNameTh} {student.lastNameTh}</td>
                <td style={tdStyle({ textAlign: 'center' as const, fontWeight: 'bold' })}>{total.present}</td>
                {/* Sem 1 */}
                <td style={tdStyle({ textAlign: 'center' as const, fontWeight: 'bold' })}>{s1.present}</td>
                <td style={tdStyle({ textAlign: 'center' as const })}>{s1Pct}</td>
                <td style={tdStyle({ textAlign: 'center' as const, color: '#2e7d32' })}>{s1.present || ''}</td>
                <td style={tdStyle({ textAlign: 'center' as const, color: '#c62828' })}>{s1.sick || ''}</td>
                <td style={tdStyle({ textAlign: 'center' as const, color: '#1565c0' })}>{s1.leave || ''}</td>
                <td style={tdStyle({ textAlign: 'center' as const, color: '#e65100' })}>{s1.absent || ''}</td>
                {/* Sem 2 */}
                <td style={tdStyle({ textAlign: 'center' as const, fontWeight: 'bold' })}>{s2.present}</td>
                <td style={tdStyle({ textAlign: 'center' as const })}>{s2Pct}</td>
                <td style={tdStyle({ textAlign: 'center' as const, color: '#2e7d32' })}>{s2.present || ''}</td>
                <td style={tdStyle({ textAlign: 'center' as const, color: '#c62828' })}>{s2.sick || ''}</td>
                <td style={tdStyle({ textAlign: 'center' as const, color: '#1565c0' })}>{s2.leave || ''}</td>
                <td style={tdStyle({ textAlign: 'center' as const, color: '#e65100' })}>{s2.absent || ''}</td>
                {/* Full year */}
                <td style={tdStyle({ textAlign: 'center' as const, fontWeight: 'bold' })}>{total.present}</td>
                <td style={tdStyle({ textAlign: 'center' as const })}>{totalPct}</td>
                <td style={tdStyle({ textAlign: 'center' as const, color: '#2e7d32' })}>{total.present || ''}</td>
                <td style={tdStyle({ textAlign: 'center' as const, color: '#c62828' })}>{total.sick || ''}</td>
                <td style={tdStyle({ textAlign: 'center' as const, color: '#1565c0' })}>{total.leave || ''}</td>
                <td style={tdStyle({ textAlign: 'center' as const, color: '#e65100' })}>{total.absent || ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div style={{ fontFamily: "'TH SarabunPSK', 'TH Sarabun', 'Sarabun', sans-serif", padding: '10mm' }}>
      <style>{`
        body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        @page { size: A4 portrait; margin: 10mm; }
        @media print {
          table, th, td { border: 1px solid #000 !important; border-collapse: collapse !important; }
          thead { display: table-header-group !important; }
          tr { page-break-inside: avoid !important; }
        }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: '6px' }}>
        <div style={{ fontSize: '16pt', fontWeight: 'bold', color: '#c62828' }}>โรงเรียนบ้านดอนมูล</div>
        <div style={{ fontSize: '14pt', fontWeight: 'bold', color: '#1565c0' }}>{getTitle()}</div>
        <div style={{ fontSize: '12pt', color: '#333' }}>{getSubTitle()}</div>
      </div>

      {reportType === 'fullYear' ? renderFullYearReport() : renderSemesterReport()}
    </div>
  );
};

// Helper styles
const thStyle = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  border: '1px solid #000',
  padding: '2px 3px',
  textAlign: 'center',
  backgroundColor: '#fff3e0',
  fontWeight: 'bold',
  fontSize: '10pt',
  ...extra,
});

const subThStyle: React.CSSProperties = {
  border: '1px solid #000',
  padding: '1px 2px',
  textAlign: 'center',
  backgroundColor: '#fff3e0',
  fontSize: '8pt',
  fontWeight: 'bold',
};

const tdStyle = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  border: '1px solid #000',
  padding: '1px 3px',
  fontSize: '12pt',
  ...extra,
});

export default PP5AttendanceHoursPrint;
