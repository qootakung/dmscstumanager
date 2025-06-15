
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, FileSpreadsheet, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { getStudents } from '@/utils/studentStorage';
import { upsertStudentHealthRecords } from '@/utils/healthStorage';
import { exportStudentsForHealthImport, importHealthDataFromExcel } from '@/utils/excel';
import HealthImportInstructions from './HealthImportInstructions';
import Swal from 'sweetalert2';

const HealthImportExport: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number, total: number } | null>(null);
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
    setImportProgress(null);

    try {
      // Show loading dialog
      Swal.fire({
        title: 'กำลังประมวลผลไฟล์...',
        text: 'กรุณารอสักครู่',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const healthRecords = await importHealthDataFromExcel(file);
      
      if (healthRecords && healthRecords.length > 0) {
        // Update progress
        setImportProgress({ current: 0, total: healthRecords.length });
        
        Swal.update({
          title: 'กำลังบันทึกข้อมูล...',
          text: `กำลังบันทึก 0 / ${healthRecords.length} รายการ`
        });

        const result = await upsertStudentHealthRecords(healthRecords);
        
        if (result && result.length > 0) {
          setImportResult({ success: result.length, fail: healthRecords.length - result.length });
          Swal.fire({
            icon: 'success',
            title: 'นำเข้าสำเร็จ!',
            html: `
              <div class="text-center">
                <p class="text-green-600 mb-2">✓ นำเข้าสำเร็จ: ${result.length} รายการ</p>
                ${healthRecords.length - result.length > 0 ? 
                  `<p class="text-red-600">✗ ไม่สำเร็จ: ${healthRecords.length - result.length} รายการ</p>` : 
                  ''
                }
              </div>
            `,
            confirmButtonText: 'ตกลง'
          });
        } else {
          setImportResult({ success: 0, fail: healthRecords.length });
          Swal.fire('นำเข้าไม่สำเร็จ', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบรหัสนักเรียน', 'error');
        }
      } else {
        Swal.fire('ไม่มีข้อมูล', 'ไม่พบข้อมูลที่สามารถนำเข้าได้ในไฟล์', 'warning');
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error instanceof Error ? error.message : 'รูปแบบไฟล์ไม่ถูกต้อง หรือเกิดปัญหาในการอ่านข้อมูล',
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setIsImporting(false);
      setImportProgress(null);
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
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังส่งออก...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  ส่งออกเทมเพลต
                </>
              )}
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
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-school-primary bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} disabled={isImporting} />
              {isImporting ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-school-primary" />
                  <p>กำลังประมวลผล...</p>
                  {importProgress && (
                    <p className="text-sm text-gray-600">
                      {importProgress.current} / {importProgress.total} รายการ
                    </p>
                  )}
                </div>
              ) : isDragActive ? (
                <p>วางไฟล์ที่นี่...</p>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <p>ลากไฟล์ .xlsx หรือ .xls มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
                  <p className="text-sm text-gray-500">รองรับเฉพาะไฟล์ Excel เท่านั้น</p>
                </div>
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
