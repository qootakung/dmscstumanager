
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { importFromExcel } from '@/utils/excel';
import { addStudent } from '@/utils/storage';
import Swal from 'sweetalert2';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

const StudentImport: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      await Swal.fire({
        title: 'ไฟล์ไม่ถูกต้อง!',
        text: 'กรุณาเลือกไฟล์ Excel (.xlsx หรือ .xls) เท่านั้น',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    setIsUploading(true);
    setImportResult(null);

    try {
      const studentsData = await importFromExcel(file);
      
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      // Process each student record
      for (let i = 0; i < studentsData.length; i++) {
        try {
          const studentData = studentsData[i];
          
          // Validate required fields
          if (!studentData.citizenId || !studentData.studentId || !studentData.firstNameTh || !studentData.lastNameTh) {
            failedCount++;
            errors.push(`แถวที่ ${i + 2}: ข้อมูลไม่ครบถ้วน (เลขประจำตัวประชาชน, รหัสนักเรียน, ชื่อ, นามสกุล)`);
            continue;
          }

          // Add student to database
          addStudent(studentData);
          successCount++;
        } catch (error) {
          failedCount++;
          errors.push(`แถวที่ ${i + 2}: ${error instanceof Error ? error.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ'}`);
        }
      }

      setImportResult({
        success: successCount,
        failed: failedCount,
        errors
      });

      if (successCount > 0) {
        await Swal.fire({
          title: 'นำเข้าข้อมูลสำเร็จ!',
          text: `นำเข้าข้อมูลนักเรียนสำเร็จ ${successCount} คน${failedCount > 0 ? `, ล้มเหลว ${failedCount} คน` : ''}`,
          icon: successCount > 0 && failedCount === 0 ? 'success' : 'warning',
          confirmButtonText: 'ตกลง'
        });
      }
    } catch (error) {
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถอ่านไฟล์ Excel ได้ กรุณาตรวจสอบรูปแบบไฟล์',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const downloadTemplate = () => {
    // Create a sample Excel file template
    const templateData = [
      {
        'เลขประจำตัวประชาชน': '1234567890123',
        'ชั้น': 'อ.1',
        'รหัสนักเรียน': 'ST001',
        'เพศ': 'ชาย',
        'คำนำหน้าชื่อ': 'เด็กชาย',
        'ชื่อ': 'สมชาย',
        'นามสกุล': 'ใจดี',
        'ชื่อ (อังกฤษ)': 'Somchai',
        'นามสกุล (อังกฤษ)': 'Jaidee',
        'วันเกิด': '2015-01-01',
        'คำนำหน้าชื่อบิดา': 'นาย',
        'ชื่อบิดา': 'สมพงษ์',
        'นามสกุลบิดา': 'ใจดี',
        'คำนำหน้าชื่อมารดา': 'นาง',
        'ชื่อมารดา': 'สมหญิง',
        'นามสกุลมารดา': 'ใจดี',
        'คำนำหน้าชื่อผู้ปกครอง': 'นาย',
        'ชื่อผู้ปกครอง': 'สมพงษ์',
        'นามสกุลผู้ปกครอง': 'ใจดี',
        'หมายเลขโทรศัพท์ของผู้ปกครอง': '081-234-5678',
        'เลขที่บ้าน (ที่อยู่ปัจจุบัน)': '123',
        'หมู่ (ที่อยู่ปัจจุบัน)': '1',
        'ตำบล (ที่อยู่ปัจจุบัน)': 'บ้านใหม่',
        'อำเภอ (ที่อยู่ปัจจุบัน)': 'เมือง',
        'จังหวัด (ที่อยู่ปัจจุบัน)': 'กรุงเทพฯ',
        'รหัสไปรษณีย์ (ที่อยู่ปัจจุบัน)': '10110'
      }
    ];

    // Import the exportToExcel function from utils
    import('@/utils/excel').then(({ exportToExcel }) => {
      exportToExcel(templateData, 'template_students');
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>นำเข้าข้อมูลจากไฟล์ Excel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <p className="text-muted-foreground">
            อัปโหลดไฟล์ Excel เพื่อนำเข้าข้อมูลนักเรียนจำนวนมาก
          </p>

          {/* Template Download */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-800">ดาวน์โหลดแม่แบบ Excel</h3>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              ดาวน์โหลดไฟล์แม่แบบเพื่อดูรูปแบบคอลัมน์ที่ถูกต้อง
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={downloadTemplate}
              className="text-blue-600 border-blue-300 hover:bg-blue-100"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              ดาวน์โหลดแม่แบบ
            </Button>
          </div>

          {/* File Upload */}
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
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <Button 
                variant="outline" 
                disabled={isUploading}
                className="pointer-events-none"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'กำลังประมวลผล...' : 'เลือกไฟล์'}
              </Button>
            </div>
          </div>

          {/* Import Results */}
          {importResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {importResult.success > 0 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>สำเร็จ: {importResult.success} คน</span>
                  </div>
                )}
                {importResult.failed > 0 && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span>ล้มเหลว: {importResult.failed} คน</span>
                  </div>
                )}
              </div>

              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">รายการข้อผิดพลาด:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {importResult.errors.length > 10 && (
                      <li className="text-red-600 font-medium">
                        ... และอีก {importResult.errors.length - 10} รายการ
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">คำแนะนำในการใช้งาน:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• ไฟล์ Excel ต้องมีคอลัมน์ตามแม่แบบที่กำหนด</li>
              <li>• ข้อมูลที่จำเป็น: เลขประจำตัวประชาชน, รหัสนักเรียน, ชื่อ, นามสกุล</li>
              <li>• แถวแรกต้องเป็นหัวคอลัมน์</li>
              <li>• ข้อมูลเริ่มต้นจากแถวที่ 2</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentImport;
