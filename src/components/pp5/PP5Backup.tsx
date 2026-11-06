import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { buildBackup, backupFileName, parseBackup, restoreBackup } from '@/utils/pp5Backup';

/**
 * สำรอง / กู้คืนข้อมูล ปพ.5 ทั้งหมด (คะแนน สัดส่วน ข้อมูลพื้นฐาน กิจกรรม ฯลฯ)
 * ข้อมูลเหล่านี้เก็บในเบราว์เซอร์ของเครื่องที่กรอก ควรสำรองเป็นประจำ โดยเฉพาะก่อนล้างแคชหรือเปลี่ยนเครื่อง
 */
const PP5Backup: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleExport = () => {
    try {
      const backup = buildBackup(localStorage);
      if (backup.count === 0) {
        toast.info('ยังไม่มีข้อมูล ปพ.5 ในเครื่องนี้ให้สำรอง');
        return;
      }
      const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backupFileName();
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success(`สำรองข้อมูลแล้ว ${backup.count} รายการ`);
    } catch (e) {
      console.error('Backup failed:', e);
      toast.error('สำรองข้อมูลไม่สำเร็จ');
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // เลือกไฟล์เดิมซ้ำได้
    if (!file) return;
    setBusy(true);
    try {
      const result = parseBackup(await file.text());
      if (result.ok === false) {
        toast.error(result.error);
        return;
      }
      const { backup } = result;
      const when = backup.exportedAt ? new Date(backup.exportedAt).toLocaleString('th-TH') : 'ไม่ทราบเวลา';
      const ok = window.confirm(
        `นำเข้าข้อมูลสำรองเมื่อ ${when} จำนวน ${backup.count} รายการ?\n\n` +
        'รายการที่มีอยู่แล้วในเครื่องนี้จะถูกเขียนทับด้วยข้อมูลจากไฟล์ (รายการอื่นไม่ถูกลบ)'
      );
      if (!ok) return;
      const n = restoreBackup(localStorage, backup);
      toast.success(`นำเข้าข้อมูลแล้ว ${n} รายการ กรุณาเปิดหน้าที่ต้องการใหม่เพื่อดูข้อมูลล่าสุด`);
    } catch (err) {
      console.error('Restore failed:', err);
      toast.error('นำเข้าข้อมูลไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-emerald-200 bg-emerald-50/60">
      <CardContent className="py-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-start gap-2 flex-1 min-w-[260px]">
            <ShieldCheck className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
            <div className="text-sm text-emerald-900">
              <div className="font-semibold">สำรองข้อมูล ปพ.5</div>
              <div className="text-emerald-800/80">
                คะแนนและข้อมูล ปพ.5 เก็บอยู่ในเบราว์เซอร์เครื่องนี้ ถ้าล้างแคชหรือเปลี่ยนเครื่องข้อมูลจะหาย ควรสำรองเป็นไฟล์ไว้เป็นประจำ
              </div>
            </div>
          </div>
          <Button onClick={handleExport} variant="outline" className="border-emerald-400 text-emerald-800 bg-white">
            <Download className="w-4 h-4 mr-1" />สำรองข้อมูล
          </Button>
          <Button onClick={() => fileRef.current?.click()} variant="outline" disabled={busy} className="border-emerald-400 text-emerald-800 bg-white">
            <Upload className="w-4 h-4 mr-1" />นำเข้าข้อมูลสำรอง
          </Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />
        </div>
      </CardContent>
    </Card>
  );
};

export default PP5Backup;
