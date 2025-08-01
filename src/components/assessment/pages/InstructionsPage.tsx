import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Download, Eye, Printer } from 'lucide-react';
import { toast } from 'sonner';

export const InstructionsPage = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('กรุณาเลือกไฟล์ PDF หรือ DOCX เท่านั้น');
        return;
      }

      setIsUploading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUploadedFile(file);
        toast.success('อัปโหลดไฟล์สำเร็จ');
      } catch (error) {
        toast.error('เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDownload = () => {
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = uploadedFile.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handlePreview = () => {
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      window.open(url, '_blank');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3">
          คำชี้แจง
        </h2>
        <p className="text-gray-600 text-lg">
          อัปโหลดและจัดการไฟล์คำชี้แจงของแบบประเมินสมรรถนะ
        </p>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-xl text-orange-700">
            <Upload className="h-6 w-6" />
            อัปโหลดไฟล์คำชี้แจง
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!uploadedFile ? (
            <div className="text-center">
              <div className="border-2 border-dashed border-orange-300 rounded-lg p-8 bg-white/50">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-orange-100 rounded-full">
                    <FileText className="h-8 w-8 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      เลือกไฟล์คำชี้แจงเพื่ออัปโหลด
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      รองรับไฟล์ .PDF และ .DOCX
                    </p>
                    <label htmlFor="instructions-file" className="cursor-pointer">
                      <Button 
                        type="button" 
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                        disabled={isUploading}
                      >
                        {isUploading ? 'กำลังอัปโหลด...' : 'เลือกไฟล์'}
                      </Button>
                      <input
                        id="instructions-file"
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{uploadedFile.name}</h3>
                  <p className="text-sm text-gray-500">
                    ขนาด: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handlePreview}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  ดูตัวอย่าง
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  ดาวน์โหลด
                </Button>
                <Button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  <Printer className="h-4 w-4" />
                  พิมพ์รายงาน
                </Button>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <label htmlFor="instructions-file-replace" className="cursor-pointer">
                  <Button variant="ghost" size="sm">
                    เปลี่ยนไฟล์
                  </Button>
                  <input
                    id="instructions-file-replace"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};