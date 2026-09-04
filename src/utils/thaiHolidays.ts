
// Thai Government Holidays - Fixed dates and calculated Buddhist holidays
// Dates are in CE (Common Era) format

interface ThaiHoliday {
  date: Date;
  name: string;
}

// Get fixed Thai government holidays for a given CE year
const getFixedHolidays = (ceYear: number): ThaiHoliday[] => [
  { date: new Date(ceYear, 0, 1), name: 'วันขึ้นปีใหม่' },
  { date: new Date(ceYear, 0, 2), name: 'ชดเชยวันขึ้นปีใหม่' },
  { date: new Date(ceYear, 3, 6), name: 'วันจักรี' },
  { date: new Date(ceYear, 3, 13), name: 'วันสงกรานต์' },
  { date: new Date(ceYear, 3, 14), name: 'วันสงกรานต์' },
  { date: new Date(ceYear, 3, 15), name: 'วันสงกรานต์' },
  { date: new Date(ceYear, 4, 1), name: 'วันแรงงาน' },
  { date: new Date(ceYear, 4, 4), name: 'วันฉัตรมงคล' },
  { date: new Date(ceYear, 5, 3), name: 'วันเฉลิมพระชนมพรรษา สมเด็จพระราชินี' },
  { date: new Date(ceYear, 6, 28), name: 'วันเฉลิมพระชนมพรรษา ร.10' },
  { date: new Date(ceYear, 7, 12), name: 'วันเฉลิมพระชนมพรรษา สมเด็จพระบรมราชชนนี' },
  { date: new Date(ceYear, 9, 13), name: 'วันคล้ายวันสวรรคต ร.9' },
  { date: new Date(ceYear, 9, 23), name: 'วันปิยมหาราช' },
  { date: new Date(ceYear, 11, 5), name: 'วันคล้ายวันพระราชสมภพ ร.9' },
  { date: new Date(ceYear, 11, 10), name: 'วันรัฐธรรมนูญ' },
  { date: new Date(ceYear, 11, 31), name: 'วันสิ้นปี' },
];

// Buddhist holidays that change yearly (approximate dates for recent years)
// These are based on the lunar calendar
const getBuddhistHolidays = (ceYear: number): ThaiHoliday[] => {
  const holidays: Record<number, ThaiHoliday[]> = {
    2024: [
      { date: new Date(2024, 1, 24), name: 'วันมาฆบูชา' },
      { date: new Date(2024, 1, 26), name: 'ชดเชยวันมาฆบูชา' },
      { date: new Date(2024, 4, 22), name: 'วันวิสาขบูชา' },
      { date: new Date(2024, 6, 20), name: 'วันอาสาฬหบูชา' },
      { date: new Date(2024, 6, 21), name: 'วันเข้าพรรษา' },
      { date: new Date(2024, 6, 22), name: 'ชดเชยวันเข้าพรรษา' },
    ],
    2025: [
      { date: new Date(2025, 1, 12), name: 'วันมาฆบูชา' },
      { date: new Date(2025, 4, 11), name: 'วันวิสาขบูชา' },
      { date: new Date(2025, 4, 12), name: 'ชดเชยวันวิสาขบูชา' },
      { date: new Date(2025, 6, 10), name: 'วันอาสาฬหบูชา' },
      { date: new Date(2025, 6, 11), name: 'วันเข้าพรรษา' },
    ],
    2026: [
      { date: new Date(2026, 2, 3), name: 'วันมาฆบูชา' },
      { date: new Date(2026, 4, 31), name: 'วันวิสาขบูชา' },
      { date: new Date(2026, 5, 1), name: 'ชดเชยวันวิสาขบูชา' },
      { date: new Date(2026, 6, 29), name: 'วันอาสาฬหบูชา' },
      { date: new Date(2026, 6, 30), name: 'วันเข้าพรรษา' },
    ],
    2027: [
      { date: new Date(2027, 1, 21), name: 'วันมาฆบูชา' },
      { date: new Date(2027, 1, 22), name: 'ชดเชยวันมาฆบูชา' },
      { date: new Date(2027, 4, 20), name: 'วันวิสาขบูชา' },
      { date: new Date(2027, 6, 18), name: 'วันอาสาฬหบูชา' },
      { date: new Date(2027, 6, 19), name: 'วันเข้าพรรษา' },
    ],
    2028: [
      { date: new Date(2028, 1, 10), name: 'วันมาฆบูชา' },
      { date: new Date(2028, 4, 8), name: 'วันวิสาขบูชา' },
      { date: new Date(2028, 6, 6), name: 'วันอาสาฬหบูชา' },
      { date: new Date(2028, 6, 7), name: 'วันเข้าพรรษา' },
    ],
  };
  return holidays[ceYear] || [];
};

// Get all Thai holidays for a given Buddhist year (academic year)
export const getThaiHolidays = (buddhistYear: number): ThaiHoliday[] => {
  const ceYear = buddhistYear - 543;
  const allHolidays: ThaiHoliday[] = [
    ...getFixedHolidays(ceYear),
    ...getFixedHolidays(ceYear + 1), // Include next year for semester 2
    ...getBuddhistHolidays(ceYear),
    ...getBuddhistHolidays(ceYear + 1),
  ];
  return allHolidays;
};

// Check if a date is a Thai government holiday
export const isThaiHoliday = (date: Date, holidays: ThaiHoliday[]): string | null => {
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const found = holidays.find(h => {
    const hDate = new Date(h.date.getFullYear(), h.date.getMonth(), h.date.getDate()).getTime();
    return hDate === target;
  });
  return found ? found.name : null;
};

