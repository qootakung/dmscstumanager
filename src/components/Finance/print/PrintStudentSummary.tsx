
import React from 'react';

interface PrintStudentSummaryProps {
    studentCount: number;
    schoolName: string;
}

const PrintStudentSummary: React.FC<PrintStudentSummaryProps> = ({ studentCount, schoolName }) => (
    <>
        <div style={{ marginBottom: 8, lineHeight: '1.6', fontSize: '15px' }}>
            <span>นักเรียนจำนวนทั้งสิ้น</span>
            <span style={{
                display: "inline-block",
                borderBottom: "1px dotted #000",
                width: 50,
                marginLeft: 5,
                marginRight: 5,
                textAlign: "center"
            }}>{studentCount}</span>
            <span>คน ได้รับเงินจากโรงเรียน</span>
            <span style={{
                display: "inline-block",
                borderBottom: "1px dotted #000",
                minWidth: 150,
                marginLeft: 5,
                textAlign: "center",
                padding: '0 5px',
            }}>{schoolName}</span>
        </div>
        <div style={{ marginBottom: 12, lineHeight: '1.4', fontSize: '14px' }}>
            <span>
                สังกัดสำนักงานเขตพื้นที่การศึกษา ประถมศึกษาลำพูนเขต 2 ข้าพเจ้าขอรับรองว่าจะนำเงิน
                ที่ได้รับไปดำเนินการตามวัตถุประสงค์ของทางราชการ หากไม่ดำเนินการดังกล่าวข้าพเจ้ายินยอมชดใช้เงินคืน
                ให้กับโรงเรียนต่อไป
            </span>
        </div>
    </>
);

export default PrintStudentSummary;
