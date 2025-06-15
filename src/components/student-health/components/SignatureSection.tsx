
import React from 'react';
import { Teacher } from '@/types/teacher';

interface SignatureSectionProps {
  teacher?: Teacher;
}

const SignatureSection: React.FC<SignatureSectionProps> = ({ teacher }) => {
  return (
    <div className="text-right mt-4 signature-section">
      <div className="signature-dots">
        ( นายธุปนนท์ ศรีสู่ )<br/>
        <div className="signature-name">
          <div style={{ marginTop: '8px' }}>
            ตำแหน่งครู วิทยฐานะครูชำนาญการพิเศษ
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureSection;
