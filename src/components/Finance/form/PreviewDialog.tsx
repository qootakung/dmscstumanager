
import React from 'react';
import type { PaymentVoucherData } from '@/components/FinancialReports';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import PrintPreview from "@/components/Finance/PrintPreview";

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucherData: PaymentVoucherData;
  paymentOptions: string[];
  onPrintFromPreview: () => void;
}

const PreviewDialog: React.FC<PreviewDialogProps> = ({
  open,
  onOpenChange,
  voucherData,
  paymentOptions,
  onPrintFromPreview,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>ตัวอย่างใบหลักฐานการจ่ายเงิน</DialogTitle>
      </DialogHeader>
      <PrintPreview voucherData={voucherData} paymentOptions={paymentOptions} />
      <DialogFooter>
        <Button
          onClick={onPrintFromPreview}
          className="bg-green-600 text-white"
        >
          พิมพ์จากตัวอย่างนี้
        </Button>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          ปิด
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default PreviewDialog;
