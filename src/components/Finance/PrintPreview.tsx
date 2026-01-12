import React from "react";
import { Check } from "lucide-react";
import type { Student } from "@/types/student";
import type { Teacher } from "@/types/teacher";
import PaymentOptionCheckbox from "./PaymentOptionCheckbox";
import SignatureSection from "./SignatureSection";
import GradeLevelRow from "./GradeLevelRow";
import StudentTable from "./StudentTable";
import type { PaymentVoucherData } from "@/types/finance";

interface PrintPreviewProps {
  voucherData: PaymentVoucherData;
  paymentOptions: string[];
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ voucherData, paymentOptions }) => {
  // Utility function to check which group/row grade belongs to
  const selectedGrade = voucherData.grade;

  // ปรับ logic เลือกช่องกรอก/เช็คถูกอัตโนมัติ
  // Map ห้องเรียนกับชื่อ label
  const levels = [
    { key: "อนุบาล", label: "อนุบาลปีที่", grades: ["อนุบาล 1", "อนุบาล 2", "อนุบาล 3"] },
    { key: "ประถม", label: "ประถมศึกษาปีที่", grades: ["ป.1", "ป.2", "ป.3", "ป.4", "ป.5", "ป.6"] },
    { key: "มัธยม", label: "มัธยมศึกษาปีที่", grades: ["ม.1", "ม.2", "ม.3"] },
    { key: "ปวช", label: "ปวช. ที่จัดโดยสถานประกอบการ ปีที่", grades: ["ปวช.1", "ปวช.2", "ปวช.3"] },
  ];
  // คำนวณ level และชั้นปีที่เลือก
  const findLevelMatch = () => {
    for (const level of levels) {
      if (level.grades.includes(selectedGrade)) {
        // ตัดเฉพาะตัวเลขท้ายชื่อ เช่น ป.4 => "4", อนุบาล 2 => "2"
        let gradeNumber = "";
        const match = selectedGrade.match(/(\d+)$/);
        if (match) gradeNumber = match[1];
        return { ...level, selectedGrade, gradeNumber };
      }
    }
    return null;
  };
  const selectedLevel = findLevelMatch();

  return (
    <div
      className="max-h-[70vh] overflow-y-auto bg-white shadow p-6 rounded text-base"
      style={{ fontFamily: "Sarabun, Arial, sans-serif" }}
    >
      {/* ฟอร์มหัวข้อ */}
      <div className="mb-3 flex flex-col items-center">
        {/* ชื่อฟอร์ม */}
        <div className="font-bold tracking-wide text-lg text-blue-900 mb-2 mt-4">
          แบบหลักฐานการจ่ายเงิน
        </div>
        {/* ภาคเรียนที่ / ปีการศึกษา */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <span>ภาคเรียนที่</span>
          <span className="inline-block border-b border-dotted w-20 text-center">
            {voucherData.semester}
          </span>
          <span>ปีการศึกษา</span>
          <span className="inline-block border-b border-dotted w-28 text-center">
            {voucherData.academicYear}
          </span>
        </div>
        {/* Checkbox 2 คอลัมน์ x 2 แถว + ช่องค่าจัดการเรียนการสอน */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2 mb-1 w-full max-w-2xl">
          {paymentOptions.slice(0, 4).map((option, i) => (
            <PaymentOptionCheckbox
              key={option}
              label={option}
              checked={voucherData.paymentTypes.includes(option)}
              size="large"
            />
          ))}
          {/* ช่อง "ค่าจัดการเรียนการสอน (ปัจจัยพื้นฐานสำหรับการรับนักเรียนยากจน)" แบบเหมือนช่องอื่น */}
          {paymentOptions[4] && (
            <PaymentOptionCheckbox
              key={paymentOptions[4]}
              label={paymentOptions[4]}
              checked={voucherData.paymentTypes.includes(paymentOptions[4])}
              className="col-span-2"
              size="large"
            />
          )}
        </div>
        {/* เส้นคั่น --- */}
        <div className="w-full border-b border-dashed border-black my-2"></div>
      </div>
      {/* ข้อมูลระดับชั้น */}
      <GradeLevelRow students={voucherData.students} />

      {/* จำนวนนักเรียน */}
      <div className="mb-2">
        <span>นักเรียนจำนวนทั้งสิ้น</span>
        <span className="inline-block border-b border-dotted w-10 mx-1 text-center">
          {voucherData.students.length}
        </span>
        <span>คน ได้รับเงินจากโรงเรียนบ้านดอนมูล</span>
      </div>
      {/* แก้ไขข้อความสังกัด */}
      <div>
        <span>
          สังกัดสำนักงานเขตพื้นที่การศึกษาประถมศึกษาลำพูนเขต 2 <br />
          ข้าพเจ้าขอรับรองว่าเงินที่ได้รับไปได้นำไปตามวัตถุประสงค์ของทางราชการ หากไม่ดำเนินการดังกล่าวข้าพเจ้ายินยอมชดใช้เงินคืนให้กับโรงเรียนต่อไป
        </span>
      </div>
      {/* ตารางข้อมูลนักเรียน */}
      <StudentTable
        students={voucherData.students}
        amountPerStudent={voucherData.amountPerStudent}
        paymentDate={voucherData.paymentDate}
      />
      {/* ลายเซ็นแบบใหม่ */}
      <SignatureSection
        payerName={voucherData.payerName}
        teacherName={
          voucherData.selectedTeacher
            ? `${voucherData.selectedTeacher.firstName} ${voucherData.selectedTeacher.lastName}`
            : ""
        }
        principalName={voucherData.principalName}
      />
    </div>
  );
};

export default PrintPreview;
