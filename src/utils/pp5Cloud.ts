/**
 * ซิงก์ข้อมูล ปพ.5 (ทุก key ที่ขึ้นต้นด้วย "pp5-") ระหว่าง localStorage ↔ ตาราง public.pp5_data ใน Supabase
 *
 * หลักการ: ทุกหน้าของ ปพ.5 ยังอ่าน/เขียน localStorage แบบเดิม (ไม่ต้องแก้ทีละหน้า)
 * ไฟล์นี้ดักการเขียน/ลบ key "pp5-*" แล้วส่งขึ้นฐานข้อมูลกลางให้เอง และดึงข้อมูลล่าสุดลงมาตอนเปิดหน้า ปพ.5
 * ใช้ระบบล็อกอินเดิมของแอป (getCurrentUser) — ผู้ใช้ที่ไม่มีสิทธิ์แก้ไข (canEdit=false) จะไม่ส่งข้อมูลขึ้น
 *
 * กันครูหลายคนบันทึกทับกัน: ส่งขึ้นแบบมีเงื่อนไข (แก้ได้เมื่อข้อมูลในระบบยังเป็นเวอร์ชันที่เครื่องนี้เคยเห็น)
 * ถ้ามีคนแก้ไปก่อน จะไม่เขียนทับเงียบๆ แต่ขึ้นรายการ "ข้อมูลที่ขัดแย้ง" ให้เลือกว่าจะใช้ของใคร
 */
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/utils/userStorage';

// ตาราง pp5_data ยังไม่อยู่ใน types ที่ generate ไว้ จึงใช้ client แบบไม่ระบุชนิด
const table = () => (supabase as any).from('pp5_data');

const PREFIX = 'pp5-';
const SYNCED_KEY = 'dm-pp5-synced';       // { key: updated_at ล่าสุดที่ตรงกับฐานข้อมูล }
const PENDING_KEY = 'dm-pp5-pending';     // key ที่ยังส่งขึ้นไม่สำเร็จ
const CONFLICT_PREFIX = 'dm-pp5-conflict-'; // สำเนาข้อมูลในเครื่องที่ถูกแทนที่ (เผื่อกู้คืน)

export type SyncState = 'idle' | 'syncing' | 'saved' | 'pending' | 'offline' | 'error' | 'readonly';
export interface Conflict { key: string; remoteValue: string; remoteAt: string; remoteBy: string }

// เก็บฟังก์ชันจริงของ Storage ไว้ก่อนถูกดัก เพื่อเขียนลงเครื่องโดยไม่วนซ้ำ
const store: Storage | null = typeof window !== 'undefined' ? window.localStorage : null;
const protoGet = typeof Storage !== 'undefined' ? Storage.prototype.getItem : null;
const protoSet = typeof Storage !== 'undefined' ? Storage.prototype.setItem : null;
const protoRemove = typeof Storage !== 'undefined' ? Storage.prototype.removeItem : null;
const rawGet = (k: string): string | null => (protoGet && store ? protoGet.call(store, k) : null);
const rawSet = (k: string, v: string) => { try { if (protoSet && store) protoSet.call(store, k, v); } catch { /* เต็ม */ } };
const rawRemove = (k: string) => { if (protoRemove && store) protoRemove.call(store, k); };

const readJSON = <T,>(k: string, fb: T): T => {
  try { const v = rawGet(k); return v ? (JSON.parse(v) as T) : fb; } catch { return fb; }
};
const writeJSON = (k: string, v: unknown) => rawSet(k, JSON.stringify(v));

const canWrite = () => {
  const u = getCurrentUser();
  return !!u && (u.role === 'admin' || !!u.canEdit);
};
const loggedIn = () => !!getCurrentUser();

// ---------- สถานะ (ให้ UI แสดงตัวบอก) ----------
let state: SyncState = 'idle';
const stateListeners = new Set<(s: SyncState) => void>();
const setState = (s: SyncState) => { state = s; stateListeners.forEach(l => l(s)); };
export const getSyncState = () => state;
export const subscribeSync = (fn: (s: SyncState) => void) => { stateListeners.add(fn); return () => { stateListeners.delete(fn); }; };

const conflicts = new Map<string, Conflict>();
const conflictListeners = new Set<(c: Conflict[]) => void>();
const emitConflicts = () => { const arr = [...conflicts.values()]; conflictListeners.forEach(l => l(arr)); };
export const getConflicts = () => [...conflicts.values()];
export const subscribeConflicts = (fn: (c: Conflict[]) => void) => { conflictListeners.add(fn); return () => { conflictListeners.delete(fn); }; };

