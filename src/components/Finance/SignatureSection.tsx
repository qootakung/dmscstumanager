
import React from "react";

interface SignatureSectionProps {
  payerName: string;
  teacherName: string;
  principalName: string;
}

const signatureLineStyle: React.CSSProperties = {
  display: 'inline-block',
  borderBottom: '1px dotted black',
  width: '120px',
  margin: '0 4px',
  verticalAlign: 'middle'
};

const nameStyle: React.CSSProperties = {
  display: 'inline-block',
  width: '140px',
  margin: '0 2px',
  textAlign: 'center',
  fontSize: '10px'
};

const SignatureSection: React.FC<SignatureSectionProps> = ({
  payerName,
  teacherName,
  principalName,
}) => (
  <div style={{ marginTop: '12px' }}>
    {/* Row 1: Payer, Teacher, and Principal signatures in one row */}
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start',
      gap: '8px',
      marginBottom: '8px'
    }}>
      {/* Payer */}
      <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{ fontSize: '10px' }}>
          <span>ลงชื่อ</span>
          <span style={signatureLineStyle}></span>
          <span>ผู้จ่ายเงิน</span>
        </div>
        <div style={{ marginTop: '4px', fontSize: '10px' }}>
          (<span style={nameStyle}>{payerName || ".............................."}</span>)
        </div>
      </div>
      
      {/* Teacher */}
      <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{ fontSize: '10px' }}>
          <span>ลงชื่อ</span>
          <span style={signatureLineStyle}></span>
          <span>ครูประจำชั้น</span>
        </div>
        <div style={{ marginTop: '4px', fontSize: '10px' }}>
          (<span style={nameStyle}>{teacherName || ".............................."}</span>)
        </div>
      </div>

      {/* Principal - moved to same row */}
      <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{ fontSize: '10px', marginBottom: '2px' }}>ตรวจสอบแล้วถูกต้อง</div>
        <div style={{ fontSize: '10px' }}>
          <span>ลงชื่อ</span>
          <span style={signatureLineStyle}></span>
          <span>ผู้อำนวยการ</span>
        </div>
        <div style={{ marginTop: '4px', fontSize: '10px' }}>
          (<span style={nameStyle}>{principalName || ".............................."}</span>)
        </div>
      </div>
    </div>
  </div>
);

export default SignatureSection;
