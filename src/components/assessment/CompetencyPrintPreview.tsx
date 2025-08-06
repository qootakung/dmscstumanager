import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Printer, X, Settings } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

interface Student {
  id: string;
  name: string;
  scores: number[];
  total: number;
  grade: string;
}

interface CompetencyPrintPreviewProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  competencyNumber: number;
  title: string;
  academicYear: string;
  students: Student[];
}

const CompetencyPrintPreview: React.FC<CompetencyPrintPreviewProps> = ({
  isOpen,
  onOpenChange,
  competencyNumber,
  title,
  academicYear,
  students
}) => {
  const printRef = React.useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [columnWidths, setColumnWidths] = useState({
    no: 30,
    name: 180,
    competency: 50,
    total: 40,
    grade: 60
  });
  const [directorName, setDirectorName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  
  // Calculate pages based on student count (18 students per page)
  const studentsPerPage = 18;
  const totalPages = Math.ceil(students.length / studentsPerPage);
  
  const getStudentsForPage = (pageIndex: number) => {
    const start = pageIndex * studentsPerPage;
    const end = start + studentsPerPage;
    return students.slice(start, end);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `แบบประเมินสมรรถนะด้าน_${competencyNumber}_${academicYear}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          font-family: 'Sarabun', sans-serif;
          line-height: 1.2;
        }
        table {
          border-collapse: collapse !important;
          width: 100% !important;
        }
        table, th, td {
          border: 1px solid #000 !important;
        }
        th {
          background-color: #f8f9fa !important;
          font-weight: bold !important;
        }
        .no-break {
          page-break-inside: avoid;
        }
      }
    `,
  });

  const getCompetencyCriteria = (competencyNumber: number) => {
    const criteria = {
      1: [
        'มีความสามารถในการรับสาร – ส่งสาร',
        'มีความสามารถในการถ่ายทอดความรู้ ความคิด ความเข้าใจของตนเอง โดยใช้ภาษาอย่างเหมาะสม',
        'ใช้วิธีการสื่อสารที่เหมาะสม มีประสิทธิภาพ',
        'เจรจาต่อรอง เพื่อขจัดและลดปัญหาความขัดแย้งต่าง ๆ ได้',
        'เลือกรับและไม่รับข้อมูลข่าวสารด้วยเหตุผลและถูกต้อง'
      ],
      2: [
        'มีความสามารถในการคิดวิเคราะห์ สังเคราะห์',
        'มีทักษะในการคิดนอกกรอบอย่างสร้างสรรค์',
        'สามารถคิดอย่างมีวิจารณญาณ',
        'มีความสามารถในการคิดอย่างมีระบบ',
        'ตัดสินใจแก้ปัญหาเกี่ยวกับตนเองได้อย่างเหมาะสม'
      ],
      3: [
        'สามารถแก้ปัญหาและอุปสรรคต่าง ๆ ที่เผชิญได้',
        'ใช้เหตุผลในการแก้ปัญหา',
        'เข้าใจความสัมพันธ์และการเปลี่ยนแปลงในสังคม',
        'แสวงหาความรู้ ประยุกต์ความรู้มาใช้ในการป้องกันและแก้ไขปัญหา',
        'สามารถตัดสินใจได้เหมาะสมตามวัย'
      ],
      4: [
        'เรียนรู้ด้วยตนเองได้เหมาะสมตามวัย',
        'สามารถทำงานกลุ่มร่วมกับผู้อื่นได้',
        'นำความรู้ที่ได้ไปใช้ประโยชน์ในชีวิตประจำวัน',
        'จัดการปัญหาและความขัดแย้งได้เหมาะสม',
        'หลีกเลี่ยงพฤติกรรมไม่พึงประสงค์ที่ส่งผลกระทบต่อตนเอง'
      ],
      5: [
        'เลือกและใช้เทคโนโลยีได้เหมาะสมตามวัย',
        'มีทักษะกระบวนการทางเทคโนโลยี',
        'สามารถนำเทคโนโลยีไปใช้พัฒนาตนเอง',
        'ใช้เทคโนโลยีในการแก้ปัญหาอย่างสร้างสรรค์',
        'มีคุณธรรม จริยธรรม ในการใช้เทคโนโลยี'
      ]
    };
    return criteria[competencyNumber] || [];
  };

  const competencyCriteria = getCompetencyCriteria(competencyNumber);
  
  const competencyTitles = {
    1: 'ความสามารถในการสื่อสาร',
    2: 'ความสามารถในการคิด', 
    3: 'ความสามารถในการแก้ปัญหา',
    4: 'ความสามารถในการใช้ทักษะชีวิต',
    5: 'ความสามารถในการใช้เทคโนโลยี'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>ตัวอย่างก่อนพิมพ์</span>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowSettings(!showSettings)} 
                variant="outline" 
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                ปรับตาราง
              </Button>
              <Button onClick={handlePrint} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Printer className="h-4 w-4 mr-2" />
                พิมพ์
              </Button>
              <Button onClick={() => onOpenChange(false)} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                ปิด
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-gray-50 p-4 mb-4 rounded-lg">
            <h3 className="font-semibold mb-3">ปรับขนาดตาราง</h3>
            <div className="grid grid-cols-5 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium">เลขที่</label>
                <Input
                  type="number"
                  value={columnWidths.no}
                  onChange={(e) => setColumnWidths(prev => ({...prev, no: parseInt(e.target.value)}))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">ชื่อ-สกุล</label>
                <Input
                  type="number"
                  value={columnWidths.name}
                  onChange={(e) => setColumnWidths(prev => ({...prev, name: parseInt(e.target.value)}))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">สมรรถนะ</label>
                <Input
                  type="number"
                  value={columnWidths.competency}
                  onChange={(e) => setColumnWidths(prev => ({...prev, competency: parseInt(e.target.value)}))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">รวม</label>
                <Input
                  type="number"
                  value={columnWidths.total}
                  onChange={(e) => setColumnWidths(prev => ({...prev, total: parseInt(e.target.value)}))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">ระดับคุณภาพ</label>
                <Input
                  type="number"
                  value={columnWidths.grade}
                  onChange={(e) => setColumnWidths(prev => ({...prev, grade: parseInt(e.target.value)}))}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">ชื่อผู้อำนวยการ</label>
                <Input
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  placeholder="กรอกชื่อผู้อำนวยการ"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">ชื่อครูประจำชั้น</label>
                <Input
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="กรอกชื่อครูประจำชั้น"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}

        <div ref={printRef} className="bg-white font-sarabun">
          <style>{`
            @media print {
              body { 
                font-family: 'Sarabun', sans-serif !important; 
                margin: 0 !important; 
                padding: 0 !important;
                font-size: 15pt !important;
                line-height: 1.2 !important;
              }
              .print-page {
                page-break-after: always;
                padding: 15mm !important;
                width: 210mm !important;
                min-height: 297mm !important;
                max-height: 297mm !important;
                box-sizing: border-box !important;
                overflow: hidden !important;
              }
              .print-page:last-child {
                page-break-after: avoid;
              }
              table {
                border-collapse: collapse !important;
                width: 100% !important;
                table-layout: fixed !important;
              }
              table, th, td {
                border: 1px solid #000 !important;
                border-collapse: collapse !important;
              }
              th {
                background-color: #f8f9fa !important;
                font-weight: bold !important;
                padding: 4px !important;
                text-align: center !important;
                vertical-align: middle !important;
                word-wrap: break-word !important;
                overflow: hidden !important;
              }
              td {
                padding: 4px !important;
                text-align: center !important;
                vertical-align: middle !important;
                word-wrap: break-word !important;
                overflow: hidden !important;
              }
              .vertical-text {
                writing-mode: vertical-rl !important;
                text-orientation: mixed !important;
                height: 120px !important;
                width: 40px !important;
                font-size: 11pt !important;
                line-height: 1.1 !important;
                padding: 2px !important;
                overflow: hidden !important;
                word-wrap: break-word !important;
              }
              .signature-section {
                margin-top: 15px !important;
                font-size: 14pt !important;
                display: flex !important;
                justify-content: space-between !important;
                align-items: flex-start !important;
              }
              .signature-box {
                text-align: center !important;
                width: 45% !important;
              }
              .signature-line {
                margin: 8px 0 !important;
              }
              .page-break {
                page-break-before: always !important;
              }
            }
            @media screen {
              .print-page {
                border: 1px solid #ccc;
                margin-bottom: 20px;
                padding: 15mm;
                width: 210mm;
                min-height: 297mm;
                background: white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
            }
          `}</style>
          
          {/* Generate pages */}
          {Array.from({ length: totalPages }, (_, pageIndex) => {
            const pageStudents = getStudentsForPage(pageIndex);
            const emptyRowsCount = Math.max(0, studentsPerPage - pageStudents.length);
            
            return (
              <div key={pageIndex} className={`print-page ${pageIndex > 0 ? 'page-break' : ''}`}>
                {/* Header */}
                <div className="text-center mb-4" style={{ fontSize: '16pt' }}>
                  <h1 className="font-bold mb-2">
                    แบบประเมินสมรรถนะสำหรับผู้เรียนเด่น ชั้นประถมศึกษาปีที่ 1
                  </h1>
                  <h2 className="font-semibold mb-1">
                    สมรรถนะด้านที่ {competencyNumber} {competencyTitles[competencyNumber]}
                  </h2>
                  <p style={{ fontSize: '14pt' }}>ปีการศึกษา {academicYear}</p>
                  {totalPages > 1 && (
                    <p style={{ fontSize: '12pt' }} className="mt-2">หน้าที่ {pageIndex + 1} จาก {totalPages}</p>
                  )}
                </div>

                {/* Assessment Table */}
                <table className="w-full border-collapse border-black" style={{ fontSize: '15pt', tableLayout: 'fixed' }}>
                  <thead>
                    <tr>
                      <th 
                        rowSpan={2} 
                        className="border border-black bg-gray-100"
                        style={{ width: '40px', padding: '4px', textAlign: 'center' }}
                      >
                        เลขที่
                      </th>
                      <th 
                        rowSpan={2} 
                        className="border border-black bg-gray-100"
                        style={{ width: '120px', padding: '4px', textAlign: 'center' }}
                      >
                        ชื่อ-สกุล
                      </th>
                      <th colSpan={5} className="border border-black bg-gray-100" style={{ padding: '4px', textAlign: 'center' }}>
                        สมรรถนะด้านที่ {competencyNumber}
                      </th>
                      <th 
                        rowSpan={2} 
                        className="border border-black bg-gray-100"
                        style={{ width: '35px', padding: '4px', textAlign: 'center' }}
                      >
                        รวม
                      </th>
                      <th 
                        rowSpan={2} 
                        className="border border-black bg-gray-100"
                        style={{ width: '50px', padding: '4px', textAlign: 'center' }}
                      >
                        ระดับคุณภาพ
                      </th>
                    </tr>
                    <tr>
                      {competencyCriteria.map((criteria, index) => {
                        const shouldSplit = criteria.length > 25;
                        let firstLine = criteria;
                        let secondLine = '';
                        
                        if (shouldSplit) {
                          const words = criteria.split(' ');
                          const midPoint = Math.ceil(words.length / 2);
                          firstLine = words.slice(0, midPoint).join(' ');
                          secondLine = words.slice(midPoint).join(' ');
                        }
                        
                        return (
                          <th 
                            key={index} 
                            className="border border-black bg-gray-100 vertical-text"
                            style={{ 
                              width: '40px',
                              writingMode: 'vertical-rl',
                              textOrientation: 'mixed',
                              fontSize: '11pt',
                              lineHeight: '1.1',
                              height: '120px',
                              padding: '2px',
                              position: 'relative'
                            }}
                          >
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              height: '100%',
                              gap: '2px'
                            }}>
                              <span>{firstLine}</span>
                              {secondLine && (
                                <>
                                  <div style={{ 
                                    width: '20px', 
                                    height: '1px', 
                                    backgroundColor: '#dc2626', 
                                    margin: '2px 0' 
                                  }}></div>
                                  <span>{secondLine}</span>
                                </>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {pageStudents.map((student, index) => (
                      <tr key={student.id}>
                        <td className="border border-black" style={{ padding: '4px', textAlign: 'center' }}>
                          {pageIndex * studentsPerPage + index + 1}
                        </td>
                        <td className="border border-black" style={{ padding: '4px', textAlign: 'left' }}>
                          {student.name}
                        </td>
                        {student.scores.map((score, scoreIndex) => (
                          <td key={scoreIndex} className="border border-black" style={{ padding: '4px', textAlign: 'center' }}>
                            {score || '-'}
                          </td>
                        ))}
                        <td className="border border-black font-semibold" style={{ padding: '4px', textAlign: 'center' }}>
                          {student.total || '-'}
                        </td>
                        <td className="border border-black" style={{ padding: '4px', textAlign: 'center' }}>
                          {student.grade || '-'}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Add empty rows for this page */}
                    {Array.from({ length: emptyRowsCount }, (_, index) => (
                      <tr key={`empty-${pageIndex}-${index}`}>
                        <td className="border border-black" style={{ padding: '4px', textAlign: 'center' }}>
                          {pageIndex * studentsPerPage + pageStudents.length + index + 1}
                        </td>
                        <td className="border border-black" style={{ padding: '4px' }}>&nbsp;</td>
                        <td className="border border-black" style={{ padding: '4px' }}>&nbsp;</td>
                        <td className="border border-black" style={{ padding: '4px' }}>&nbsp;</td>
                        <td className="border border-black" style={{ padding: '4px' }}>&nbsp;</td>
                        <td className="border border-black" style={{ padding: '4px' }}>&nbsp;</td>
                        <td className="border border-black" style={{ padding: '4px' }}>&nbsp;</td>
                        <td className="border border-black" style={{ padding: '4px' }}>&nbsp;</td>
                        <td className="border border-black" style={{ padding: '4px' }}>&nbsp;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Signature Section */}
                <div className="signature-section" style={{ 
                  marginTop: '15px', 
                  fontSize: '14pt',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div className="signature-box" style={{ textAlign: 'center', width: '45%' }}>
                    <p style={{ marginBottom: '8px' }}>รับรองข้อมูลถูกต้อง</p>
                    <div className="signature-line" style={{ margin: '8px 0' }}>
                      <p>( {directorName || '.................................'} )</p>
                    </div>
                    <p>ผู้อำนวยการโรงเรียนบ้านดอนมูล</p>
                  </div>
                  <div className="signature-box" style={{ textAlign: 'center', width: '45%' }}>
                    <p style={{ marginBottom: '8px' }}>ตรวจสอบข้อมูลถูกต้อง</p>
                    <div className="signature-line" style={{ margin: '8px 0' }}>
                      <p>( {teacherName || '.................................'} )</p>
                    </div>
                    <p>ครูประจำชั้น</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompetencyPrintPreview;