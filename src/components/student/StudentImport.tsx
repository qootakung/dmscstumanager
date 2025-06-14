
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { importFromExcel, exportToExcel } from '@/utils/excel';
import { addStudent } from '@/utils/storage';
import Swal from 'sweetalert2';
import ImportTemplate from './import/ImportTemplate';
import ImportUploader from './import/ImportUploader';
import ImportResults from './import/ImportResults';
import ImportInstructions from './import/ImportInstructions';
import { ImportResult } from './import/types';

const StudentImport: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

      for (let i = 0; i < studentsData.length; i++) {
        try {
          const studentData = studentsData[i];
          
          if (!studentData.citizenId || !studentData.studentId || !studentData.firstNameTh || !studentData.lastNameTh) {
            failedCount++;
            errors.push(`แถวที่ ${i + 2}: ข้อมูลไม่ครบถ้วน (เลขประจำตัวประชาชน, รหัสนักเรียน, ชื่อ, นามสกุล)`);
            continue;
          }

          await addStudent(studentData);
          successCount++;
        } catch (error) {
          failedCount++;
          errors.push(`แถวที่ ${i + 2}: ${error instanceof Error ? error.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ'}`);
        }
      }

      setImportResult({ success: successCount, failed: failedCount, errors });

      if (successCount > 0) {
        await Swal.fire({
          title: 'นำเข้าข้อมูลสำเร็จ!',
          text: `นำเข้าข้อมูลนักเรียนสำเร็จ ${successCount} คน${failedCount > 0 ? `, ล้มเหลว ${failedCount} คน` : ''}`,
          icon: successCount > 0 && failedCount === 0 ? 'success' : 'warning',
          confirmButtonText: 'ตกลง'
        });
      } else if (failedCount > 0) {
        await Swal.fire({
            title: 'การนำเข้าล้มเหลว',
            text: `ไม่สามารถนำเข้าข้อมูลนักเรียนได้ ${failedCount} คน กรุณาตรวจสอบไฟล์และลองอีกครั้ง`,
            icon: 'error',
            confirmButtonText: 'ตกลง',
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
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const downloadTemplate = () => {
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
        'วันเกิด': '01/01/2558',
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
    exportToExcel(templateData, 'template_students');
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
          <ImportTemplate onDownload={downloadTemplate} />
          <ImportUploader onFileUpload={handleFileUpload} isUploading={isUploading} />
          <ImportResults result={importResult} />
          <ImportInstructions />
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentImport;
