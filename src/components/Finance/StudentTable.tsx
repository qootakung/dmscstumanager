
import React from "react";
import type { Student } from "@/types/student";

interface StudentTableProps {
  students: Student[];
}

const StudentTable: React.FC<StudentTableProps> = ({ students }) => {
  // Display at least 15 rows
  const emptyRowCount = Math.max(0, 15 - students.length);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-base mb-3">
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
          {students.map((student, index) => (
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
          {[...Array(emptyRowCount)].map((_, idx) => (
            <tr key={`empty-${idx}`}>
              <td className="border px-2 py-1">{students.length + idx + 1}</td>
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
  );
};

export default StudentTable;
