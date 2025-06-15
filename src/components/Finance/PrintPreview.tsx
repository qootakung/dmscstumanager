import React from "react";
import { Check } from "lucide-react";
import type { Student } from "@/types/student";
import type { Teacher } from "@/types/teacher";
import PaymentOptionCheckbox from "./PaymentOptionCheckbox";
import SignatureSection from "./SignatureSection";

interface PrintPreviewProps {
  voucherData: {
    paymentTypes: string[];
    academicYear: string;
    semester: string;
    grade: string;
    students: Student[];
    schoolName: string;
    principalName: string;
    managerName: string;
    selectedTeacher: Teacher | null;
    payerName: string;
  };
  paymentOptions: string[];
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ voucherData, paymentOptions }) => {
  // Utility function to check which group/row grade belongs to
  const selectedGrade = voucherData.grade;

  // ปรับ logic เลือกช่องกรอก/เช็คถูกอัตโนมัติ
  // Map ห้องเรียนกับชื่อ label
  const levels = [
    {
      key: "อนุบาล",
      label: "อนุบาลปีที่",
      grades: ["อนุบาล 1", "อนุบาล 2", "อนุบาล 3"],
    },
    {
      key: "ประถม",
      label: "ประถมศึกษาปีที่",
      grades: ["ป.1", "ป.2", "ป.3", "ป.4", "ป.5", "ป.6"],
    },
    {
      key: "มัธยม",
      label: "มัธยมศึกษาปีที่",
      grades: ["ม.1", "ม.2", "ม.3"],
    },
    {
      key: "ปวช",
      label: "ปวช. ที่จัดโดยสถานประกอบการ ปีที่",
      grades: ["ปวช.1", "ปวช.2", "ปวช.3"],
    },
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
        <div className="relative flex flex-col items-center w-full">
          {/* ชื่อฟอร์ม */}
          <div className="font-bold tracking-wide text-lg text-blue-900 mb-2 mt-4">
            แบบหลักฐานการจ่ายเงิน
          </div>
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
            />
          ))}
          {/* ช่อง "ค่าจัดการเรียนการสอน (ปัจจัยพื้นฐานสำหรับการรับนักเรียนยากจน)" แบบเหมือนช่องอื่น */}
          {paymentOptions[4] && (
            <PaymentOptionCheckbox
              key={paymentOptions[4]}
              label={paymentOptions[4]}
              checked={voucherData.paymentTypes.includes(paymentOptions[4])}
              className="col-span-2"
            />
          )}
        </div>
        {/* เส้นคั่น --- */}
        <div className="w-full border-b border-dashed border-black my-2"></div>
      </div>
      {/* ข้อมูลระดับชั้น */}
      <div className="mb-2">
        <div className="flex items-center gap-4 mb-1">
          {/* อนุบาล */}
          <div className="flex items-center mr-4">
            <PaymentOptionCheckbox
              checked={selectedLevel?.key === "อนุบาล"}
              hideLabel
              boldCheck
              size="large"
              className="mr-1"
            />
            <span>อนุบาลปีที่</span>
            <span className="inline-block border-b border-dotted w-12 mx-1 text-center">
              {selectedLevel?.key === "อนุบาล" ? selectedLevel.gradeNumber : ""}
            </span>
          </div>
          {/* ประถม */}
          <div className="flex items-center">
            <PaymentOptionCheckbox
              checked={selectedLevel?.key === "ประถม"}
              hideLabel
              boldCheck
              size="large"
              className="mr-1"
            />
            <span>ประถมศึกษาปีที่</span>
            <span className="inline-block border-b border-dotted w-12 mx-1 text-center">
              {selectedLevel?.key === "ประถม" ? selectedLevel.gradeNumber : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-1">
          {/* มัธยม */}
          <div className="flex items-center mr-4">
            <PaymentOptionCheckbox
              checked={selectedLevel?.key === "มัธยม"}
              hideLabel
              boldCheck
              size="large"
              className="mr-1"
            />
            <span>มัธยมศึกษาปีที่</span>
            <span className="inline-block border-b border-dotted w-12 mx-1 text-center">
              {selectedLevel?.key === "มัธยม" ? selectedLevel.gradeNumber : ""}
            </span>
          </div>
          {/* ปวช */}
          <div className="flex items-center">
            <PaymentOptionCheckbox
              checked={selectedLevel?.key === "ปวช"}
              hideLabel
              boldCheck
              size="large"
              className="mr-1"
            />
            <span>ปวช. ที่จัดโดยสถานประกอบการ ปีที่</span>
            <span className="inline-block border-b border-dotted w-12 mx-1 text-center">
              {selectedLevel?.key === "ปวช" ? selectedLevel.gradeNumber : ""}
            </span>
          </div>
        </div>
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
      </div>
      {/* ตารางข้อมูลนักเรียน */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs mb-3">
          <thead>
            <tr>
              <th className="border px-2 py-1">ที่</th>
              <th className="border px-2 py-1">ชื่อ - สกุลนักเรียน</th>
              <th className="border px-2 py-1">หมายเลขประจำตัว<br />ประชาชน 13 หลัก</th>
              <th className="border px-2 py-1">จำนวนเงิน<br />(บาท)</th>
              <th className="border px-2 py-1">วันที่รับเงิน</th>
              <th className="border px-2 py-1">ลายมือชื่อ<br />ผู้ปกครอง/<br />นักเรียน</th>
              <th className="border px-2 py-1">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {voucherData.students.map((student, index) => (
              <tr key={student.id || index}>
                <td className="border px-2 py-1">{index + 1}</td>
                <td className="border px-2 py-1">{student.titleTh || ''} {student.firstNameTh} {student.lastNameTh}</td>
                <td className="border px-2 py-1">{student.citizenId || ''}</td>
                <td className="border px-2 py-1"></td>
                <td className="border px-2 py-1"></td>
                <td className="border px-2 py-1"></td>
                <td className="border px-2 py-1"></td>
              </tr>
            ))}
            {[...Array(Math.max(0, 15 - voucherData.students.length))].map((_, idx) => (
              <tr key={`empty-${idx}`}>
                <td className="border px-2 py-1">{voucherData.students.length + idx + 1}</td>
                <td className="border px-2 py-1"></td>
                <td className="border px-2 py-1"></td>
                <td className="border px-2 py-1"></td>
                <td className="border px-2 py-1"></td>
                <td className="border px-2 py-1"></td>
                <td className="border px-2 py-1"></td>
              </tr>
            ))}
            <tr>
              <td colSpan={3} className="border px-2 py-1 font-bold text-center">รวมทั้งสิ้น</td>
              <td className="border px-2 py-1"></td>
              <td className="border px-2 py-1"></td>
              <td className="border px-2 py-1"></td>
              <td className="border px-2 py-1"></td>
            </tr>
          </tbody>
        </table>
      </div>
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
