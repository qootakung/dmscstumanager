import React, { useEffect, useState } from 'react';
import { Cloud, CloudOff, CheckCircle2, Loader2, AlertTriangle, Eye } from 'lucide-react';
import {
  getConflicts, getSyncState, installPP5Sync, pullAll, resolveKeepMine, resolveTakeRemote,
  subscribeConflicts, subscribeSync, type Conflict, type SyncState,
} from '@/utils/pp5Cloud';

/**
 * ครอบหน้า ปพ.5: ดึงข้อมูลล่าสุดจากระบบกลางก่อนแสดงหน้า แล้วซิงก์ขึ้นอัตโนมัติทุกครั้งที่บันทึก
 * (ใช้ล็อกอินเดิมของแอป — หน้านี้แสดงเฉพาะผู้ที่ล็อกอินแล้ว)
 */
const STATE_LABEL: Record<SyncState, { text: string; cls: string; Icon: React.ElementType; spin?: boolean }> = {
  idle: { text: 'พร้อมใช้งาน', cls: 'bg-gray-100 text-gray-700 border-gray-300', Icon: Cloud },
  syncing: { text: 'กำลังซิงก์…', cls: 'bg-blue-50 text-blue-700 border-blue-300', Icon: Loader2, spin: true },
  saved: { text: 'บันทึกขึ้นระบบแล้ว', cls: 'bg-emerald-50 text-emerald-700 border-emerald-300', Icon: CheckCircle2 },
  pending: { text: 'รอส่งขึ้นระบบ…', cls: 'bg-amber-50 text-amber-700 border-amber-300', Icon: Loader2, spin: true },
  offline: { text: 'ออฟไลน์ — จะส่งเมื่อออนไลน์', cls: 'bg-amber-50 text-amber-700 border-amber-300', Icon: CloudOff },
  error: { text: 'ยังซิงก์ไม่สำเร็จ', cls: 'bg-red-50 text-red-700 border-red-300', Icon: AlertTriangle },
  readonly: { text: 'อ่านอย่างเดียว', cls: 'bg-amber-50 text-amber-700 border-amber-300', Icon: Eye },
};

/** แปลง key เช่น pp5-basic-ป.1-2569-2 ให้อ่านง่ายขึ้น */
const prettyKey = (k: string) => k.replace(/^pp5-/, '').replace(/-/g, ' / ');

const PP5CloudGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [sync, setSync] = useState<SyncState>(getSyncState());
  const [conflicts, setConflicts] = useState<Conflict[]>(getConflicts());
  const [note, setNote] = useState('');
  const [offlineStart, setOfflineStart] = useState(false);

  useEffect(() => {
    installPP5Sync();
    const u1 = subscribeSync(setSync);
    const u2 = subscribeConflicts(setConflicts);
    let cancelled = false;
    (async () => {
      try {
        const r = await pullAll();
        if (!cancelled && (r.downloaded || r.uploaded)) {
          setNote(`ซิงก์แล้ว: ดึงข้อมูลลง ${r.downloaded} รายการ / อัปโหลดข้อมูลเดิมในเครื่อง ${r.uploaded} รายการ`);
        }
      } catch {
        if (!cancelled) setOfflineStart(true);   // เชื่อมต่อไม่ได้ → ใช้ข้อมูลในเครื่องไปก่อน
      }
      if (!cancelled) setReady(true);
    })();
    const onFocus = () => { void pullAll().catch(() => {}); };
    window.addEventListener('focus', onFocus);
    return () => { cancelled = true; u1(); u2(); window.removeEventListener('focus', onFocus); };
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" /> กำลังโหลดข้อมูลล่าสุดจากระบบกลาง…
      </div>
    );
  }

  const { text, cls, Icon, spin } = STATE_LABEL[sync];
  return (
    <>
      {offlineStart && (
        <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          เชื่อมต่อระบบกลางไม่ได้ ตอนนี้ใช้ข้อมูลที่ค้างในเครื่องไปก่อน ข้อมูลที่บันทึกจะถูกส่งขึ้นระบบเองเมื่อเชื่อมต่อได้
          (ถ้าเปิดมาจากเครื่องใหม่ อาจยังไม่เห็นข้อมูลล่าสุด)
        </div>
      )}
      {note && (
        <div className="mb-3 flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <span>{note}</span>
          <button className="ml-3 underline" onClick={() => setNote('')}>ปิด</button>
        </div>
      )}
      {conflicts.length > 0 && (
        <div className="mb-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" /> มีข้อมูล {conflicts.length} รายการที่ถูกแก้ไขโดยครูท่านอื่นพร้อมกัน — เลือกว่าจะใช้ข้อมูลของใคร
          </div>
          <ul className="space-y-2">
            {conflicts.map(c => (
              <li key={c.key} className="flex flex-wrap items-center gap-2 rounded bg-white/70 px-2 py-1.5">
                <span className="flex-1 min-w-[220px]">
                  <span className="font-medium">{prettyKey(c.key)}</span>
                  <span className="text-red-700/80"> · แก้ล่าสุดโดย {c.remoteBy || 'ไม่ทราบ'} เมื่อ {new Date(c.remoteAt).toLocaleString('th-TH')}</span>
                </span>
                <button onClick={() => void resolveKeepMine(c.key)}
                  className="rounded border border-red-300 bg-white px-2 py-1 text-red-700 hover:bg-red-100">ใช้ของฉัน (ทับของระบบ)</button>
                <button onClick={() => { resolveTakeRemote(c.key); setNote('โหลดข้อมูลจากระบบแล้ว สำเนาของเครื่องนี้ถูกเก็บสำรองไว้ในเครื่อง — เปิดหน้านั้นใหม่เพื่อดูข้อมูลล่าสุด'); }}
                  className="rounded border border-emerald-300 bg-white px-2 py-1 text-emerald-700 hover:bg-emerald-100">ใช้ของระบบ</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {children}
      <div className="fixed bottom-4 right-4 z-50">
        <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow ${cls}`}>
          <Icon className={`h-3.5 w-3.5 ${spin ? 'animate-spin' : ''}`} />
          {text}
        </span>
      </div>
    </>
  );
};

export default PP5CloudGate;
