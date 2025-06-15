
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

  const gradeTemplates = [
    {
      grade: 'ป.1',
      students: [
        { id: 'P1001', name: 'กิตติพร วงษ์สวัสดิ์' },
        { id: 'P1002', name: 'จันทร์เพ็ญ ใจดี' },
        { id: 'P1003', name: 'ชาญวิทย์ สุขสมบูรณ์' }
      ]
    },
    {
      grade: 'ป.2',
      students: [
        { id: 'P2001', name: 'ณัฐวรรณ อำนวยสุข' },
        { id: 'P2002', name: 'ธนวัฒน์ บุญมี' },
        { id: 'P2003', name: 'ปัทมา สว่างใส' }
      ]
    },
    {
      grade: 'ป.3',
      students: [
        { id: 'P3001', name: 'พัชรินทร์ เจริญสุข' },
        { id: 'P3002', name: 'มนัสชนก รุ่งเรือง' },
        { id: 'P3003', name: 'ยศกร ดีใจ' }
      ]
    },
    {
      grade: 'ป.4',
      students: [
        { id: 'P4001', name: 'รัตนาวดี มั่งคั่ง' },
        { id: 'P4002', name: 'วรรณพร สุขใส' },
        { id: 'P4003', name: 'สิรภพ แสงสว่าง' }
      ]
    },
    {
      grade: 'ป.5',
      students: [
        { id: 'P5001', name: 'อาทิตย์ พรหมสวรรค์' },
        { id: 'P5002', name: 'ใจดี สมบูรณ์' },
        { id: 'P5003', name: 'ธัญญรัตน์ วงศ์ใหญ่' }
      ]
    },
    {
      grade: 'ป.6',
      students: [
        { id: 'P6001', name: 'กานต์รวี ชาญชัย' },
        { id: 'P6002', name: 'จิรายุ มหาชัย' },
        { id: 'P6003', name: 'ดารารัตน์ สุขสันต์' }
      ]
    }
  ];

  const generateSampleScores = () => {
    // สุ่มคะแนนตัวอย่าง
    const scores = [4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0];
    const sampleScores: { [key: string]: number } = {};
    
    subjects.forEach(subject => {
      sampleScores[subject] = scores[Math.floor(Math.random() * scores.length)];
    });
    
    return sampleScores;
  };

  const downloadTemplate = (gradeLevel: string) => {
    const template = gradeTemplates.find(t => t.grade === gradeLevel);
    if (!template) return;

    // สร้างข้อมูลตัวอย่าง
    const templateData = [
      // แถวตัวอย่าง 3 แถว
      ...template.students.map(student => ({
        'รหัสนักเรียน': student.id,
        'ชื่อ-นามสกุล': student.name,
        'ชั้นเรียน': template.grade,
        ...generateSampleScores()
      })),
      // แถวว่างสำหรับกรอกข้อมูลจริง
      {
        'รหัสนักเรียน': '',
        'ชื่อ-นามสกุล': '',
        'ชั้นเรียน': template.grade,
        ...subjects.reduce((acc, subject) => ({ ...acc, [subject]: '' }), {})
      }
    ];

    // สร้าง workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // ตั้งค่าความกว้างของคอลัมน์
    const colWidths = [
      { wch: 15 }, // รหัสนักเรียน
      { wch: 25 }, // ชื่อ-นามสกุล
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

    XLSX.utils.book_append_sheet(wb, ws, `คะแนนนักเรียน${gradeLevel}`);
    
    // ดาวน์โหลดไฟล์
    XLSX.writeFile(wb, `template_scores_${gradeLevel}.xlsx`);
  };

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <FileSpreadsheet className="w-5 h-5" />
          ดาวน์โหลดไฟล์ตัวอย่างตามชั้นเรียน
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-blue-700">
          <p className="mb-3">
            <strong>ไฟล์ตัวอย่างประกอบด้วย:</strong>
          </p>
          <ul className="space-y-1 mb-4">
            <li>• คอลัมน์ที่ 1: รหัสนักเรียน</li>
            <li>• คอลัมน์ที่ 2: ชื่อ-นามสกุล</li>
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

          <div className="bg-green-100 border border-green-300 rounded p-3 mb-4">
            <p className="text-green-800 font-medium mb-2">✅ ข้อมูลในไฟล์:</p>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• แถว 1: หัวคอลัมน์</li>
              <li>• แถว 2-4: ข้อมูลตัวอย่าง 3 คน (สีเหลือง)</li>
              <li>• แถว 5: แถวว่างสำหรับกรอกข้อมูลจริง</li>
              <li>• คะแนน: 4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0</li>
            </ul>
          </div>
        </div>

        {/* Grade Selection Buttons */}
        <div className="space-y-3">
          <h3 className="font-medium text-blue-800">เลือกชั้นเรียนที่ต้องการดาวน์โหลด:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gradeTemplates.map((template) => (
              <Button
                key={template.grade}
                onClick={() => downloadTemplate(template.grade)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md h-auto py-3 px-4 flex flex-col items-center gap-2"
              >
                <div className="text-lg font-bold">{template.grade}</div>
                <div className="text-xs opacity-90">
                  <Download className="w-3 h-3 inline mr-1" />
                  ดาวน์โหลด
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-purple-100 border border-purple-300 rounded p-4">
          <p className="text-purple-800 font-medium mb-2">🎯 ข้อมูลตัวอย่างในแต่ละไฟล์:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-purple-700">
            {gradeTemplates.map((template) => (
              <div key={template.grade} className="bg-white p-2 rounded border border-purple-200">
                <div className="font-bold text-purple-800 mb-1">{template.grade}</div>
                {template.students.map((student, index) => (
                  <div key={index} className="truncate">
                    {student.id}: {student.name}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportTemplate;
