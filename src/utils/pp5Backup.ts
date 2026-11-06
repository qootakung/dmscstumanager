// สำรอง/กู้คืนข้อมูล ปพ.5 ที่เก็บในเบราว์เซอร์ (localStorage คีย์ที่ขึ้นต้นด้วย "pp5-")
// เพราะข้อมูลเหล่านี้อยู่ในเครื่องที่ใช้กรอกเท่านั้น ถ้าล้างแคชหรือเปลี่ยนเครื่องจะหายหมด

export const PP5_BACKUP_PREFIX = 'pp5-';
export const PP5_BACKUP_APP = 'dmscstumanager-pp5';
export const PP5_BACKUP_VERSION = 1;
const MAX_BACKUP_BYTES = 50 * 1024 * 1024; // กันไฟล์ผิดประเภทขนาดใหญ่

export interface PP5Backup {
  app: string;
  version: number;
  exportedAt: string;
  count: number;
  data: Record<string, string>;
}

type StorageLike = Pick<Storage, 'length' | 'key' | 'getItem' | 'setItem'>;

export const collectPP5Data = (storage: StorageLike): Record<string, string> => {
  const data: Record<string, string> = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key || !key.startsWith(PP5_BACKUP_PREFIX)) continue;
    const value = storage.getItem(key);
    if (value !== null) data[key] = value;
  }
  return data;
};

export const buildBackup = (storage: StorageLike, now: Date = new Date()): PP5Backup => {
  const data = collectPP5Data(storage);
  return {
    app: PP5_BACKUP_APP,
    version: PP5_BACKUP_VERSION,
    exportedAt: now.toISOString(),
    count: Object.keys(data).length,
    data,
  };
};

export const backupFileName = (now: Date = new Date()): string => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `pp5-backup-${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}-${p(now.getHours())}${p(now.getMinutes())}.json`;
};

export type ParseResult =
  | { ok: true; backup: PP5Backup }
  | { ok: false; error: string };

/** ตรวจไฟล์สำรองก่อนนำเข้า: ต้องเป็นไฟล์ของระบบนี้ และมีเฉพาะคีย์ pp5- ที่ค่าเป็นข้อความ */
export const parseBackup = (text: string): ParseResult => {
  if (text.length > MAX_BACKUP_BYTES) return { ok: false, error: 'ไฟล์ใหญ่เกินไป' };
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'ไฟล์ไม่ใช่ JSON ที่อ่านได้' };
  }
  if (!parsed || parsed.app !== PP5_BACKUP_APP) {
    return { ok: false, error: 'ไม่ใช่ไฟล์สำรอง ปพ.5 ของระบบนี้' };
  }
  if (typeof parsed.version !== 'number' || parsed.version > PP5_BACKUP_VERSION) {
    return { ok: false, error: 'ไฟล์สำรองมาจากเวอร์ชันที่ใหม่กว่า ไม่สามารถนำเข้าได้' };
  }
  if (!parsed.data || typeof parsed.data !== 'object' || Array.isArray(parsed.data)) {
    return { ok: false, error: 'โครงสร้างไฟล์สำรองไม่ถูกต้อง' };
  }
  const data: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if (!key.startsWith(PP5_BACKUP_PREFIX) || typeof value !== 'string') {
      return { ok: false, error: `พบข้อมูลที่ไม่ถูกต้องในไฟล์ (${key.slice(0, 40)})` };
    }
    data[key] = value;
  }
  return {
    ok: true,
    backup: {
      app: PP5_BACKUP_APP,
      version: parsed.version,
      exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : '',
      count: Object.keys(data).length,
      data,
    },
  };
};

/** นำเข้าโดยเขียนทับคีย์เดียวกัน คีย์อื่นในเครื่องไม่ถูกลบ คืนจำนวนรายการที่เขียน */
export const restoreBackup = (storage: StorageLike, backup: PP5Backup): number => {
  let n = 0;
  for (const [key, value] of Object.entries(backup.data)) {
    storage.setItem(key, value);
    n++;
  }
  return n;
};
