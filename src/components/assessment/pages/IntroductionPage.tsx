import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Download, Eye, Printer, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateAcademicYears } from '@/utils/data';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';

export const IntroductionPage = () => {
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const academicYears = generateAcademicYears();
  
  const {
    isUploading,
    documentRecord,
    loadExistingDocument,
    uploadFile,
    downloadFile,
    previewFile,
    deleteFile
  } = useDocumentUpload('introduction');

  // Load existing document when academic year changes
  useEffect(() => {
    loadExistingDocument(selectedAcademicYear);
  }, [selectedAcademicYear]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedAcademicYear) {
      await uploadFile(file, selectedAcademicYear);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          คำนำ
        </h2>
        <p className="text-gray-600 text-lg">
          อัปโหลดและจัดการไฟล์คำนำของแบบประเมินสมรรถนะ
        </p>
      </div>

      {/* Academic Year Selection */}
      <Card className="border-0 shadow-md bg-white/80">
        <CardHeader>
          <CardTitle className="text-lg text-gray-700">เลือกปีการศึกษา</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="เลือกปีการศึกษา" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map(year => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedAcademicYear && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-xl text-purple-700">
              <Upload className="h-6 w-6" />
              อัปโหลดไฟล์คำนำ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!documentRecord ? (
              <div className="text-center">
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 bg-white/50">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-purple-100 rounded-full">
                      <FileText className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        เลือกไฟล์คำนำเพื่ออัปโหลด
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        รองรับไฟล์ .PDF และ .DOCX
                      </p>
                      <div>
                        <input
                          id="introduction-file"
                          type="file"
                          accept=".pdf,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <label htmlFor="introduction-file" className="cursor-pointer">
                          <Button 
                            type="button" 
                            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                            disabled={isUploading}
                            asChild
                          >
                            <span>{isUploading ? 'กำลังอัปโหลด...' : 'เลือกไฟล์'}</span>
                          </Button>
                        </label>
                      </div>
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
                    <h3 className="font-medium text-gray-800">{documentRecord.file_name}</h3>
                    <p className="text-sm text-gray-500">
                      ขนาด: {(documentRecord.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-gray-400">
                      อัปโหลดเมื่อ: {new Date(documentRecord.created_at).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={downloadFile}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    ดาวน์โหลด
                  </Button>
                  <Button
                    onClick={deleteFile}
                    variant="outline"
                    className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    ลบไฟล์
                  </Button>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <input
                    id="introduction-file-replace"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="introduction-file-replace" className="cursor-pointer">
                    <Button variant="ghost" size="sm" asChild>
                      <span>เปลี่ยนไฟล์</span>
                    </Button>
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};