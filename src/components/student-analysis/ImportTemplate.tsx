
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet, Download, Users, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import type { Student } from '@/types/student';

const ImportTemplate: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const grades = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const studentData = await getStudents();
        setStudents(studentData);
        console.log('Fetched students:', studentData.length);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลนักเรียนได้",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const getStudentsByGrade = (grade: string) => {
    return students.filter(student => student.grade === grade);
  };

  const generateSampleScores = () => {
    const scores = [4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0];
    const sampleScores: { [key: string]: string } = {};
    
    subjects.forEach(subject => {
      sampleScores[subject] = '';
    });
    
    return sampleScores;
  };

  const downloadTemplate = (gradeLevel: string) => {
    const gradeStudents = getStudentsByGrade(gradeLevel);
    
    if (gradeStudents.length === 0) {
      toast({
        title: "ไม่มีข้อมูลนักเรียน",
        description: `ไม่พบข้อมูลนักเรียนชั้น ${gradeLevel} ในระบบ`,
        variant: "destructive",
      });
      return;
    }

    // สร้างข้อมูลเทมเพลต
    const templateData = gradeStudents.map(student => {
      const fullName = `${student.titleTh || ''}${student.firstNameTh || ''} ${student.lastNameTh || ''}`.trim();
      return {
        'รหัสนักเรียน': student.studentId || '',
        'ชื่อ-นามสกุล': fullName,
        'ชั้นเรียน': student.grade || gradeLevel,
        ...generateSampleScores()
      };
    });

    // เรียงลำดับตามรหัสนักเรียน
    templateData.sort((a, b) => {
      const aId = parseInt(a['รหัสนักเรียน']) || 0;
      const bId = parseInt(b['รหัสนักเรียน']) || 0;
      return aId - bId;
    });

    // สร้าง workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // ตั้งค่าความกว้างของคอลัมน์
    const colWidths = [
      { wch: 15 }, // รหัสนักเรียน
      { wch: 30 }, // ชื่อ-นามสกุล
      { wch: 10 }, // ชั้นเรียน
      ...subjects.map(() => ({ wch: 12 })) // คะแนนแต่ละวิชา
    ];
    ws['!cols'] = colWidths;

    // จัดรูปแบบหัวตาราง
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        fill: { fgColor: { rgb: "4F81BD" } },
        font: { color: { rgb: "FFFFFF" }, bold: true },
        alignment: { horizontal: "center" }
      };
    }

    XLSX.utils.book_append_sheet(wb, ws, `คะแนนนักเรียน${gradeLevel}`);
    
    // ดาวน์โหลดไฟล์
    const fileName = `template_scores_${gradeLevel}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast({
      title: "ดาวน์โหลดสำเร็จ",
      description: `ไฟล์เทมเพลต ${gradeLevel} พร้อมข้อมูลนักเรียน ${gradeStudents.length} คน`,
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Loader2 className="w-5 h-5 animate-spin" />
            กำลังโหลดข้อมูลนักเรียน...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-blue-600">กรุณารอสักครู่</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <FileSpreadsheet className="w-5 h-5" />
          ดาวน์โหลดไฟล์เทมเพลตพร้อมข้อมูลนักเรียน
          <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {students.length} คน
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-blue-700">
          <p className="mb-3">
            <strong>ไฟล์เทมเพลตประกอบด้วย:</strong>
          </p>
          <ul className="space-y-1 mb-4">
            <li>• คอลัมน์ที่ 1: รหัสนักเรียน</li>
            <li>• คอลัมน์ที่ 2: ชื่อ-นามสกุล</li>
            <li>• คอลัมน์ที่ 3: ชั้นเรียน</li>
            <li>• คอลัมน์ที่ 4-15: คะแนนรายวิชาทั้ง 12 วิชา</li>
          </ul>
          
          <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mb-4">
            <p className="text-yellow-800 font-medium mb-2">📝 รายวิชาในไฟล์เทมเพลต:</p>
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
              <li>• แถว 2 เป็นต้นไป: ข้อมูลนักเรียนจริงจากฐานข้อมูล</li>
              <li>• คอลัมน์คะแนนว่างไว้สำหรับกรอกข้อมูล</li>
              <li>• ใช้คะแนน: 4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0</li>
            </ul>
          </div>
        </div>

        {/* Grade Selection Buttons */}
        <div className="space-y-3">
          <h3 className="font-medium text-blue-800">เลือกชั้นเรียนที่ต้องการดาวน์โหลด:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {grades.map((grade) => {
              const gradeStudents = getStudentsByGrade(grade);
              return (
                <Button
                  key={grade}
                  onClick={() => downloadTemplate(grade)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md h-auto py-3 px-4 flex flex-col items-center gap-2"
                  disabled={gradeStudents.length === 0}
                >
                  <div className="text-lg font-bold">{grade}</div>
                  <div className="text-xs opacity-90 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {gradeStudents.length} คน
                  </div>
                  <div className="text-xs opacity-90">
                    <Download className="w-3 h-3 inline mr-1" />
                    ดาวน์โหลด
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Students by Grade Summary */}
        <div className="bg-purple-100 border border-purple-300 rounded p-4">
          <p className="text-purple-800 font-medium mb-2">👥 สรุปจำนวนนักเรียนแต่ละชั้น:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-purple-700">
            {grades.map((grade) => {
              const gradeStudents = getStudentsByGrade(grade);
              return (
                <div key={grade} className="bg-white p-2 rounded border border-purple-200">
                  <div className="font-bold text-purple-800 mb-1">{grade}</div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{gradeStudents.length} คน</span>
                  </div>
                  {gradeStudents.length === 0 && (
                    <div className="text-xs text-red-600 mt-1">ไม่มีข้อมูล</div>
                  )}
                </div>
              );
            })}
          </div>
          
          {students.length === 0 && (
            <div className="bg-red-100 border border-red-300 rounded p-3 mt-4">
              <p className="text-red-800 font-medium">⚠️ ไม่พบข้อมูลนักเรียนในระบบ</p>
              <p className="text-red-700 text-sm mt-1">
                กรุณาเพิ่มข้อมูลนักเรียนในระบบก่อนดาวน์โหลดเทมเพลต
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportTemplate;
