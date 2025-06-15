
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
        className="w-24 h-8"
        disabled={isPending}
      />
    );
  }

  return (
    <div 
      onClick={() => onCellClick(record, column)} 
      className="cursor-pointer min-h-[32px] flex items-center p-2 -m-2 rounded-md hover:bg-muted"
    >
      {value !== null && value !== undefined ? value.toFixed(2) : <span className="text-muted-foreground">-</span>}
    </div>
  );
};

export default HealthEditableCell;
