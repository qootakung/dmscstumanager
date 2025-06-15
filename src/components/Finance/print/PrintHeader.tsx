
import React from 'react';

interface PrintHeaderProps {
  semester: string;
  academicYear: string;
}

const PrintHeader: React.FC<PrintHeaderProps> = ({ semester, academicYear }) => (
  <>
    <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "20px", marginBottom: "8px" }}>แบบหลักฐานการจ่ายเงิน</div>
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <span>ภาคเรียนที่</span>
      <span style={{
        display: "inline-block",
        borderBottom: "1px dotted #000",
        width: 56,
        textAlign: "center"
      }}>{semester}</span>
      <span style={{ marginLeft: "16px" }}>ปีการศึกษา</span>
      <span style={{
        display: "inline-block",
        borderBottom: "1px dotted #000",
        width: 80,
        textAlign: "center"
      }}>{academicYear}</span>
    </div>
  </>
);

export default PrintHeader;
