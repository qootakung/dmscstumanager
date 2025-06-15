
import React from 'react';
import PrintCheckbox from './PrintCheckbox';

interface PrintPaymentTypesProps {
  paymentTypes: string[];
  paymentOptions: string[];
}

const PrintPaymentTypes: React.FC<PrintPaymentTypesProps> = ({ paymentTypes, paymentOptions }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 32, rowGap: 8, marginBottom: '8px' }}>
    <div>
      <PrintCheckbox 
        label="ค่าอุปกรณ์การเรียน" 
        checked={paymentTypes.includes(paymentOptions[0])} 
      />
      <PrintCheckbox 
        label="ค่าจัดการเรียนการสอน (ปัจจัยพื้นฐานสำหรับการรับนักเรียนยากจน)" 
        checked={paymentTypes.includes(paymentOptions[2])} 
      />
    </div>
    <div>
      <PrintCheckbox 
        label="ค่าเครื่องแบบนักเรียน" 
        checked={paymentTypes.includes(paymentOptions[1])} 
      />
      <PrintCheckbox 
        label="ค่าเครื่องแบบนักเรียน (เพิ่มเติม)" 
        checked={paymentTypes.includes(paymentOptions[3])} 
      />
    </div>
  </div>
);

export default PrintPaymentTypes;
