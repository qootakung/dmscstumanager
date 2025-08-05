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

  const competencyCriteria = [
    'ข้อที่ 1 เด็กสามารถรับฟังและเข้าใจคำพูด ประโยค ข้อความ',
    'ข้อที่ 2 เด็กสามารถใช้คำศัพท์ ประโยคพื้นฐานสำหรับการสื่อสาร', 
    'ข้อที่ 3 เด็กสามารถเล่าเรื่องที่ตนเองสนใจ',
    'ข้อที่ 4 เด็กสามารถแสดงออกทางสายตาและการใช้ร่างกาย',
    'ข้อที่ 5 เด็กสามารถใช้สื่อและเทคโนโลยีในการสื่อสาร'
  ];

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
              {title}
            </h2>
            <p className="text-sm mt-2">ปีการศึกษา {academicYear}</p>
          </div>

          {/* Assessment Table */}
          <table className="w-full border-collapse border border-black text-sm">
            <thead>
              <tr>
                <th rowSpan={2} className="border border-black p-2 bg-gray-100 w-12 text-center">
                  เลขที่
                </th>
                <th rowSpan={2} className="border border-black p-2 bg-gray-100 w-48 text-center">
                  ชื่อ-สกุล
                </th>
                <th colSpan={5} className="border border-black p-2 bg-gray-100 text-center">
                  สมรรถนะด้านที่ {competencyNumber}
                </th>
                <th rowSpan={2} className="border border-black p-2 bg-gray-100 w-16 text-center">
                  รวม
                </th>
                <th rowSpan={2} className="border border-black p-2 bg-gray-100 w-20 text-center">
                  ระดับคุณภาพ
                </th>
              </tr>
              <tr>
                {competencyCriteria.map((criteria, index) => (
                  <th 
                    key={index} 
                    className="border border-black p-1 bg-gray-100 text-xs text-center writing-mode-vertical-rl transform rotate-180"
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                  >
                    {criteria}
                  </th>
                ))}
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
          <div className="mt-8 flex justify-between">
            <div className="text-center">
              <p className="mb-16">ลงชื่อ .................................. ผู้ประเมิน</p>
              <p>( .................................. )</p>
              <p>วันที่ .................................</p>
            </div>
            <div className="text-center">
              <p className="mb-16">ลงชื่อ .................................. ผู้ตรวจสอบ</p>
              <p>( .................................. )</p>
              <p>วันที่ .................................</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompetencyPrintPreview;