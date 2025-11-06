import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import DentalMilkPrintPreview from './DentalMilkPrintPreview';
import type { Student } from '@/types/student';
import { Printer } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DentalMilkPrintDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  students: Student[];
  recordedData: {[key: string]: boolean};
  selectedMonth: number;
  selectedYear: number;
  selectedGrade: string;
  recordingMode: 'brushing' | 'milk';
}

const DentalMilkPrintDialog: React.FC<DentalMilkPrintDialogProps> = ({
  isOpen,
  onOpenChange,
  students,
  recordedData,
  selectedMonth,
  selectedYear,
  selectedGrade,
  recordingMode,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [printing, setPrinting] = useState(false);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `บันทึก${recordingMode === 'brushing' ? 'แปรงฟัน' : 'ดื่มนม'}-${selectedMonth}-${selectedYear}`,
  });

  const onPrintClick = () => {
    setPrinting(true);
    handlePrint();
    setTimeout(() => {
      setPrinting(false);
      toast({
        title: "พิมพ์เอกสารสำเร็จ",
        description: "สามารถนำเอกสารไปใช้งานต่อได้",
      });
    }, 1000);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle>ตัวอย่างก่อนพิมพ์</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div className="bg-white shadow-lg mx-auto" style={{width: 'fit-content'}}>
            <DentalMilkPrintPreview 
              ref={componentRef}
              students={students}
              recordedData={recordedData}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              selectedGrade={selectedGrade}
              recordingMode={recordingMode}
            />
          </div>
        </div>
        <DialogFooter className="p-4 border-t bg-background flex-row justify-end items-center space-x-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={printing}>ปิด</Button>
          </DialogClose>
          <Button onClick={onPrintClick} disabled={printing}>
            <Printer className="mr-2 h-4 w-4" />
            {printing ? "กำลังพิมพ์..." : "พิมพ์เอกสาร"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DentalMilkPrintDialog;
