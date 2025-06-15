
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
      border: "2px solid #000",
      borderRadius: 4,
      width: 24, height: 24,
      marginRight: 8
    }}>
      {checked && (
        <span style={{
          display: "inline-block",
          width: 18,
          height: 18,
          background: "#059669",
          margin: 1,
          borderRadius: 2,
          position: "relative"
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: "block" }}>
            <polyline points="3,10 8,15 15,5" style={{ fill: "none", stroke: "white", strokeWidth: 3 }} />
          </svg>
        </span>
      )}
    </span>
    <span>{label}</span>
  </div>
);

export default PrintCheckbox;
