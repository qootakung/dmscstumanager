
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface ActionButtonsProps {
  onPrint: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onPrint }) => (
  <div className="flex justify-end gap-3">
    <Button onClick={onPrint} className="flex items-center gap-2">
      <Printer className="w-4 h-4" />
      พิมพ์หลักฐานการจ่ายเงิน
    </Button>
  </div>
);

export default ActionButtons;
