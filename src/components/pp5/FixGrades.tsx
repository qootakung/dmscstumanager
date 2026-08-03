import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Printer, Save, Edit3, RefreshCw } from 'lucide-react';
import { getStudents } from '@/utils/studentStorage';
import type { Student } from '@/types/student';
import { computeSubjectResults, sortStudents, fullName, getBasicInfo } from '@/utils/pp5GradeCalc';
import { openPrintWindow, signatureBlock, emptyRows } from '@/utils/pp5Print';
import { toast } from 'sonner';

interface Props {
  selectedGrade: string;
  selectedSemester: string;
  selectedAcademicYear: string;
  onBack: () => void;
}

type FixStatus = '0' | 'ร' | 'มส' | 'มผ';

interface FixRecord {
  id: string;
  studentId: string;   // student.id
  studentName: string;
  subject: string;
  status: FixStatus;
  reason: string;
  fixMethod: string;
  fixDate: string;
  resultGrade: string;
}

const STATUS_OPTIONS: { value: FixStatus; label: string }[] = [
  { value: '0', label: '0 (ไม่ผ่านเกณฑ์คะแนน)' },
  { value: 'ร', label: 'ร (รอการตัดสิน)' },
  { value: 'มส', label: 'มส (เวลาเรียนไม่ครบ)' },
  { value: 'มผ', label: 'มผ (กิจกรรมไม่ผ่าน)' },
];

