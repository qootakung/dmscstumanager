
import React from 'react';
import type { Student, ReportOptions } from '@/types/student';
import { getReportColumns, getReportTitle } from '@/utils/studentReportUtils';

interface StudentReportPrintableProps {
  students: Student[];
  reportOptions: ReportOptions;
}

const StudentReportPrintable = React.forwardRef<HTMLDivElement, StudentReportPrintableProps>(
  ({ students, reportOptions }, ref) => {
    const columns = getReportColumns(reportOptions);
    const reportTitle = getReportTitle(reportOptions);

    const maleCount = students.filter(s => s.gender === 'ชาย').length;
    const femaleCount = students.filter(s => s.gender === 'หญิง').length;
    const totalCount = students.length;

    const tableStyle: React.CSSProperties = {
      width: '100%',
      borderCollapse: 'collapse',
      border: '2px solid #000',
      fontSize: '14px',
      fontFamily: 'TH Sarabun, Sarabun, Arial, sans-serif'
    };

    const cellStyle: React.CSSProperties = {
      border: '1px solid #000',
      padding: '8px 4px',
      textAlign: 'left',
      verticalAlign: 'top'
    };

    const headerCellStyle: React.CSSProperties = {
      ...cellStyle,
      backgroundColor: '#f5f5f5',
      fontWeight: 'bold',
      textAlign: 'center',
      verticalAlign: 'middle'
    };

    const centerCellStyle: React.CSSProperties = {
      ...cellStyle,
      textAlign: 'center'
    };

    const getRowData = (student: Student, index: number) => {
      const baseData = [
        index + 1,
        student.studentId || '',
        `${student.titleTh || ''}${student.firstNameTh} ${student.lastNameTh}`
      ];

      if (reportOptions.reportType === '3') {
        // For "Other Registration Form", only show basic columns
        return baseData;
      }

      // For other report types, use existing logic
      const additionalData = [];
      if (reportOptions.additionalFields.gender) additionalData.push(student.gender === 'ชาย' ? 'ช' : 'ญ');
      if (reportOptions.additionalFields.citizenId) additionalData.push(student.citizenId || '');
      if (reportOptions.additionalFields.signature) additionalData.push('');
      if (reportOptions.additionalFields.guardianSignature) additionalData.push('');
      if (reportOptions.additionalFields.timeIn) additionalData.push('');
      if (reportOptions.additionalFields.timeOut) additionalData.push('');
      if (reportOptions.additionalFields.phone) additionalData.push(student.guardianPhone || '');

      const customData = Array(reportOptions.customColumns || 0).fill('');
      const noteData = reportOptions.additionalFields.note ? [''] : [];

      return [...baseData, ...additionalData, ...customData, ...noteData];
    };

    return (
      <div ref={ref} style={{ 
        padding: '20px',
        fontFamily: 'TH Sarabun, Sarabun, Arial, sans-serif',
        fontSize: '16px',
        lineHeight: '1.4',
        color: '#000'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {reportOptions.reportType === '3' && reportOptions.customColumn1?.trim() ? (
            <h1 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              margin: '0 0 8px 0'
            }}>
              {reportOptions.customColumn1}
            </h1>
          ) : (
            <h1 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              margin: '0 0 8px 0'
            }}>
              {reportTitle}
            </h1>
          )}
          
          {reportOptions.reportType === '3' && reportOptions.customColumn2?.trim() && (
            <p style={{ 
              fontSize: '16px', 
              margin: '0 0 8px 0'
            }}>
              {reportOptions.customColumn2}
            </p>
          )}
          
          <p style={{ 
            fontSize: '16px', 
            margin: '0 0 4px 0'
          }}>
            ปีการศึกษา {reportOptions.academicYear}
          </p>
          <p style={{ 
            fontSize: '16px', 
            margin: '0'
          }}>
            {reportOptions.classLevel === 'all' ? 'ทุกระดับชั้น' : `ระดับชั้น ${reportOptions.classLevel}`}
          </p>
        </div>

        {/* Summary */}
        <div style={{ marginBottom: '16px', fontSize: '14px' }}>
          <span>จำนวนเพศชาย {maleCount} คน </span>
          <span>เพศหญิง {femaleCount} คน </span>
          <span>รวม {totalCount} คน</span>
        </div>

        {/* Table */}
        <table style={tableStyle}>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index} style={headerCellStyle}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => {
              const rowData = getRowData(student, index);
              return (
                <tr key={student.id}>
                  {rowData.map((data, cellIndex) => (
                    <td
                      key={cellIndex}
                      style={cellIndex === 0 || cellIndex === 1 ? centerCellStyle : cellStyle}
                    >
                      {data}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer space for signatures if needed */}
        <div style={{ marginTop: '40px', height: '100px' }}></div>
      </div>
    );
  }
);

StudentReportPrintable.displayName = 'StudentReportPrintable';

export default StudentReportPrintable;
