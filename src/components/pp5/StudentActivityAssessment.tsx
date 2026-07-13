import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Printer, Users, Save } from 'lucide-react';
import { getStudents } from '@/utils/studentStorage';
import type { Student } from '@/types/student';
import { createRoot } from 'react-dom/client';
import { toast } from 'sonner';

const primaryGrades = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];

export type ActivityKey = 'guidance' | 'scout' | 'club' | 'social';
interface ActivityDef { key: ActivityKey; name: string; short: string; hours: number; }

const ACTIVITIES: ActivityDef[] = [
  { key: 'guidance', name: 'กิจกรรมแนะแนว', short: 'แนะแนว', hours: 40 },
  { key: 'scout', name: 'กิจกรรมลูกเสือ เนตรนารี ยุวกาชาด', short: 'ลูกเสือฯ', hours: 40 },
  { key: 'club', name: 'กิจกรรมชุมนุม/ชมรม', short: 'ชุมนุม', hours: 40 },
  { key: 'social', name: 'กิจกรรมเพื่อสังคมและสาธารณประโยชน์', short: 'เพื่อสังคม', hours: 10 },
];

// value: 1 = ผ่าน (participated), 0 = ไม่มา, -1 = มผ. explicit
type CellVal = 0 | 1;
type ActivityScores = Record<string, CellVal[]>; // studentId -> hours[]
type AllScores = Record<ActivityKey, ActivityScores>;

const PASS_THRESHOLD = 0.8; // 80% attendance required to pass

interface Props {
  selectedGrade: string;
  selectedSemester: string;
  selectedAcademicYear: string;
  onBack: () => void;
  /** Show only one activity's data-entry tab. */
  focusActivity?: ActivityKey;
  /** Show only the overall summary table (hides data-entry). */
  summaryOnly?: boolean;
  /** Override the header title. */
  titleOverride?: string;
}

