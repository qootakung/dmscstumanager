
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';

interface ImportTemplateProps {
  onDownload: () => void;
}

const ImportTemplate: React.FC<ImportTemplateProps> = ({ onDownload }) => {
  return (
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
        onClick={onDownload}
        className="text-blue-600 border-blue-300 hover:bg-blue-100"
      >
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        ดาวน์โหลดแม่แบบ
      </Button>
    </div>
  );
};

export default ImportTemplate;
