
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PaymentDetailsSectionProps {
  paymentDate: string;
  amountPerStudent: string;
  onPaymentDateChange: (value: string) => void;
  onAmountPerStudentChange: (value: string) => void;
}

const PaymentDetailsSection: React.FC<PaymentDetailsSectionProps> = ({
  paymentDate,
  amountPerStudent,
  onPaymentDateChange,
  onAmountPerStudentChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
      <div>
        <Label htmlFor="paymentDate">วันที่จ่ายเงิน</Label>
        <Input
          id="paymentDate"
          value={paymentDate}
          onChange={(e) => onPaymentDateChange(e.target.value)}
          placeholder="เช่น 18 มิ.ย. 68"
        />
      </div>
      <div>
        <Label htmlFor="amountPerStudent">จำนวนเงิน (ต่อคน)</Label>
        <Input
          id="amountPerStudent"
          type="number"
          value={amountPerStudent}
          onChange={(e) => onAmountPerStudentChange(e.target.value)}
          placeholder="ระบุจำนวนเงิน"
        />
      </div>
    </div>
  );
};

export default PaymentDetailsSection;
