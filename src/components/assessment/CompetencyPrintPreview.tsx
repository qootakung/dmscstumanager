import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
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

        <div ref={printRef} className="bg-white p-8 font-sarabun">
          <style>{`
            @media print {
              table, th, td {
                border: 1px solid #000 !important;
                border-collapse: collapse !important;
              }
              th {
                background-color: #f8f9fa !important;
              }
            }
          `}</style>
          
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-lg font-bold mb-2">
              แบบประเมินสมรรถนะสำหรับผู้เรียนเด่น ชั้นประถมศึกษาปีที่ 1
            </h1>
            <h2 className="text-base font-semibold">
              สมรรถนะด้านที่ {competencyNumber} {competencyTitles[competencyNumber]}
            </h2>
            <p className="text-sm mt-2">ปีการศึกษา {academicYear}</p>
          </div>

          {/* Assessment Table */}
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr>
                <th rowSpan={2} className="border border-black p-1 bg-gray-100 w-8 text-center">
                  เลขที่
                </th>
                <th rowSpan={2} className="border border-black p-1 bg-gray-100 w-32 text-center">
                  ชื่อ-สกุล
                </th>
                <th colSpan={5} className="border border-black p-1 bg-gray-100 text-center">
                  สมรรถนะด้านที่ {competencyNumber}
                </th>
                <th rowSpan={2} className="border border-black p-1 bg-gray-100 w-12 text-center">
                  รวม
                </th>
                <th rowSpan={2} className="border border-black p-1 bg-gray-100 w-16 text-center">
                  ระดับคุณภาพ
                </th>
              </tr>
              <tr>
                {competencyCriteria.map((criteria, index) => {
                  // Split long text into multiple lines
                  const shouldSplit = criteria.length > 35;
                  const words = criteria.split(' ');
                  const midPoint = Math.ceil(words.length / 2);
                  const firstLine = shouldSplit ? words.slice(0, midPoint).join(' ') : criteria;
                  const secondLine = shouldSplit ? words.slice(midPoint).join(' ') : '';
                  
                  return (
                    <th 
                      key={index} 
                      className="border border-black p-1 bg-gray-100 w-20 text-center vertical-text"
                      style={{ 
                        writingMode: 'vertical-rl', 
                        textOrientation: 'mixed',
                        fontSize: '10px',
                        lineHeight: '1.2'
                      }}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span>{firstLine}</span>
                        {secondLine && (
                          <>
                            <hr className="w-full border-red-500 my-1" />
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
              {students.map((student, index) => (
                <tr key={student.id}>
                  <td className="border border-black p-2 text-center">{index + 1}</td>
                  <td className="border border-black p-2">{student.name}</td>
                  {student.scores.map((score, scoreIndex) => (
                    <td key={scoreIndex} className="border border-black p-2 text-center">
                      {score || '-'}
                    </td>
                  ))}
                  <td className="border border-black p-2 text-center font-semibold">
                    {student.total || '-'}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {student.grade || '-'}
                  </td>
                </tr>
              ))}
              
              {/* Add empty rows if needed */}
              {Array.from({ length: Math.max(0, 10 - students.length) }, (_, index) => (
                <tr key={`empty-${index}`}>
                  <td className="border border-black p-2 text-center">{students.length + index + 1}</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2 text-center">&nbsp;</td>
                  <td className="border border-black p-2 text-center">&nbsp;</td>
                  <td className="border border-black p-2 text-center">&nbsp;</td>
                  <td className="border border-black p-2 text-center">&nbsp;</td>
                  <td className="border border-black p-2 text-center">&nbsp;</td>
                  <td className="border border-black p-2 text-center">&nbsp;</td>
                  <td className="border border-black p-2 text-center">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signature Section */}
          <div className="mt-6 flex justify-between items-start">
            <div className="text-center">
              <p className="text-sm">รับรองข้อมูลถูกต้อง</p>
              <div className="mt-8 mb-2">
                <p>( ................................. )</p>
              </div>
              <p className="text-sm">ผู้อำนวยการโรงเรียนบ้านดอนมูล</p>
            </div>
            <div className="text-center">
              <p className="text-sm">ตรวจสอบข้อมูลถูกต้อง</p>
              <div className="mt-8 mb-2">
                <p>( ................................. )</p>
              </div>
              <p className="text-sm">ครูประจำชั้น</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompetencyPrintPreview;