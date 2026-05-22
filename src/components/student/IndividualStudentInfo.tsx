import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Camera, Save, Loader2, UserCircle2 } from 'lucide-react';
import { getStudents } from '@/utils/storage';
import type { Student } from '@/types/student';
import Swal from 'sweetalert2';

const APPSCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwQYp7L4Bfc66uofuMB0m3i1N4a7L7dtFykTF3Jpk2i-vdsN65XFpe2JPIxT6nFCz-X0A/exec';

const GRADE_OPTIONS = ['อ.1','อ.2','อ.3','ป.1','ป.2','ป.3','ป.4','ป.5','ป.6'];

interface ExtraInfo {
  nickname: string;
  phone: string;
  phone2?: string;
  photoDataUrl?: string;
  photoFile?: File;
  photoMimeType?: string;
  photoFileName?: string;
  photoUrl?: string;
}

// ใช้ 1 รูป/1 ปีการศึกษา ไม่แยกเทอม จึง key ด้วย studentId + academicYear เท่านั้น
const storageKey = (studentId: string, academicYear: string) =>
  `individual-info:${studentId}:${academicYear}`;

// แปลง URL ของ Google Drive ให้แสดงเป็นรูปได้ใน <img>
const driveViewToImage = (url?: string): string => {
  if (!url) return '';
  const m = url.match(/\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
  const id = m?.[1];
  if (!id) return url;
  return `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
};

const loadLocal = (studentId: string, academicYear: string): ExtraInfo => {
  try {
    const raw = localStorage.getItem(storageKey(studentId, academicYear));
    if (raw) return JSON.parse(raw);
  } catch {}
  return { nickname: '', phone: '' };
};

const saveLocal = (studentId: string, academicYear: string, info: ExtraInfo) => {
  const { photoFile, ...rest } = info;
  localStorage.setItem(storageKey(studentId, academicYear), JSON.stringify(rest));
};

const fileToDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const compressImageDataUrl = (dataUrl: string): Promise<string> => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => {
    const maxSize = 1200;
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) {
      reject(new Error('ไม่สามารถเตรียมรูปสำหรับอัปโหลดได้'));
      return;
    }
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    resolve(canvas.toDataURL('image/jpeg', 0.82));
  };
  image.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'));
  image.src = dataUrl;
});

const getPhotoPayload = (dataUrl?: string, file?: File, savedMimeType?: string, savedFileName?: string) => {
  if (!dataUrl) return { base64: '', mimeType: '', extension: 'jpg' };
  const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
  const mimeType = savedMimeType || file?.type || match?.[1] || 'image/jpeg';
  const base64 = (match?.[2] || dataUrl).replace(/\s/g, '');
  const extension = savedFileName?.split('.').pop() || file?.name.split('.').pop() || mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
  return { base64, mimeType, extension, fileName: savedFileName };
};

const IndividualStudentInfo: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [grade, setGrade] = useState<string>('ป.1');
  const [index, setIndex] = useState(0);
  const [extra, setExtra] = useState<ExtraInfo>({ nickname: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const data = await getStudents();
      // Keep only the latest academic year + latest semester
      if (data.length === 0) { setStudents([]); return; }
      const latestYear = data.reduce((m, s) => (s.academicYear > m ? s.academicYear : m), data[0].academicYear);
      const inYear = data.filter(s => s.academicYear === latestYear);
      const latestSem = inYear.reduce((m, s) => (s.semester > m ? s.semester : m), inYear[0].semester);
      const latest = inYear.filter(s => s.semester === latestSem);
      // Dedupe by studentId
      const seen = new Set<string>();
      const unique = latest.filter(s => {
        const k = s.studentId || s.id;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      setStudents(unique);
    })();
  }, []);

  const filtered = useMemo(() =>
    students.filter(s => s.grade === grade),
    [students, grade]
  );

  const current = filtered[index];

  useEffect(() => {
    setIndex(0);
  }, [grade]);

  useEffect(() => {
    if (!current) {
      setExtra({ nickname: '', phone: '' });
      return;
    }
    const saved = loadLocal(current.studentId, current.academicYear);
    setExtra({
      ...saved,
      phone: saved.phone || current.guardianPhone || '',
    });
    // ดึงข้อมูลล่าสุด (รวมถึงรูป) จาก Google Sheet/Drive — 1 รูปต่อ 1 ปีการศึกษา
    const controller = new AbortController();
    (async () => {
      try {
        const url = `${APPSCRIPT_URL}?studentId=${encodeURIComponent(current.studentId)}&academicYear=${encodeURIComponent(current.academicYear)}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return;
        const json = await res.json();
        if (json?.status === 'ok' && (json.photoUrl || json.nickname || json.phone)) {
          setExtra(prev => {
            const merged: ExtraInfo = {
              ...prev,
              nickname: prev.nickname || json.nickname || '',
              phone: prev.phone || json.phone || '',
              photoUrl: json.photoUrl || prev.photoUrl,
            };
            saveLocal(current.studentId, current.academicYear, merged);
            return merged;
          });
        }
      } catch {}
    })();
    return () => controller.abort();
  }, [current?.id]);

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    const compressedDataUrl = await compressImageDataUrl(dataUrl);
    setExtra(prev => ({
      ...prev,
      photoFile: file,
      photoDataUrl: compressedDataUrl,
      photoMimeType: 'image/jpeg',
      photoFileName: `${file.name.replace(/\.[^.]+$/, '')}.jpg`,
    }));
  };

  const handleSubmit = async () => {
    if (!current) return;
    if (!extra.nickname && !extra.phone && !extra.photoDataUrl) {
      await Swal.fire({ icon: 'warning', title: 'ไม่มีข้อมูลให้บันทึก', confirmButtonText: 'ตกลง' });
      return;
    }
    setSubmitting(true);
    try {
      const photoPayload = getPhotoPayload(extra.photoDataUrl, extra.photoFile, extra.photoMimeType, extra.photoFileName);
      const payload = {
        studentId: current.studentId,
        citizenId: current.citizenId,
        fullName: `${current.titleTh || ''}${current.firstNameTh} ${current.lastNameTh}`.trim(),
        firstName: current.firstNameTh,
        lastName: current.lastNameTh,
        grade: current.grade,
        academicYear: current.academicYear,
        nickname: extra.nickname || '',
        phone: extra.phone || '',
        photoBase64: photoPayload.base64,
        photoMimeType: photoPayload.mimeType,
        photoFileName: photoPayload.base64 ? `${current.studentId}_${current.firstNameTh}.${photoPayload.extension}` : '',
      };

      let photoUrl = '';
      let photoError = '';
      try {
        const res = await fetch(APPSCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
          redirect: 'follow',
        });
        if (!res.ok) {
          throw new Error(`Apps Script ไม่พร้อมใช้งาน (HTTP ${res.status})`);
        }
        const json = await res.json();
        if (json?.status === 'ok') {
          photoUrl = json.photoUrl || '';
          photoError = json.photoError || '';
        } else {
          throw new Error(json?.message || 'Apps Script ตอบกลับว่า error');
        }
      } catch (e) {
        console.error('Apps Script submit failed', e);
        await Swal.fire({
          icon: 'error',
          title: 'ยังบันทึกลง Google Sheet/Drive ไม่ได้',
          html: `Web app URL ยังไม่เปิดสาธารณะหรือยังเด้งไปหน้า Google Sign-In<br/><br/><small>${e instanceof Error ? e.message : String(e)}</small>`,
          confirmButtonText: 'ตกลง',
        });
        return;
      }
      const next = { ...extra, photoUrl: photoUrl || extra.photoUrl, photoDataUrl: undefined, photoFile: undefined };
      setExtra(next);
      saveLocal(current.studentId, current.academicYear, next);
      await Swal.fire({
        icon: photoError ? 'warning' : 'success',
        title: photoError ? 'บันทึกข้อมูลแล้ว แต่รูปมีหมายเหตุ' : 'บันทึกสำเร็จ',
        html: photoUrl
          ? `<a href="${photoUrl}" target="_blank" class="text-blue-600 underline">ดูรูปที่อัปโหลด</a>${photoError ? `<br/><small>${photoError}</small>` : ''}`
          : `บันทึกข้อมูลลง Google Sheet แล้ว${photoError ? `<br/><small>${photoError}</small>` : ''}`,
      });
    } catch (err) {
      console.error(err);
      await Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถส่งข้อมูลได้' });
    } finally {
      setSubmitting(false);
    }
  };

  const goPrev = () => setIndex(i => Math.max(0, i - 1));
  const goNext = () => setIndex(i => Math.min(filtered.length - 1, i + 1));

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-100">
        <CardContent className="pt-6 flex flex-wrap items-center gap-4">
          <Label className="text-base font-semibold">ระดับชั้น:</Label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {GRADE_OPTIONS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            พบนักเรียน {filtered.length} คน
          </span>
          {filtered.length > 0 && (
            <span className="ml-auto text-sm font-medium text-blue-700">
              คนที่ {index + 1} / {filtered.length}
            </span>
          )}
        </CardContent>
      </Card>

      {!current ? (
        <Card>
          <CardContent className="py-20 text-center text-muted-foreground">
            ไม่มีข้อมูลนักเรียนในระดับชั้นนี้
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex items-center justify-between text-white">
            <Button
              variant="ghost"
              size="lg"
              onClick={goPrev}
              disabled={index === 0}
              className="text-white hover:bg-white/20 disabled:opacity-30"
            >
              <ChevronLeft className="w-6 h-6" /> ก่อนหน้า
            </Button>
            <div className="text-center">
              <div className="text-sm opacity-90">เลขที่ {current.studentId}</div>
              <div className="text-lg font-semibold">{current.grade} • ปี {current.academicYear}</div>
            </div>
            <Button
              variant="ghost"
              size="lg"
              onClick={goNext}
              disabled={index >= filtered.length - 1}
              className="text-white hover:bg-white/20 disabled:opacity-30"
            >
              ถัดไป <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          <CardContent className="p-8">
            <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start">
              <div className="flex flex-col items-center gap-3">
                <div className="w-64 h-64 rounded-2xl border-4 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center overflow-hidden shadow-lg">
                  {extra.photoDataUrl ? (
                    <img src={extra.photoDataUrl} alt="student" className="w-full h-full object-cover" />
                  ) : extra.photoUrl ? (
                    <img
                      src={driveViewToImage(extra.photoUrl)}
                      alt="student"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(ev) => {
                        (ev.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <UserCircle2 className="w-32 h-32 text-blue-300" />
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={e => handlePhoto(e.target.files?.[0])}
                />
                <Button variant="outline" onClick={() => fileRef.current?.click()}>
                  <Camera className="w-4 h-4 mr-2" /> เลือก/ถ่ายรูป
                </Button>
              </div>

              <div className="space-y-5">
                <div>
                  <Label className="text-sm text-muted-foreground">ชื่อ-นามสกุล</Label>
                  <div className="text-2xl font-bold text-slate-800 mt-1">
                    {current.titleTh}{current.firstNameTh} {current.lastNameTh}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nickname">ชื่อเล่น</Label>
                    <Input
                      id="nickname"
                      value={extra.nickname}
                      onChange={e => setExtra(p => ({ ...p, nickname: e.target.value }))}
                      placeholder="ชื่อเล่น"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">เบอร์โทร</Label>
                    <Input
                      id="phone"
                      value={extra.phone}
                      onChange={e => setExtra(p => ({ ...p, phone: e.target.value }))}
                      placeholder="0xx-xxx-xxxx"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    บันทึก / ส่งข้อมูล
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IndividualStudentInfo;