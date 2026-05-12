import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Upload, Download } from 'lucide-react';
import { exportFinanceStudentTemplate, importFinanceStudentsFromExcel } from '@/utils/financeExcel';
import type { Student } from '@/types/student';
import { toast } from '@/components/ui/use-toast';

interface ManualStudentUploadProps {
  onStudentsLoaded: (students: Student[]) => void;
  currentStudentsCount: number;
}

const ManualStudentUpload: React.FC<ManualStudentUploadProps> = ({ 
  onStudentsLoaded,
  currentStudentsCount
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDownloadTemplate = () => {
    exportFinanceStudentTemplate();
    toast({
      title: "ดาวน์โหลดแม่แบบสำเร็จ",
      description: "สามารถนำไฟล์ไปกรอกข้อมูลนักเรียนและอัปโหลดกลับเข้าระบบได้",
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const students = await importFinanceStudentsFromExcel(file);
      onStudentsLoaded(students);
      toast({
        title: "อัปโหลดข้อมูลสำเร็จ",
        description: `นำเข้าข้อมูลนักเรียนจำนวน ${students.length} คน`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบรูปแบบไฟล์",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-medium text-blue-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            ดาวน์โหลดแม่แบบ Excel
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            ดาวน์โหลดไฟล์แม่แบบเพื่อกรอกรายชื่อนักเรียน โดยไม่ต้องบันทึกลงฐานข้อมูลหลัก
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadTemplate}
          className="text-blue-600 border-blue-300 hover:bg-blue-100 shrink-0"
        >
          <Download className="w-4 h-4 mr-2" />
          โหลดแม่แบบ
        </Button>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
        <p className="text-sm font-medium text-gray-600 mb-1">
          อัปโหลดไฟล์รายชื่อนักเรียน
        </p>
        <p className="text-xs text-gray-500 mb-4">
          รองรับไฟล์ .xlsx และ .xls
        </p>
        
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          disabled={isUploading}
          ref={fileInputRef}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full sm:w-auto"
        >
          {isUploading ? 'กำลังประมวลผล...' : 'เลือกไฟล์ Excel'}
        </Button>
      </div>

      {currentStudentsCount > 0 && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200 text-center">
          นำเข้าข้อมูลพร้อมสำหรับการพิมพ์แล้ว {currentStudentsCount} คน
        </div>
      )}
    </div>
  );
};

export default ManualStudentUpload;