
import React from 'react';
import PrintCheckbox from './PrintCheckbox';

interface PrintPaymentTypesProps {
  paymentTypes: string[];
  paymentOptions: string[];
}

const PrintPaymentTypes: React.FC<PrintPaymentTypesProps> = ({ paymentTypes, paymentOptions }) => {
  const optionsInGrid = paymentOptions.slice(0, 4);
  const lastOption = paymentOptions.length > 4 ? paymentOptions[4] : null;

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 32, rowGap: 8 }}>
        {optionsInGrid.map(option => (
          <PrintCheckbox key={option} label={option} checked={paymentTypes.includes(option)} />
        ))}
      </div>
      {lastOption && (
        <div style={{ marginTop: 8 }}>
          <PrintCheckbox label={lastOption} checked={paymentTypes.includes(lastOption)} />
        </div>
      )}
    </div>
  );
};

export default PrintPaymentTypes;