// ---------- ตัวช่วยเก็บสถานะการซิงก์ ----------
const pendingSet = (): Set<string> => new Set(readJSON<string[]>(PENDING_KEY, []));
const savePending = (s: Set<string>) => writeJSON(PENDING_KEY, [...s]);
const getSynced = () => readJSON<Record<string, string>>(SYNCED_KEY, {});
const setSynced = (key: string, at: string | null) => {
  const m = getSynced();
  if (at) m[key] = at; else delete m[key];
  writeJSON(SYNCED_KEY, m);
};
const addConflict = (c: Conflict) => {
  conflicts.set(c.key, c);
  const p = pendingSet(); p.delete(c.key); savePending(p);  // หยุดลองส่งจนกว่าผู้ใช้จะเลือก
  emitConflicts();
};

// ---------- ส่งขึ้นฐานข้อมูล ----------
let timer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;

function markDirty(key: string) {
  if (!loggedIn() || !canWrite()) return;
  const p = pendingSet(); p.add(key); savePending(p);
  setState('pending');
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { void flush(); }, 700);
}

type PushOutcome = 'ok' | 'conflict' | 'fail';

async function fetchRemote(key: string) {
  const { data, error } = await table().select('key,value,updated_at,updated_by').eq('key', key).maybeSingle();
  if (error) throw error;
  return data as { value: string; updated_at: string; updated_by: string | null } | null;
}

async function pushKey(key: string): Promise<PushOutcome> {
  const local = rawGet(key);
  const by = getCurrentUser()?.username ?? '';
  const syncedAt = getSynced()[key];

  if (local === null) {                                    // ถูกลบในเครื่อง
    const q = table().delete().eq('key', key);
    const { error } = syncedAt ? await q.eq('updated_at', syncedAt) : await q;
    if (error) return 'fail';
    setSynced(key, null);
    return 'ok';
  }

  if (syncedAt) {                                          // เคยซิงก์แล้ว → แก้ได้ถ้าเวอร์ชันบนระบบยังเป็นเวอร์ชันที่เห็น
    const { data, error } = await table()
      .update({ value: local, updated_by: by })
      .eq('key', key).eq('updated_at', syncedAt)
      .select('updated_at');
    if (error) return 'fail';
    if (data && data.length > 0) { setSynced(key, data[0].updated_at); return 'ok'; }
  } else {                                                 // ยังไม่เคยมี → เพิ่มใหม่
    const { data, error } = await table().insert({ key, value: local, updated_by: by }).select('updated_at');
    if (!error && data && data.length > 0) { setSynced(key, data[0].updated_at); return 'ok'; }
    if (error && error.code !== '23505') return 'fail';    // 23505 = มีคนสร้าง key นี้ไปก่อน
  }

  // มาถึงตรงนี้ = ข้อมูลบนระบบเปลี่ยนไปจากที่เครื่องนี้เคยเห็น
  const remote = await fetchRemote(key);
  if (!remote) { setSynced(key, null); return pushKey(key); }   // ถูกลบไปแล้ว → สร้างใหม่
  if (remote.value === local) { setSynced(key, remote.updated_at); return 'ok'; }
  addConflict({ key, remoteValue: remote.value, remoteAt: remote.updated_at, remoteBy: remote.updated_by ?? '' });
  return 'conflict';
}

export async function flush(): Promise<void> {
  if (!loggedIn() || flushing) return;
  if (!canWrite()) { setState('readonly'); return; }
  const keys = [...pendingSet()];
  if (keys.length === 0) { if (state !== 'offline') setState(conflicts.size ? 'error' : 'saved'); return; }
  flushing = true;
  setState('syncing');
  let failed = false;
  try {
    for (const key of keys) {
      try {
        const r = await pushKey(key);
        if (r === 'ok') { const p = pendingSet(); p.delete(key); savePending(p); }
        else if (r === 'fail') failed = true;
      } catch { failed = true; }
    }
  } finally { flushing = false; }
  if (failed) setState(navigator.onLine ? 'error' : 'offline');
  else setState(conflicts.size ? 'error' : 'saved');
}

// ---------- ดึงข้อมูลลงเครื่อง ----------
export interface PullResult { downloaded: number; uploaded: number; conflicts: number }

