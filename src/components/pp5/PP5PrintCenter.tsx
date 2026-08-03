import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Printer } from 'lucide-react';
import { getStudents } from '@/utils/studentStorage';
import type { Student } from '@/types/student';
import {
  computeSubjectResults, sortStudents, fullName, getBasicInfo,
} from '@/utils/pp5GradeCalc';
import { openPrintWindow } from '@/utils/pp5Print';
import { toast } from 'sonner';

interface Props {
  selectedGrade: string;
  selectedSemester: string;
  selectedAcademicYear: string;
  onBack: () => void;
}

const SECTIONS = [
  { id: 'cover', label: 'หน้าปก ปพ.5' },
  { id: 'students', label: 'รายชื่อนักเรียน' },
  { id: 'grades', label: 'สรุปผลการเรียนรายวิชา (ระดับผลการเรียน)' },
  { id: 'traits', label: 'สรุปคุณลักษณะอันพึงประสงค์' },
  { id: 'reading', label: 'สรุปการอ่าน คิดวิเคราะห์ และเขียน' },
  { id: 'activities', label: 'สรุปกิจกรรมพัฒนาผู้เรียน' },
];

const readJSON = (key: string): any => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

const traitLevel = (sum: number) => (sum >= 22 ? 'ดีเยี่ยม' : sum >= 16 ? 'ดี' : sum >= 8 ? 'ผ่าน' : 'ไม่ผ่าน');
const readingLevel = (sum: number) => (sum >= 14 ? 'ดีเยี่ยม' : sum >= 10 ? 'ดี' : sum >= 6 ? 'ผ่าน' : 'ไม่ผ่าน');

