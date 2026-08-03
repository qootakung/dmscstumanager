import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Printer, CheckSquare } from 'lucide-react';
import { getStudents } from '@/utils/studentStorage';
import type { Student } from '@/types/student';
import {
  computeSubjectResults, sortStudents, fullName, getBasicInfo,
  type PP5SubjectResult,
} from '@/utils/pp5GradeCalc';
import { openPrintWindow, signatureBlock } from '@/utils/pp5Print';
import { toast } from 'sonner';

interface Props {
  selectedGrade: string;
  selectedSemester: string;
  selectedAcademicYear: string;
  onBack: () => void;
}

const gradeText = (g: number) => (g === 0 ? '0' : g.toFixed(1).replace('.0', ''));

const GradeDecision: React.FC<Props> = ({ selectedGrade, selectedSemester, selectedAcademicYear, onBack }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [passCriteria, setPassCriteria] = useState(50);

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

  const subjectResults: PP5SubjectResult[] = useMemo(() => {
    if (students.length === 0) return [];
    return computeSubjectResults(students, selectedGrade, selectedAcademicYear, selectedSemester);
  }, [students, selectedGrade, selectedAcademicYear, selectedSemester]);

  const rows = useMemo(() => students.map(st => {
    const perSubject = subjectResults.map(sr => sr.results[st.id] || { score100: 0, grade: 0, hasData: false });
    const failed = perSubject.filter(r => r.score100 < passCriteria).length;
    let creditSum = 0, weighted = 0;
    subjectResults.forEach((sr, i) => {
      creditSum += sr.def.credit;
      weighted += perSubject[i].grade * sr.def.credit;
    });
    const gpa = creditSum > 0 ? weighted / creditSum : 0;
    return {
      student: st,
      perSubject,
      failed,
      gpa: parseFloat(gpa.toFixed(2)),
      decision: failed === 0 ? 'ผ่านการตัดสิน' : 'ไม่ผ่าน (ต้องซ่อมเสริม)',
    };
  }), [students, subjectResults, passCriteria]);

  const passCount = rows.filter(r => r.failed === 0).length;

  const handlePrint = () => {
    const head = `
      <tr>
        <th rowspan="2" style="width:32px">ที่</th>
        <th rowspan="2" style="min-width:170px">ชื่อ - นามสกุล</th>
        <th colspan="${subjectResults.length}">ผลการเรียนรายวิชา (ระดับผลการเรียน)</th>
        <th rowspan="2" style="width:48px">GPA</th>
        <th rowspan="2" style="width:52px">วิชาที่<br/>ไม่ผ่าน</th>
        <th rowspan="2" style="width:110px">ผลการตัดสิน</th>
      </tr>
      <tr>${subjectResults.map(sr => `<th style="width:38px"><div class="rot">${sr.def.shortName}</div></th>`).join('')}</tr>`;
    const body = rows.map((r, i) => `
      <tr>
        <td class="num">${i + 1}</td>
        <td>${fullName(r.student)}</td>
        ${r.perSubject.map(p => `<td class="num">${gradeText(p.grade)}</td>`).join('')}
        <td class="num">${r.gpa.toFixed(2)}</td>
        <td class="num">${r.failed || '-'}</td>
        <td class="num">${r.decision}</td>
      </tr>`).join('');

    const html = `
      <div class="center">
        <div class="title">แบบบันทึกการตัดสินผลการเรียน</div>
        <div class="subtitle">โรงเรียน${info?.schoolName || 'บ้านดอนมูล'} ชั้นประถมศึกษาปีที่ ${selectedGrade.replace('ป.', '')} ภาคเรียนที่ ${selectedSemester} ปีการศึกษา ${selectedAcademicYear}</div>
        <div style="font-size:15pt">เกณฑ์การผ่าน: ได้คะแนนไม่น้อยกว่าร้อยละ ${passCriteria} ของทุกรายวิชา</div>
      </div>
      <table style="margin-top:8px;font-size:14pt"><thead>${head}</thead><tbody>${body}</tbody></table>
      <div style="margin-top:8px;font-size:15pt">
        สรุป: ผ่านการตัดสิน ${passCount} คน | ไม่ผ่าน ${rows.length - passCount} คน | รวม ${rows.length} คน
      </div>
      ${signatureBlock('ครูประจำชั้น', info?.homeTeacher1 || '')}
    `;
    const css = `.rot { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; height: 120px; font-size: 12pt; }`;
    if (!openPrintWindow(`การตัดสินผลการเรียน ${selectedGrade}`, html, 'landscape', css)) {
      toast.error('กรุณาอนุญาต pop-ups เพื่อพิมพ์');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-600 to-orange-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />กลับ
            </Button>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-6 h-6" />การตัดสินผลการเรียน
            </CardTitle>
            <div className="text-white text-sm">ภาคเรียนที่ {selectedSemester} / {selectedAcademicYear}</div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">เกณฑ์ผ่าน (ร้อยละ):</Label>
              <Input type="number" min={0} max={100} value={passCriteria}
                onChange={e => setPassCriteria(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                className="w-24" />
            </div>
            <div className="text-sm text-muted-foreground">
              คำนวณจากคะแนนที่กรอกไว้ในเมนู “กรอกคะแนนตามตัวชี้วัด”
            </div>
            <Button onClick={handlePrint} className="bg-orange-700 hover:bg-orange-800 ml-auto">
              <Printer className="w-4 h-4 mr-1" />พิมพ์ (A4 แนวนอน)
            </Button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>
          ) : students.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              ไม่พบข้อมูลนักเรียน {selectedGrade} ปีการศึกษา {selectedAcademicYear}
            </div>
          ) : (
            <>
              <div className="flex gap-4 text-sm bg-amber-50 border border-amber-200 rounded p-3">
                <span>นักเรียนทั้งหมด <strong>{rows.length}</strong> คน</span>
                <span className="text-green-700">ผ่านการตัดสิน <strong>{passCount}</strong> คน</span>
                <span className="text-red-700">ไม่ผ่าน <strong>{rows.length - passCount}</strong> คน</span>
              </div>
              <div className="overflow-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-amber-100">
                      <th className="border border-gray-400 p-1 w-10">ที่</th>
                      <th className="border border-gray-400 p-1 text-left min-w-[160px]">ชื่อ - นามสกุล</th>
                      {subjectResults.map(sr => (
                        <th key={sr.def.menuId} className="border border-gray-400 p-1 w-14 text-[11px] leading-tight">
                          {sr.def.shortName}
                        </th>
                      ))}
                      <th className="border border-gray-400 p-1 w-16">GPA</th>
                      <th className="border border-gray-400 p-1 w-16">ไม่ผ่าน</th>
                      <th className="border border-gray-400 p-1 w-32">ผลการตัดสิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={r.student.id} className="hover:bg-amber-50/50">
                        <td className="border border-gray-300 p-1 text-center">{i + 1}</td>
                        <td className="border border-gray-300 p-1">{fullName(r.student)}</td>
                        {r.perSubject.map((p, j) => (
                          <td key={j} className={`border border-gray-300 p-1 text-center ${p.score100 < passCriteria ? 'text-red-600 font-semibold' : ''}`}>
                            {gradeText(p.grade)}
                          </td>
                        ))}
                        <td className="border border-gray-300 p-1 text-center font-semibold">{r.gpa.toFixed(2)}</td>
                        <td className="border border-gray-300 p-1 text-center">{r.failed || '-'}</td>
                        <td className={`border border-gray-300 p-1 text-center ${r.failed === 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {r.decision}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GradeDecision;