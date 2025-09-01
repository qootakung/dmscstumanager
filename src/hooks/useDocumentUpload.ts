import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DocumentRecord {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  academic_year: string;
}

export const useDocumentUpload = (documentType: 'cover' | 'introduction' | 'table_of_contents' | 'notes' | 'instructions') => {
  const [isUploading, setIsUploading] = useState(false);
  const [documentRecord, setDocumentRecord] = useState<DocumentRecord | null>(null);

  const loadExistingDocument = async (academicYear: string) => {
    if (!academicYear) {
      setDocumentRecord(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('assessment_documents')
        .select('*')
        .eq('document_type', documentType)
        .eq('academic_year', academicYear)
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
    }
  };

  const uploadFile = async (file: File, academicYear: string) => {
    if (!file || !academicYear) {
      if (!academicYear) {
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
      const fileName = `${documentType}_${academicYear}_${timestamp}.${fileExt}`;
      const filePath = `${documentType}/${fileName}`;

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
          document_type: documentType,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          academic_year: academicYear,
          uploaded_by: 'current_user' // You can modify this to get actual user info
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setDocumentRecord(dbData);
      toast.success('อัปโหลดไฟล์สำเร็จ');
      return dbData;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadFile = async () => {
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

  const previewFile = async () => {
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

  const deleteFile = async () => {
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
      toast.success('ลบไฟล์สำเร็จ');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('เกิดข้อผิดพลาดในการลบไฟล์');
    }
  };

  return {
    isUploading,
    documentRecord,
    loadExistingDocument,
    uploadFile,
    downloadFile,
    previewFile,
    deleteFile,
    setDocumentRecord
  };
};