const PP5PrintCenter: React.FC<Props> = ({ selectedGrade, selectedSemester, selectedAcademicYear, onBack }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<string[]>(SECTIONS.map(s => s.id));
  const [loading, setLoading] = useState(true);

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

  const toggle = (id: string) =>
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  const gradeNum = selectedGrade.replace('ป.', '');
  const header = (title: string) => `
    <div class="center">
      <div class="title">${title}</div>
      <div class="subtitle">โรงเรียน${info?.schoolName || 'บ้านดอนมูล'} ชั้นประถมศึกษาปีที่ ${gradeNum} ภาคเรียนที่ ${selectedSemester} ปีการศึกษา ${selectedAcademicYear}</div>
    </div>`;

  const buildHtml = (): string => {
    const pages: string[] = [];

    if (selected.includes('cover')) {
      const cover = readJSON(`pp5-cover-${selectedGrade}-${selectedAcademicYear}-${selectedSemester}`);
      pages.push(`
        <div style="text-align:center;padding-top:26mm;line-height:2">
          <div style="font-size:30pt;font-weight:bold">ปพ.5</div>
          <div style="font-size:24pt;font-weight:bold">${cover?.documentName || 'แบบบันทึกผลการเรียนประจำรายวิชา (ปพ.5)'}</div>
          <div style="font-size:22pt">ชั้นประถมศึกษาปีที่ ${gradeNum}</div>
          <div style="font-size:20pt">ภาคเรียนที่ ${selectedSemester} ปีการศึกษา ${selectedAcademicYear}</div>
          <div style="font-size:22pt;margin-top:18mm">โรงเรียน${cover?.schoolName || info?.schoolName || 'บ้านดอนมูล'}</div>
          <div style="font-size:18pt;margin-top:16mm">ครูประจำชั้น ${cover?.teacher1 || info?.homeTeacher1 || '.........................................'}</div>
        </div>`);
    }

    if (selected.includes('students')) {
      pages.push(`${header('รายชื่อนักเรียน')}
        <table style="margin-top:8px">
          <thead><tr><th style="width:36px">ที่</th><th style="width:90px">เลขประจำตัว</th><th>ชื่อ - นามสกุล</th><th style="width:50px">เพศ</th></tr></thead>
          <tbody>${students.map((s, i) => `<tr><td class="num">${i + 1}</td><td class="num">${s.studentId || ''}</td><td>${fullName(s)}</td><td class="num">${(s.gender || '').charAt(0)}</td></tr>`).join('')}</tbody>
        </table>`);
    }

    if (selected.includes('grades')) {
      const results = computeSubjectResults(students, selectedGrade, selectedAcademicYear, selectedSemester);
      pages.push(`${header('สรุปผลการเรียนรายวิชา')}
        <table style="margin-top:8px;font-size:13pt">
          <thead><tr>
            <th style="width:32px">ที่</th><th style="min-width:150px">ชื่อ - นามสกุล</th>
            ${results.map(r => `<th style="width:36px"><div class="rot">${r.def.shortName}</div></th>`).join('')}
            <th style="width:46px">GPA</th>
          </tr></thead>
          <tbody>${students.map((s, i) => {
            let credits = 0, weighted = 0;
            const cells = results.map(r => {
              const res = r.results[s.id] || { grade: 0 };
              credits += r.def.credit; weighted += res.grade * r.def.credit;
              return `<td class="num">${res.grade}</td>`;
            }).join('');
            const gpa = credits ? (weighted / credits).toFixed(2) : '0.00';
            return `<tr><td class="num">${i + 1}</td><td>${fullName(s)}</td>${cells}<td class="num">${gpa}</td></tr>`;
          }).join('')}</tbody>
        </table>`);
    }

    if (selected.includes('traits')) {
      const d = readJSON(`pp5-desirable-traits-${selectedGrade}-${selectedAcademicYear}-${selectedSemester}`);
      pages.push(`${header('สรุปผลการประเมินคุณลักษณะอันพึงประสงค์')}
        <table style="margin-top:8px">
          <thead><tr><th style="width:36px">ที่</th><th>ชื่อ - นามสกุล</th><th style="width:70px">รวม</th><th style="width:100px">สรุปผล</th></tr></thead>
          <tbody>${students.map((s, i) => {
            const row: number[] = d?.scores?.[s.studentId || s.id] || [];
            const sum = row.reduce((a: number, b: number) => a + (Number(b) || 0), 0);
            return `<tr><td class="num">${i + 1}</td><td>${fullName(s)}</td><td class="num">${sum || ''}</td><td class="num">${sum ? traitLevel(sum) : ''}</td></tr>`;
          }).join('')}</tbody>
        </table>`);
    }

    if (selected.includes('reading')) {
      const d = readJSON(`pp5-reading-analysis-${selectedGrade}-${selectedAcademicYear}-${selectedSemester}`);
      pages.push(`${header('สรุปผลการประเมินการอ่าน คิดวิเคราะห์ และเขียน')}
        <table style="margin-top:8px">
          <thead><tr><th style="width:36px">ที่</th><th>ชื่อ - นามสกุล</th><th style="width:70px">รวม</th><th style="width:100px">สรุปผล</th></tr></thead>
          <tbody>${students.map((s, i) => {
            const row: number[] = d?.scores?.[s.studentId || s.id] || [];
            const sum = row.reduce((a: number, b: number) => a + (Number(b) || 0), 0);
            return `<tr><td class="num">${i + 1}</td><td>${fullName(s)}</td><td class="num">${sum || ''}</td><td class="num">${sum ? readingLevel(sum) : ''}</td></tr>`;
          }).join('')}</tbody>
        </table>`);
    }

    if (selected.includes('activities')) {
      pages.push(`${header('สรุปกิจกรรมพัฒนาผู้เรียน')}
        <table style="margin-top:8px">
          <thead><tr><th style="width:36px">ที่</th><th>ชื่อ - นามสกุล</th>
            <th style="width:70px">แนะแนว</th><th style="width:70px">ลูกเสือฯ</th>
            <th style="width:70px">ชุมนุม</th><th style="width:90px">เพื่อสังคมฯ</th>
            <th style="width:80px">สรุปผล</th></tr></thead>
          <tbody>${students.map((s, i) =>
            `<tr><td class="num">${i + 1}</td><td>${fullName(s)}</td><td></td><td></td><td></td><td></td><td></td></tr>`
          ).join('')}</tbody>
        </table>
        <div style="font-size:13pt;margin-top:4px;color:#555">* บันทึกผลรายกิจกรรมได้ที่เมนู “กิจกรรมพัฒนาผู้เรียน”</div>`);
    }

    return pages.map((p, i) => `<div${i < pages.length - 1 ? ' class="page-break"' : ''}>${p}</div>`).join('');
  };

  const handlePrint = () => {
    if (selected.length === 0) { toast.error('กรุณาเลือกอย่างน้อย 1 ส่วน'); return; }
    const css = `.rot { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; height: 110px; font-size: 11pt; }`;
    if (!openPrintWindow(`ปพ.5 ${selectedGrade} ปีการศึกษา ${selectedAcademicYear}`, buildHtml(), 'portrait', css)) {
      toast.error('กรุณาอนุญาต pop-ups เพื่อพิมพ์');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-700 to-gray-900">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />กลับ
            </Button>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Printer className="w-6 h-6" />การสั่งพิมพ์ ปพ.5
            </CardTitle>
            <div className="text-white text-sm">ภาคเรียนที่ {selectedSemester} / {selectedAcademicYear}</div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="text-sm text-muted-foreground">
            เลือกส่วนที่ต้องการพิมพ์ ระบบจะรวมเป็นเอกสารเดียว (A4 แนวตั้ง) แยกหน้าให้อัตโนมัติ
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {SECTIONS.map(s => (
              <label key={s.id} className="flex items-center gap-2 border rounded p-2 cursor-pointer hover:bg-muted/50">
                <Checkbox checked={selected.includes(s.id)} onCheckedChange={() => toggle(s.id)} />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setSelected(SECTIONS.map(s => s.id))}>เลือกทั้งหมด</Button>
            <Button variant="outline" onClick={() => setSelected([])}>ล้างการเลือก</Button>
            <Button onClick={handlePrint} disabled={loading} className="ml-auto bg-slate-800 hover:bg-slate-900">
              <Printer className="w-4 h-4 mr-1" />พิมพ์เอกสาร ({students.length} คน)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PP5PrintCenter;