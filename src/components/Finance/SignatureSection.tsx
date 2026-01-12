
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
  <div style={{ marginTop: '8px' }}>
    {/* Row 1: Payer and Teacher signatures */}
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      justifyContent: 'space-around', 
      alignItems: 'flex-start',
      marginBottom: '8px'
    }}>
      {/* Payer */}
      <div style={{ textAlign: 'center' }}>
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
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '10px' }}>
          <span>ลงชื่อ</span>
          <span style={signatureLineStyle}></span>
          <span>ครูประจำชั้น</span>
        </div>
        <div style={{ marginTop: '4px', fontSize: '10px' }}>
          (<span style={nameStyle}>{teacherName || ".............................."}</span>)
        </div>
      </div>
    </div>

    {/* Row 2: Principal signature at bottom center */}
    <div style={{ textAlign: 'center', marginTop: '12px' }}>
      <div style={{ fontSize: '10px', marginBottom: '4px' }}>ตรวจสอบแล้วถูกต้อง</div>
      <div style={{ fontSize: '10px' }}>
        <span>ลงชื่อ</span>
        <span style={signatureLineStyle}></span>
        <span>ผู้อำนวยการโรงเรียน</span>
      </div>
      <div style={{ marginTop: '4px', fontSize: '10px' }}>
        (<span style={nameStyle}>{principalName || ".............................."}</span>)
      </div>
    </div>
  </div>
);

export default SignatureSection;
