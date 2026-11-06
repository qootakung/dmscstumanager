import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * ตัวเลือกวันที่แบบไทย (พ.ศ.) — แทน <input type="date">
 * - value / onChange ใช้รูปแบบ ISO "YYYY-MM-DD" (ค.ศ.) เหมือนเดิม จึงไม่กระทบข้อมูลที่บันทึกไว้
 * - แสดงผลเป็น "6 พฤศจิกายน 2569"
 * - ไม่พึ่งพา library ภายนอก (ใช้แค่ React + Tailwind + lucide-react)
 */

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];
const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];
const THAI_WEEKDAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

const pad = (n: number) => String(n).padStart(2, '0');
const toISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function parseISO(v?: string): { y: number; m: number; d: number } | null {
  if (!v) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
  if (!match) return null;
  return { y: +match[1], m: +match[2] - 1, d: +match[3] };
}

/** "2026-11-06" → "6 พฤศจิกายน 2569" (ใช้ในหน้าพิมพ์ได้ด้วย) */
export function formatThaiDate(iso?: string, short = false): string {
  const p = parseISO(iso);
  if (!p) return '';
  return `${p.d} ${(short ? THAI_MONTHS_SHORT : THAI_MONTHS)[p.m]} ${p.y + 543}`;
}

interface Props {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  className?: string;
  /** ธีมสีของปุ่ม: pink (ฟอร์มข้อมูลพื้นฐาน) | plain (ช่องในตาราง) */
  variant?: 'pink' | 'plain';
  disabled?: boolean;
}

type View = 'day' | 'month' | 'year';

