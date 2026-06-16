import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, UserCircle2, LogOut } from 'lucide-react';
import { getStudents } from '@/utils/storage';
import { logout } from '@/utils/userStorage';
import type { Student } from '@/types/student';

const APPSCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwQYp7L4Bfc66uofuMB0m3i1N4a7L7dtFykTF3Jpk2i-vdsN65XFpe2JPIxT6nFCz-X0A/exec';
const GRADE_OPTIONS = ['อ.1','อ.2','อ.3','ป.1','ป.2','ป.3','ป.4','ป.5','ป.6'];

interface ExtraInfo {
  nickname?: string;
  phone?: string;
  phone2?: string;
  photoUrl?: string;
}

const storageKey = (studentId: string, academicYear: string) =>
  `individual-info:${studentId}:${academicYear}`;

const loadLocal = (studentId: string, academicYear: string): ExtraInfo => {
  try {
    const raw = localStorage.getItem(storageKey(studentId, academicYear));
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
};

const driveViewToImage = (url?: string): string => {
  if (!url) return '';
  const m = url.match(/\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
  const id = m?.[1];
  if (!id) return url;
  return `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
};

const normalizePhone = (p: any): string => {
  if (p === undefined || p === null) return '';
  let s = String(p).trim();
  s = s.replace(/\.0+$/, '');
  const digits = s.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 9 && !digits.startsWith('0')) return '0' + digits;
  return digits;
};

interface Props {
  username: string;
  onLogout: () => void;
}

const StudentCardViewer: React.FC<Props> = ({ username, onLogout }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [year, setYear] = useState<string>('');
  const [grade, setGrade] = useState<string>('ป.1');
  const [index, setIndex] = useState(0);
  const [extras, setExtras] = useState<Record<string, ExtraInfo>>({});
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getStudents();
      if (!data.length) { setStudents([]); return; }
      // dedupe by studentId, keep latest semester per academicYear
      const sorted = [...data].sort((a, b) => (b.academicYear + b.semester).localeCompare(a.academicYear + a.semester));
      const seen = new Set<string>();
      const unique = sorted.filter(s => {
        const k = `${s.academicYear}:${s.studentId || s.id}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      setStudents(unique);
      const latestYear = unique[0]?.academicYear || '';
      setYear(latestYear);
    })();
  }, []);

  const years = useMemo(() => {
    const set = new Set(students.map(s => s.academicYear));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [students]);

  const filtered = useMemo(() => {
    return students
      .filter(s => s.academicYear === year && s.grade === grade)
      .sort((a, b) => (a.studentId || '').localeCompare(b.studentId || '', 'th', { numeric: true }));
  }, [students, year, grade]);

  useEffect(() => { setIndex(0); }, [year, grade]);

  const current = filtered[index];

  // load local + remote extra info for current student
  useEffect(() => {
    if (!current) return;
    const key = `${current.studentId}:${current.academicYear}`;
    setExtras(prev => prev[key] ? prev : { ...prev, [key]: loadLocal(current.studentId, current.academicYear) });
    const controller = new AbortController();
    (async () => {
      try {
        const url = `${APPSCRIPT_URL}?studentId=${encodeURIComponent(current.studentId)}&academicYear=${encodeURIComponent(current.academicYear)}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return;
        const json = await res.json();
        if (json?.status === 'ok') {
          setExtras(prev => ({
            ...prev,
            [key]: {
              ...prev[key],
              nickname: json.nickname || prev[key]?.nickname,
              phone: normalizePhone(json.phone) || prev[key]?.phone,
              phone2: normalizePhone(json.phone2) || prev[key]?.phone2,
              photoUrl: json.photoUrl || prev[key]?.photoUrl,
            },
          }));
        }
      } catch {}
    })();
    return () => controller.abort();
  }, [current?.id]);

  const goPrev = () => setIndex(i => Math.max(0, i - 1));
  const goNext = () => setIndex(i => Math.min(filtered.length - 1, i + 1));

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) { dx < 0 ? goNext() : goPrev(); }
    touchStartX.current = null;
  };

  const ex = current ? extras[`${current.studentId}:${current.academicYear}`] || {} : {};
  const photo = ex.photoUrl ? driveViewToImage(ex.photoUrl) : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 font-sarabun">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-sm">
            <div className="font-semibold text-blue-700 leading-tight">บัตรประจำตัวนักเรียน</div>
            <div className="text-xs text-muted-foreground">โรงเรียนบ้านดอนมูล • {username}</div>
          </div>
          <Button size="sm" variant="ghost" onClick={onLogout} className="text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-1" /> ออก
          </Button>
        </div>
        <div className="max-w-md mx-auto px-4 pb-3 grid grid-cols-2 gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="bg-white"><SelectValue placeholder="ปีการศึกษา" /></SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={y}>ปีการศึกษา {y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {GRADE_OPTIONS.map(g => <SelectItem key={g} value={g}>ชั้น {g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {!current ? (
          <Card><CardContent className="py-20 text-center text-muted-foreground">ไม่มีข้อมูลนักเรียนในชั้น/ปีนี้</CardContent></Card>
        ) : (
          <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {/* Card mimicking the reference image */}
            <div className="relative rounded-3xl p-4 bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-100 shadow-2xl border-2 border-amber-200">
              {/* Photo frame */}
              <div className="mx-auto w-44 h-56 rounded-xl overflow-hidden border-4 border-sky-400 bg-white shadow-lg flex items-center justify-center">
                {photo ? (
                  <img src={photo} alt="student" referrerPolicy="no-referrer" className="w-full h-full object-cover"
                    onError={(ev) => { (ev.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <UserCircle2 className="w-24 h-24 text-sky-300" />
                )}
              </div>

              {/* Info panel */}
              <div className="mt-4 rounded-2xl bg-gradient-to-b from-sky-100 to-sky-50 border-2 border-sky-300 p-4 space-y-2 text-slate-800">
                <div className="text-center">
                  <div className="font-bold text-base">เลขบัตรประจำตัวประชาชน</div>
                  <div className="text-lg tracking-wider">{current.citizenId || '-'}</div>
                </div>
                <Row label="รหัสนักเรียน" value={current.studentId} />
                <Row label="ชื่อ-สกุล" value={`${current.titleTh || ''}${current.firstNameTh} ${current.lastNameTh}`.trim()} />
                <Row label="ชื่อเล่น" value={ex.nickname || '-'} />
                <Row label="เบอร์โทร1" value={ex.phone || current.guardianPhone || '-'} />
                <Row label="เบอร์โทร2" value={ex.phone2 || '-'} />
              </div>
            </div>

            {/* Nav */}
            <div className="mt-5 flex items-center justify-between">
              <Button variant="outline" size="lg" onClick={goPrev} disabled={index === 0} className="rounded-full">
                <ChevronLeft className="w-5 h-5 mr-1" /> ก่อนหน้า
              </Button>
              <div className="text-sm font-medium text-blue-700">
                {index + 1} / {filtered.length}
              </div>
              <Button variant="outline" size="lg" onClick={goNext} disabled={index >= filtered.length - 1} className="rounded-full">
                ถัดไป <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">ปัดซ้าย/ขวาเพื่อเลื่อนดูทีละคน</p>
          </div>
        )}
      </main>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-baseline gap-2">
    <span className="font-bold whitespace-nowrap">{label} :</span>
    <span className="break-all">{value}</span>
  </div>
);

export default StudentCardViewer;