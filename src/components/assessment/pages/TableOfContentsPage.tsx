import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Download, Eye, Printer, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateAcademicYears } from '@/utils/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DocumentRecord {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  academic_year: string;
}

export const TableOfContentsPage = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [documentRecord, setDocumentRecord] = useState<DocumentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const academicYears = generateAcademicYears();

  // Load existing document when academic year changes
  useEffect(() => {
    const loadExistingDocument = async () => {
      if (!selectedAcademicYear) {
        setDocumentRecord(null);
        setUploadedFile(null);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('assessment_documents')
          .select('*')
          .eq('document_type', 'table_of_contents')
          .eq('academic_year', selectedAcademicYear)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setDocumentRecord(data);
        } else {
          setDocumentRecord(null);
        }
      } catch (error) {
        console.error('Error loading document:', error);
        toast.error('เกิดข้อผิดพลาดในการโหลดเอกสาร');
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingDocument();
  }, [selectedAcademicYear]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedAcademicYear) {
      if (!selectedAcademicYear) {
        toast.error('กรุณาเลือกปีการศึกษาก่อน');
      }
      return;
    }

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('กรุณาเลือกไฟล์ PDF หรือ DOCX เท่านั้น');
      return;
    }

    setIsUploading(true);
    try {
      // Create file path
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `table_of_contents_${selectedAcademicYear}_${timestamp}.${fileExt}`;
      const filePath = `table_of_contents/${fileName}`;

      // Upload to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('assessment-documents')
        .upload(filePath, file);

      if (storageError) throw storageError;

      // Delete existing record if it exists
      if (documentRecord) {
        await supabase
          .from('assessment_documents')
          .delete()
          .eq('id', documentRecord.id);

        // Delete old file from storage
        await supabase.storage
          .from('assessment-documents')
          .remove([documentRecord.file_path]);
      }

      // Save record to database
      const { data: dbData, error: dbError } = await supabase
        .from('assessment_documents')
        .insert({
          document_type: 'table_of_contents',
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          academic_year: selectedAcademicYear,
          uploaded_by: 'current_user' // You can modify this to get actual user info
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadedFile(file);
      setDocumentRecord(dbData);
      toast.success('อัปโหลดไฟล์สำเร็จ');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!documentRecord) return;

    try {
      const { data, error } = await supabase.storage
        .from('assessment-documents')
        .download(documentRecord.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentRecord.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์');
    }
  };

  const handlePreview = async () => {
    if (!documentRecord) return;

    try {
      const { data, error } = await supabase.storage
        .from('assessment-documents')
        .download(documentRecord.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error previewing file:', error);
      toast.error('เกิดข้อผิดพลาดในการดูตัวอย่างไฟล์');
    }
  };

  const handleDelete = async () => {
    if (!documentRecord) return;

    if (!confirm('คุณต้องการลบไฟล์นี้หรือไม่?')) return;

    try {
      // Delete from storage
      await supabase.storage
        .from('assessment-documents')
        .remove([documentRecord.file_path]);

      // Delete from database
      await supabase
        .from('assessment_documents')
        .delete()
        .eq('id', documentRecord.id);

      setDocumentRecord(null);
      setUploadedFile(null);
      toast.success('ลบไฟล์สำเร็จ');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('เกิดข้อผิดพลาดในการลบไฟล์');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-3">
          สารบัญ
        </h2>
        <p className="text-gray-600 text-lg">
          อัปโหลดและจัดการไฟล์สารบัญของแบบประเมินสมรรถนะ
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
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-teal-50">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-xl text-green-700">
              <Upload className="h-6 w-6" />
              อัปโหลดไฟล์สารบัญ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!documentRecord ? (
              <div className="text-center">
                <div className="border-2 border-dashed border-green-300 rounded-lg p-8 bg-white/50">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-green-100 rounded-full">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        เลือกไฟล์สารบัญเพื่ออัปโหลด
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        รองรับไฟล์ .PDF และ .DOCX
                      </p>
                      <label htmlFor="toc-file" className="cursor-pointer">
                        <Button 
                          type="button" 
                          className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                          disabled={isUploading || isLoading}
                        >
                          {isUploading ? 'กำลังอัปโหลด...' : 'เลือกไฟล์'}
                        </Button>
                        <input
                          id="toc-file"
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
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                  >
                    <Printer className="h-4 w-4" />
                    พิมพ์รายงาน
                  </Button>
                  <Button
                    onClick={handleDelete}
                    variant="outline"
                    className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    ลบไฟล์
                  </Button>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <label htmlFor="toc-file-replace" className="cursor-pointer">
                    <Button variant="ghost" size="sm">
                      เปลี่ยนไฟล์
                    </Button>
                    <input
                      id="toc-file-replace"
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
      )}
    </div>
  );
};