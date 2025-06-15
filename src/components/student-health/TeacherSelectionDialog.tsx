
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTeachers } from '@/utils/teacherStorage';
import { Teacher } from '@/types/teacher';

interface TeacherSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (teacher: Teacher) => void;
}

const TeacherSelectionDialog: React.FC<TeacherSelectionDialogProps> = ({
  open,
  onOpenChange,
  onConfirm
}) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const teacherData = await getTeachers();
        setTeachers(teacherData);
      } catch (error) {
        console.error('Failed to load teachers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      loadTeachers();
    }
  }, [open]);

  const handleConfirm = () => {
    const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
    if (selectedTeacher) {
      onConfirm(selectedTeacher);
      onOpenChange(false);
      setSelectedTeacherId('');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedTeacherId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เลือกครูประจำชั้น</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="text-center py-4">กำลังโหลดรายชื่อครู...</div>
          ) : (
            <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกครูประจำชั้น" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName} - {teacher.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            ยกเลิก
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedTeacherId || isLoading}
          >
            พิมพ์รายงาน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherSelectionDialog;
