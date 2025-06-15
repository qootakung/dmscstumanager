
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface PaymentTypeSelectionProps {
  paymentOptions: string[];
  selectedPaymentTypes: string[];
  onPaymentTypeChange: (paymentType: string, checked: boolean) => void;
}

const PaymentTypeSelection: React.FC<PaymentTypeSelectionProps> = ({
  paymentOptions,
  selectedPaymentTypes,
  onPaymentTypeChange,
}) => (
  <div>
    <Label className="text-base font-medium mb-3 block">ประเภทการจ่ายเงิน</Label>
    <div className="space-y-2">
      {paymentOptions.map((option) => (
        <div key={option} className="flex items-center space-x-2">
          <Checkbox
            id={option}
            checked={selectedPaymentTypes.includes(option)}
            onCheckedChange={(checked) =>
              onPaymentTypeChange(option, checked as boolean)
            }
          />
          <Label htmlFor={option} className="text-sm">{option}</Label>
        </div>
      ))}
    </div>
  </div>
);

export default PaymentTypeSelection;