const StudentActivityAssessment: React.FC<Props> = ({
  selectedGrade: initialGrade,
  selectedSemester,
  selectedAcademicYear,
  onBack,
  focusActivity,
  summaryOnly,
  titleOverride,
}) => {
  const [currentGrade, setCurrentGrade] = useState(initialGrade);
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<AllScores>({ guidance: {}, scout: {}, club: {}, social: {} });
  const [teacherNames, setTeacherNames] = useState<Record<ActivityKey, string>>({
    guidance: '', scout: '', club: '', social: '',
  });
  const [activeTab, setActiveTab] = useState<ActivityKey>(focusActivity || 'guidance');
  const [loading, setLoading] = useState(true);

  const visibleActivities = useMemo(
    () => (focusActivity ? ACTIVITIES.filter(a => a.key === focusActivity) : ACTIVITIES),
    [focusActivity]
  );

  const storageKey = `pp5-student-activity-${currentGrade}-${selectedAcademicYear}-${selectedSemester}`;

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
          setScores(parsed.scores || { guidance: {}, scout: {}, club: {}, social: {} });
          setTeacherNames(parsed.teacherNames || { guidance: '', scout: '', club: '', social: '' });
        } catch { /* noop */ }
      } else {
        setScores({ guidance: {}, scout: {}, club: {}, social: {} });
      }
      setLoading(false);
    })();
  }, [currentGrade, selectedAcademicYear, selectedSemester, storageKey]);

  const getRow = (key: ActivityKey, sid: string, hours: number): CellVal[] => {
    const existing = scores[key][sid];
    if (existing && existing.length === hours) return existing;
    return new Array(hours).fill(1) as CellVal[];
  };

  const toggleCell = (key: ActivityKey, sid: string, hourIdx: number, hours: number) => {
    setScores(prev => {
      const row = [...getRow(key, sid, hours)];
      row[hourIdx] = row[hourIdx] === 1 ? 0 : 1;
      return { ...prev, [key]: { ...prev[key], [sid]: row } };
    });
  };

  const fillAll = (key: ActivityKey, val: CellVal) => {
    const def = ACTIVITIES.find(a => a.key === key)!;
    setScores(prev => {
      const next: ActivityScores = {};
      students.forEach(s => {
        const sid = s.studentId || s.id;
        next[sid] = new Array(def.hours).fill(val) as CellVal[];
      });
      return { ...prev, [key]: next };
    });
    toast.success(`เติม ${val === 1 ? 'ผ.' : 'มผ.'} ให้ทุกคนใน${def.name}`);
  };

  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify({ scores, teacherNames, savedAt: new Date().toISOString() }));
    toast.success('บันทึกข้อมูลเรียบร้อย');
  };

  const computePass = (row: CellVal[]): { attended: number; total: number; pass: boolean } => {
    const total = row.length;
    const attended = row.reduce((a, b) => a + b, 0);
    return { attended, total, pass: total > 0 && attended / total >= PASS_THRESHOLD };
  };

  const currentDef = ACTIVITIES.find(a => a.key === activeTab)!;

  const handlePrint = () => {
    handleSave();
    const win = window.open('', '', 'height=900,width=1400');
    if (!win) { toast.error('กรุณาอนุญาต pop-ups เพื่อพิมพ์'); return; }
    document.querySelectorAll('link[rel="stylesheet"], style').forEach(el => {
      win.document.head.appendChild(el.cloneNode(true));
    });
    win.document.title = `กิจกรรมพัฒนาผู้เรียน ${currentGrade}`;
    const el = win.document.createElement('div');
    win.document.body.appendChild(el);
    createRoot(el).render(
      <ActivityPrintable
        activities={visibleActivities}
        students={students}
        scores={scores}
        teacherNames={teacherNames}
        grade={currentGrade}
        semester={selectedSemester}
        academicYear={selectedAcademicYear}
        summaryOnly={summaryOnly}
      />
    );
    setTimeout(() => { win.focus(); win.print(); win.close(); }, 900);
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-indigo-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />กลับ
            </Button>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6" />{titleOverride || 'กิจกรรมพัฒนาผู้เรียน'}
            </CardTitle>
            <div className="text-white text-sm">ภาคเรียนที่ {selectedSemester} / {selectedAcademicYear}</div>
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
            <Button onClick={handleSave} variant="outline"><Save className="w-4 h-4 mr-1" />บันทึกทั้งหมด</Button>
            <Button onClick={handlePrint} className="bg-indigo-700 hover:bg-indigo-800"><Printer className="w-4 h-4 mr-1" />พิมพ์ทั้งหมด</Button>
          </div>

          <div className="text-sm bg-indigo-50 border border-indigo-200 rounded p-3">
            <strong className="text-indigo-800">เกณฑ์การประเมิน:</strong> เข้าร่วมกิจกรรมไม่น้อยกว่า 80% ของจำนวนชั่วโมง → <strong>ผ่าน (ผ.)</strong> · น้อยกว่า 80% → <strong>ไม่ผ่าน (มผ.)</strong>
            <div className="mt-1 text-xs text-muted-foreground">คลิกที่ช่องเพื่อสลับสถานะระหว่าง ผ. (เข้าร่วม) และ มผ. (ไม่เข้าร่วม)</div>
          </div>

          {!summaryOnly && (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActivityKey)}>
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${visibleActivities.length}, minmax(0, 1fr))` }}>
              {visibleActivities.map(a => (
                <TabsTrigger key={a.key} value={a.key}>{a.short}</TabsTrigger>
              ))}
            </TabsList>

            {visibleActivities.map(def => (
              <TabsContent key={def.key} value={def.key} className="space-y-3">
                <div className="flex flex-wrap gap-3 items-end pt-2">
                  <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                    <Label className="whitespace-nowrap">ครูผู้ประเมิน:</Label>
                    <Input
                      value={teacherNames[def.key]}
                      onChange={e => setTeacherNames(prev => ({ ...prev, [def.key]: e.target.value }))}
                      placeholder={`ชื่อครูผู้สอน${def.name}`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground">เติมให้ทุกคน:</Label>
                    <Button size="sm" variant="outline" className="text-green-700" onClick={() => fillAll(def.key, 1)}>ผ.</Button>
                    <Button size="sm" variant="outline" className="text-red-700" onClick={() => fillAll(def.key, 0)}>มผ.</Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    จำนวนชั่วโมง: <strong>{def.hours}</strong> ชม.
                  </div>
                </div>

                {loading ? (
                  <div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>
                ) : students.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    ไม่พบข้อมูลนักเรียนในระดับชั้น {currentGrade} ปีการศึกษา {selectedAcademicYear}
                  </div>
                ) : (
                  <div className="overflow-auto max-h-[65vh] border rounded">
                    <table className="border-collapse text-xs">
                      <thead className="sticky top-0 bg-indigo-100 z-10">
                        <tr>
                          <th className="border border-gray-400 p-1 w-10 sticky left-0 bg-indigo-100">ที่</th>
                          <th className="border border-gray-400 p-1 min-w-[160px] text-left sticky left-10 bg-indigo-100">ชื่อ - นามสกุล</th>
                          {Array.from({ length: def.hours }).map((_, i) => (
                            <th key={i} className="border border-gray-400 p-0.5 w-7 text-center">{i + 1}</th>
                          ))}
                          <th className="border border-gray-400 p-1 w-16">เข้าร่วม</th>
                          <th className="border border-gray-400 p-1 w-14">สรุป</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s, idx) => {
                          const sid = s.studentId || s.id;
                          const row = getRow(def.key, sid, def.hours);
                          const { attended, total, pass } = computePass(row);
                          return (
                            <tr key={s.id} className="hover:bg-indigo-50/40">
                              <td className="border border-gray-300 p-1 text-center sticky left-0 bg-white">{idx + 1}</td>
                              <td className="border border-gray-300 p-1 sticky left-10 bg-white whitespace-nowrap">
                                {s.titleTh}{s.firstNameTh} {s.lastNameTh}
                              </td>
                              {row.map((v, i) => (
                                <td
                                  key={i}
                                  onClick={() => toggleCell(def.key, sid, i, def.hours)}
                                  className={`border border-gray-300 p-0.5 text-center cursor-pointer select-none ${
                                    v === 1 ? 'text-green-700 bg-green-50 hover:bg-green-100' : 'text-red-700 bg-red-50 hover:bg-red-100'
                                  }`}
                                  title={`ชั่วโมงที่ ${i + 1}`}
                                >
                                  {v === 1 ? 'ผ' : 'มผ'}
                                </td>
                              ))}
                              <td className="border border-gray-300 p-1 text-center font-medium">{attended}/{total}</td>
                              <td className={`border border-gray-300 p-1 text-center font-bold ${pass ? 'text-green-700' : 'text-red-700'}`}>
                                {pass ? 'ผ.' : 'มผ.'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
          )}

          {/* Summary section - all activities */}
          {!loading && students.length > 0 && (summaryOnly || !focusActivity) && (
            <div className="mt-6">
              <h3 className="font-bold text-indigo-800 mb-2">สรุปผลรวมทุกกิจกรรม</h3>
              <div className="overflow-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-indigo-100">
                      <th className="border border-gray-400 p-1 w-10">ที่</th>
                      <th className="border border-gray-400 p-1 text-left">ชื่อ - นามสกุล</th>
                      {ACTIVITIES.map(a => (
                        <th key={a.key} className="border border-gray-400 p-1">{a.short}</th>
                      ))}
                      <th className="border border-gray-400 p-1">สรุปกิจกรรมพัฒนาผู้เรียน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => {
                      const sid = s.studentId || s.id;
                      const results = ACTIVITIES.map(def => computePass(getRow(def.key, sid, def.hours)));
                      const allPass = results.every(r => r.pass);
                      return (
                        <tr key={s.id}>
                          <td className="border border-gray-300 p-1 text-center">{idx + 1}</td>
                          <td className="border border-gray-300 p-1">{s.titleTh}{s.firstNameTh} {s.lastNameTh}</td>
                          {results.map((r, i) => (
                            <td key={i} className={`border border-gray-300 p-1 text-center font-medium ${r.pass ? 'text-green-700' : 'text-red-700'}`}>
                              {r.pass ? 'ผ.' : 'มผ.'}
                            </td>
                          ))}
                          <td className={`border border-gray-300 p-1 text-center font-bold ${allPass ? 'text-green-700' : 'text-red-700'}`}>
                            {allPass ? 'ผ.' : 'มผ.'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ==================== PRINT PREVIEW ====================
interface PrintProps {
  activities: ActivityDef[];
  students: Student[];
  scores: AllScores;
  teacherNames: Record<ActivityKey, string>;
  grade: string;
  semester: string;
  academicYear: string;
  summaryOnly?: boolean;
}

const ActivityPrintable: React.FC<PrintProps> = ({ activities, students, scores, teacherNames, grade, semester, academicYear, summaryOnly }) => {
  const minRows = 20;
  const emptyCount = Math.max(0, minRows - students.length);
  const getRow = (key: ActivityKey, sid: string, hours: number): CellVal[] => {
    const existing = scores[key][sid];
    if (existing && existing.length === hours) return existing;
    return new Array(hours).fill(1) as CellVal[];
  };
  const compute = (row: CellVal[]) => {
    const total = row.length;
    const attended = row.reduce((a: number, b) => a + b, 0);
    return { attended, total, pass: total > 0 && attended / total >= PASS_THRESHOLD };
  };

  return (
    <div style={{ fontFamily: "'TH SarabunPSK','TH Sarabun','Sarabun',sans-serif" }}>
      <style>{`
        @page { size: A4 landscape; margin: 8mm; }
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          table, th, td { border: 1px solid #000 !important; border-collapse: collapse !important; }
          thead { display: table-header-group !important; }
          tr { page-break-inside: avoid !important; }
          .page-break { page-break-after: always; }
        }
        .act-table { width: 100%; border-collapse: collapse; font-size: 13pt; }
        .act-table th, .act-table td { border: 1px solid #000; padding: 1px 3px; }
        .act-table th { background: #eef2ff; text-align: center; }
        .act-table td.num { text-align: center; }
      `}</style>

      {!summaryOnly && activities.map((def, ai) => (
        <div key={def.key} className={ai < activities.length ? 'page-break' : ''} style={{ padding: '4mm' }}>
          <div style={{ textAlign: 'center', marginBottom: '6px' }}>
            <div style={{ fontSize: '18pt', fontWeight: 'bold' }}>แบบสรุปการประเมิน{def.name}</div>
            <div style={{ fontSize: '15pt' }}>
              โรงเรียนบ้านดอนมูล ชั้นประถมศึกษาปีที่ {grade.replace('ป.', '')} ภาคเรียนที่ {semester} ปีการศึกษา {academicYear}
            </div>
          </div>

          <table className="act-table">
            <thead>
              <tr>
                <th rowSpan={2} style={{ width: '28px' }}>ที่</th>
                <th rowSpan={2} style={{ minWidth: '160px' }}>ชื่อ - นามสกุล</th>
                <th colSpan={def.hours}>ชั่วโมงที่</th>
                <th rowSpan={2} style={{ width: '48px' }}>เข้าร่วม</th>
                <th rowSpan={2} style={{ width: '40px' }}>สรุป</th>
              </tr>
              <tr>
                {Array.from({ length: def.hours }).map((_, i) => (
                  <th key={i} style={{ width: '18px', fontSize: '10pt' }}>{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => {
                const sid = s.studentId || s.id;
                const row = getRow(def.key, sid, def.hours);
                const { attended, total, pass } = compute(row);
                return (
                  <tr key={s.id}>
                    <td className="num">{idx + 1}</td>
                    <td>{s.titleTh}{s.firstNameTh} {s.lastNameTh}</td>
                    {row.map((v, i) => (
                      <td key={i} className="num" style={{ fontSize: '10pt' }}>{v === 1 ? 'ผ' : 'มผ'}</td>
                    ))}
                    <td className="num">{attended}/{total}</td>
                    <td className="num">{pass ? 'ผ.' : 'มผ.'}</td>
                  </tr>
                );
              })}
              {Array.from({ length: emptyCount }).map((_, i) => (
                <tr key={`e-${i}`}>
                  <td className="num" style={{ color: '#bbb' }}>{students.length + i + 1}</td>
                  <td>&nbsp;</td>
                  {Array.from({ length: def.hours }).map((_, j) => <td key={j}>&nbsp;</td>)}
                  <td>&nbsp;</td><td>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '6px', fontSize: '12pt' }}>
            <strong>เกณฑ์:</strong> เข้าร่วมกิจกรรม ≥ 80% ของ {def.hours} ชั่วโมง = ผ่าน (ผ.) / น้อยกว่า = ไม่ผ่าน (มผ.)
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', fontSize: '14pt', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <div style={{ textAlign: 'center', minWidth: '260px', lineHeight: 1.6 }}>
              <div>ลงชื่อ ..................................................... ครูผู้ประเมิน</div>
              <div>( {teacherNames[def.key] || '.....................................................'} )</div>
            </div>
          </div>
        </div>
      ))}

      {summaryOnly && (
        <div style={{ padding: '4mm' }}>
          <div style={{ textAlign: 'center', marginBottom: '6px' }}>
            <div style={{ fontSize: '18pt', fontWeight: 'bold' }}>สรุปกิจกรรมพัฒนาผู้เรียน</div>
            <div style={{ fontSize: '15pt' }}>
              โรงเรียนบ้านดอนมูล ชั้นประถมศึกษาปีที่ {grade.replace('ป.', '')} ภาคเรียนที่ {semester} ปีการศึกษา {academicYear}
            </div>
          </div>
          <table className="act-table">
            <thead>
              <tr>
                <th style={{ width: '32px' }}>ที่</th>
                <th style={{ minWidth: '200px' }}>ชื่อ - นามสกุล</th>
                {ACTIVITIES.map(a => (<th key={a.key}>{a.short}</th>))}
                <th>สรุปกิจกรรมพัฒนาผู้เรียน</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => {
                const sid = s.studentId || s.id;
                const results = ACTIVITIES.map(def => compute(getRow(def.key, sid, def.hours)));
                const allPass = results.every(r => r.pass);
                return (
                  <tr key={s.id}>
                    <td className="num">{idx + 1}</td>
                    <td>{s.titleTh}{s.firstNameTh} {s.lastNameTh}</td>
                    {results.map((r, i) => (<td key={i} className="num">{r.pass ? 'ผ.' : 'มผ.'}</td>))}
                    <td className="num" style={{ fontWeight: 'bold' }}>{allPass ? 'ผ.' : 'มผ.'}</td>
                  </tr>
                );
              })}
              {Array.from({ length: emptyCount }).map((_, i) => (
                <tr key={`e-${i}`}>
                  <td className="num" style={{ color: '#bbb' }}>{students.length + i + 1}</td>
                  <td>&nbsp;</td>
                  {ACTIVITIES.map(a => (<td key={a.key}>&nbsp;</td>))}
                  <td>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', fontSize: '14pt', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <div style={{ textAlign: 'center', minWidth: '260px', lineHeight: 1.6 }}>
              <div>ลงชื่อ ..................................................... ครูผู้ประเมิน</div>
              <div>( ..................................................... )</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentActivityAssessment;