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
  { id: 'front', label: 'ปกหน้า (สรุปจำนวนนักเรียน / ลงนาม)' },
  { id: 'students', label: 'รายชื่อนักเรียน' },
  { id: 'basicInfo', label: 'ข้อมูลพื้นฐานนักเรียน (ผู้ปกครอง / ที่อยู่)' },
  { id: 'ratio', label: 'การกำหนดสัดส่วนคะแนน' },
  { id: 'grades', label: 'สรุปผลการเรียนรายวิชา (ระดับผลการเรียน)' },
  { id: 'elective', label: 'เอกสารรายวิชาเพิ่มเติม (ปกอนุมัติ / คะแนน)' },
  { id: 'chart', label: 'กราฟสรุปผลสัมฤทธิ์ทางการเรียน' },
  { id: 'analysis', label: 'วิเคราะห์ผลสัมฤทธิ์ 8 กลุ่มสาระการเรียนรู้' },
  { id: 'traits', label: 'สรุปคุณลักษณะอันพึงประสงค์' },
  { id: 'reading', label: 'สรุปการอ่าน คิดวิเคราะห์ และเขียน' },
  { id: 'activityCover', label: 'ปกเสนออนุมัติกิจกรรมพัฒนาผู้เรียน' },
  { id: 'activityForms', label: 'แบบประเมินกิจกรรมพัฒนาผู้เรียน (4 ประเภท)' },
  { id: 'activities', label: 'สรุปกิจกรรมพัฒนาผู้เรียน' },
  { id: 'individual', label: 'รายงานผลการพัฒนาคุณภาพผู้เรียนรายบุคคล' },
  { id: 'individualEval', label: 'รายงานผลการประเมินรายบุคคล (อ่านคิดฯ / คุณลักษณะ / กิจกรรม)' },
];


const TRAITS = [
  '1. รักชาติ ศาสน์ กษัตริย์', '2. ซื่อสัตย์ สุจริต', '3. มีวินัย', '4. ใฝ่เรียนรู้',
  '5. อยู่อย่างพอเพียง', '6. มุ่งมั่นในการทำงาน', '7. รักความเป็นไทย', '8. มีจิตสาธารณะ',
];
const READING_ITEMS = [
  '1. สามารถอ่านและหาประสบการณ์จากสื่อ', '2. สามารถจับประเด็นสำคัญ',
  '3. สามารถเปรียบเทียบ/เชื่อมโยงความคิด', '4. สามารถแสดงความคิดเห็นอย่างมีเหตุผล',
  '5. สามารถถ่ายทอดความคิดเห็นด้วยการเขียน',
];
const ACTIVITY_DEFS = [
  { key: 'guidance', name: 'กิจกรรมแนะแนว', short: 'แนะแนว', hours: 40 },
  { key: 'scout', name: 'กิจกรรมลูกเสือ เนตรนารี ยุวกาชาด', short: 'ลูกเสือฯ', hours: 40 },
  { key: 'club', name: 'กิจกรรมชุมนุม/ชมรม', short: 'ชุมนุม', hours: 40 },
  { key: 'social', name: 'กิจกรรมเพื่อสังคมและสาธารณประโยชน์', short: 'เพื่อสังคมฯ', hours: 10 },
] as const;

