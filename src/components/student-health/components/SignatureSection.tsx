
import React from 'react';
import { Teacher } from '@/types/teacher';

interface SignatureSectionProps {
  teacher?: Teacher;
}

const SignatureSection: React.FC<SignatureSectionProps> = ({ teacher }) => {
  return (
    <div className="text-right mt-4 signature-section">
      <div className="signature-dots">
        ...............................................................<br/>
        ( นายฐปนนท์ สีวิจี๋ )<br/>
        ตำแหน่ง ครู วิทยฐานะครูชำนาญการพิเศษ
      </div>
    </div>
  );
};

export default SignatureSection;
