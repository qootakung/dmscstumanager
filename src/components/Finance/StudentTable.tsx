import React from "react";
import type { Student } from "@/types/student";

interface StudentTableProps {
  students: Student[];
  amountPerStudent: string;
  paymentDate: string;
  isFirstPage?: boolean;
  startIndex?: number;
}

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "15px",
  marginBottom: "12px",
};

const cellStyle: React.CSSProperties = {
  border: "1px solid #000000",
  padding: "4px 6px",
  textAlign: "left",
  verticalAlign: "top",
  lineHeight: "1.3",
};

const thStyle: React.CSSProperties = {
  ...cellStyle,
  textAlign: "center",
  fontWeight: "bold",
  verticalAlign: "middle",
  backgroundColor: "#f0f0f0",
  fontSize: "14px",
  padding: "4px 6px",
  border: "1px solid #000000",
};

const centerCellStyle: React.CSSProperties = {
  ...cellStyle,
  textAlign: "center",
  border: "1px solid #000000",
};

const rightCellStyle: React.CSSProperties = {
  ...cellStyle,
  textAlign: "right",
  border: "1px solid #000000",
};

const nameCellStyle: React.CSSProperties = {
  ...cellStyle,
  whiteSpace: 'nowrap',
  fontSize: "14px",
  border: "1px solid #000000",
};

const totalRowStyle: React.CSSProperties = {
  ...thStyle,
  fontSize: "15px",
  fontWeight: "bold",
  height: "32px",
  lineHeight: "1.2",
  border: "1px solid #000000",
};

const StudentTable: React.FC<StudentTableProps> = ({ 
  students, 
  amountPerStudent, 
  paymentDate,
  isFirstPage = true,
  startIndex = 0
}) => {
  const studentsPerPage = 15;
  const pageStudents = students.slice(startIndex, startIndex + studentsPerPage);
  
  const emptyRowCount = Math.max(0, studentsPerPage - pageStudents.length);
  const amount = parseFloat(amountPerStudent) || 0;
  
  const pageTotal = amount * pageStudents.length;

  const formatCurrency = (num: number) => {
    if (num === 0) return '';
    return num.toLocaleString('th-TH', { maximumFractionDigits: 2 });
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: "25px" }}>ที่</th>
            <th style={{ ...thStyle, width: "100px" }}>ชื่อ - สกุลนักเรียน</th>
            <th style={{ ...thStyle, width: "120px" }}>เลขประจำตัว<br />ประชาชน</th>
            <th style={{ ...thStyle, width: "70px" }}>จำนวนเงิน<br />(บาท)</th>
            <th style={{ ...thStyle, width: "110px" }}>วันที่รับเงิน</th>
            <th style={{ ...thStyle, width: "140px" }}>ลายมือชื่อ<br />ผู้รับเงิน</th>
            <th style={{ ...thStyle, width: "60px" }}>หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          {pageStudents.map((student, index) => (
            <tr key={student.id || index} style={{ height: '32px' }}>
              <td style={centerCellStyle}>{startIndex + index + 1}</td>
              <td style={nameCellStyle}>
                {student.titleTh || ''} {student.firstNameTh} {student.lastNameTh}
              </td>
              <td style={centerCellStyle}>{student.citizenId || ''}</td>
              <td style={rightCellStyle}>{formatCurrency(amount)}</td>
              <td style={centerCellStyle}>{paymentDate}</td>
              <td style={cellStyle}></td>
              <td style={cellStyle}></td>
            </tr>
          ))}
          {[...Array(emptyRowCount)].map((_, idx) => (
            <tr key={`empty-${idx}`} style={{ height: '32px' }}>
              <td style={centerCellStyle}>{startIndex + pageStudents.length + idx + 1}</td>
              <td style={cellStyle}></td>
              <td style={cellStyle}></td>
              <td style={rightCellStyle}></td>
              <td style={cellStyle}></td>
              <td style={cellStyle}></td>
              <td style={cellStyle}></td>
            </tr>
          ))}
          <tr>
            <td colSpan={3} style={{ ...totalRowStyle, textAlign: 'center' }}>
              {isFirstPage && students.length <= studentsPerPage ? 'รวมทั้งสิ้น' : 'รวมหน้านี้'}
            </td>
            <td style={{...totalRowStyle, textAlign: 'right'}}>{formatCurrency(pageTotal)}</td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
