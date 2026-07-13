import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Printer, GraduationCap, Save } from 'lucide-react';
import { getStudents } from '@/utils/studentStorage';
import type { Student } from '@/types/student';
import { createRoot } from 'react-dom/client';
import { toast } from 'sonner';

const primaryGrades = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];

export const DESIRABLE_TRAITS = [
  'รักชาติ ศาสน์ กษัตริย์',
  'ซื่อสัตย์สุจริต',
  'มีวินัย',
  'ใฝ่เรียนรู้',
  'อยู่อย่างพอเพียง',
  'มุ่งมั่นในการทำงาน',
  'รักความเป็นไทย',
  'มีจิตสาธารณะ',
];

const SHORT_TRAITS = ['รักชาติฯ', 'ซื่อสัตย์', 'มีวินัย', 'ใฝ่เรียนรู้', 'พอเพียง', 'มุ่งมั่นฯ', 'รักไทย', 'จิตสาธารณะ'];

// MOE conversion: sum 0-24 → level 0-3 → label
export const traitLevel = (sum: number): { level: number; label: string } => {
  if (sum >= 22) return { level: 3, label: 'ดีเยี่ยม' };
  if (sum >= 16) return { level: 2, label: 'ดี' };
  if (sum >= 8) return { level: 1, label: 'ผ่าน' };
  return { level: 0, label: 'ไม่ผ่าน' };
};

type Scores = Record<string, number[]>; // studentId -> 8 scores

interface Props {
  selectedGrade: string;
  selectedSemester: string;
  selectedAcademicYear: string;
  onBack: () => void;
}

