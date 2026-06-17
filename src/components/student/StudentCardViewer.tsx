import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  UserCircle2,
  LogOut,
  Phone,
  PhoneCall,
  IdCard,
  Hash,
  User,
  Users,
  Shield,
  MapPin,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
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

  const fullName = current
    ? `${current.titleTh || ''}${current.firstNameTh} ${current.lastNameTh}`.trim()
    : '';
  const fatherName = current
    ? `${current.fatherTitle || ''}${current.fatherFirstName || ''} ${current.fatherLastName || ''}`.trim()
    : '';
  const motherName = current
    ? `${current.motherTitle || ''}${current.motherFirstName || ''} ${current.motherLastName || ''}`.trim()
    : '';
  const guardianName = current
    ? `${current.guardianTitle || ''}${current.guardianFirstName || ''} ${current.guardianLastName || ''}`.trim()
    : '';
  const address = current
    ? [
        current.houseNumber && `บ้านเลขที่ ${current.houseNumber}`,
        current.moo && `ม.${current.moo}`,
        current.subDistrict && `ต.${current.subDistrict}`,
        current.district && `อ.${current.district}`,
        current.province && `จ.${current.province}`,
        current.postalCode,
      ]
        .filter(Boolean)
        .join(' ')
    : '';

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-sky-800 font-sarabun flex flex-col">
      <header className="z-10 bg-white/10 backdrop-blur-md border-b border-white/10 text-white">
        <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-between">
          <div className="text-sm">
            <div className="font-bold leading-tight flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-300" /> บัตรนักเรียนดิจิทัล
            </div>
            <div className="text-[11px] text-white/70">โรงเรียนบ้านดอนมูล • {username}</div>
          </div>
          <Button size="sm" variant="ghost" onClick={onLogout} className="text-white hover:bg-white/10 h-8">
            <LogOut className="w-4 h-4 mr-1" /> ออก
          </Button>
        </div>
        <div className="max-w-md mx-auto px-3 pb-2 grid grid-cols-2 gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="bg-white/90 h-9 text-slate-800"><SelectValue placeholder="ปีการศึกษา" /></SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={y}>ปีการศึกษา {y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger className="bg-white/90 h-9 text-slate-800"><SelectValue /></SelectTrigger>
            <SelectContent>
              {GRADE_OPTIONS.map(g => <SelectItem key={g} value={g}>ชั้น {g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="flex-1 overflow-hidden max-w-md w-full mx-auto px-3 py-2 flex flex-col">
        {!current ? (
          <Card><CardContent className="py-20 text-center text-muted-foreground">ไม่มีข้อมูลนักเรียนในชั้น/ปีนี้</CardContent></Card>
        ) : (
          <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} className="flex-1 flex flex-col min-h-0">
            {/* Hero card */}
            <div className="relative rounded-3xl p-3 bg-gradient-to-br from-amber-200 via-amber-50 to-amber-200 shadow-2xl border border-amber-300 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-sky-400/30 blur-2xl" />
              <div className="absolute -bottom-12 -left-10 w-32 h-32 rounded-full bg-pink-400/20 blur-2xl" />

              <div className="relative flex gap-3 items-stretch">
                {/* Photo */}
                <div className="w-24 h-32 shrink-0 rounded-xl overflow-hidden border-[3px] border-sky-400 bg-white shadow-lg flex items-center justify-center">
                  {photo ? (
                    <img src={photo} alt="student" referrerPolicy="no-referrer" className="w-full h-full object-cover"
                      onError={(ev) => { (ev.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <UserCircle2 className="w-14 h-14 text-sky-300" />
                  )}
                </div>
                {/* Name + meta */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] text-slate-600 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" /> ชั้น {current.grade} • ปี {current.academicYear}
                    </div>
                    <div className="font-extrabold text-slate-800 text-base leading-snug truncate">
                      {fullName}
                    </div>
                    {ex.nickname && (
                      <div className="text-xs text-sky-700 font-semibold">ชื่อเล่น: {ex.nickname}</div>
                    )}
                  </div>
                  <div className="space-y-1 text-[12px] text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-sky-600" />
                      <span className="font-semibold">รหัส:</span>
                      <span className="tracking-wide">{current.studentId || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IdCard className="w-3.5 h-3.5 text-sky-600" />
                      <span className="tracking-wider">{current.citizenId || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail panel */}
            <div className="mt-2 flex-1 min-h-0 overflow-y-auto rounded-2xl bg-white/95 backdrop-blur border border-white/40 shadow-xl p-3 space-y-2 text-slate-800">
              <InfoRow icon={<Phone className="w-4 h-4" />} label="เบอร์โทร 1"
                value={ex.phone || current.guardianPhone || '-'} tel />
              <InfoRow icon={<PhoneCall className="w-4 h-4" />} label="เบอร์โทร 2"
                value={ex.phone2 || '-'} tel />
              <Divider />
              <InfoRow icon={<User className="w-4 h-4 text-blue-600" />} label="บิดา" value={fatherName || '-'} />
              <InfoRow icon={<User className="w-4 h-4 text-pink-600" />} label="มารดา" value={motherName || '-'} />
              <InfoRow icon={<Shield className="w-4 h-4 text-emerald-600" />} label="ผู้ปกครอง" value={guardianName || '-'} />
              <Divider />
              <InfoRow icon={<MapPin className="w-4 h-4 text-rose-600" />} label="ที่อยู่" value={address || '-'} multiline />
            </div>

            {/* Nav */}
            <div className="mt-2 flex items-center justify-between">
              <Button size="sm" onClick={goPrev} disabled={index === 0}
                className="rounded-full bg-white/90 text-slate-800 hover:bg-white shadow">
                <ChevronLeft className="w-4 h-4 mr-1" /> ก่อนหน้า
              </Button>
              <div className="text-xs font-semibold text-white bg-white/15 px-3 py-1 rounded-full backdrop-blur">
                {index + 1} / {filtered.length}
              </div>
              <Button size="sm" onClick={goNext} disabled={index >= filtered.length - 1}
                className="rounded-full bg-white/90 text-slate-800 hover:bg-white shadow">
                ถัดไป <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const Divider = () => <div className="h-px bg-slate-200" />;

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  tel?: boolean;
  multiline?: boolean;
}> = ({ icon, label, value, tel, multiline }) => (
  <div className="flex items-start gap-2 text-[13px]">
    <div className="mt-0.5 w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{label}</div>
      {tel && value && value !== '-' ? (
        <a href={`tel:${value}`} className="font-bold text-sky-700 break-all">{value}</a>
      ) : (
        <div className={`font-semibold text-slate-800 ${multiline ? 'leading-snug' : 'truncate'}`}>{value}</div>
      )}
    </div>
  </div>
);

export default StudentCardViewer;