
import React from "react";
import type { Student } from "@/types/student";

interface StudentTableProps {
  students: Student[];
  amountPerStudent: string;
  paymentDate: string;
}

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px",
  marginBottom: "12px",
};

const cellStyle: React.CSSProperties = {
  border: "1px solid black",
  padding: "4px 8px",
  textAlign: "left",
  verticalAlign: "top",
};

const thStyle: React.CSSProperties = {
  ...cellStyle,
  textAlign: "center",
  fontWeight: "bold",
  verticalAlign: "middle",
  backgroundColor: "#f0f0f0",
};

const centerCellStyle: React.CSSProperties = {
  ...cellStyle,
  textAlign: "center",
};

const rightCellStyle: React.CSSProperties = {
  ...cellStyle,
  textAlign: "right",
};

const nameCellStyle: React.CSSProperties = {
  ...cellStyle,
  whiteSpace: 'nowrap',
};

const StudentTable: React.FC<StudentTableProps> = ({ students, amountPerStudent, paymentDate }) => {
  // Display at least 15 rows
  const emptyRowCount = Math.max(0, 15 - students.length);
  const amount = parseFloat(amountPerStudent) || 0;
  const totalAmount = amount * students.length;

  const formatCurrency = (num: number) => {
    if (num === 0) return '';
    return num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: "30px" }}>ที่</th>
            <th style={thStyle}>ชื่อ - สกุลนักเรียน</th>
            <th style={{ ...thStyle, width: "150px" }}>หมายเลขประจำตัว<br />ประชาชน 13 หลัก</th>
            <th style={{ ...thStyle, width: "80px" }}>จำนวนเงิน<br />(บาท)</th>
            <th style={{ ...thStyle, width: "80px" }}>วันที่รับเงิน</th>
            <th style={{ ...thStyle, width: "100px" }}>ลายมือชื่อ<br />ผู้ปกครอง/<br />นักเรียน</th>
            <th style={{ ...thStyle, width: "80px" }}>หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.id || index}>
              <td style={centerCellStyle}>{index + 1}</td>
              <td style={nameCellStyle}>{student.titleTh || ''} {student.firstNameTh} {student.lastNameTh}</td>
              <td style={centerCellStyle}>{student.citizenId || ''}</td>
              <td style={rightCellStyle}>{formatCurrency(amount)}</td>
              <td style={centerCellStyle}>{paymentDate}</td>
              <td style={cellStyle}></td>
              <td style={cellStyle}></td>
            </tr>
          ))}
          {[...Array(emptyRowCount)].map((_, idx) => (
            <tr key={`empty-${idx}`} style={{ height: '36px' }}>
              <td style={centerCellStyle}>{students.length + idx + 1}</td>
              <td style={cellStyle}></td>
              <td style={cellStyle}></td>
              <td style={rightCellStyle}></td>
              <td style={cellStyle}></td>
              <td style={cellStyle}></td>
              <td style={cellStyle}></td>
            </tr>
          ))}
          <tr>
            <td colSpan={3} style={{ ...thStyle, textAlign: 'center' }}>รวมทั้งสิ้น</td>
            <td style={{...thStyle, textAlign: 'right'}}>{formatCurrency(totalAmount)}</td>
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
