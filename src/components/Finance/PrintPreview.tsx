
import React from "react";
import { Check } from "lucide-react";
import type { Student } from "@/types/student";
import type { Teacher } from "@/types/teacher";

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

const PrintPreview: React.FC<PrintPreviewProps> = ({ voucherData, paymentOptions }) => (
  <div
    className="max-h-[70vh] overflow-y-auto bg-white shadow p-6 rounded text-base"
    style={{ fontFamily: "Sarabun, Arial, sans-serif" }}
  >
    {/* ฟอร์มหัวข้อ */}
    <div className="mb-3 flex flex-col items-center">
      <div className="relative flex flex-col items-center w-full">
        {/* ลบกล่องส้มออก */}
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
      {/* Checkbox 2 คอลัมน์ x 2 แถว */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2 mb-1 w-full max-w-2xl">
        {paymentOptions.slice(0, 4).map((option, i) => (
          <div className="flex items-center gap-2" key={option}>
            <span
              className="inline-block border w-4 h-4 mr-1 align-middle flex items-center justify-center"
            >
              {voucherData.paymentTypes.includes(option) && (
                <Check className="w-3 h-3 text-black" />
              )}
            </span>
            <span>{option}</span>
          </div>
        ))}
        {paymentOptions[4] && (
          <div className="flex items-center gap-2 col-span-2">
            <span
              className="inline-block border w-4 h-4 mr-1 align-middle flex items-center justify-center"
            >
              {voucherData.paymentTypes.includes(paymentOptions[4]) && (
                <Check className="w-3 h-3 text-black" />
              )}
            </span>
            <span>{paymentOptions[4]}</span>
          </div>
        )}
      </div>
      {/* เส้นคั่น --- */}
      <div className="w-full border-b border-dashed border-black my-2"></div>
    </div>
    {/* ข้อมูลระดับชั้น */}
    <div className="mb-2">
      <div className="flex items-center gap-4 mb-1">
        <div className="flex items-center mr-4">
          <span className="inline-block border w-4 h-4 mx-1 align-middle" />
          <span>อนุบาลปีที่</span>
          <span className="inline-block border-b border-dotted w-10 mx-1"></span>
        </div>
        <div className="flex items-center">
          <span className="inline-block border w-4 h-4 mx-1 align-middle" />
          <span>ประถมศึกษาปีที่</span>
          <span className="inline-block border-b border-dotted w-10 mx-1"></span>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-1">
        <div className="flex items-center mr-4">
          <span className="inline-block border w-4 h-4 mx-1 align-middle" />
          <span>มัธยมศึกษาปีที่</span>
          <span className="inline-block border-b border-dotted w-10 mx-1"></span>
        </div>
        <div className="flex items-center">
          <span className="inline-block border w-4 h-4 mx-1 align-middle" />
          <span>ปวช. ที่จัดโดยสถานประกอบการ ปีที่</span>
          <span className="inline-block border-b border-dotted w-10 mx-1"></span>
        </div>
      </div>
      {/* จำนวนนักเรียน */}
      <div className="mb-2">
        <span>นักเรียนจำนวนทั้งสิ้น</span>
        <span className="inline-block border-b border-dotted w-10 mx-1 text-center">{
          voucherData.students.length
        }</span>
        <span>คน ได้รับเงินจากโรงเรียน</span>
        <span className="inline-block border-b border-dotted w-20 mx-1 text-center">{
          voucherData.students.length
        }</span>
        <span>บาท</span>
      </div>
      {/* ย่อข้อความและจัดเรียงเหมือนฟอร์ม */}
      <div>
        <span>
          สังกัดสำนักงานเขตพื้นที่การศึกษา ประถมศึกษาจังหวัดเขต 2 <br />
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
    {/* ลายเซ็น */}
    <div className="flex flex-row justify-between items-start gap-3 my-4">
      <div className="text-center w-1/3">
        <div>
          ลงชื่อ
          <span className="inline-block border-b border-dotted min-w-[120px] mx-1">
            {voucherData.payerName || "..............................."}
          </span>
          ผู้จ่ายเงิน
        </div>
        <div>
          (<span className="inline-block border-b border-dotted min-w-[120px] mx-1">
            {voucherData.payerName || "..............................."}
          </span>)
        </div>
      </div>
      <div className="text-center w-1/3">
        <div>
          ลงชื่อ
          <span className="inline-block border-b border-dotted min-w-[120px] mx-1">
            {voucherData.selectedTeacher ? `${voucherData.selectedTeacher.firstName} ${voucherData.selectedTeacher.lastName}` : "..............................."}
          </span>
          ครูประจำชั้น
        </div>
        <div>
          (<span className="inline-block border-b border-dotted min-w-[120px] mx-1">
            {voucherData.selectedTeacher ? `${voucherData.selectedTeacher.firstName} ${voucherData.selectedTeacher.lastName}` : "..............................."}
          </span>)
        </div>
      </div>
    </div>
    <div className="text-center mt-2">
      <div>ตรวจสอบแล้วถูกต้อง</div>
      <div className="my-2">
        ลงชื่อ
        <span className="inline-block border-b border-dotted min-w-[120px] mx-1">
          {voucherData.principalName || "..............................."}
        </span>
        ผู้อำนวยการโรงเรียน
      </div>
      <div>
        (<span className="inline-block border-b border-dotted min-w-[120px] mx-1">
          {voucherData.principalName || "..............................."}
        </span>)
      </div>
    </div>
  </div>
);

export default PrintPreview;
