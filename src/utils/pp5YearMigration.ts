// ปพ.5 ทำเป็นรายปี (ใช้ภาคเรียนที่ 2 เป็นค่าคงที่)
// ข้อมูลที่เคยกรอกไว้ในภาคเรียนที่ 1 (คีย์ลงท้าย -{ปี}-1) จะถูกคัดลอกมาที่คีย์ภาคเรียนที่ 2 (-{ปี}-2)
// เฉพาะคีย์ที่ยังไม่มีในภาคเรียนที่ 2 เท่านั้น ไม่ทับข้อมูลเดิม และไม่ลบข้อมูลภาคเรียนที่ 1

export const PP5_YEAR_SEMESTER = '2';
export const PP5_MIGRATION_FLAG = 'dm-pp5-year-migrated-v1'; // ไม่ขึ้นต้นด้วย pp5- จึงไม่ถูกรวมในไฟล์สำรอง

type StorageLike = Pick<Storage, 'length' | 'key' | 'getItem' | 'setItem'>;

const SEM1_KEY = /^(pp5-.+-\d{4})-1$/;

export interface MigrationResult {
  copied: number;
  skippedExisting: number;
}

/** คัดลอกคีย์ภาคเรียนที่ 1 -> 2 ถ้าปลายทางยังไม่มี */
export const copySemester1To2 = (storage: StorageLike): MigrationResult => {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const k = storage.key(i);
    if (k && SEM1_KEY.test(k)) keys.push(k);
  }
  let copied = 0;
  let skippedExisting = 0;
  keys.forEach(k => {
    const target = k.replace(SEM1_KEY, '$1-2');
    if (storage.getItem(target) !== null) { skippedExisting++; return; }
    const value = storage.getItem(k);
    if (value === null) return;
    storage.setItem(target, value);
    copied++;
  });
  return { copied, skippedExisting };
};

/** ทำครั้งเดียวต่อเครื่อง คืน null ถ้าเคยทำแล้ว */
export const runYearMigrationOnce = (storage: StorageLike): MigrationResult | null => {
  try {
    if (storage.getItem(PP5_MIGRATION_FLAG)) return null;
    const result = copySemester1To2(storage);
    storage.setItem(PP5_MIGRATION_FLAG, new Date().toISOString());
    return result;
  } catch (e) {
    console.error('PP5 year migration failed:', e);
    return null;
  }
};
