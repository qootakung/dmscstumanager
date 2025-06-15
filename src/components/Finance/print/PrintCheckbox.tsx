
import React from 'react';

interface PrintCheckboxProps {
  label: string;
  checked: boolean;
}

const PrintCheckbox: React.FC<PrintCheckboxProps> = ({ label, checked }) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid #000",
      borderRadius: 2,
      width: 16, height: 16,
      marginRight: 8
    }}>
      {checked && (
        <span style={{
          display: "inline-block",
          width: 12,
          height: 12,
          background: "#059669",
          margin: 1,
          borderRadius: 1,
          position: "relative"
        }}>
          <svg width="12" height="12" viewBox="0 0 18 18" style={{ display: "block" }}>
            <polyline points="3,10 8,15 15,5" style={{ fill: "none", stroke: "white", strokeWidth: 3 }} />
          </svg>
        </span>
      )}
    </span>
    <span>{label}</span>
  </div>
);

export default PrintCheckbox;
