
import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import PrintPreviewStatic from './PrintPreviewStatic';
import type { PaymentVoucherData } from '@/types/finance';
import { Printer } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface PrintPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  voucherData: PaymentVoucherData;
  paymentOptions: string[];
}

const PrintPreviewDialog: React.FC<PrintPreviewDialogProps> = ({ isOpen, onOpenChange, voucherData, paymentOptions }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [printing, setPrinting] = useState(false);

  // Note: react-to-print type definition may not match, but 'content' property is actually required
  // @ts-ignore
  const handlePrint = useReactToPrint({
    // @ts-ignore
    content: () => {
      if (!componentRef.current) {
        toast({
          title: "ไม่พบเนื้อหาเอกสาร",
          description: "เนื้อหาสำหรับพิมพ์ไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง",
          variant: "destructive",
        });
      }
      return componentRef.current;
    },
    documentTitle: `หลักฐานการจ่ายเงิน-${voucherData.grade}-${voucherData.academicYear}_${voucherData.semester}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 1.5cm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
      }
    `,
    onBeforeGetContent: () => {
      setPrinting(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setPrinting(false);
      toast({
        title: "พิมพ์เอกสารสำเร็จ",
        description: "สามารถนำเอกสารไปใช้งานต่อได้",
      });
    },
    onPrintError: (error: any) => {
      setPrinting(false);
      toast({
        title: "เกิดข้อผิดพลาดขณะพิมพ์",
        description: "ไม่สามารถพิมพ์เอกสารได้ โปรดลองใหม่ หรือใช้เบราว์เซอร์อื่น",
        variant: "destructive",
      });
      console.error("Print Error:", error);
    }
  });

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 sm:max-w-4xl">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle>ตัวอย่างก่อนพิมพ์</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
            <div className="p-6 bg-white shadow-lg mx-auto">
                 <PrintPreviewStatic ref={componentRef} voucherData={voucherData} paymentOptions={paymentOptions} />
            </div>
        </div>
        <DialogFooter className="p-4 border-t bg-background flex-row justify-end items-center space-x-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={printing}>ปิด</Button>
          </DialogClose>
          <Button onClick={handlePrint} disabled={printing}>
            <Printer className="mr-2 h-4 w-4" />
            {printing ? "กำลังพิมพ์..." : "พิมพ์เอกสาร"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintPreviewDialog;

