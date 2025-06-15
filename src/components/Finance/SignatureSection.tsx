
import React from "react";

interface SignatureSectionProps {
  payerName: string;
  teacherName: string;
  principalName: string;
}

const dottedLine = (
  <span className="inline-block border-b border-dotted min-w-[160px] mx-1 align-middle" />
);

const SignatureSection: React.FC<SignatureSectionProps> = ({
  payerName,
  teacherName,
  principalName,
}) => (
  <div>
    <div className="flex flex-row justify-between items-start gap-3 my-4">
      <div className="text-center w-1/3">
        <div>
          <span>ลงชื่อ</span>
          {dottedLine}
          <span>ผู้จ่ายเงิน</span>
        </div>
        <div>
          (
          <span className="inline-block min-w-[120px] mx-1 text-center">
            {payerName || "..............................."}
          </span>
          )
        </div>
      </div>
      <div className="text-center w-1/3">
        <div>
          <span>ลงชื่อ</span>
          {dottedLine}
          <span>ครูประจำชั้น</span>
        </div>
        <div>
          (
          <span className="inline-block min-w-[120px] mx-1 text-center">
            {teacherName || "..............................."}
          </span>
          )
        </div>
      </div>
    </div>
    <div className="text-center mt-2">
      <div>ตรวจสอบแล้วถูกต้อง</div>
      <div className="my-2">
        <span>ลงชื่อ</span>
        <span className="inline-block border-b border-dotted min-w-[160px] mx-1 align-middle"></span>
        <span>ผู้อำนวยการโรงเรียน</span>
      </div>
      <div>
        (
        <span className="inline-block min-w-[120px] mx-1 text-center">
          {principalName || "..............................."}
        </span>
        )
      </div>
    </div>
  </div>
);

export default SignatureSection;
