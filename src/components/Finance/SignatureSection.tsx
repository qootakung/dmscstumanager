
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
  <div style={{ marginTop: '8px' }}>
    {/* Row 1: Payer and Teacher signatures */}
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start',
      marginBottom: '8px',
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
    <div style={{ textAlign: 'center', marginTop: '12px' }}>
      <div style={{ fontSize: '10px', marginBottom: '4px' }}>ตรวจสอบแล้วถูกต้อง</div>
      <div style={{ height: '20px' }}></div>
      <div style={{ fontSize: '10px' }}>
        <span>ลงชื่อ</span>
        <span>..............................................</span>
        <span>ผู้อำนวยการโรงเรียน</span>
      </div>
      <div style={{ marginTop: '4px', fontSize: '10px' }}>
        ({principalName || "........................................"})
      </div>
    </div>
  </div>
);

export default SignatureSection;
