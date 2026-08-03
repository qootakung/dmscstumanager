import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Printer, FileText } from 'lucide-react';
import { getStudents } from '@/utils/studentStorage';
import type { Student } from '@/types/student';
import { sortStudents, fullName, getBasicInfo } from '@/utils/pp5GradeCalc';
import { openPrintWindow, signatureBlock, emptyRows } from '@/utils/pp5Print';
import { toast } from 'sonner';

interface Props {
  selectedGrade: string;
  selectedSemester: string;
  selectedAcademicYear: string;
  onBack: () => void;
}

const StudentNameListPrint: React.FC<Props> = ({ selectedGrade, selectedSemester, selectedAcademicYear, onBack }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [listTitle, setListTitle] = useState('ใบรายชื่อนักเรียน');
  const [blankCols, setBlankCols] = useState(6);
  const [showId, setShowId] = useState(true);
  const [showGender, setShowGender] = useState(true);

  const info = useMemo(
    () => getBasicInfo(selectedGrade, selectedAcademicYear, selectedSemester),
    [selectedGrade, selectedAcademicYear, selectedSemester]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      const all = await getStudents();
      setStudents(sortStudents(all.filter(s => s.grade === selectedGrade && s.academicYear === selectedAcademicYear)));
      setLoading(false);
    })();
  }, [selectedGrade, selectedAcademicYear]);

  const handlePrint = () => {
    const baseCols = 2 + (showId ? 1 : 0) + (showGender ? 1 : 0);
    const totalCols = baseCols + blankCols;
    const head = `
      <tr>
        <th style="width:36px">ที่</th>
        ${showId ? '<th style="width:90px">เลขประจำตัว</th>' : ''}
        <th style="min-width:190px">ชื่อ - นามสกุล</th>
        ${showGender ? '<th style="width:44px">เพศ</th>' : ''}
        ${Array.from({ length: blankCols }).map(() => '<th style="width:34px">&nbsp;</th>').join('')}
      </tr>`;
    const body = students.map((s, i) => `
      <tr>
        <td class="num">${i + 1}</td>
        ${showId ? `<td class="num">${s.studentId || ''}</td>` : ''}
        <td>${fullName(s)}</td>
        ${showGender ? `<td class="num">${(s.gender || '').charAt(0)}</td>` : ''}
        ${Array.from({ length: blankCols }).map(() => '<td>&nbsp;</td>').join('')}
      </tr>`).join('');

    const html = `
      <div class="center">
        <div class="title">${listTitle}</div>
        <div class="subtitle">โรงเรียน${info?.schoolName || 'บ้านดอนมูล'} ชั้นประถมศึกษาปีที่ ${selectedGrade.replace('ป.', '')} ภาคเรียนที่ ${selectedSemester} ปีการศึกษา ${selectedAcademicYear}</div>
        <div style="font-size:15pt">จำนวนนักเรียน ${students.length} คน
          (ชาย ${students.filter(s => (s.gender || '').startsWith('ช')).length} คน หญิง ${students.filter(s => (s.gender || '').startsWith('ห') || (s.gender || '').startsWith('ญ')).length} คน)</div>
      </div>
      <table style="margin-top:8px"><thead>${head}</thead><tbody>
        ${body}
        ${emptyRows(Math.max(0, 30 - students.length), totalCols, students.length + 1)}
      </tbody></table>
      ${signatureBlock('ครูประจำชั้น', info?.homeTeacher1 || '')}
    `;
    if (!openPrintWindow(`${listTitle} ${selectedGrade}`, html, 'portrait')) {
      toast.error('กรุณาอนุญาต pop-ups เพื่อพิมพ์');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-sky-600 to-blue-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />กลับ
            </Button>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6" />ใบรายชื่อนักเรียน
            </CardTitle>
            <div className="text-white text-sm">ภาคเรียนที่ {selectedSemester} / {selectedAcademicYear}</div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Label className="whitespace-nowrap">หัวเรื่อง:</Label>
              <Input value={listTitle} onChange={e => setListTitle(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">ช่องว่างสำหรับบันทึก:</Label>
              <Input type="number" min={0} max={20} value={blankCols}
                onChange={e => setBlankCols(Math.max(0, Math.min(20, Number(e.target.value) || 0)))}
                className="w-20" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={showId} onCheckedChange={v => setShowId(!!v)} />เลขประจำตัว
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={showGender} onCheckedChange={v => setShowGender(!!v)} />เพศ
            </label>
            <Button onClick={handlePrint} className="bg-blue-700 hover:bg-blue-800">
              <Printer className="w-4 h-4 mr-1" />พิมพ์ (A4 แนวตั้ง)
            </Button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>
          ) : students.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              ไม่พบข้อมูลนักเรียน {selectedGrade} ปีการศึกษา {selectedAcademicYear}
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-sky-100">
                    <th className="border border-gray-400 p-1 w-12">ที่</th>
                    {showId && <th className="border border-gray-400 p-1 w-24">เลขประจำตัว</th>}
                    <th className="border border-gray-400 p-1 text-left">ชื่อ - นามสกุล</th>
                    {showGender && <th className="border border-gray-400 p-1 w-16">เพศ</th>}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.id} className="hover:bg-sky-50/50">
                      <td className="border border-gray-300 p-1 text-center">{i + 1}</td>
                      {showId && <td className="border border-gray-300 p-1 text-center">{s.studentId}</td>}
                      <td className="border border-gray-300 p-1">{fullName(s)}</td>
                      {showGender && <td className="border border-gray-300 p-1 text-center">{(s.gender || '').charAt(0)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentNameListPrint;