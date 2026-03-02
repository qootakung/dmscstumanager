
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Printer } from 'lucide-react';
import { getIndicatorsForGrade, countIndicatorsForGrade, allSubjectGroups } from '@/data/curriculumIndicators';

interface CurriculumIndicatorsProps {
  gradeLevel: string; // e.g., 'ป.1'
  onBack: () => void;
}

const CurriculumIndicators: React.FC<CurriculumIndicatorsProps> = ({ gradeLevel, onBack }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const indicatorData = getIndicatorsForGrade(gradeLevel);
  const totalCount = countIndicatorsForGrade(gradeLevel);

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=900,width=700');
    if (!printWindow || !printRef.current) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>ตัวชี้วัดชั้น ${gradeLevel}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'TH SarabunPSK', 'TH Sarabun', 'Sarabun', sans-serif; font-size: 16pt; padding: 10mm; }
            h1 { font-size: 18pt; text-align: center; margin-bottom: 4px; }
            h2 { font-size: 16pt; margin-top: 12px; margin-bottom: 4px; background: #f0f0f0; padding: 4px 8px; }
            h3 { font-size: 15pt; margin-top: 8px; margin-bottom: 2px; padding-left: 8px; }
            .standard-name { font-size: 14pt; color: #333; padding-left: 16px; margin-bottom: 4px; }
            .indicator-list { padding-left: 32px; }
            .indicator-item { font-size: 14pt; margin-bottom: 2px; line-height: 1.4; }
            .indicator-item::before { content: '• '; }
            .summary { text-align: center; font-size: 14pt; margin-bottom: 8px; }
            .page-break { page-break-before: always; }
            @media print {
              body { padding: 10mm; }
            }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Group by subject group
  const groupedData: { [groupId: string]: typeof indicatorData } = {};
  indicatorData.forEach(item => {
    if (!groupedData[item.group.id]) {
      groupedData[item.group.id] = [];
    }
    groupedData[item.group.id].push(item);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
        </Button>
        <Button onClick={handlePrint} className="gap-2 bg-pink-600 hover:bg-pink-700">
          <Printer className="w-4 h-4" /> พิมพ์ตัวชี้วัด A4
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-t-lg">
          <CardTitle className="text-xl text-center">
            ตัวชี้วัดชั้นปี ชั้นประถมศึกษาปีที่ {gradeLevel.replace('ป.', '')}
          </CardTitle>
          <p className="text-center text-pink-100 text-sm">
            ตามหลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน พุทธศักราช 2551 (ฉบับปรับปรุง พ.ศ. 2560) | รวมทั้งหมด {totalCount} ตัวชี้วัด
          </p>
        </CardHeader>
        <CardContent className="p-4">
          {allSubjectGroups.map(group => {
            const items = groupedData[group.id];
            if (!items || items.length === 0) return null;

            // Count indicators in this group
            const groupCount = items.reduce((sum, i) => sum + i.indicators.length, 0);

            return (
              <div key={group.id} className="mb-6">
                <h2 className="text-lg font-bold bg-gradient-to-r from-pink-100 to-rose-100 p-3 rounded-lg border border-pink-200 mb-3">
                  {group.name} ({groupCount} ตัวชี้วัด)
                </h2>
                {items.map((item, idx) => (
                  <div key={`${item.subject.id}-${item.standard.code}-${idx}`} className="ml-2 mb-4">
                    <h3 className="font-bold text-pink-800 text-base mb-1">
                      {item.subject.strand}
                    </h3>
                    <div className="ml-4 mb-2">
                      <p className="font-semibold text-sm text-gray-700">
                        มาตรฐาน {item.standard.code}: {item.standard.name}
                      </p>
                      <div className="ml-4 mt-1">
                        {item.indicators.map((ind, i) => (
                          <div key={ind.id} className="flex gap-2 text-sm py-0.5">
                            <span className="text-pink-500 font-bold min-w-[24px]">{i + 1}.</span>
                            <span>{ind.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Hidden print content */}
      <div className="hidden">
        <div ref={printRef}>
          <h1>ตัวชี้วัดชั้นปี ชั้นประถมศึกษาปีที่ {gradeLevel.replace('ป.', '')}</h1>
          <p className="summary">
            ตามหลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน พุทธศักราช 2551 (ฉบับปรับปรุง พ.ศ. 2560)<br/>
            โรงเรียนบ้านดอนมูล | รวมทั้งหมด {totalCount} ตัวชี้วัด
          </p>

          {allSubjectGroups.map(group => {
            const items = groupedData[group.id];
            if (!items || items.length === 0) return null;
            const groupCount = items.reduce((sum, i) => sum + i.indicators.length, 0);

            return (
              <div key={group.id}>
                <h2>{group.name} ({groupCount} ตัวชี้วัด)</h2>
                {items.map((item, idx) => (
                  <div key={`print-${item.subject.id}-${item.standard.code}-${idx}`}>
                    <h3>{item.subject.strand}</h3>
                    <div className="standard-name">
                      มาตรฐาน {item.standard.code}: {item.standard.name}
                    </div>
                    <div className="indicator-list">
                      {item.indicators.map((ind, i) => (
                        <div key={ind.id} className="indicator-item">
                          {i + 1}. {ind.text}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CurriculumIndicators;