const DesirableTraitsAssessment: React.FC<Props> = ({
  selectedGrade: initialGrade,
  selectedSemester,
  selectedAcademicYear,
  onBack,
}) => {
  const [currentGrade, setCurrentGrade] = useState(initialGrade);
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<Scores>({});
  const [teacherName, setTeacherName] = useState('');
  const [loading, setLoading] = useState(true);

  const storageKey = `pp5-desirable-traits-${currentGrade}-${selectedAcademicYear}-${selectedSemester}`;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const all = await getStudents();
      const filtered = all.filter(s => s.grade === currentGrade && s.academicYear === selectedAcademicYear);
      const seen = new Set<string>();
      const unique = filtered.filter(s => {
        const k = s.studentId || s.id;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      unique.sort((a, b) => (parseInt(a.studentId || '0') || 0) - (parseInt(b.studentId || '0') || 0));
      setStudents(unique);

      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setScores(parsed.scores || {});
          setTeacherName(parsed.teacherName || '');
        } catch { /* noop */ }
      } else {
        setScores({});
      }
      setLoading(false);
    })();
  }, [currentGrade, selectedAcademicYear, selectedSemester, storageKey]);

  const updateScore = (sid: string, idx: number, val: number) => {
    setScores(prev => {
      const row = prev[sid] ? [...prev[sid]] : new Array(8).fill(0);
      row[idx] = Math.max(0, Math.min(3, val));
      return { ...prev, [sid]: row };
    });
  };

  const fillAll = (val: number) => {
    const next: Scores = {};
    students.forEach(s => {
      const sid = s.studentId || s.id;
      next[sid] = new Array(8).fill(val);
    });
    setScores(next);
    toast.success(`เติมค่า ${val} ให้นักเรียนทุกคน`);
  };

  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify({ scores, teacherName, savedAt: new Date().toISOString() }));
    toast.success('บันทึกข้อมูลเรียบร้อย');
  };

  const rows = useMemo(() => students.map(s => {
    const sid = s.studentId || s.id;
    const row = scores[sid] || new Array(8).fill(0);
    const sum = row.reduce((a, b) => a + (Number(b) || 0), 0);
    const { level, label } = traitLevel(sum);
    return { student: s, sid, row, sum, level, label };
  }), [students, scores]);

  const summary = useMemo(() => {
    const s = { 'ดีเยี่ยม': 0, 'ดี': 0, 'ผ่าน': 0, 'ไม่ผ่าน': 0 } as Record<string, number>;
    rows.forEach(r => { s[r.label] = (s[r.label] || 0) + 1; });
    return s;
  }, [rows]);

  const handlePrint = () => {
    handleSave();
    const win = window.open('', '', 'height=900,width=1200');
    if (!win) { toast.error('กรุณาอนุญาต pop-ups เพื่อพิมพ์'); return; }
    document.querySelectorAll('link[rel="stylesheet"], style').forEach(el => {
      win.document.head.appendChild(el.cloneNode(true));
    });
    win.document.title = `การประเมินคุณลักษณะอันพึงประสงค์ ${currentGrade}`;
    const el = win.document.createElement('div');
    win.document.body.appendChild(el);
    createRoot(el).render(
      <DesirableTraitsPrintable
        rows={rows}
        grade={currentGrade}
        semester={selectedSemester}
        academicYear={selectedAcademicYear}
        teacherName={teacherName}
        summary={summary}
      />
    );
    setTimeout(() => { win.focus(); win.print(); win.close(); }, 800);
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-purple-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />กลับ
            </Button>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6" />
              การประเมินคุณลักษณะอันพึงประสงค์
            </CardTitle>
            <div className="text-white text-sm">
              ภาคเรียนที่ {selectedSemester} / {selectedAcademicYear}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">ระดับชั้น:</Label>
              <Select value={currentGrade} onValueChange={setCurrentGrade}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {primaryGrades.map(g => (
                    <SelectItem key={g} value={g}>ประถมศึกษาปีที่ {g.replace('ป.', '')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Label className="whitespace-nowrap">ครูผู้ประเมิน:</Label>
              <Input value={teacherName} onChange={e => setTeacherName(e.target.value)} placeholder="ชื่อครูผู้ประเมิน" />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">เติมค่าให้ทุกคน:</Label>
              {[0, 1, 2, 3].map(v => (
                <Button key={v} size="sm" variant="outline" onClick={() => fillAll(v)}>{v}</Button>
              ))}
            </div>
            <Button onClick={handleSave} variant="outline"><Save className="w-4 h-4 mr-1" />บันทึก</Button>
            <Button onClick={handlePrint} className="bg-purple-600 hover:bg-purple-700"><Printer className="w-4 h-4 mr-1" />พิมพ์</Button>
          </div>

          <div className="flex flex-wrap gap-3 text-sm bg-purple-50 border border-purple-200 rounded p-3">
            <span className="font-semibold text-purple-800">เกณฑ์การประเมิน (คะแนนเต็ม 24):</span>
            <span>22–24 = ดีเยี่ยม (3)</span>
            <span>16–21 = ดี (2)</span>
            <span>8–15 = ผ่าน (1)</span>
            <span>0–7 = ไม่ผ่าน (0)</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>
          ) : students.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              ไม่พบข้อมูลนักเรียนในระดับชั้น {currentGrade} ปีการศึกษา {selectedAcademicYear}
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="border border-gray-400 p-1 w-12">ที่</th>
                    <th className="border border-gray-400 p-1 text-left min-w-[180px]">ชื่อ - นามสกุล</th>
                    {SHORT_TRAITS.map((t, i) => (
                      <th key={i} className="border border-gray-400 p-1 w-16" title={DESIRABLE_TRAITS[i]}>
                        <div className="text-xs font-semibold">{i + 1}</div>
                        <div className="text-[10px] leading-tight">{t}</div>
                      </th>
                    ))}
                    <th className="border border-gray-400 p-1 w-14">รวม</th>
                    <th className="border border-gray-400 p-1 w-14">ระดับ</th>
                    <th className="border border-gray-400 p-1 w-20">สรุปผล</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={r.student.id} className="hover:bg-purple-50/50">
                      <td className="border border-gray-300 p-1 text-center">{idx + 1}</td>
                      <td className="border border-gray-300 p-1">
                        {r.student.titleTh}{r.student.firstNameTh} {r.student.lastNameTh}
                      </td>
                      {r.row.map((val, i) => (
                        <td key={i} className="border border-gray-300 p-0 text-center">
                          <Input
                            type="number"
                            min={0}
                            max={3}
                            value={val}
                            onChange={e => updateScore(r.sid, i, Number(e.target.value) || 0)}
                            className="h-8 w-full text-center border-0 focus-visible:ring-1 rounded-none px-1"
                          />
                        </td>
                      ))}
                      <td className="border border-gray-300 p-1 text-center font-semibold">{r.sum}</td>
                      <td className="border border-gray-300 p-1 text-center">{r.level}</td>
                      <td className={`border border-gray-300 p-1 text-center font-medium ${
                        r.label === 'ดีเยี่ยม' ? 'text-green-700' :
                        r.label === 'ดี' ? 'text-blue-700' :
                        r.label === 'ผ่าน' ? 'text-orange-700' : 'text-red-700'
                      }`}>{r.label}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-purple-50 font-semibold">
                    <td className="border border-gray-400 p-2 text-right" colSpan={11}>สรุปจำนวนนักเรียน</td>
                    <td className="border border-gray-400 p-2 text-center" colSpan={3}>
                      ดีเยี่ยม {summary['ดีเยี่ยม']} | ดี {summary['ดี']} | ผ่าน {summary['ผ่าน']} | ไม่ผ่าน {summary['ไม่ผ่าน']}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ==================== PRINT PREVIEW ====================
interface PrintableProps {
  rows: ReturnType<typeof buildRowsShape>;
  grade: string;
  semester: string;
  academicYear: string;
  teacherName: string;
  summary: Record<string, number>;
}
// helper only for typing
const buildRowsShape = () => [] as Array<{ student: Student; sid: string; row: number[]; sum: number; level: number; label: string }>;

const DesirableTraitsPrintable: React.FC<PrintableProps> = ({ rows, grade, semester, academicYear, teacherName, summary }) => {
  const totalStudents = rows.length;
  const minRows = 20;
  const emptyCount = Math.max(0, minRows - totalStudents);

  return (
    <div style={{ fontFamily: "'TH SarabunPSK', 'TH Sarabun', 'Sarabun', sans-serif", padding: '6mm' }}>
      <style>{`
        @page { size: A4 portrait; margin: 8mm; }
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          table, th, td { border: 1px solid #000 !important; border-collapse: collapse !important; }
          thead { display: table-header-group !important; }
          tr { page-break-inside: avoid !important; }
        }
        .pp5-trait-table { width: 100%; border-collapse: collapse; font-size: 14pt; }
        .pp5-trait-table th, .pp5-trait-table td { border: 1px solid #000; padding: 2px 4px; }
        .pp5-trait-table th { background-color: #eef2ff; text-align: center; vertical-align: middle; }
        .pp5-trait-table td.num { text-align: center; }
        .rot { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; padding: 4px 2px; font-size: 12pt; height: 90px; }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: '6px' }}>
        <div style={{ fontSize: '18pt', fontWeight: 'bold' }}>แบบสรุปการประเมินคุณลักษณะอันพึงประสงค์</div>
        <div style={{ fontSize: '16pt' }}>
          โรงเรียนบ้านดอนมูล ชั้นประถมศึกษาปีที่ {grade.replace('ป.', '')} ภาคเรียนที่ {semester} ปีการศึกษา {academicYear}
        </div>
      </div>

      <table className="pp5-trait-table">
        <thead>
          <tr>
            <th rowSpan={2} style={{ width: '32px' }}>ที่</th>
            <th rowSpan={2} style={{ minWidth: '180px' }}>ชื่อ - นามสกุล</th>
            <th colSpan={8}>คุณลักษณะอันพึงประสงค์ (กรอกตัวเลขระดับ 0-3)</th>
            <th rowSpan={2} style={{ width: '40px' }}>รวม<br/>คะแนน</th>
            <th rowSpan={2} style={{ width: '40px' }}>ระดับ<br/>(0-3)</th>
            <th rowSpan={2} style={{ width: '60px' }}>สรุปผล</th>
          </tr>
          <tr>
            {DESIRABLE_TRAITS.map((t, i) => (
              <th key={i} style={{ width: '38px' }}>
                <div className="rot">{`${i + 1}. ${t}`}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={r.student.id}>
              <td className="num">{idx + 1}</td>
              <td>{r.student.titleTh}{r.student.firstNameTh} {r.student.lastNameTh}</td>
              {r.row.map((v, i) => <td key={i} className="num">{v || ''}</td>)}
              <td className="num">{r.sum || ''}</td>
              <td className="num">{r.sum ? r.level : ''}</td>
              <td className="num">{r.sum ? r.label : ''}</td>
            </tr>
          ))}
          {Array.from({ length: emptyCount }).map((_, i) => (
            <tr key={`e-${i}`}>
              <td className="num" style={{ color: '#bbb' }}>{totalStudents + i + 1}</td>
              <td>&nbsp;</td>
              {Array.from({ length: 8 }).map((_, j) => <td key={j}>&nbsp;</td>)}
              <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '8px', fontSize: '14pt' }}>
        <div>
          <strong>สรุปผลรวม:</strong> ดีเยี่ยม {summary['ดีเยี่ยม']} คน | ดี {summary['ดี']} คน | ผ่าน {summary['ผ่าน']} คน | ไม่ผ่าน {summary['ไม่ผ่าน']} คน
        </div>
        <div style={{ marginTop: '2px', fontSize: '12pt', color: '#444' }}>
          <strong>เกณฑ์:</strong> 22–24 = ดีเยี่ยม (3), 16–21 = ดี (2), 8–15 = ผ่าน (1), 0–7 = ไม่ผ่าน (0)
        </div>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', fontSize: '14pt', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <div style={{ textAlign: 'center', minWidth: '260px', lineHeight: 1.6 }}>
          <div>ลงชื่อ ..................................................... ครูผู้ประเมิน</div>
          <div>( {teacherName || '.....................................................'} )</div>
        </div>
      </div>
    </div>
  );
};

export default DesirableTraitsAssessment;