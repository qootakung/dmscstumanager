
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
  // For level checkboxes: larger, bold, centered
  const boxSize =
    size === "large"
      ? "w-6 h-6"
      : "w-5 h-5";
  const checkSize =
    size === "large"
      ? "w-5 h-5"
      : "w-4 h-4";

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
            strokeWidth={boldCheck ? 4 : 3}
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
