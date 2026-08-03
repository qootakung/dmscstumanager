import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, FileSpreadsheet } from 'lucide-react';
import { allSubjectGroups } from '@/data/curriculumIndicators';
import { openPrintWindow, signatureBlock } from '@/utils/pp5Print';
import { getBasicInfo } from '@/utils/pp5GradeCalc';
import { toast } from 'sonner';

interface Props {
  selectedGrade: string;
  selectedSemester: string;
  selectedAcademicYear: string;
  onBack: () => void;
}

interface Row {
  groupName: string;
  strand: string;
  standardCode: string;
  standardName: string;
  count: number;
}

const IndicatorCountTable: React.FC<Props> = ({ selectedGrade, selectedSemester, selectedAcademicYear, onBack }) => {
  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    allSubjectGroups.forEach(group => {
      group.subjects.forEach(subject => {
        subject.standards.forEach(standard => {
          const inds = standard.indicators[selectedGrade];
          if (!inds || inds.length === 0) return;
          out.push({
            groupName: group.name,
            strand: subject.strand,
            standardCode: standard.code,
            standardName: standard.name,
            count: inds.length,
          });
        });
      });
    });
    return out;
  }, [selectedGrade]);

  const groupTotals = useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach(r => m.set(r.groupName, (m.get(r.groupName) || 0) + r.count));
    return m;
  }, [rows]);

  const total = rows.reduce((a, r) => a + r.count, 0);

  const handlePrint = () => {
    const info = getBasicInfo(selectedGrade, selectedAcademicYear, selectedSemester);
    let body = '';
    let no = 0;
    let lastGroup = '';
    rows.forEach(r => {
      if (r.groupName !== lastGroup) {
        lastGroup = r.groupName;
        body += `<tr><td colspan="4" style="background:#eef2ff;font-weight:bold">${r.groupName} (รวม ${groupTotals.get(r.groupName)} ตัวชี้วัด)</td></tr>`;
      }
      no += 1;
      body += `<tr>
        <td class="num" style="width:40px">${no}</td>
        <td style="width:120px">${r.standardCode}</td>
        <td>${r.standardName}</td>
        <td class="num" style="width:90px">${r.count}</td>
      </tr>`;
    });

    const html = `
      <div class="center">
        <div class="title">ตารางแสดงจำนวนตัวชี้วัดตามหลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน พุทธศักราช 2551</div>
        <div class="subtitle">โรงเรียน${info?.schoolName || 'บ้านดอนมูล'} ชั้นประถมศึกษาปีที่ ${selectedGrade.replace('ป.', '')} ภาคเรียนที่ ${selectedSemester} ปีการศึกษา ${selectedAcademicYear}</div>
      </div>
      <table style="margin-top:8px">
        <thead><tr><th>ที่</th><th>รหัสมาตรฐาน</th><th>มาตรฐานการเรียนรู้</th><th>จำนวนตัวชี้วัด</th></tr></thead>
        <tbody>${body}
          <tr><td colspan="3" style="text-align:right;font-weight:bold">รวมทั้งสิ้น</td><td class="num" style="font-weight:bold">${total}</td></tr>
        </tbody>
      </table>
      ${signatureBlock('ครูประจำชั้น', info?.homeTeacher1 || '')}
    `;
    if (!openPrintWindow(`ตารางจำนวนตัวชี้วัด ${selectedGrade}`, html, 'portrait')) {
      toast.error('กรุณาอนุญาต pop-ups เพื่อพิมพ์');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-teal-600 to-emerald-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />กลับ
            </Button>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6" />ตารางจำนวนตัวชี้วัด
            </CardTitle>
            <div className="text-white text-sm">ภาคเรียนที่ {selectedSemester} / {selectedAcademicYear}</div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-lg font-semibold">
              ชั้น {selectedGrade} — รวมทั้งสิ้น <span className="text-emerald-700">{total}</span> ตัวชี้วัด
            </div>
            <Button onClick={handlePrint} className="bg-emerald-700 hover:bg-emerald-800">
              <Printer className="w-4 h-4 mr-1" />พิมพ์ (A4 แนวตั้ง)
            </Button>
          </div>

          <div className="overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-emerald-100">
                  <th className="border border-gray-400 p-1 w-12">ที่</th>
                  <th className="border border-gray-400 p-1 w-32">รหัสมาตรฐาน</th>
                  <th className="border border-gray-400 p-1 text-left">มาตรฐานการเรียนรู้</th>
                  <th className="border border-gray-400 p-1 w-24">จำนวนตัวชี้วัด</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let last = '';
                  let no = 0;
                  const out: React.ReactNode[] = [];
                  rows.forEach((r, i) => {
                    if (r.groupName !== last) {
                      last = r.groupName;
                      out.push(
                        <tr key={`g-${i}`} className="bg-emerald-50 font-semibold">
                          <td className="border border-gray-300 p-1" colSpan={4}>
                            {r.groupName} (รวม {groupTotals.get(r.groupName)} ตัวชี้วัด)
                          </td>
                        </tr>
                      );
                    }
                    no += 1;
                    out.push(
                      <tr key={`r-${i}`} className="hover:bg-emerald-50/50">
                        <td className="border border-gray-300 p-1 text-center">{no}</td>
                        <td className="border border-gray-300 p-1 text-center">{r.standardCode}</td>
                        <td className="border border-gray-300 p-1">{r.standardName}</td>
                        <td className="border border-gray-300 p-1 text-center">{r.count}</td>
                      </tr>
                    );
                  });
                  return out;
                })()}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndicatorCountTable;