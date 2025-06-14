
import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { ImportResult } from './types';

interface ImportResultsProps {
  result: ImportResult | null;
}

const ImportResults: React.FC<ImportResultsProps> = ({ result }) => {
  if (!result) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {result.success > 0 && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span>สำเร็จ: {result.success} คน</span>
          </div>
        )}
        {result.failed > 0 && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>ล้มเหลว: {result.failed} คน</span>
          </div>
        )}
      </div>

      {result.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
          <h4 className="font-medium text-red-800 mb-2">รายการข้อผิดพลาด:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {result.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImportResults;
