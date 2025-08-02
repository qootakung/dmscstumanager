import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Upload, FileSpreadsheet, Download, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  id: string;
  studentId: string;
  name: string;
  grade: string;
  academicYear: string;
}

export const StudentImportPage = () => {
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const grades = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6', 'ม.1', 'ม.2', 'ม.3'];
  const academicYears = ['2566', '2567', '2568', '2569', '2570'];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedGrade || !selectedAcademicYear) {
      toast.error('กรุณาเลือกระดับชั้นและปีการศึกษาก่อนนำเข้าข้อมูล');
      return;
    }

    setIsUploading(true);
    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock student data
      const mockStudents: Student[] = [
        { id: '1', studentId: '001', name: 'นายสมชาย ใจดี', grade: selectedGrade, academicYear: selectedAcademicYear },
        { id: '2', studentId: '002', name: 'นางสาวสมหญิง รักเรียน', grade: selectedGrade, academicYear: selectedAcademicYear },
        { id: '3', studentId: '003', name: 'นายวิชาติ มีปัญญา', grade: selectedGrade, academicYear: selectedAcademicYear },
      ];
      
      setStudents(mockStudents);
      toast.success(`นำเข้าข้อมูลนักเรียนสำเร็จ ${mockStudents.length} คน`);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    toast.success('กำลังดาวน์โหลดไฟล์ตัวอย่าง...');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-3">
          นำเข้าข้อมูลนักเรียน
        </h2>
        <p className="text-gray-600 text-lg">
          เลือกระดับชั้นและปีการศึกษา จากนั้นนำเข้าข้อมูลนักเรียนเพื่อเริ่มการประเมิน
        </p>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-700">
            <UserPlus className="h-6 w-6" />
            ข้อมูลพื้นฐาน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                ระดับชั้น
              </Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="เลือกระดับชั้น" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                ปีการศึกษา
              </Label>
              <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="เลือกปีการศึกษา" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-700">
            <Upload className="h-6 w-6" />
            นำเข้าข้อมูลนักเรียน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="flex items-center gap-2 h-12"
            >
              <Download className="h-4 w-4" />
              ดาวน์โหลดไฟล์ตัวอย่าง
            </Button>
            
            <div className="relative">
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="file-upload"
              />
              <Label
                htmlFor="file-upload"
                className={`
                  flex items-center justify-center gap-2 h-12 px-4 py-2 
                  bg-gradient-to-r from-indigo-500 to-purple-600 
                  text-white rounded-md cursor-pointer hover:from-indigo-600 
                  hover:to-purple-700 transition-all duration-200
                  ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <FileSpreadsheet className="h-4 w-4" />
                {isUploading ? 'กำลังนำเข้าข้อมูล...' : 'เลือกไฟล์ Excel'}
              </Label>
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">หมายเหตุ:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>รองรับไฟล์ .xlsx, .xls, .csv</li>
              <li>ไฟล์ต้องมีคอลัมน์: รหัสนักเรียน, ชื่อ-นามสกุล</li>
              <li>กรุณาดาวน์โหลดไฟล์ตัวอย่างเพื่อดูรูปแบบที่ถูกต้อง</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {students.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl text-gray-700">
              <Users className="h-6 w-6" />
              รายชื่อนักเรียน ({students.length} คน)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-center">ลำดับ</TableHead>
                    <TableHead>รหัสนักเรียน</TableHead>
                    <TableHead>ชื่อ-นามสกุล</TableHead>
                    <TableHead className="text-center">ระดับชั้น</TableHead>
                    <TableHead className="text-center">ปีการศึกษา</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell className="font-medium">{student.studentId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell className="text-center">{student.grade}</TableCell>
                      <TableCell className="text-center">{student.academicYear}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};