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

const APPSCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw7Ujpowe1C57qpV_M7ADlcDSm39RKatMp-FwtbJVE9HLe11G87Y5sJXHlD182O0Jr5/exec';

const GRADE_OPTIONS = ['อ.1','อ.2','อ.3','ป.1','ป.2','ป.3','ป.4','ป.5','ป.6'];

interface ExtraInfo {
  nickname: string;
  phone: string;
  photoDataUrl?: string;
  photoFile?: File;
}

const storageKey = (studentId: string) => `individual-info:${studentId}`;

const loadLocal = (studentId: string): ExtraInfo => {
  try {
    const raw = localStorage.getItem(storageKey(studentId));
    if (raw) return JSON.parse(raw);
  } catch {}
  return { nickname: '', phone: '' };
};

const saveLocal = (studentId: string, info: ExtraInfo) => {
  const { photoFile, ...rest } = info;
  localStorage.setItem(storageKey(studentId), JSON.stringify(rest));
};

const fileToDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

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
      setStudents(data);
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
    if (current) {
      setExtra(loadLocal(current.id));
    } else {
      setExtra({ nickname: '', phone: '' });
    }
  }, [current?.id]);

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setExtra(prev => ({ ...prev, photoFile: file, photoDataUrl: dataUrl }));
  };

  const handleSubmit = async () => {
    if (!current) return;
    if (!extra.nickname && !extra.phone && !extra.photoDataUrl) {
      await Swal.fire({ icon: 'warning', title: 'ไม่มีข้อมูลให้บันทึก', confirmButtonText: 'ตกลง' });
      return;
    }
    setSubmitting(true);
    try {
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
        photoBase64: extra.photoDataUrl ? extra.photoDataUrl.split(',')[1] : '',
        photoMimeType: extra.photoFile?.type || '',
        photoFileName: extra.photoFile ? `${current.studentId}_${current.firstNameTh}.${(extra.photoFile.name.split('.').pop() || 'jpg')}` : '',
      };

      // Apps Script Web App — use no-cors text/plain to avoid preflight; response is opaque.
      await fetch(APPSCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });

      saveLocal(current.id, extra);
      await Swal.fire({ icon: 'success', title: 'ส่งข้อมูลสำเร็จ', timer: 1400, showConfirmButton: false });
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