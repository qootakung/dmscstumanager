
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const ImportTemplate: React.FC = () => {
  const subjects = [
    'ภาษาไทย',
    'คณิตศาสตร์',
    'วิทยาศาสตร์และเทคโนโลยี',
    'สังคมศึกษา ศาสนาและวัฒนธรรม',
    'ประวัติศาสตร์',
    'สุขศึกษาและพลศึกษา',
    'ศิลปะ',
    'การงานอาชีพ',
    'ภาษาอังกฤษ',
    'การป้องกันการทุจริต',
    'ภาษาอังกฤษเพื่อการสื่อสาร',
    'วิทยาศาสตร์พลังสิบ'
  ];

  const downloadTemplate = () => {
    // สร้างข้อมูลตัวอย่าง
    const templateData = [
      // แถวตัวอย่างที่ 1
      {
        'รหัสนักเรียน': 'STD001',
        'ชื่อ': 'พิชญา',
        'ชั้นเรียน': 'ป.4',
        'ภาษาไทย': 4.0,
        'คณิตศาสตร์': 4.0,
        'วิทยาศาสตร์และเทคโนโลยี': 3.0,
        'สังคมศึกษา ศาสนาและวัฒนธรรม': 4.0,
        'ประวัติศาสตร์': 3.5,
        'สุขศึกษาและพลศึกษา': 4.0,
        'ศิลปะ': 3.0,
        'การงานอาชีพ': 3.5,
        'ภาษาอังกฤษ': 4.0,
        'การป้องกันการทุจริต': 4.0,
        'ภาษาอังกฤษเพื่อการสื่อสาร': 3.5,
        'วิทยาศาสตร์พลังสิบ': 3.0
      },
      // แถวตัวอย่างที่ 2
      {
        'รหัสนักเรียน': 'STD002',
        'ชื่อ': 'จิดาภา',
        'ชั้นเรียน': 'ป.4',
        'ภาษาไทย': 3.5,
        'คณิตศาสตร์': 3.0,
        'วิทยาศาสตร์และเทคโนโลยี': 2.5,
        'สังคมศึกษา ศาสนาและวัฒนธรรม': 3.0,
        'ประวัติศาสตร์': 2.5,
        'สุขศึกษาและพลศึกษา': 3.5,
        'ศิลปะ': 3.0,
        'การงานอาชีพ': 2.5,
        'ภาษาอังกฤษ': 3.0,
        'การป้องกันการทุจริต': 3.0,
        'ภาษาอังกฤษเพื่อการสื่อสาร': 2.5,
        'วิทยาศาสตร์พลังสิบ': 2.0
      },
      // แถวตัวอย่างที่ 3
      {
        'รหัสนักเรียน': 'STD003',
        'ชื่อ': 'กิจเรียน',
        'ชั้นเรียน': 'ป.4',
        'ภาษาไทย': 1.5,
        'คณิตศาสตร์': 1.0,
        'วิทยาศาสตร์และเทคโนโลยี': 1.5,
        'สังคมศึกษา ศาสนาและวัฒนธรรม': 2.0,
        'ประวัติศาสตร์': 1.0,
        'สุขศึกษาและพลศึกษา': 2.5,
        'ศิลปะ': 2.0,
        'การงานอาชีพ': 1.5,
        'ภาษาอังกฤษ': 1.0,
        'การป้องกันการทุจริต': 1.5,
        'ภาษาอังกฤษเพื่อการสื่อสาร': 1.0,
        'วิทยาศาสตร์พลังสิบ': 1.0
      },
      // แถวว่างสำหรับกรอกข้อมูลจริง
      {
        'รหัสนักเรียน': '',
        'ชื่อ': '',
        'ชั้นเรียน': '',
        'ภาษาไทย': '',
        'คณิตศาสตร์': '',
        'วิทยาศาสตร์และเทคโนโลยี': '',
        'สังคมศึกษา ศาสนาและวัฒนธรรม': '',
        'ประวัติศาสตร์': '',
        'สุขศึกษาและพลศึกษา': '',
        'ศิลปะ': '',
        'การงานอาชีพ': '',
        'ภาษาอังกฤษ': '',
        'การป้องกันการทุจริต': '',
        'ภาษาอังกฤษเพื่อการสื่อสาร': '',
        'วิทยาศาสตร์พลังสิบ': ''
      }
    ];

    // สร้าง workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // ตั้งค่าความกว้างของคอลัมน์
    const colWidths = [
      { wch: 15 }, // รหัสนักเรียน
      { wch: 20 }, // ชื่อ
      { wch: 10 }, // ชั้นเรียน
      ...subjects.map(() => ({ wch: 12 })) // คะแนนแต่ละวิชา
    ];
    ws['!cols'] = colWidths;

    // จัดรูปแบบแถวตัวอย่าง (แถว 2-4) ให้เป็นสีเหลือง
    for (let row = 2; row <= 4; row++) {
      for (let col = 0; col < 3 + subjects.length; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row - 1, c: col });
        if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
        ws[cellAddress].s = {
          fill: {
            fgColor: { rgb: "FFFF00" }
          }
        };
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'คะแนนนักเรียน');
    
    // ดาวน์โหลดไฟล์
    XLSX.writeFile(wb, 'template_student_scores.xlsx');
  };

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <FileSpreadsheet className="w-5 h-5" />
          ดาวน์โหลดไฟล์ตัวอย่าง
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-blue-700">
          <p className="mb-3">
            <strong>ไฟล์ตัวอย่างประกอบด้วย:</strong>
          </p>
          <ul className="space-y-1 mb-4">
            <li>• คอลัมน์ที่ 1: รหัสนักเรียน</li>
            <li>• คอลัมน์ที่ 2: ชื่อ</li>
            <li>• คอลัมน์ที่ 3: ชั้นเรียน</li>
            <li>• คอลัมน์ที่ 4-15: คะแนนรายวิชาทั้ง 12 วิชา</li>
          </ul>
          
          <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mb-4">
            <p className="text-yellow-800 font-medium mb-2">📝 รายวิชาในไฟล์ตัวอย่าง:</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-yellow-700">
              {subjects.map((subject, index) => (
                <div key={index}>
                  {index + 1}. {subject}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-100 border border-green-300 rounded p-3">
            <p className="text-green-800 font-medium mb-2">✅ ข้อมูลในไฟล์:</p>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• แถว 1: หัวคอลัมน์</li>
              <li>• แถว 2-4: ข้อมูลตัวอย่าง (สีเหลือง)</li>
              <li>• แถว 5: แถวว่างสำหรับกรอกข้อมูลจริง</li>
              <li>• คะแนน: 4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0</li>
            </ul>
          </div>
        </div>

        <Button
          onClick={downloadTemplate}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Download className="w-4 h-4 mr-2" />
          ดาวน์โหลดไฟล์ตัวอย่าง Excel
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImportTemplate;
