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
    no: 25,
    name: 200,
    competency: 40,
    total: 35,
    grade: 55
  });
  const [directorName, setDirectorName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('1');

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `แบบประเมินสมรรถนะด้าน_${competencyNumber}_ชั้น${gradeLevel}_${academicYear}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm 8mm;
        @top-center {
          content: none;
        }
        @bottom-center {
          content: none;
        }
      }
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        body {
          font-family: 'TH Sarabun New', 'Sarabun', sans-serif !important;
          line-height: 1.2 !important;
          font-size: 15pt !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .print-container {
          width: 100% !important;
          height: 100vh !important;
          display: flex !important;
          flex-direction: column !important;
          page-break-inside: avoid !important;
        }
        .print-header {
          text-align: center !important;
          margin-bottom: 15px !important;
        }
        table {
          border-collapse: collapse !important;
          width: 100% !important;
          table-layout: fixed !important;
          font-size: 15pt !important;
        }
        table, th, td {
          border: 2px solid #000 !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        th {
          background-color: #f8f9fa !important;
          font-weight: bold !important;
          padding: 8px 4px !important;
          text-align: center !important;
          vertical-align: middle !important;
        }
        td {
          padding: 6px 4px !important;
          text-align: center !important;
          vertical-align: middle !important;
        }
        .student-name {
          text-align: left !important;
          padding-left: 8px !important;
        }
        .competency-header {
          writing-mode: vertical-rl !important;
          text-orientation: mixed !important;
          height: 120px !important;
          width: 35px !important;
          font-size: 11pt !important;
          line-height: 1.1 !important;
          padding: 4px 2px !important;
        }
        .signature-section {
          margin-top: 30px !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: flex-start !important;
        }
        .signature-item {
          text-align: center !important;
          flex: 1 !important;
        }
        h1 {
          font-size: 16pt !important;
          font-weight: bold !important;
          margin: 10px 0 !important;
        }
        h2 {
          font-size: 14pt !important;
          font-weight: bold !important;
          margin: 8px 0 !important;
        }
        .grade-year {
          font-size: 13pt !important;
          margin: 5px 0 !important;
        }
        .page-break {
          page-break-before: always !important;
        }
      }
    `,
    onBeforePrint: async () => {
      console.log('Starting print...');
    },
    onAfterPrint: async () => {
      console.log('Print completed!');
    },
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">ระดับชั้น</label>
                <Input
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  placeholder="ป.1"
                  className="mt-1"
                />
              </div>
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

        <div ref={printRef} className="bg-white p-6 font-sarabun">
          {/* Generate pages with max 18 students each */}
          {(() => {
            const pages = [];
            const studentsPerPage = 18;
            const totalPages = Math.ceil(students.length / studentsPerPage);
            
            for (let pageIndex = 0; pageIndex < Math.max(1, totalPages); pageIndex++) {
              const startIndex = pageIndex * studentsPerPage;
              const endIndex = Math.min(startIndex + studentsPerPage, students.length);
              const pageStudents = students.slice(startIndex, endIndex);
              
              // Calculate remaining empty rows
              const emptyRowsCount = studentsPerPage - pageStudents.length;
              
              pages.push(
                <div key={pageIndex} className={`print-container ${pageIndex > 0 ? 'page-break' : ''}`}>
                  {/* Header */}
                  <div className="print-header">
                    <h1 className="text-lg font-bold mb-2">
                      แบบประเมินสมรรถนะสำคัญผู้เรียน ชั้นประถมศึกษาปีที่ {gradeLevel}
                    </h1>
                    <h2 className="text-base font-semibold">
                      สมรรถนะด้านที่ {competencyNumber} {competencyTitles[competencyNumber]}
                    </h2>
                    <p className="grade-year">ปีการศึกษา {academicYear}</p>
                    {totalPages > 1 && (
                      <p className="text-sm mt-1">หน้าที่ {pageIndex + 1} จาก {totalPages}</p>
                    )}
                  </div>

                  {/* Assessment Table */}
                  <table style={{ fontSize: '15px', borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                      <tr>
                        <th 
                          rowSpan={2} 
                          style={{ 
                            width: `${columnWidths.no}px`,
                            border: '2px solid #000',
                            backgroundColor: '#f8f9fa',
                            padding: '8px 4px',
                            textAlign: 'center'
                          }}
                        >
                          เลขที่
                        </th>
                        <th 
                          rowSpan={2} 
                          style={{ 
                            width: `${columnWidths.name}px`,
                            border: '2px solid #000',
                            backgroundColor: '#f8f9fa',
                            padding: '8px 4px',
                            textAlign: 'center'
                          }}
                        >
                          ชื่อ-สกุล
                        </th>
                        <th 
                          colSpan={5} 
                          style={{ 
                            border: '2px solid #000',
                            backgroundColor: '#f8f9fa',
                            padding: '8px 4px',
                            textAlign: 'center'
                          }}
                        >
                          สมรรถนะด้านที่ {competencyNumber}
                        </th>
                        <th 
                          rowSpan={2} 
                          style={{ 
                            width: `${columnWidths.total}px`,
                            border: '2px solid #000',
                            backgroundColor: '#f8f9fa',
                            padding: '8px 4px',
                            textAlign: 'center'
                          }}
                        >
                          รวม
                        </th>
                        <th 
                          rowSpan={2} 
                          style={{ 
                            width: `${columnWidths.grade}px`,
                            border: '2px solid #000',
                            backgroundColor: '#f8f9fa',
                            padding: '8px 4px',
                            textAlign: 'center'
                          }}
                        >
                          ระดับคุณภาพ
                        </th>
                      </tr>
                      <tr>
                        {competencyCriteria.map((criteria, index) => {
                           // Split criteria into max 3 lines
                           const words = criteria.split(' ');
                           let lines = [];
                           
                           if (words.length > 3) {
                             const wordsPerLine = Math.ceil(words.length / 3);
                             for (let i = 0; i < words.length; i += wordsPerLine) {
                               lines.push(words.slice(i, i + wordsPerLine).join(' '));
                             }
                             lines = lines.slice(0, 3);
                           } else {
                             lines = [criteria];
                           }
                           
                           return (
                             <th 
                               key={index} 
                               className="competency-header"
                               style={{ 
                                 width: `${columnWidths.competency}px`,
                                 border: '2px solid #000',
                                 backgroundColor: '#f8f9fa',
                                 writingMode: 'vertical-rl',
                                 textOrientation: 'mixed',
                                 height: '120px',
                                 fontSize: '11pt',
                                 padding: '4px 2px',
                                 textAlign: 'center',
                                 verticalAlign: 'middle'
                               }}
                             >
                               <div style={{ 
                                 display: 'flex', 
                                 flexDirection: 'column', 
                                 alignItems: 'center', 
                                 justifyContent: 'center', 
                                 height: '100%' 
                               }}>
                                 {lines.map((line, lineIndex) => (
                                   <div key={lineIndex}>
                                     <span>{line}</span>
                                     {lineIndex < lines.length - 1 && (
                                       <div style={{ 
                                         borderTop: '1px solid #dc2626', 
                                         margin: '2px 0', 
                                         width: '100%' 
                                       }}></div>
                                     )}
                                   </div>
                                 ))}
                               </div>
                             </th>
                           );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {pageStudents.map((student, index) => (
                        <tr key={student.id}>
                          <td style={{ 
                            border: '2px solid #000', 
                            padding: '6px 4px', 
                            textAlign: 'center' 
                          }}>
                            {startIndex + index + 1}
                          </td>
                          <td 
                            className="student-name"
                            style={{ 
                              border: '2px solid #000', 
                              padding: '6px 8px', 
                              textAlign: 'left' 
                            }}
                          >
                            {student.name}
                          </td>
                          {student.scores.map((score, scoreIndex) => (
                            <td key={scoreIndex} style={{ 
                              border: '2px solid #000', 
                              padding: '6px 4px', 
                              textAlign: 'center' 
                            }}>
                              {score || '-'}
                            </td>
                          ))}
                          <td style={{ 
                            border: '2px solid #000', 
                            padding: '6px 4px', 
                            textAlign: 'center', 
                            fontWeight: 'bold' 
                          }}>
                            {student.total || '-'}
                          </td>
                          <td style={{ 
                            border: '2px solid #000', 
                            padding: '6px 4px', 
                            textAlign: 'center' 
                          }}>
                            {student.grade || '-'}
                          </td>
                        </tr>
                      ))}
                      
                      {/* Add empty rows to fill the page */}
                      {Array.from({ length: emptyRowsCount }, (_, index) => (
                        <tr key={`empty-${pageIndex}-${index}`}>
                          <td style={{ 
                            border: '2px solid #000', 
                            padding: '6px 4px', 
                            textAlign: 'center' 
                          }}>
                            {startIndex + pageStudents.length + index + 1}
                          </td>
                          <td style={{ 
                            border: '2px solid #000', 
                            padding: '6px 4px', 
                            textAlign: 'center' 
                          }}>
                            &nbsp;
                          </td>
                          <td style={{ 
                            border: '2px solid #000', 
                            padding: '6px 4px', 
                            textAlign: 'center' 
                          }}>
                            &nbsp;
                          </td>
                          <td style={{ 
                            border: '2px solid #000', 
                            padding: '6px 4px', 
                            textAlign: 'center' 
                          }}>
                            &nbsp;
                          </td>
                          <td style={{ 
                            border: '2px solid #000', 
                            padding: '6px 4px', 
                            textAlign: 'center' 
                          }}>
                            &nbsp;
                          </td>
                          <td style={{ 
                            border: '2px solid #000', 
                            padding: '6px 4px', 
                            textAlign: 'center' 
                          }}>
                            &nbsp;
                          </td>
                          <td style={{ 
                            border: '2px solid #000', 
                            padding: '6px 4px', 
                            textAlign: 'center' 
                          }}>
                            &nbsp;
                          </td>
                          <td style={{ 
                            border: '2px solid #000', 
                            padding: '6px 4px', 
                            textAlign: 'center' 
                          }}>
                            &nbsp;
                          </td>
                          <td style={{ 
                            border: '2px solid #000', 
                            padding: '6px 4px', 
                            textAlign: 'center' 
                          }}>
                            &nbsp;
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Signature Section - only on last page */}
                  {pageIndex === totalPages - 1 && (
                    <div className="signature-section">
                      <div className="signature-item">
                        <p style={{ marginBottom: '30px' }}>รับรองข้อมูลถูกต้อง</p>
                        <p style={{ marginBottom: '8px' }}>
                          ( {directorName || '.................................'} )
                        </p>
                        <p>ผู้อำนวยการโรงเรียนบ้านดอนมูล</p>
                      </div>
                      <div className="signature-item">
                        <p style={{ marginBottom: '30px' }}>ตรวจสอบข้อมูลถูกต้อง</p>
                        <p style={{ marginBottom: '8px' }}>
                          ( {teacherName || '.................................'} )
                        </p>
                        <p>ครูประจำชั้น</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            
            return pages;
          })()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompetencyPrintPreview;