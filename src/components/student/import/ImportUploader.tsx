
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ImportUploaderProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

const ImportUploader: React.FC<ImportUploaderProps> = ({ onFileUpload, isUploading }) => {
  return (
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
          onChange={onFileUpload}
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
  );
};

export default ImportUploader;
