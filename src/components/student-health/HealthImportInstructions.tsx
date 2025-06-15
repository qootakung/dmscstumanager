
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Calendar, Weight, Ruler } from 'lucide-react';

const HealthImportInstructions: React.FC = () => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Info className="w-5 h-5" />
          คำแนะนำการกรอกข้อมูล
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-blue-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-medium">วันที่ชั่งน้ำหนัก</span>
            </div>
            <p className="text-xs mb-2">รูปแบบ: วว/ดด/ปปปป (ปีพุทธศักราช)</p>
            <div className="bg-yellow-100 p-2 rounded text-xs">
              <strong>ตัวอย่าง:</strong><br />
              • 15/06/2568<br />
              • 01/12/2567<br />
              • 25/03/2568
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Weight className="w-4 h-4 text-blue-600" />
              <span className="font-medium">น้ำหนัก</span>
            </div>
            <p className="text-xs mb-2">หน่วย: กิโลกรัม (กก.)</p>
            <div className="bg-yellow-100 p-2 rounded text-xs">
              <strong>ตัวอย่าง:</strong><br />
              • 25.5<br />
              • 30<br />
              • 18.2
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-4 h-4 text-blue-600" />
              <span className="font-medium">ส่วนสูง</span>
            </div>
            <p className="text-xs mb-2">หน่วย: เซนติเมตร (ซม.)</p>
            <div className="bg-yellow-100 p-2 rounded text-xs">
              <strong>ตัวอย่าง:</strong><br />
              • 120.0<br />
              • 135<br />
              • 142.5
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-blue-200">
          <h4 className="font-medium mb-2">ข้อควรระวัง:</h4>
          <ul className="text-xs space-y-1 list-disc list-inside">
            <li>แถวแรกในไฟล์เป็นตัวอย่าง (สีเหลือง) ไม่ต้องลบออก ระบบจะข้ามอัตโนมัติ</li>
            <li>วันที่ต้องเป็นปีพุทธศักราช เช่น 2568, 2567</li>
            <li>ถ้าไม่มีข้อมูลน้ำหนักหรือส่วนสูง ให้เว้นว่างไว้</li>
            <li>ตรวจสอบรหัสนักเรียนให้ถูกต้องก่อนนำเข้า</li>
            <li>ไฟล์ต้องเป็นนามสกุล .xlsx หรือ .xls เท่านั้น</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthImportInstructions;
