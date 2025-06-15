import React from "react";
import { Check } from "lucide-react";

interface PaymentOptionCheckboxProps {
  label?: string;
  checked: boolean;
  className?: string;
  hideLabel?: boolean;
  boldCheck?: boolean;
  size?: "default" | "large";
}

const PaymentOptionCheckbox: React.FC<PaymentOptionCheckboxProps> = ({
  label,
  checked,
  className,
  hideLabel = false,
  boldCheck = false,
  size = "default"
}) => {
  // ปรับขนาดให้เล็กลงกว่าเดิมประมาณ 2px
  const boxSize =
    size === "large"
      ? "w-5 h-5"   // เดิม w-6 h-6, ลดลง
      : "w-4 h-4";  // เดิม w-5 h-5, ลดลง
  const checkSize =
    size === "large"
      ? "w-4 h-4"   // เดิม w-5 h-5, ลดลง
      : "w-3 h-3";  // เดิม w-4 h-4, ลดลง

  // Custom style for more bold check
  // hideLabel for just showing the box with check
  return (
    <div
      className={`flex items-center gap-2 select-none ${className ?? ""}`}
      style={{ minWidth: hideLabel ? undefined : 0 }}
    >
      <span
        className={`inline-flex items-center justify-center border-2 border-black bg-white rounded ${boxSize} mr-1`}
        style={{
          boxSizing: "border-box"
        }}
      >
        {checked && (
          <Check
            className={`${checkSize} text-green-600`}
            strokeWidth={boldCheck ? 3.5 : 2.5}
          />
        )}
      </span>
      {!hideLabel && (
        <span>{label}</span>
      )}
    </div>
  );
};

export default PaymentOptionCheckbox;
