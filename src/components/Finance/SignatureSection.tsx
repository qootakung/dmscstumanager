
import React from "react";

interface SignatureSectionProps {
  payerName: string;
  teacherName: string;
  principalName: string;
}

const SignatureSection: React.FC<SignatureSectionProps> = ({
  payerName,
  teacherName,
  principalName,
}) => (
<div style={{ marginTop: '16px' }}>
    {/* Row 1: Payer and Teacher signatures */}
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start',
      marginBottom: '16px',
      padding: '0 20px'
    }}>
      {/* Payer */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '10px' }}>
          <span>ลงชื่อ</span>
          <span>..............................................</span>
          <span>ผู้จ่ายเงิน</span>
        </div>
        <div style={{ marginTop: '4px', fontSize: '10px' }}>
          ({payerName || "........................................"})
        </div>
      </div>
      
      {/* Teacher */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '10px' }}>
          <span>ลงชื่อครู</span>
          <span>..............................................</span>
          <span>ประจำชั้น</span>
        </div>
        <div style={{ marginTop: '4px', fontSize: '10px' }}>
          ({teacherName || "........................................"})
        </div>
      </div>
    </div>

    {/* Row 2: Principal signature at bottom center */}
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <div style={{ fontSize: '10px', marginBottom: '16px', lineHeight: '1.6' }}>ตรวจสอบแล้วถูกต้อง</div>
      <div style={{ fontSize: '10px', lineHeight: '1.6' }}>
        <span>ลงชื่อ</span>
        <span>............................................................</span>
        <span>ผู้อำนวยการโรงเรียน</span>
      </div>
      <div style={{ marginTop: '4px', fontSize: '10px', lineHeight: '1.6' }}>
        ({principalName || "........................................"})
      </div>
    </div>
  </div>
);

export default SignatureSection;
