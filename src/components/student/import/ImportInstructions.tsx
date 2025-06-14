
import React from 'react';

const ImportInstructions: React.FC = () => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 className="font-medium text-gray-800 mb-2">คำแนะนำในการใช้งาน:</h3>
      <ul className="text-sm text-gray-700 space-y-1">
        <li>• ไฟล์ Excel ต้องมีคอลัมน์ตามแม่แบบที่กำหนด</li>
        <li>• ข้อมูลที่จำเป็น: เลขประจำตัวประชาชน, รหัสนักเรียน, ชื่อ, นามสกุล</li>
        <li>• แถวแรกต้องเป็นหัวคอลัมน์</li>
        <li>• ข้อมูลเริ่มต้นจากแถวที่ 2</li>
      </ul>
    </div>
  );
};

export default ImportInstructions;