// Check if a date is a weekend (Saturday or Sunday)
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

// Get Thai day abbreviation
export const getThaiDayAbbr = (date: Date): string => {
  const days = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  return days[date.getDay()];
};

// Get Thai month name
export const getThaiMonthName = (month: number): string => {
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  return months[month];
};

// Get months for a semester
export const getSemesterMonths = (semester: string, academicYear: string): { month: number; year: number; ceYear: number }[] => {
  const buddhistYear = parseInt(academicYear);
  const ceYear = buddhistYear - 543;

  if (semester === '1') {
    // Semester 1: May 16 - October (same CE year)
    return [
      { month: 4, year: buddhistYear, ceYear }, // พฤษภาคม (May)
      { month: 5, year: buddhistYear, ceYear }, // มิถุนายน (June)
      { month: 6, year: buddhistYear, ceYear }, // กรกฎาคม (July)
      { month: 7, year: buddhistYear, ceYear }, // สิงหาคม (August)
      { month: 8, year: buddhistYear, ceYear }, // กันยายน (September)
      { month: 9, year: buddhistYear, ceYear }, // ตุลาคม (October)
    ];
  } else {
    // Semester 2: November - March (crosses CE year boundary)
    return [
      { month: 10, year: buddhistYear, ceYear },     // พฤศจิกายน (November)
      { month: 11, year: buddhistYear, ceYear },     // ธันวาคม (December)
      { month: 0, year: buddhistYear + 1, ceYear: ceYear + 1 }, // มกราคม (January next year)
      { month: 1, year: buddhistYear + 1, ceYear: ceYear + 1 }, // กุมภาพันธ์ (February next year)
      { month: 2, year: buddhistYear + 1, ceYear: ceYear + 1 }, // มีนาคม (March next year)
    ];
  }
};

// Get the number of days in a month
export const getDaysInMonth = (month: number, ceYear: number): number => {
  return new Date(ceYear, month + 1, 0).getDate();
};

// Get start day for semester 1 (May starts from 16th)
export const getStartDay = (semester: string, month: number): number => {
  if (semester === '1' && month === 4) {
    return 16; // May 16th
  }
  return 1;
};

// ============ Custom (user-defined) holidays ============
// Stored per academic (Buddhist) year in localStorage.
// type 'holiday' = ปิดเรียนเพิ่มเติม, type 'school' = ยกเลิกวันหยุด (เปิดเรียนพิเศษ)
export interface CustomDay {
  type: 'holiday' | 'school';
  name?: string;
}
export type CustomDayMap = Record<string, CustomDay>; // key: YYYY-MM-DD

export const customHolidayKey = (academicYear: string) => `pp5-custom-holidays-${academicYear}`;

export const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const getCustomDays = (academicYear: string): CustomDayMap => {
  try {
    const raw = localStorage.getItem(customHolidayKey(academicYear));
    return raw ? (JSON.parse(raw) as CustomDayMap) : {};
  } catch {
    return {};
  }
};

export const saveCustomDays = (academicYear: string, map: CustomDayMap): void => {
  localStorage.setItem(customHolidayKey(academicYear), JSON.stringify(map));
};

/** Resolve the final status of a date, honouring user overrides. */
export const getDayStatus = (
  date: Date,
  holidays: ThaiHoliday[],
  custom: CustomDayMap = {},
): { weekend: boolean; holiday: string | null; custom: boolean } => {
  const key = toDateKey(date);
  const override = custom[key];
  if (override) {
    if (override.type === 'school') return { weekend: false, holiday: null, custom: true };
    return { weekend: false, holiday: override.name || 'วันหยุด', custom: true };
  }
  return { weekend: isWeekend(date), holiday: isThaiHoliday(date, holidays), custom: false };
};

// ============ Locked school days (shared across all grades) ============
// When a month is locked, the set of school days is frozen and used by every
// grade's attendance sheet, so all classes reference the same open-school days.
export type LockedMonthsMap = Record<string, string[]>; // key: YYYY-MM -> list of school-day keys (YYYY-MM-DD)

export const lockedDaysKey = (academicYear: string) => `pp5-locked-schooldays-${academicYear}`;

export const toMonthKey = (ceYear: number, month: number): string =>
  `${ceYear}-${String(month + 1).padStart(2, '0')}`;

export const getLockedMonths = (academicYear: string): LockedMonthsMap => {
  try {
    const raw = localStorage.getItem(lockedDaysKey(academicYear));
    return raw ? (JSON.parse(raw) as LockedMonthsMap) : {};
  } catch {
    return {};
  }
};

export const saveLockedMonths = (academicYear: string, map: LockedMonthsMap): void => {
  localStorage.setItem(lockedDaysKey(academicYear), JSON.stringify(map));
};

/** Day status honouring a locked month snapshot (takes priority over overrides). */
export const getDayStatusLocked = (
  date: Date,
  holidays: ThaiHoliday[],
  custom: CustomDayMap,
  lockedSchoolDays: string[] | null,
): { weekend: boolean; holiday: string | null; custom: boolean } => {
  if (lockedSchoolDays) {
    const key = toDateKey(date);
    if (lockedSchoolDays.includes(key)) return { weekend: false, holiday: null, custom: true };
    return { weekend: isWeekend(date), holiday: isWeekend(date) ? null : 'วันหยุด (ล็อก)', custom: true };
  }
  return getDayStatus(date, holidays, custom);
};
