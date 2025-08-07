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
  const [directorName, setDirectorName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('4');

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `แบบประเมินสมรรถนะสำคัญผู้เรียน_ชั้น${gradeLevel}_${academicYear}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 15mm 10mm;
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
          font-size: 16pt !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .print-container {
          width: 100% !important;
          height: 100vh !important;
          page-break-inside: avoid !important;
        }
        .print-header {
          text-align: center !important;
          margin-bottom: 20px !important;
        }
        table {
          border-collapse: collapse !important;
          width: 100% !important;
          table-layout: fixed !important;
          font-size: 16pt !important;
        }
        table, th, td {
          border: 2px solid #000 !important;
        }
        th {
          background-color: white !important;
          font-weight: bold !important;
          padding: 8px 4px !important;
          text-align: center !important;
          vertical-align: middle !important;
        }
        td {
          padding: 8px 4px !important;
          text-align: center !important;
          vertical-align: middle !important;
        }
        .student-name {
          text-align: left !important;
          padding-left: 12px !important;
        }
        .vertical-text {
          writing-mode: vertical-rl !important;
          text-orientation: mixed !important;
          height: 150px !important;
          white-space: nowrap !important;
          font-size: 13pt !important;
          line-height: 1.1 !important;
          padding: 8px 4px !important;
        }
        .signature-section {
          margin-top: 40px !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: flex-start !important;
        }
        .signature-item {
          text-align: center !important;
          flex: 1 !important;
        }
        h1 {
          font-size: 18pt !important;
          font-weight: bold !important;
          margin: 8px 0 !important;
        }
        h2 {
          font-size: 16pt !important;
          font-weight: bold !important;
          margin: 5px 0 !important;
        }
        .grade-year {
          font-size: 16pt !important;
          margin: 8px 0 !important;
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

  // Competency criteria for all 5 domains (matching the image exactly)
  const competencyHeaders = [
    'มีความสามารถในการสื่อสาร คิดวิเคราะห์ คิดสร้างสรรค์ คิดแก้ปัญหา และใช้ทักษะชีวิต',
    'มีความสามารถในการรับสาร สังเคราะห์ ความรู้ด้วย ตนเองอย่าง ต่อเนื่อง โดยใช้ สื่อเทคโนโลยี สารสนเทศ ตาง ๆ ได้',
    'ใช้วิธีการทรัพยากร ที่เหมาะสม มีประสิทธิภาพ',
    'เจรจาต่อรอง เพื่อขจัดและลด ปัญหาความ ขัดแย้งต่าง ๆ ได้',
    'เลือกรับและไม่รับ ข้อมูลข่าวสาร ด้วยเหตุผลและ ถูกต้อง'
  ];

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
            <h3 className="font-semibold mb-3">ตั้งค่าการพิมพ์</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">ระดับชั้น</label>
                <Input
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  placeholder="4"
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
          {(() => {
            const pages = [];
            const studentsPerPage = 12;
            const totalPages = Math.ceil(students.length / studentsPerPage);
            
            for (let pageIndex = 0; pageIndex < Math.max(1, totalPages); pageIndex++) {
              const startIndex = pageIndex * studentsPerPage;
              const endIndex = Math.min(startIndex + studentsPerPage, students.length);
              const pageStudents = students.slice(startIndex, endIndex);
              
              // Calculate empty rows to fill up to 12 students per page
              const emptyRowsCount = studentsPerPage - pageStudents.length;
              
              pages.push(
                <div key={pageIndex} className={`print-container ${pageIndex > 0 ? 'page-break' : ''}`}>
                  {/* Header */}
                  <div className="print-header">
                    <h1 className="text-lg font-bold mb-2">
                      แบบประเมินสมรรถนะสำคัญผู้เรียน ชั้นประถมศึกษาปีที่ {gradeLevel}
                    </h1>
                    <h2 className="text-base font-semibold">
                      สมรรถนะด้านที่ 1 ความสามารถในการสื่อสาร
                    </h2>
                    <p className="grade-year">ปีการศึกษา {academicYear}</p>
                  </div>

                  {/* Assessment Table */}
                  <table style={{ 
                    fontSize: '16px', 
                    borderCollapse: 'collapse', 
                    width: '100%',
                    tableLayout: 'fixed'
                  }}>
                    <thead>
                      <tr>
                        <th 
                          rowSpan={2} 
                          style={{ 
                            width: '40px',
                            border: '2px solid #000',
                            padding: '8px 4px',
                            textAlign: 'center',
                            verticalAlign: 'middle'
                          }}
                        >
                          เลขที่
                        </th>
                        <th 
                          rowSpan={2} 
                          style={{ 
                            width: '180px',
                            border: '2px solid #000',
                            padding: '8px 4px',
                            textAlign: 'center',
                            verticalAlign: 'middle'
                          }}
                        >
                          ชื่อ-สกุล
                        </th>
                        <th 
                          colSpan={5} 
                          style={{ 
                            border: '2px solid #000',
                            padding: '8px 4px',
                            textAlign: 'center',
                            fontSize: '16pt'
                          }}
                        >
                          สมรรถนะด้านที่ 1
                        </th>
                        <th 
                          rowSpan={2} 
                          style={{ 
                            width: '50px',
                            border: '2px solid #000',
                            padding: '8px 4px',
                            textAlign: 'center',
                            verticalAlign: 'middle'
                          }}
                        >
                          รวม
                        </th>
                        <th 
                          rowSpan={2} 
                          style={{ 
                            width: '60px',
                            border: '2px solid #000',
                            padding: '8px 4px',
                            textAlign: 'center',
                            verticalAlign: 'middle'
                          }}
                        >
                          ระดับคุณภาพ
                        </th>
                      </tr>
                      <tr>
                        {competencyHeaders.map((header, index) => (
                          <th 
                            key={index} 
                            className="vertical-text"
                            style={{ 
                              width: '35px',
                              border: '2px solid #000',
                              writingMode: 'vertical-rl',
                              textOrientation: 'mixed',
                              height: '150px',
                              fontSize: '13pt',
                              padding: '8px 4px',
                              textAlign: 'center',
                              verticalAlign: 'middle',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                      <tr>
                        <td style={{ border: '2px solid #000', textAlign: 'center', fontWeight: 'bold' }}></td>
                        <td style={{ border: '2px solid #000', textAlign: 'center', fontWeight: 'bold' }}></td>
                        <td style={{ border: '2px solid #000', textAlign: 'center', fontWeight: 'bold' }}>3</td>
                        <td style={{ border: '2px solid #000', textAlign: 'center', fontWeight: 'bold' }}>3</td>
                        <td style={{ border: '2px solid #000', textAlign: 'center', fontWeight: 'bold' }}>3</td>
                        <td style={{ border: '2px solid #000', textAlign: 'center', fontWeight: 'bold' }}>3</td>
                        <td style={{ border: '2px solid #000', textAlign: 'center', fontWeight: 'bold' }}>3</td>
                        <td style={{ border: '2px solid #000', textAlign: 'center', fontWeight: 'bold' }}>15</td>
                        <td style={{ border: '2px solid #000', textAlign: 'center', fontWeight: 'bold' }}></td>
                      </tr>
                    </thead>
                    <tbody>
                      {pageStudents.map((student, index) => (
                        <tr key={student.id}>
                          <td style={{ 
                            border: '2px solid #000', 
                            padding: '8px 4px', 
                            textAlign: 'center' 
                          }}>
                            {startIndex + index + 1}
                          </td>
                          <td 
                            className="student-name"
                            style={{ 
                              border: '2px solid #000', 
                              padding: '8px 12px', 
                              textAlign: 'left' 
                            }}
                          >
                            {student.name}
                          </td>
                          <td style={{ border: '2px solid #000', padding: '8px 4px', textAlign: 'center' }}>
                            &nbsp;
                          </td>
                          <td style={{ border: '2px solid #000', padding: '8px 4px', textAlign: 'center' }}>
                            &nbsp;
                          </td>
                          <td style={{ border: '2px solid #000', padding: '8px 4px', textAlign: 'center' }}>
                            &nbsp;
                          </td>
                          <td style={{ border: '2px solid #000', padding: '8px 4px', textAlign: 'center' }}>
                            &nbsp;
                          </td>
                          <td style={{ border: '2px solid #000', padding: '8px 4px', textAlign: 'center' }}>
                            &nbsp;
                          </td>
                          <td style={{ 
                            border: '2px solid #000', 
                            padding: '8px 4px', 
                            textAlign: 'center' 
                          }}>
                            &nbsp;
                          </td>
                          <td style={{ 
                            border: '2px solid #000', 
                            padding: '8px 4px', 
                            textAlign: 'center' 
                          }}>
                            &nbsp;
                          </td>
                        </tr>
                      ))}
                      
                      {/* Add empty rows to fill the page */}
                      {Array.from({ length: emptyRowsCount }, (_, index) => (
                        <tr key={`empty-${pageIndex}-${index}`}>
                          <td style={{ 
                            border: '2px solid #000', 
                            padding: '8px 4px', 
                            textAlign: 'center' 
                          }}>
                            {startIndex + pageStudents.length + index + 1}
                          </td>
                          <td style={{ 
                            border: '2px solid #000', 
                            padding: '8px 4px', 
                            textAlign: 'center' 
                          }}>
                            &nbsp;
                          </td>
                          <td style={{ border: '2px solid #000', padding: '8px 4px', textAlign: 'center' }}>
                            &nbsp;
                          </td>
                          <td style={{ border: '2px solid #000', padding: '8px 4px', textAlign: 'center' }}>
                            &nbsp;
                          </td>
                          <td style={{ border: '2px solid #000', padding: '8px 4px', textAlign: 'center' }}>
                            &nbsp;
                          </td>
                          <td style={{ border: '2px solid #000', padding: '8px 4px', textAlign: 'center' }}>
                            &nbsp;
                          </td>
                          <td style={{ border: '2px solid #000', padding: '8px 4px', textAlign: 'center' }}>
                            &nbsp;
                          </td>
                          <td style={{ 
                            border: '2px solid #000', 
                            padding: '8px 4px', 
                            textAlign: 'center' 
                          }}>
                            &nbsp;
                          </td>
                          <td style={{ 
                            border: '2px solid #000', 
                            padding: '8px 4px', 
                            textAlign: 'center' 
                          }}>
                            &nbsp;
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Signature Section - only on last page or single page */}
                  {(pageIndex === totalPages - 1 || totalPages === 1) && (
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