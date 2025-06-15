
import React from "react";
import { Check } from "lucide-react";

interface PaymentOptionCheckboxProps {
  label: string;
  checked: boolean;
  className?: string;
}

const PaymentOptionCheckbox: React.FC<PaymentOptionCheckboxProps> = ({
  label,
  checked,
  className,
}) => (
  <div className={`flex items-center gap-2 ${className ?? ""}`}>
    <span
      className="inline-block border-2 border-neutral-900 w-5 h-5 mr-1 align-middle flex items-center justify-center rounded bg-white"
      style={{ boxShadow: "0 0 0 1.5px #000" }}
    >
      {checked && <Check className="w-4 h-4 text-green-600" strokeWidth={3} />}
    </span>
    <span>{label}</span>
  </div>
);

export default PaymentOptionCheckbox;
