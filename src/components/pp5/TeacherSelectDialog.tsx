
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User, Check } from 'lucide-react';
import { getTeachers } from '@/utils/teacherStorage';
import type { Teacher } from '@/types/teacher';

interface TeacherSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (teacher: Teacher) => void;
  title?: string;
}

const TeacherSelectDialog: React.FC<TeacherSelectDialogProps> = ({
  open,
  onOpenChange,
  onSelect,
  title = 'เลือกครู',
}) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadTeachers();
    }
  }, [open]);

  const loadTeachers = async () => {
    setLoading(true);
    const data = await getTeachers();
    setTeachers(data);
    setLoading(false);
  };

  const filteredTeachers = teachers.filter(teacher => {
    const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
    const position = teacher.position?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || position.includes(search);
  });

  const handleSelect = (teacher: Teacher) => {
    onSelect(teacher);
    onOpenChange(false);
    setSearchTerm('');
  };

  const getPositionColor = (position: string) => {
    if (position.includes('ผู้อำนวยการ')) return 'bg-purple-100 text-purple-700';
    if (position.includes('ชำนาญการพิเศษ')) return 'bg-emerald-100 text-emerald-700';
    if (position.includes('ชำนาญการ')) return 'bg-blue-100 text-blue-700';
    if (position.includes('ครูผู้ช่วย')) return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
            <User className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อครู หรือตำแหน่ง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              กำลังโหลดข้อมูล...
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              ไม่พบข้อมูลครู
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTeachers.map((teacher) => (
                <Button
                  key={teacher.id}
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4 hover:bg-primary/5 hover:border-primary transition-all"
                  onClick={() => handleSelect(teacher)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-foreground">
                        {teacher.firstName} {teacher.lastName}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getPositionColor(teacher.position)}`}>
                          {teacher.position}
                        </span>
                        {teacher.majorSubject && (
                          <span className="text-xs text-muted-foreground">
                            วิชา: {teacher.majorSubject}
                          </span>
                        )}
                      </div>
                    </div>
                    <Check className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100" />
                  </div>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherSelectDialog;