const SUBJECT_CODES: Record<string, string> = {
  thai: 'ท#3101', math: 'ค#3101', science: 'ว#3101', social: 'ส#3101', history: 'ส#3102',
  health: 'พ#3101', art: 'ศ#3101', career: 'ง#3101', english: 'อ#3101',
  'anti-corruption': 'ส#3202', 'english-comm': 'อ#3201',
};
const subjectCode = (menuId: string, gradeNum: string) =>
  (SUBJECT_CODES[menuId] || '').replace('#3', `1${gradeNum}`);

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

    if (selected.includes('front')) {
      const cover = readJSON(`pp5-cover-${selectedGrade}-${selectedAcademicYear}-${selectedSemester}`);
      const sign = (name: string, role: string) => `
        <div style="text-align:center;min-width:230px;line-height:1.6;margin-top:12mm">
          ลงชื่อ .....................................................<br/>
          ( ${name || '.....................................................'} )<br/>${role}
        </div>`;
      pages.push(`
        <div style="text-align:center;line-height:1.9">
          <div style="font-size:26pt;font-weight:bold">ปพ.5</div>
          <div style="font-size:20pt;font-weight:bold">แบบบันทึกผลการพัฒนาคุณภาพผู้เรียน</div>
          <div style="font-size:18pt">ชั้นประถมศึกษาปีที่ ${gradeNum} ภาคเรียนที่ ${selectedSemester} ปีการศึกษา ${selectedAcademicYear}</div>
          <div style="font-size:18pt">โรงเรียน${cover?.schoolName || info?.schoolName || 'บ้านดอนมูล'}</div>
          <div style="font-size:16pt">สำนักงานเขตพื้นที่การศึกษาประถมศึกษา${info?.educationArea || '..............................'}</div>
        </div>
        <table style="margin-top:10mm;width:70%;margin-left:auto;margin-right:auto">
          <tbody>
            <tr><td>จำนวนนักเรียนทั้งหมด</td><td class="num" style="width:80px">${students.length}</td><td style="width:50px">คน</td></tr>
            <tr><td>จำนวนนักเรียนที่ผ่านเกณฑ์การประเมิน</td><td class="num">&nbsp;</td><td>คน</td></tr>
            <tr><td>จำนวนนักเรียนที่ไม่ผ่านเกณฑ์การประเมิน</td><td class="num">&nbsp;</td><td>คน</td></tr>
            <tr><td>จำนวนนักเรียนที่จำหน่ายออก</td><td class="num">&nbsp;</td><td>คน</td></tr>
            <tr><td>จำนวนนักเรียนย้ายสถานศึกษา</td><td class="num">&nbsp;</td><td>คน</td></tr>
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-around;flex-wrap:wrap">
          ${sign(cover?.teacher1 || info?.homeTeacher1 || '', 'ครูประจำชั้น')}
          ${sign(cover?.teacher2 || info?.homeTeacher2 || '', 'ครูประจำชั้น')}
          ${sign(info?.academicHead || '', 'หัวหน้าฝ่ายวิชาการ')}
          ${sign(info?.directorName || '', 'ผู้อำนวยการโรงเรียน')}
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

    const activityData = readJSON(`pp5-student-activity-${selectedGrade}-${selectedAcademicYear}-${selectedSemester}`);
    const actResult = (key: string, sid: string, hours: number): boolean | null => {
      const row: number[] | undefined = activityData?.scores?.[key]?.[sid];
      if (!row || row.length === 0) return null;
      const attended = row.reduce((a: number, b: number) => a + (Number(b) || 0), 0);
      return attended / row.length >= 0.8;
    };
    const actSymbol = (v: boolean | null) => (v === null ? '' : v ? 'ผ.' : 'มผ.');
    const actHours = (key: string, sid: string): number | null => {
      const row: number[] | undefined = activityData?.scores?.[key]?.[sid];
      if (!row || row.length === 0) return null;
      return row.reduce((a: number, b: number) => a + (Number(b) || 0), 0);
    };

    if (selected.includes('activityCover')) {
      pages.push(`
        <div style="text-align:center;line-height:2;padding-top:18mm">
          <div style="font-size:24pt;font-weight:bold">แบบเสนอขออนุมัติผลการประเมิน</div>
          <div style="font-size:22pt;font-weight:bold">กิจกรรมพัฒนาผู้เรียน</div>
          <div style="font-size:18pt">ชั้นประถมศึกษาปีที่ ${gradeNum} ภาคเรียนที่ ${selectedSemester} ปีการศึกษา ${selectedAcademicYear}</div>
          <div style="font-size:18pt">โรงเรียน${info?.schoolName || 'บ้านดอนมูล'}</div>
        </div>
        <table style="margin-top:10mm;width:80%;margin-left:auto;margin-right:auto">
          <thead><tr><th>กิจกรรม</th><th style="width:90px">เวลาเรียน<br/>(ชั่วโมง)</th><th style="width:70px">ผ่าน</th><th style="width:70px">ไม่ผ่าน</th></tr></thead>
          <tbody>${ACTIVITY_DEFS.map(a => {
            const res = students.map(s => actResult(a.key, s.studentId || s.id, a.hours));
            const pass = res.filter(r => r === true).length;
            const fail = res.filter(r => r === false).length;
            return `<tr><td>${a.name}</td><td class="num">${a.hours}</td><td class="num">${pass || ''}</td><td class="num">${fail || ''}</td></tr>`;
          }).join('')}</tbody>
        </table>
        <div style="display:flex;justify-content:space-around;margin-top:16mm">
          <div style="text-align:center;line-height:1.6">ลงชื่อ .....................................................<br/>( ${info?.homeTeacher1 || '.........................................'} )<br/>ครูผู้รับผิดชอบกิจกรรม</div>
          <div style="text-align:center;line-height:1.6">ลงชื่อ .....................................................<br/>( ${info?.directorName || '.........................................'} )<br/>ผู้อำนวยการโรงเรียน</div>
        </div>`);
    }

    if (selected.includes('activityForms')) {
      ACTIVITY_DEFS.forEach(a => {
        pages.push(`${header(`แบบประเมิน${a.name}`)}
          <table style="margin-top:8px">
            <thead><tr><th style="width:36px">ที่</th><th style="width:90px">เลขประจำตัว</th><th>ชื่อ - นามสกุล</th>
              <th style="width:90px">เวลาเรียน<br/>(${a.hours} ชม.)</th><th style="width:70px">ร้อยละ</th><th style="width:80px">ผลการประเมิน</th></tr></thead>
            <tbody>${students.map((s, i) => {
              const sid = s.studentId || s.id;
              const h = actHours(a.key, sid);
              const pct = h === null ? '' : Math.round((h / a.hours) * 100).toString();
              return `<tr><td class="num">${i + 1}</td><td class="num">${s.studentId || ''}</td><td>${fullName(s)}</td>
                <td class="num">${h === null ? '' : h}</td><td class="num">${pct}</td><td class="num">${actSymbol(actResult(a.key, sid, a.hours))}</td></tr>`;
            }).join('')}</tbody>
          </table>
          <div style="margin-top:6px;font-size:14pt">เกณฑ์การประเมิน : มีเวลาเข้าร่วมกิจกรรมไม่น้อยกว่าร้อยละ 80 และผ่านจุดประสงค์สำคัญของกิจกรรม</div>
          <div style="display:flex;justify-content:space-around;margin-top:14mm">
            <div style="text-align:center;line-height:1.6">ลงชื่อ .....................................................<br/>( ${activityData?.teacherNames?.[a.key] || info?.homeTeacher1 || '.........................................'} )<br/>ครูผู้สอนกิจกรรม</div>
            <div style="text-align:center;line-height:1.6">ลงชื่อ .....................................................<br/>( ${info?.directorName || '.........................................'} )<br/>ผู้อำนวยการโรงเรียน</div>
          </div>`);
      });
    }



    if (selected.includes('activities')) {
      pages.push(`${header('สรุปผลการประเมินกิจกรรมพัฒนาผู้เรียน')}
        <table style="margin-top:8px">
          <thead><tr><th style="width:36px">ที่</th><th>ชื่อ - นามสกุล</th>
            ${ACTIVITY_DEFS.map(a => `<th style="width:80px">${a.short}</th>`).join('')}
            <th style="width:80px">สรุปผล</th></tr></thead>
          <tbody>${students.map((s, i) => {
            const sid = s.studentId || s.id;
            const res = ACTIVITY_DEFS.map(a => actResult(a.key, sid, a.hours));
            const known = res.filter(r => r !== null);
            const summary = known.length === 0 ? '' : res.every(r => r === true) ? 'ผ่าน' : 'ไม่ผ่าน';
            return `<tr><td class="num">${i + 1}</td><td>${fullName(s)}</td>${res.map(r => `<td class="num">${actSymbol(r)}</td>`).join('')}<td class="num">${summary}</td></tr>`;
          }).join('')}</tbody>
        </table>`);
    }

    if (selected.includes('individual') || selected.includes('individualEval')) {
      const results = computeSubjectResults(students, selectedGrade, selectedAcademicYear, selectedSemester);
      const traitData = readJSON(`pp5-desirable-traits-${selectedGrade}-${selectedAcademicYear}-${selectedSemester}`);
      const readData = readJSON(`pp5-reading-analysis-${selectedGrade}-${selectedAcademicYear}-${selectedSemester}`);

      const gpaOf = (s: Student) => {
        let credits = 0, weighted = 0;
        results.forEach(r => { credits += r.def.credit; weighted += (r.results[s.id]?.grade || 0) * r.def.credit; });
        return credits ? weighted / credits : 0;
      };
      const ranked = [...students].sort((a, b) => gpaOf(b) - gpaOf(a));
      const rankOf = (s: Student) => ranked.findIndex(x => x.id === s.id) + 1;

      const signPair = `
        <div style="display:flex;justify-content:space-around;margin-top:12mm">
          <div style="text-align:center;line-height:1.6">ลงชื่อ .....................................................<br/>( ${info?.homeTeacher1 || '.........................................'} )<br/>ครูประจำชั้น</div>
          <div style="text-align:center;line-height:1.6">ลงชื่อ .....................................................<br/>( ${info?.directorName || '.........................................'} )<br/>ผู้อำนวยการโรงเรียน</div>
        </div>`;

      students.forEach(s => {
        const sid = s.studentId || s.id;
        const traitRow: number[] = traitData?.scores?.[sid] || [];
        const traitSum = traitRow.reduce((a, b) => a + (Number(b) || 0), 0);
        const readRow: number[] = readData?.scores?.[sid] || [];
        const readSum = readRow.reduce((a, b) => a + (Number(b) || 0), 0);
        const actRes = ACTIVITY_DEFS.map(a => actResult(a.key, sid, a.hours));
        const actSummary = actRes.every(r => r === null) ? '' : actRes.every(r => r === true) ? 'ผ่าน' : 'ไม่ผ่าน';

        if (selected.includes('individual')) {
          let credits = 0, earned = 0, weighted = 0;
          const rows = results.map(r => {
            const res = r.results[s.id] || { score100: 0, grade: 0 };
            credits += r.def.credit;
            weighted += res.grade * r.def.credit;
            if (res.grade > 0) earned += r.def.credit;
            return `<tr><td class="num">${subjectCode(r.def.menuId, gradeNum)}</td><td>${r.def.name}</td>
              <td class="num">${r.def.credit.toFixed(1)}</td><td class="num">100</td>
              <td class="num">${Math.round(res.score100)}</td><td class="num">${res.grade.toFixed(1)}</td></tr>`;
          }).join('');
          const gpa = credits ? (weighted / credits).toFixed(2) : '0.00';
          pages.push(`${header('รายงานผลการพัฒนาคุณภาพผู้เรียนรายบุคคล')}
            <div style="margin:6px 0;font-size:16pt">ชื่อนักเรียน : ${fullName(s)} &nbsp;&nbsp; เลขประจำตัว : ${s.studentId || '-'}</div>
            <table>
              <thead><tr><th style="width:78px">รหัสวิชา</th><th>กลุ่มสาระการเรียนรู้</th>
                <th style="width:70px">น้ำหนัก<br/>หน่วยกิต</th><th style="width:60px">คะแนน<br/>เต็ม</th>
                <th style="width:60px">คะแนน<br/>ที่ได้</th><th style="width:60px">ระดับ<br/>ผลการเรียน</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
            <table style="margin-top:6px">
              <thead><tr><th colspan="2">สรุปผลการเรียน</th><th style="width:150px">ผลการประเมิน</th></tr></thead>
              <tbody>
                <tr><td colspan="2">จำนวนหน่วยกิตที่เรียน</td><td class="num">${credits.toFixed(1)}</td></tr>
                <tr><td colspan="2">จำนวนหน่วยกิตที่ได้</td><td class="num">${earned.toFixed(1)}</td></tr>
                <tr><td colspan="2">ระดับผลการเรียนเฉลี่ย (GPA)</td><td class="num">${gpa}</td></tr>
                <tr><td colspan="2">คุณลักษณะอันพึงประสงค์</td><td class="num">${traitSum ? traitLevel(traitSum) : ''}</td></tr>
                <tr><td colspan="2">การอ่าน คิดวิเคราะห์และเขียน</td><td class="num">${readSum ? readingLevel(readSum) : ''}</td></tr>
                <tr><td colspan="2">กิจกรรมพัฒนาผู้เรียน</td><td class="num">${actSummary}</td></tr>
                <tr><td colspan="2">สอบได้ลำดับที่</td><td class="num">${rankOf(s)} จาก ${students.length}</td></tr>
              </tbody>
            </table>
            ${signPair}`);
        }

        if (selected.includes('individualEval')) {
          pages.push(`${header('รายงานผลการประเมินรายบุคคล')}
            <div style="margin:6px 0;font-size:16pt">ชื่อนักเรียน : ${fullName(s)} &nbsp;&nbsp; เลขประจำตัว : ${s.studentId || '-'}</div>
            <table>
              <thead><tr><th>การประเมินการอ่าน คิดวิเคราะห์ และเขียน</th><th style="width:120px">คะแนน</th><th style="width:130px">ผลการประเมิน</th></tr></thead>
              <tbody>${READING_ITEMS.map((t, i) => {
                const v = Number(readRow[i] || 0);
                return `<tr><td>${t}</td><td class="num">${v || ''}</td><td class="num">${v ? readingLevel(v * 5) : ''}</td></tr>`;
              }).join('')}
              <tr><td style="font-weight:bold">สรุปผลการประเมินการอ่าน คิดวิเคราะห์ และเขียน</td><td class="num">${readSum || ''}</td><td class="num">${readSum ? readingLevel(readSum) : ''}</td></tr></tbody>
            </table>
            <table style="margin-top:6px">
              <thead><tr><th>การประเมินคุณลักษณะอันพึงประสงค์</th><th style="width:120px">คะแนน</th><th style="width:130px">ผลการประเมิน</th></tr></thead>
              <tbody>${TRAITS.map((t, i) => {
                const v = Number(traitRow[i] || 0);
                return `<tr><td>${t}</td><td class="num">${v || ''}</td><td class="num">${v ? traitLevel(v * 8) : ''}</td></tr>`;
              }).join('')}
              <tr><td style="font-weight:bold">สรุปผลการประเมินคุณลักษณะอันพึงประสงค์</td><td class="num">${traitSum || ''}</td><td class="num">${traitSum ? traitLevel(traitSum) : ''}</td></tr></tbody>
            </table>
            <table style="margin-top:6px">
              <thead><tr><th>การประเมินกิจกรรมพัฒนาผู้เรียน</th><th style="width:120px">เวลาเรียน</th><th style="width:130px">ผลการประเมิน</th></tr></thead>
              <tbody>${ACTIVITY_DEFS.map((a, i) => `<tr><td>${a.name}</td><td class="num">${a.hours} ชม.</td><td class="num">${actSymbol(actRes[i])}</td></tr>`).join('')}
              <tr><td style="font-weight:bold">สรุปผลการประเมินกิจกรรมพัฒนาผู้เรียน</td><td class="num">&nbsp;</td><td class="num">${actSummary}</td></tr></tbody>
            </table>
            ${signPair}`);
        }
      });
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