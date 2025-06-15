
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface ActionButtonsProps {
  onPreview: () => void;
  onPrint: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onPreview, onPrint }) => (
  <div className="flex justify-end gap-3">
    <Button variant="secondary" onClick={onPreview} className="flex items-center gap-2">
      👁️ ดูตัวอย่าง
    </Button>
    <Button onClick={onPrint} className="flex items-center gap-2">
      <Printer className="w-4 h-4" />
      พิมพ์หลักฐานการจ่ายเงิน
    </Button>
  </div>
);

export default ActionButtons;
