
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Edit3 } from 'lucide-react';
import { StudentHealthDetails } from '@/types/student';

interface HealthEditableCellProps {
  record: StudentHealthDetails;
  column: 'weight' | 'height';
  isEditing: boolean;
  editValue: string;
  isPending: boolean;
  onCellClick: (record: StudentHealthDetails, column: 'weight' | 'height') => void;
  onValueChange: (value: string) => void;
  onUpdate: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const HealthEditableCell: React.FC<HealthEditableCellProps> = ({
  record,
  column,
  isEditing,
  editValue,
  isPending,
  onCellClick,
  onValueChange,
  onUpdate,
  onKeyDown
}) => {
  const value = column === 'weight' ? record.weight_kg : record.height_cm;

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          type="number"
          value={editValue}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
          className="w-20 h-7 text-center text-xs"
          disabled={isPending}
          placeholder={column === 'weight' ? 'น้ำหนัก' : 'ส่วนสูง'}
          min="0"
          step="0.1"
        />
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={onUpdate}
            disabled={isPending}
            className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
            title="บันทึก"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              onKeyDown({ key: 'Escape' } as React.KeyboardEvent<HTMLInputElement>);
            }}
            disabled={isPending}
            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="ยกเลิก"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 group">
      <div className="text-center min-w-[60px]">
        {value !== null && value !== undefined ? (
          <span className="font-medium">{value.toFixed(2)}</span>
        ) : (
          <span className="text-muted-foreground">
            ไม่มีข้อมูล
          </span>
        )}
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onCellClick(record, column)}
        className="h-7 w-7 opacity-50 group-hover:opacity-100 transition-opacity hover:bg-blue-50 hover:text-blue-600"
        title={`แก้ไข${column === 'weight' ? 'น้ำหนัก' : 'ส่วนสูง'}`}
        disabled={isPending}
      >
        <Edit3 className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default HealthEditableCell;
