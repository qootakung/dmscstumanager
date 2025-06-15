
import React from 'react';

interface PrintStudentSummaryProps {
    studentCount: number;
    schoolName: string;
}

const PrintStudentSummary: React.FC<PrintStudentSummaryProps> = ({ studentCount, schoolName }) => (
    <>
        <div style={{ marginBottom: 6 }}>
            <span>นักเรียนจำนวนทั้งสิ้น</span>
            <span style={{
                display: "inline-block",
                borderBottom: "1px dotted #000",
                width: 32,
                marginLeft: 5,
                marginRight: 5,
                textAlign: "center"
            }}>{studentCount}</span>
            <span>คน ได้รับเงินจากโรงเรียน{schoolName}</span>
        </div>
        <div style={{ marginBottom: 10 }}>
            <span>
                สังกัดสำนักงานเขตพื้นที่การศึกษาประถมศึกษาลำพูนเขต 2 <br />
                ข้าพเจ้าขอรับรองว่าเงินที่ได้รับไปได้นำไปตามวัตถุประสงค์ของทางราชการ หากไม่ดำเนินการดังกล่าวข้าพเจ้ายินยอมชดใช้เงินคืนให้กับโรงเรียนต่อไป
            </span>
        </div>
    </>
);

export default PrintStudentSummary;
