
import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  const [hasTriggeredPrint, setHasTriggeredPrint] = useState(false);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
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
          font-family: 'TH Sarabun', 'Sarabun', Arial, sans-serif !important;
          font-size: 15px !important;
        }
        table, th, td {
          border: 1px solid #000000 !important;
          border-collapse: collapse !important;
          font-size: 15px !important;
        }
        th {
          background-color: #f3f4f6 !important;
          font-size: 14px !important;
          font-weight: bold !important;
        }
        * {
          font-size: inherit !important;
        }
        div[style*="18px"] {
          font-size: 18px !important;
        }
        div[style*="15px"] {
          font-size: 15px !important;
        }
        div[style*="14px"] {
          font-size: 14px !important;
        }
      }
    `,
    onBeforePrint: () => {
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
  });

  // Auto-trigger print when dialog opens
  useEffect(() => {
    if (isOpen && !hasTriggeredPrint && componentRef.current) {
      const timer = setTimeout(() => {
        handlePrint();
        setHasTriggeredPrint(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasTriggeredPrint, handlePrint]);

  // Reset trigger flag when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setHasTriggeredPrint(false);
    }
  }, [isOpen]);

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
