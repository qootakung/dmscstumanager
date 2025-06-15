
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Swal from 'sweetalert2';

interface ScoreImportProps {
  onImportComplete: () => void;
}

const ScoreImport: React.FC<ScoreImportProps> = ({ onImportComplete }) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const grades = ['อ.1', 'อ.2', 'อ.3', 'ม.1', 'ม.2', 'ม.3'];
  const subjects = ['คณิตศาสตร์', 'ภาษาไทย', 'วิทยาศาสตร์', 'สังคมศึกษา', 'ภาษาอังกฤษ'];

  const downloadTemplate = () => {
    // สร้างไฟล์ template สำหรับการนำเข้าคะแนน
    const templateData = [
      {
        'รหัสนักเรียน': 'ST001',
        'ชื่อ-นามสกุล': 'เด็กชายสมชาย ใจดี',
        'คะแนน': '85'
      },
      {
        'รหัสนักเรียน': 'ST002',
        'ชื่อ-นามสกุล': 'เด็กหญิงสมหญิง ใจงาม',
        'คะแนน': '92'
      }
    ];

    // จำลองการดาวน์โหลด
    Swal.fire({
      title: 'ดาวน์โหลดไฟล์ Template',
      text: `ไฟล์ template สำหรับ ${selectedGrade} วิชา${selectedSubject} กำลังถูกดาวน์โหลด`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedGrade || !selectedSubject) {
      await Swal.fire({
        title: 'กรุณาเลือกข้อมูล!',
        text: 'กรุณาเลือกระดับชั้นและวิชาก่อนนำเข้าไฟล์',
        icon: 'warning',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    setIsUploading(true);

    try {
      // จำลองการประมวลผลไฟล์
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResult = {
        success: Math.floor(Math.random() * 20) + 10,
        failed: Math.floor(Math.random() * 3),
        grade: selectedGrade,
        subject: selectedSubject
      };

      setImportResult(mockResult);

      await Swal.fire({
        title: 'นำเข้าข้อมูลสำเร็จ!',
        text: `นำเข้าคะแนน ${mockResult.success} คน สำเร็จ${mockResult.failed > 0 ? `, ล้มเหลว ${mockResult.failed} คน` : ''}`,
        icon: 'success',
        confirmButtonText: 'ตกลง'
      });

      onImportComplete();
    } catch (error) {
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถประมวลผลไฟล์ได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* คำแนะนำ */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <AlertCircle className="w-5 h-5" />
            วิธีการนำเข้าข้อมูลคะแนน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-600">
            <p>• เลือกระดับชั้นและวิชาที่ต้องการนำเข้าข้อมูล</p>
            <p>• ดาวน์โหลดไฟล์ template และกรอกข้อมูลคะแนนให้ครบถ้วน</p>
            <p>• อัปโหลดไฟล์ที่กรอกข้อมูลแล้ว</p>
            <p>• ระบบจะวิเคราะห์และจัดกลุ่มผู้เรียนอัตโนมัติ</p>
          </div>
        </CardContent>
      </Card>

      {/* เลือกระดับชั้นและวิชา */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            เลือกข้อมูลที่ต้องการนำเข้า
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ระดับชั้น <span className="text-red-500">*</span>
              </label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกระดับชั้น" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(grade => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วิชา <span className="text-red-500">*</span>
              </label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกวิชา" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedGrade && selectedSubject && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-700 font-medium">
                พร้อมนำเข้าข้อมูลคะแนน: <Badge className="ml-2">{selectedGrade} - {selectedSubject}</Badge>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ดาวน์โหลด Template */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            ดาวน์โหลดไฟล์ Template
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600 mb-4">
            ดาวน์โหลดไฟล์ตัวอย่างและกรอกข้อมูลคะแนนตามรูปแบบที่กำหนด
          </p>
          <Button 
            onClick={downloadTemplate}
            disabled={!selectedGrade || !selectedSubject}
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600"
          >
            <Download className="w-4 h-4 mr-2" />
            ดาวน์โหลด Template
          </Button>
        </CardContent>
      </Card>

      {/* อัปโหลดไฟล์ */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            อัปโหลดไฟล์คะแนน
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600 mb-2">
              คลิกหรือลากไฟล์มาวางที่นี่
            </p>
            <p className="text-sm text-gray-500 mb-4">
              รองรับไฟล์ .xlsx และ .xls เท่านั้น
            </p>

            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                disabled={isUploading || !selectedGrade || !selectedSubject}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                accept=".xlsx,.xls"
              />
              <Button
                disabled={isUploading || !selectedGrade || !selectedSubject}
                className="pointer-events-none bg-gradient-to-r from-orange-500 to-red-500 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'กำลังประมวลผล...' : 'เลือกไฟล์'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ผลการนำเข้า */}
      {importResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700">ผลการนำเข้าข้อมูล</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{importResult.success}</p>
                <p className="text-sm text-green-700">สำเร็จ</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{importResult.failed}</p>
                <p className="text-sm text-red-700">ล้มเหลว</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-blue-600">{importResult.grade}</p>
                <p className="text-sm text-blue-700">ระดับชั้น</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-purple-600">{importResult.subject}</p>
                <p className="text-sm text-purple-700">วิชา</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScoreImport;