export async function pullAll(): Promise<PullResult> {
  const result: PullResult = { downloaded: 0, uploaded: 0, conflicts: 0 };
  setState('syncing');

  const rows: { key: string; value: string; updated_at: string; updated_by: string | null }[] = [];
  for (let from = 0; ; from += 500) {
    const { data, error } = await table().select('key,value,updated_at,updated_by').order('key').range(from, from + 499);
    if (error) { setState(navigator.onLine ? 'error' : 'offline'); throw error; }
    rows.push(...(data ?? []));
    if (!data || data.length < 500) break;
  }

  const remote = new Map(rows.map(r => [r.key, r]));
  const synced = getSynced();
  const pending = pendingSet();
  const writable = canWrite();

  for (const r of rows) {
    const local = rawGet(r.key);
    if (local === r.value) { setSynced(r.key, r.updated_at); pending.delete(r.key); continue; }
    if (local !== null && synced[r.key] === r.updated_at) {            // ระบบไม่เปลี่ยน แต่เครื่องนี้แก้ไว้ → รอส่งขึ้น
      if (writable) pending.add(r.key);
      continue;
    }
    if (local !== null && (pending.has(r.key) || !synced[r.key])) {    // ทั้งสองฝั่งเปลี่ยน / ข้อมูลเดิมในเครื่องไม่ตรงระบบ
      if (writable) {
        addConflict({ key: r.key, remoteValue: r.value, remoteAt: r.updated_at, remoteBy: r.updated_by ?? '' });
        result.conflicts++;
        continue;
      }
    }
    rawSet(r.key, r.value);                                            // ใช้ของระบบกลาง
    setSynced(r.key, r.updated_at);
    pending.delete(r.key);
    result.downloaded++;
  }

  if (store) {
    for (let i = store.length - 1; i >= 0; i--) {
      const k = store.key(i);
      if (!k || !k.startsWith(PREFIX) || remote.has(k)) continue;
      if (synced[k] && !pending.has(k)) { rawRemove(k); setSynced(k, null); }   // ถูกลบจากเครื่องอื่นแล้ว
      else if (writable) { pending.add(k); result.uploaded++; }                 // ข้อมูลที่มีเฉพาะในเครื่อง → อัปโหลดขึ้น
    }
  }
  savePending(pending);
  emitConflicts();
  await flush();
  return result;
}

// ---------- แก้ข้อขัดแย้ง ----------
/** ใช้ข้อมูลของเครื่องนี้ทับของในระบบ */
export async function resolveKeepMine(key: string) {
  const c = conflicts.get(key);
  if (!c) return;
  conflicts.delete(key);
  setSynced(key, c.remoteAt);        // ยอมรับเวอร์ชันบนระบบ แล้วส่งของเราทับ
  const p = pendingSet(); p.add(key); savePending(p);
  emitConflicts();
  await flush();
}
/** ใช้ข้อมูลในระบบ (สำเนาของเครื่องนี้ถูกเก็บไว้สำรอง) */
export function resolveTakeRemote(key: string) {
  const c = conflicts.get(key);
  if (!c) return;
  const mine = rawGet(key);
  if (mine !== null) rawSet(CONFLICT_PREFIX + key, mine);
  rawSet(key, c.remoteValue);
  setSynced(key, c.remoteAt);
  conflicts.delete(key);
  emitConflicts();
}

// ---------- ตอนออกจากระบบ ----------
/**
 * ส่งงานที่ค้างขึ้นระบบ แล้วล้างสำเนา ปพ.5 ในเครื่อง (กันครูคนถัดไปบนเครื่องเดียวกันเห็นข้อมูล)
 * ถ้ายังมีข้อมูลที่ส่งไม่สำเร็จ/ขัดแย้ง จะไม่ล้าง และคืน false เพื่อให้ผู้เรียกเตือนผู้ใช้
 */
export async function prepareLogout(): Promise<boolean> {
  if (canWrite()) { try { await flush(); } catch { /* ignore */ } }
  const clean = pendingSet().size === 0 && conflicts.size === 0;
  if (!clean || !store) return clean;
  const toRemove: string[] = [];
  for (let i = 0; i < store.length; i++) {
    const k = store.key(i);
    if (k && (k.startsWith(PREFIX) || k.startsWith(CONFLICT_PREFIX))) toRemove.push(k);
  }
  toRemove.forEach(rawRemove);
  rawRemove(SYNCED_KEY); rawRemove(PENDING_KEY);
  setState('idle');
  return true;
}

// ---------- ดักการเขียน localStorage ----------
let installed = false;
export function installPP5Sync() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  Storage.prototype.setItem = function (this: Storage, key: string, value: string) {
    protoSet!.call(this, key, value);
    if (this === store && key.startsWith(PREFIX)) markDirty(key);
  } as typeof Storage.prototype.setItem;
  Storage.prototype.removeItem = function (this: Storage, key: string) {
    protoRemove!.call(this, key);
    if (this === store && key.startsWith(PREFIX)) markDirty(key);
  } as typeof Storage.prototype.removeItem;

  window.addEventListener('online', () => { void flush(); });
  window.addEventListener('offline', () => setState('offline'));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush();
  });
  window.addEventListener('pagehide', () => { void flush(); });
  setInterval(() => { if (pendingSet().size) void flush(); }, 15_000);
}