const FixGrades: React.FC<Props> = ({ selectedGrade, selectedSemester, selectedAcademicYear, onBack }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<FixRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState('');

  const storageKey = `pp5-fix-grades-${selectedGrade}-${selectedAcademicYear}-${selectedSemester}`;
  const info = useMemo(
    () => getBasicInfo(selectedGrade, selectedAcademicYear, selectedSemester),
    [selectedGrade, selectedAcademicYear, selectedSemester]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      const all = await getStudents();
      setStudents(sortStudents(all.filter(s => s.grade === selectedGrade && s.academicYear === selectedAcademicYear)));
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const p = JSON.parse(saved);
          setRecords(p.records || []);
          setTeacherName(p.teacherName || '');
        } catch { /* noop */ }
      } else {
        setRecords([]);
      }
      setLoading(false);
    })();
  }, [selectedGrade, selectedAcademicYear, selectedSemester, storageKey]);

  const save = (next: FixRecord[], teacher = teacherName) => {
    setRecords(next);
    localStorage.setItem(storageKey, JSON.stringify({ records: next, teacherName: teacher, savedAt: new Date().toISOString() }));
  };

  const addRow = () => {
    save([...records, {
      id: crypto.randomUUID(),
      studentId: students[0]?.id || '',
      studentName: students[0] ? fullName(students[0]) : '',
      subject: '', status: '0', reason: '', fixMethod: '', fixDate: '', resultGrade: '',
    }]);
  };

  const update = (id: string, patch: Partial<FixRecord>) => {
    save(records.map(r => (r.id === id ? { ...r, ...patch } : r)));
  };

  const remove = (id: string) => save(records.filter(r => r.id !== id));

  // Auto-detect students failing any subject (score < 50)
  const autoDetect = () => {
    const results = computeSubjectResults(students, selectedGrade, selectedAcademicYear, selectedSemester);
    const found: FixRecord[] = [];
    students.forEach(st => {
      results.forEach(sr => {
        const r = sr.results[st.id];
        if (r && r.hasData && r.score100 < 50) {
          const exists = records.some(x => x.studentId === st.id && x.subject === sr.def.name);
          if (!exists) {
            found.push({
              id: crypto.randomUUID(),
              studentId: st.id,
              studentName: fullName(st),
              subject: sr.def.name,
              status: '0',
              reason: `คะแนนรวม ${r.score100.toFixed(2)} ต่ำกว่าเกณฑ์ร้อยละ 50`,
              fixMethod: 'สอนซ่อมเสริมและสอบแก้ตัว',
              fixDate: '',
              resultGrade: '',
            });
          }
        }
      });
    });
    if (found.length === 0) { toast.info('ไม่พบนักเรียนที่ต้องแก้ผลการเรียนเพิ่มเติม'); return; }
    save([...records, ...found]);
    toast.success(`พบและเพิ่มรายการที่ต้องแก้ ${found.length} รายการ`);
  };

  const handlePrint = () => {
    const body = records.map((r, i) => `
      <tr>
        <td class="num">${i + 1}</td>
        <td>${r.studentName}</td>
        <td>${r.subject}</td>
        <td class="num">${r.status}</td>
        <td>${r.reason}</td>
        <td>${r.fixMethod}</td>
        <td class="num">${r.fixDate}</td>
        <td class="num">${r.resultGrade}</td>
      </tr>`).join('');

    const html = `
      <div class="center">
        <div class="title">แบบบันทึกการแก้ผลการเรียน "0" , "ร" , "มส" , "มผ"</div>
        <div class="subtitle">โรงเรียน${info?.schoolName || 'บ้านดอนมูล'} ชั้นประถมศึกษาปีที่ ${selectedGrade.replace('ป.', '')} ภาคเรียนที่ ${selectedSemester} ปีการศึกษา ${selectedAcademicYear}</div>
      </div>
      <table style="margin-top:8px;font-size:15pt">
        <thead><tr>
          <th style="width:34px">ที่</th>
          <th style="min-width:160px">ชื่อ - นามสกุล</th>
          <th style="min-width:120px">รายวิชา</th>
          <th style="width:50px">ผล</th>
          <th style="min-width:150px">สาเหตุ</th>
          <th style="min-width:150px">วิธีการแก้ไข</th>
          <th style="width:90px">วันที่แก้</th>
          <th style="width:70px">ผลหลังแก้</th>
        </tr></thead>
        <tbody>${body}${emptyRows(Math.max(0, 18 - records.length), 8, records.length + 1)}</tbody>
      </table>
      ${signatureBlock('ครูผู้สอน', teacherName)}
    `;
    if (!openPrintWindow(`การแก้ผลการเรียน ${selectedGrade}`, html, 'landscape')) {
      toast.error('กรุณาอนุญาต pop-ups เพื่อพิมพ์');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-rose-600 to-red-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />กลับ
            </Button>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Edit3 className="w-6 h-6" />การแก้ "0" , "ร" , "มส"
            </CardTitle>
            <div className="text-white text-sm">ภาคเรียนที่ {selectedSemester} / {selectedAcademicYear}</div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[220px]">
              <Label className="whitespace-nowrap">ครูผู้สอน:</Label>
              <Input value={teacherName} onChange={e => { setTeacherName(e.target.value); save(records, e.target.value); }} placeholder="ชื่อครูผู้สอน" />
            </div>
            <Button variant="outline" onClick={autoDetect}><RefreshCw className="w-4 h-4 mr-1" />ตรวจหาอัตโนมัติ</Button>
            <Button variant="outline" onClick={addRow} disabled={students.length === 0}>+ เพิ่มรายการ</Button>
            <Button variant="outline" onClick={() => { save(records); toast.success('บันทึกข้อมูลเรียบร้อย'); }}>
              <Save className="w-4 h-4 mr-1" />บันทึก
            </Button>
            <Button onClick={handlePrint} className="bg-red-700 hover:bg-red-800">
              <Printer className="w-4 h-4 mr-1" />พิมพ์
            </Button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>
          ) : records.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              ยังไม่มีรายการแก้ผลการเรียน — กด “ตรวจหาอัตโนมัติ” เพื่อดึงนักเรียนที่คะแนนต่ำกว่าเกณฑ์
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-rose-100">
                    <th className="border border-gray-400 p-1 w-10">ที่</th>
                    <th className="border border-gray-400 p-1 min-w-[170px]">ชื่อ - นามสกุล</th>
                    <th className="border border-gray-400 p-1 min-w-[130px]">รายวิชา</th>
                    <th className="border border-gray-400 p-1 w-24">ผล</th>
                    <th className="border border-gray-400 p-1 min-w-[140px]">สาเหตุ</th>
                    <th className="border border-gray-400 p-1 min-w-[140px]">วิธีการแก้ไข</th>
                    <th className="border border-gray-400 p-1 w-32">วันที่แก้</th>
                    <th className="border border-gray-400 p-1 w-20">ผลหลังแก้</th>
                    <th className="border border-gray-400 p-1 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={r.id}>
                      <td className="border border-gray-300 p-1 text-center">{i + 1}</td>
                      <td className="border border-gray-300 p-0">
                        <Select
                          value={r.studentId}
                          onValueChange={v => {
                            const st = students.find(s => s.id === v);
                            update(r.id, { studentId: v, studentName: st ? fullName(st) : '' });
                          }}
                        >
                          <SelectTrigger className="h-8 border-0 rounded-none"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {students.map(s => <SelectItem key={s.id} value={s.id}>{fullName(s)}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-gray-300 p-0">
                        <Input value={r.subject} onChange={e => update(r.id, { subject: e.target.value })}
                          className="h-8 border-0 rounded-none" />
                      </td>
                      <td className="border border-gray-300 p-0">
                        <Select value={r.status} onValueChange={v => update(r.id, { status: v as FixStatus })}>
                          <SelectTrigger className="h-8 border-0 rounded-none"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-gray-300 p-0">
                        <Input value={r.reason} onChange={e => update(r.id, { reason: e.target.value })}
                          className="h-8 border-0 rounded-none" />
                      </td>
                      <td className="border border-gray-300 p-0">
                        <Input value={r.fixMethod} onChange={e => update(r.id, { fixMethod: e.target.value })}
                          className="h-8 border-0 rounded-none" />
                      </td>
                      <td className="border border-gray-300 p-0">
                        <Input type="date" value={r.fixDate} onChange={e => update(r.id, { fixDate: e.target.value })}
                          className="h-8 border-0 rounded-none" />
                      </td>
                      <td className="border border-gray-300 p-0">
                        <Input value={r.resultGrade} onChange={e => update(r.id, { resultGrade: e.target.value })}
                          className="h-8 border-0 rounded-none text-center" />
                      </td>
                      <td className="border border-gray-300 p-1 text-center">
                        <Button size="sm" variant="ghost" className="text-red-600 h-7 px-2" onClick={() => remove(r.id)}>ลบ</Button>
                      </td>
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

export default FixGrades;