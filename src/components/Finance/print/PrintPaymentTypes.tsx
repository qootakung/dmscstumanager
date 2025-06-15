
import React from 'react';
import PrintCheckbox from './PrintCheckbox';

interface PrintPaymentTypesProps {
  paymentTypes: string[];
  paymentOptions: string[];
}

const PrintPaymentTypes: React.FC<PrintPaymentTypesProps> = ({ paymentTypes, paymentOptions }) => {
  const [
    equipment,      // ค่าอุปกรณ์การเรียน
    uniform,        // ค่าเครื่องแบบนักเรียน
    teachingSupport,// ค่าจัดการเรียนการสอน
    uniformExtra,   // ค่าเครื่องแบบนักเรียน (เพิ่มเติม)
    equipmentExtra  // ค่าอุปกรณ์การเรียน (เพิ่มเติม)
  ] = paymentOptions;

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 32, rowGap: 8 }}>
        <PrintCheckbox label={equipment} checked={paymentTypes.includes(equipment)} />
        <PrintCheckbox label={uniform} checked={paymentTypes.includes(uniform)} />
        <PrintCheckbox label={equipmentExtra} checked={paymentTypes.includes(equipmentExtra)} />
        <PrintCheckbox label={uniformExtra} checked={paymentTypes.includes(uniformExtra)} />
      </div>
      <div style={{ marginTop: 8 }}>
        <PrintCheckbox label={teachingSupport} checked={paymentTypes.includes(teachingSupport)} />
      </div>
    </div>
  );
};

export default PrintPaymentTypes;
