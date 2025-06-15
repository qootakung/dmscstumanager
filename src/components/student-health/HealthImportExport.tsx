
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { getStudents } from '@/utils/studentStorage';
import { upsertStudentHealthRecords } from '@/utils/healthStorage';
import { exportStudentsForHealthImport, importHealthDataFromExcel } from '@/utils/excel';
import HealthImportInstructions from './HealthImportInstructions';
import Swal from 'sweetalert2';

const HealthImportExport: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number, fail: number } | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    await Swal.fire({
        title: 'กำลังเตรียมข้อมูล...',
        text: 'กำลังดึงรายชื่อนักเรียนเพื่อสร้างไฟล์ Excel',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    try {
      const students = await getStudents();
      if (students.length === 0) {
        Swal.fire('ไม่มีข้อมูล', 'ไม่พบข้อมูลนักเรียนในระบบ', 'warning');
        return;
      }
      exportStudentsForHealthImport(students);
      Swal.close();
    } catch (error) {
      console.error(error);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถส่งออกข้อมูลได้', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);
    await Swal.fire({
      title: 'กำลังนำเข้าข้อมูล...',
      text: 'ระบบกำลังประมวลผลไฟล์ Excel ของคุณ',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const healthRecords = await importHealthDataFromExcel(file);
      if (healthRecords && healthRecords.length > 0) {
        const result = await upsertStudentHealthRecords(healthRecords);
        if (result) {
            setImportResult({ success: result.length, fail: healthRecords.length - result.length });
            Swal.fire('นำเข้าสำเร็จ!', `นำเข้าข้อมูลน้ำหนัก-ส่วนสูงสำเร็จ ${result.length} รายการ`, 'success');
        } else {
            setImportResult({ success: 0, fail: healthRecords.length });
            Swal.fire('นำเข้าไม่สำเร็จ', 'ไม่สามารถบันทึกข้อมูลที่นำเข้าได้', 'error');
        }
      } else {
        Swal.fire('ไม่มีข้อมูล', 'ไม่พบข้อมูลที่สามารถนำเข้าได้ในไฟล์', 'warning');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('เกิดข้อผิดพลาด', 'รูปแบบไฟล์ไม่ถูกต้อง หรือเกิดปัญหาในการอ่านข้อมูล', 'error');
    } finally {
      setIsImporting(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-6 h-6 text-school-primary" />
              ส่งออกข้อมูลเพื่อนำเข้า
            </CardTitle>
            <CardDescription>
              ส่งออกไฟล์ Excel ที่มีรายชื่อนักเรียนทั้งหมด
              เพื่อกรอกข้อมูลน้ำหนักและส่วนสูง แล้วนำกลับเข้ามาในระบบ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} disabled={isExporting} className="w-full">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              {isExporting ? 'กำลังส่งออก...' : 'ส่งออกเทมเพลต'}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-6 h-6 text-school-primary" />
              นำเข้าข้อมูลจาก Excel
            </CardTitle>
            <CardDescription>
              นำเข้าไฟล์ Excel ที่กรอกข้อมูลน้ำหนักและส่วนสูงเรียบร้อยแล้ว
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                ${isDragActive ? 'border-school-primary bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <input {...getInputProps()} />
              {isImporting ? (
                <p>กำลังประมวลผล...</p>
              ) : isDragActive ? (
                <p>วางไฟล์ที่นี่...</p>
              ) : (
                <p>ลากไฟล์ .xlsx หรือ .xls มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
              )}
            </div>
            {importResult && (
               <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
                  <p className="font-bold mb-2">ผลการนำเข้า:</p>
                  <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>สำเร็จ: {importResult.success} รายการ</span>
                  </div>
                  {importResult.fail > 0 && (
                      <div className="flex items-center gap-2 text-red-600 mt-1">
                          <XCircle className="w-4 h-4" />
                          <span>ไม่สำเร็จ: {importResult.fail} รายการ (อาจเนื่องจากรหัสนักเรียนไม่ถูกต้อง)</span>
                      </div>
                  )}
               </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <HealthImportInstructions />
    </div>
  );
};

export default HealthImportExport;