const ThaiDatePicker: React.FC<Props> = ({
  value, onChange, placeholder = 'เลือกวันที่', className = '', variant = 'pink', disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('day');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const selected = parseISO(value);
  const today = useMemo(() => {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() };
  }, []);

  const [cursor, setCursor] = useState(() => ({
    y: (selected ?? today).y, m: (selected ?? today).m,
  }));
  const [yearPageStart, setYearPageStart] = useState(0);

  // เปิดปฏิทินทุกครั้ง → กลับไปเดือนของวันที่ที่เลือก (หรือเดือนนี้)
  useEffect(() => {
    if (open) {
      const base = selected ?? today;
      setCursor({ y: base.y, m: base.m });
      setView('day');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // คำนวณตำแหน่ง popover (fixed) ให้ไม่ล้นจอ และไม่โดน overflow ของตารางตัดทิ้ง
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const place = () => {
      const r = triggerRef.current!.getBoundingClientRect();
      const w = 320, h = 400;
      let left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
      let top = r.bottom + 6;
      if (top + h > window.innerHeight && r.top - h - 6 > 8) top = r.top - h - 6;
      setPos({ top, left });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  // ปิดเมื่อคลิกนอกกรอบ / กด Esc
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1).getDay();
    const days = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const arr: (number | null)[] = Array(first).fill(null);
    for (let d = 1; d <= days; d++) arr.push(d);
    return arr;
  }, [cursor]);

  const shiftMonth = (delta: number) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };

  const pick = (d: number) => {
    onChange(toISO(cursor.y, cursor.m, d));
    setOpen(false);
  };

  const isSel = (d: number) => !!selected && selected.y === cursor.y && selected.m === cursor.m && selected.d === d;
  const isToday = (d: number) => today.y === cursor.y && today.m === cursor.m && today.d === d;

  const triggerBase =
    variant === 'pink'
      ? 'h-10 w-full rounded-md border border-pink-200 bg-pink-50 px-3 text-sm'
      : 'h-8 w-full rounded-none border-0 bg-transparent px-2 text-sm';

  const yearStart = yearPageStart || Math.floor((cursor.y + 543) / 12) * 12 - 543;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={`${triggerBase} flex items-center justify-between gap-2 text-left transition-colors hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 disabled:opacity-50 ${className}`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value ? formatThaiDate(value) : placeholder}
        </span>
        <CalendarDays className="h-4 w-4 shrink-0 text-emerald-600" />
      </button>

      {open && createPortal(
        <div
          ref={popRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: 320, zIndex: 9999 }}
          className="rounded-2xl border border-emerald-100 bg-[#fdfcf7] p-4 shadow-xl shadow-emerald-900/10"
        >
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => (view === 'day' ? shiftMonth(-1) : view === 'year' ? setYearPageStart(yearStart - 12) : setCursor(c => ({ ...c, y: c.y - 1 })))}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
              aria-label="ก่อนหน้า"
            ><ChevronLeft className="h-4 w-4" /></button>

            <div className="flex items-center gap-1 font-bold text-emerald-900">
              <button type="button" onClick={() => setView(view === 'month' ? 'day' : 'month')}
                className="rounded-lg px-2 py-1 hover:bg-emerald-100">
                {THAI_MONTHS[cursor.m]}
              </button>
              <button type="button" onClick={() => { setYearPageStart(0); setView(view === 'year' ? 'day' : 'year'); }}
                className="rounded-lg px-2 py-1 hover:bg-emerald-100">
                {cursor.y + 543}
              </button>
            </div>

            <button
              type="button"
              onClick={() => (view === 'day' ? shiftMonth(1) : view === 'year' ? setYearPageStart(yearStart + 12) : setCursor(c => ({ ...c, y: c.y + 1 })))}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
              aria-label="ถัดไป"
            ><ChevronRight className="h-4 w-4" /></button>
          </div>

          {/* Day view */}
          {view === 'day' && (
            <>
              <div className="mb-1 grid grid-cols-7 text-center text-xs font-semibold">
                {THAI_WEEKDAYS.map((w, i) => (
                  <div key={w} className={i === 0 || i === 6 ? 'text-rose-500' : 'text-emerald-700'}>{w}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((d, i) => {
                  if (d === null) return <div key={`e${i}`} />;
                  const weekend = i % 7 === 0 || i % 7 === 6;
                  const sel = isSel(d);
                  const td = isToday(d);
                  let cls = 'border border-emerald-100 bg-white text-gray-800 hover:bg-emerald-100 hover:border-emerald-300';
                  if (weekend) cls = 'border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100';
                  if (td && !sel) cls += ' ring-2 ring-emerald-500 ring-offset-1 font-bold';
                  if (sel) cls = 'border border-emerald-600 bg-emerald-600 text-white font-bold shadow-md hover:bg-emerald-700';
                  return (
                    <button key={d} type="button" onClick={() => pick(d)}
                      className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${cls}`}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Month view */}
          {view === 'month' && (
            <div className="grid grid-cols-3 gap-2">
              {THAI_MONTHS.map((m, i) => (
                <button key={m} type="button"
                  onClick={() => { setCursor(c => ({ ...c, m: i })); setView('day'); }}
                  className={`rounded-xl border px-1 py-2 text-sm transition-colors ${
                    i === cursor.m
                      ? 'border-emerald-600 bg-emerald-600 font-bold text-white'
                      : 'border-emerald-100 bg-white text-gray-800 hover:bg-emerald-100'}`}>
                  {m}
                </button>
              ))}
            </div>
          )}

          {/* Year view (พ.ศ.) */}
          {view === 'year' && (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }, (_, i) => yearStart + i).map(be => (
                <button key={be} type="button"
                  onClick={() => { setCursor(c => ({ ...c, y: be - 543 })); setView('month'); }}
                  className={`rounded-xl border px-1 py-2 text-sm transition-colors ${
                    be - 543 === cursor.y
                      ? 'border-emerald-600 bg-emerald-600 font-bold text-white'
                      : be - 543 === today.y
                        ? 'border-emerald-400 bg-white font-bold text-emerald-700 hover:bg-emerald-100'
                        : 'border-emerald-100 bg-white text-gray-800 hover:bg-emerald-100'}`}>
                  {be}
                </button>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-emerald-100 pt-3 text-sm">
            <button type="button" onClick={() => { onChange(''); setOpen(false); }}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-rose-500 hover:bg-rose-50">
              <X className="h-3.5 w-3.5" /> ล้าง
            </button>
            <button type="button" onClick={() => { onChange(toISO(today.y, today.m, today.d)); setOpen(false); }}
              className="rounded-lg bg-emerald-100 px-3 py-1 font-semibold text-emerald-700 hover:bg-emerald-200">
              วันนี้
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

export default ThaiDatePicker;
