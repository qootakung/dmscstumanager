
import React from "react";
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
  <div className="max-h-[70vh] overflow-y-auto bg-white shadow p-4 rounded text-sm" style={{fontFamily: 'Sarabun, Arial, sans-serif'}}>
    <div className="header text-center mb-4">
      <div className="form-title font-bold text-base mb-1">แบบหลักฐานการจ่ายเงิน</div>
      <div>
        ภาคเรียนที่&nbsp;
        <span className="inline-block border-b border-dotted w-20 text-center">{voucherData.semester}</span>
        &nbsp;ปีการศึกษา&nbsp;
        <span className="inline-block border-b border-dotted w-28 text-center">{voucherData.academicYear}</span>
      </div>
    </div>
    <div className="mb-4">
      {paymentOptions.map(option => (
        <div className="flex items-center gap-2 mb-1" key={option}>
          <span className={`inline-block border w-4 h-4 mr-1 align-middle ${voucherData.paymentTypes.includes(option) ? 'bg-black' : ''}`} />
          {option}
        </div>
      ))}
    </div>
    <div className="mb-3">
      <p>
        ระดับชั้น <span className={`inline-block border w-4 h-4 mr-1 align-middle ${voucherData.paymentTypes.length > 0 ? 'bg-black' : ''}`} />
        อนุบาลปีที่<span className="inline-block border-b border-dotted w-10 mx-1"></span>
        <span className="inline-block border w-4 h-4 mr-1 align-middle" />
        ประถมศึกษาปีที่<span className="inline-block border-b border-dotted w-10 mx-1"></span>
      </p>
      <p>
        <span className="inline-block border w-4 h-4 mr-1 align-middle" />
        มัธยมศึกษาปีที่<span className="inline-block border-b border-dotted w-10 mx-1"></span>
        <span className="inline-block border w-4 h-4 mr-1 align-middle" />
        ปวช. ที่สังเคยศตสหกรณ์ การปีที่<span className="inline-block border-b border-dotted w-10 mx-1"></span>
      </p>
      <p>
        นักเรียนจำนวนทั้งสิ้น
        <span className="inline-block border-b border-dotted w-10 mx-1 text-center">{voucherData.students.length}</span>
        คน ได้รับเงินจากโรงเรียน
        <span className="inline-block border-b border-dotted w-10 mx-1 text-center">{voucherData.students.length}</span>
      </p>
      <p>สังกัดสำนักงานเขตพื้นที่การศึกษา ประถมศึกษาจังหวัดเขต 2 ข้าพเจ้าขอรับรองว่าเงินเจ้านี้เงิน</p>
      <p>ที่ได้รับไปตำลินมาครอบครัวผู้ประสบความเดือดร้อนทางการทำการ หากไม่ดำเนินการดังกล่าวข้าพเจ้ายอมยอมเคยใช้เงินคืน</p>
      <p>ให้กับโรงเรียนต่อไป</p>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs mb-4">
        <thead>
          <tr>
            <th className="border px-2 py-1">ที่</th>
            <th className="border px-2 py-1">ชื่อ - สกุลนักเรียน</th>
            <th className="border px-2 py-1">หมายเลขประจำตัว<br/>ประชาชน 13 หลัก</th>
            <th className="border px-2 py-1">จำนวนเงิน<br/>(บาท)</th>
            <th className="border px-2 py-1">วันที่รับเงิน</th>
            <th className="border px-2 py-1">ลายมือชื่อ<br/>ผู้ปกครอง/<br/>นักเรียน</th>
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
    <div className="flex justify-between items-start gap-3 my-4">
      <div className="text-center w-1/3">
        <div>
          ลงชื่อ
          <span className="inline-block border-b border-dotted min-w-[120px] mx-1">{voucherData.payerName || '..........................................'}</span>
          ผู้จ่ายเงิน
        </div>
        <div>
          (<span className="inline-block border-b border-dotted min-w-[120px] mx-1">{voucherData.payerName || '..........................................'}</span>)
        </div>
      </div>
      <div className="text-center w-1/3">
        <div>
          ลงชื่อ
          <span className="inline-block border-b border-dotted min-w-[120px] mx-1">
            {voucherData.selectedTeacher ? `${voucherData.selectedTeacher.firstName} ${voucherData.selectedTeacher.lastName}` : '..........................................'}
          </span>
          ครูประจำชั้น
        </div>
        <div>
          (<span className="inline-block border-b border-dotted min-w-[120px] mx-1">
            {voucherData.selectedTeacher ? `${voucherData.selectedTeacher.firstName} ${voucherData.selectedTeacher.lastName}` : '..........................................'}
          </span>)
        </div>
      </div>
    </div>
    <div className="text-center mt-4">
      <div>ตรวจสอบแล้วถูกต้อง</div>
      <div className="my-2">
        ลงชื่อ
        <span className="inline-block border-b border-dotted min-w-[120px] mx-1">
          {voucherData.principalName || '..........................................'}
        </span>
        ผู้อำนวยการโรงเรียน
      </div>
      <div>
        (<span className="inline-block border-b border-dotted min-w-[120px] mx-1">{voucherData.principalName || '..........................................'}</span>)
      </div>
    </div>
  </div>
);

export default PrintPreview;
