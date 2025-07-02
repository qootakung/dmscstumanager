
import React from "react";

interface SignatureSectionProps {
  payerName: string;
  teacherName: string;
  principalName: string;
}

const signatureLineStyle: React.CSSProperties = {
  display: 'inline-block',
  borderBottom: '1px dotted black',
  width: '200px',
  margin: '0 8px',
  verticalAlign: 'middle'
};

const nameStyle: React.CSSProperties = {
  display: 'inline-block',
  width: '240px',
  margin: '0 4px',
  textAlign: 'center'
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
  margin: '24px 0 12px 0'
};

const signatureBoxStyle: React.CSSProperties = {
  textAlign: 'center',
};

const SignatureSection: React.FC<SignatureSectionProps> = ({
  payerName,
  teacherName,
  principalName,
}) => (
  <div style={{ marginTop: '24px' }}>
    <div style={containerStyle}>
      <div style={signatureBoxStyle}>
        <div>
          <span>ลงชื่อ</span>
          <span style={signatureLineStyle}></span>
          <span>ผู้จ่ายเงิน</span>
        </div>
        <div style={{ marginTop: '8px' }}>
          (
          <span style={nameStyle}>
            {payerName || "........................................"}
          </span>
          )
        </div>
      </div>
      <div style={signatureBoxStyle}>
        <div>
          <span>ลงชื่อ</span>
          <span style={signatureLineStyle}></span>
          <span>ครูประจำชั้น</span>
        </div>
        <div style={{ marginTop: '8px' }}>
          (
          <span style={nameStyle}>
            {teacherName || "........................................"}
          </span>
          )
        </div>
      </div>
    </div>
    <div style={{ textAlign: 'center', marginTop: '48px' }}> 
      <div style={{ marginBottom: '8px' }}>ตรวจสอบแล้วถูกต้อง</div>
      <div>
        <span>ลงชื่อ</span>
        <span style={signatureLineStyle}></span>
        <span>ผู้อำนวยการโรงเรียน</span>
      </div>
      <div style={{ marginTop: '8px' }}>
        (
        <span style={nameStyle}>
          {principalName || "........................................"}
        </span>
        )
      </div>
    </div>
  </div>
);

export default SignatureSection;
