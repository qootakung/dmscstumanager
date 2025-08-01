
import React from 'react';
import { Input } from '@/components/ui/input';
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
      <Input
        type="number"
        value={editValue}
        onChange={(e) => onValueChange(e.target.value)}
        onBlur={onUpdate}
        onKeyDown={onKeyDown}
        autoFocus
        className="w-28 h-8 text-center"
        disabled={isPending}
        placeholder={column === 'weight' ? 'น้ำหนัก' : 'ส่วนสูง'}
        min="0"
        step="0.1"
      />
    );
  }

  return (
    <div 
      onClick={() => onCellClick(record, column)} 
      className="cursor-pointer min-h-[32px] flex items-center justify-center p-2 -m-2 rounded-md hover:bg-muted/60 transition-colors group"
      title={`คลิกเพื่อแก้ไข${column === 'weight' ? 'น้ำหนัก' : 'ส่วนสูง'}`}
    >
      <div className="flex items-center gap-1">
        {value !== null && value !== undefined ? (
          <span className="text-center min-w-[60px]">{value.toFixed(2)}</span>
        ) : (
          <span className="text-muted-foreground text-center min-w-[60px] group-hover:text-primary">
            คลิกเพื่อเพิ่ม
          </span>
        )}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground">
          ✏️
        </span>
      </div>
    </div>
  );
};

export default HealthEditableCell;
