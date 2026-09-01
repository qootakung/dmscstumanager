
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Printer, Settings } from 'lucide-react';
import { allSubjectGroups } from '@/data/curriculumIndicators';
import { toast } from 'sonner';

interface ScoreRatioConfigProps {
  selectedGrade: string;
  selectedSemester: string;
  selectedAcademicYear: string;
  onBack: () => void;
}

interface StandardScore {
  standardCode: string;
  score: number;
}

interface SubjectGroupRatio {
  groupId: string;
  groupName: string;
  strands: {
    strandName: string;
    standards: StandardScore[];
  }[];
  midYearTotal: number; // รวมคะแนนระหว่างปี
  endYearScore: number; // คะแนนปลายปี
}

const SUBJECT_GROUP_COLORS: { [key: string]: { bg: string; header: string; text: string; stripe: string } } = {
  thai: { bg: 'bg-blue-50', header: 'bg-blue-500', text: 'text-blue-700', stripe: 'bg-blue-100' },
  math: { bg: 'bg-green-50', header: 'bg-green-500', text: 'text-green-700', stripe: 'bg-green-100' },
  science: { bg: 'bg-purple-50', header: 'bg-purple-500', text: 'text-purple-700', stripe: 'bg-purple-100' },
  social: { bg: 'bg-orange-50', header: 'bg-orange-500', text: 'text-orange-700', stripe: 'bg-orange-100' },
  health: { bg: 'bg-pink-50', header: 'bg-pink-500', text: 'text-pink-700', stripe: 'bg-pink-100' },
  arts: { bg: 'bg-indigo-50', header: 'bg-indigo-500', text: 'text-indigo-700', stripe: 'bg-indigo-100' },
  career: { bg: 'bg-amber-50', header: 'bg-amber-500', text: 'text-amber-700', stripe: 'bg-amber-100' },
  english: { bg: 'bg-teal-50', header: 'bg-teal-500', text: 'text-teal-700', stripe: 'bg-teal-100' },
};

const getStorageKey = (grade: string, year: string, semester: string) =>
  `pp5-score-ratio-${grade}-${year}-${semester}`;

// ค่าน้ำหนักคะแนนเริ่มต้น อ้างอิงจากไฟล์ ปพ.5 โรงเรียนบ้านดอนมูล (ชีต "สัดส่วน")
// รวมคะแนนระหว่างปี + คะแนนปลายปี = 100 เสมอ
const DEFAULT_WEIGHTS: {
  [groupId: string]: { standards: { [stdCode: string]: number }; endYear: number };
} = {
  thai: {
    standards: { 'ท 1.1': 20, 'ท 2.1': 10, 'ท 3.1': 15, 'ท 4.1': 15, 'ท 5.1': 10 },
    endYear: 30,
  },
  math: {
    standards: { 'ค 1.1': 15, 'ค 1.2': 10, 'ค 1.3': 0, 'ค 2.1': 15, 'ค 2.2': 10, 'ค 3.1': 20, 'ค 3.2': 0 },
    endYear: 30,
  },
  science: {
    standards: { 'ว 1.1': 10, 'ว 1.2': 10, 'ว 1.3': 0, 'ว 2.1': 10, 'ว 2.2': 0, 'ว 2.3': 5, 'ว 3.1': 10, 'ว 3.2': 5, 'ว 4.1': 0, 'ว 4.2': 20 },
    endYear: 30,
  },
  social: {
    standards: { 'ส 1.1': 10, 'ส 1.2': 10, 'ส 2.1': 5, 'ส 2.2': 10, 'ส 3.1': 10, 'ส 3.2': 5, 'ส 4.1': 0, 'ส 4.2': 0, 'ส 4.3': 0, 'ส 5.1': 10, 'ส 5.2': 10 },
    endYear: 30,
  },
  health: {
    standards: { 'พ 1.1': 10, 'พ 2.1': 10, 'พ 3.1': 15, 'พ 3.2': 20, 'พ 4.1': 15, 'พ 5.1': 10 },
    endYear: 20,
  },
  arts: {
    standards: { 'ศ 1.1': 20, 'ศ 1.2': 10, 'ศ 2.1': 15, 'ศ 2.2': 15, 'ศ 3.1': 10, 'ศ 3.2': 10 },
    endYear: 20,
  },
  career: {
    standards: { 'ง 1.1': 40, 'ง 2.1': 40 },
    endYear: 20,
  },
  english: {
    standards: { 'ต 1.1': 10, 'ต 1.2': 10, 'ต 1.3': 10, 'ต 2.1': 5, 'ต 2.2': 10, 'ต 3.1': 15, 'ต 4.1': 5, 'ต 4.2': 5 },
    endYear: 30,
  },
};

// น้ำหนักวิทยาศาสตร์ฯ แยกตามระดับชั้น — อ้างอิงเอกสารตัวชี้วัดระหว่างทาง/ปลายทาง กลุ่มสาระวิทยาศาสตร์และเทคโนโลยี (สพฐ.)
// แต่ละชั้นมีมาตรฐานที่มีตัวชี้วัดต่างกัน จึงกระจายคะแนนระหว่างปี 70 เฉพาะมาตรฐานที่มีตัวชี้วัดในชั้นนั้น
// (ว 4.1 ไม่มีตัวชี้วัดระดับประถมในหลักสูตรปรับปรุง 2560)
const SCIENCE_WEIGHTS_BY_GRADE: {
  [grade: string]: { standards: { [stdCode: string]: number }; endYear: number };
} = {
  'ป.1': { // ว1.1 ว1.2 ว2.1 ว2.3 ว3.1 ว3.2 ว4.2 (15 ตัวชี้วัด)
    standards: { 'ว 1.1': 10, 'ว 1.2': 10, 'ว 2.1': 10, 'ว 2.3': 5, 'ว 3.1': 10, 'ว 3.2': 5, 'ว 4.2': 20 },
    endYear: 30,
  },
  'ป.2': { // ว1.2 ว1.3 ว2.1 ว2.3 ว3.2 ว4.2 (16 ตัวชี้วัด)
    standards: { 'ว 1.2': 10, 'ว 1.3': 5, 'ว 2.1': 15, 'ว 2.3': 10, 'ว 3.2': 10, 'ว 4.2': 20 },
    endYear: 30,
  },
  'ป.3': { // ว1.2 ว2.1 ว2.2 ว2.3 ว3.1 ว3.2 ว4.2 (25 ตัวชี้วัด)
    standards: { 'ว 1.2': 10, 'ว 2.1': 10, 'ว 2.2': 10, 'ว 2.3': 5, 'ว 3.1': 10, 'ว 3.2': 5, 'ว 4.2': 20 },
    endYear: 30,
  },
  'ป.4': { // ว1.2 ว1.3 ว2.1 ว2.2 ว2.3 ว3.1 ว4.2 (21 ตัวชี้วัด)
    standards: { 'ว 1.2': 5, 'ว 1.3': 10, 'ว 2.1': 10, 'ว 2.2': 10, 'ว 2.3': 5, 'ว 3.1': 10, 'ว 4.2': 20 },
    endYear: 30,
  },
  'ป.5': { // ว1.1 ว1.3 ว2.1 ว2.2 ว2.3 ว3.1 ว3.2 ว4.2 (32 ตัวชี้วัด)
    standards: { 'ว 1.1': 10, 'ว 1.3': 5, 'ว 2.1': 10, 'ว 2.2': 10, 'ว 2.3': 5, 'ว 3.1': 5, 'ว 3.2': 5, 'ว 4.2': 20 },
    endYear: 30,
  },
  'ป.6': { // ว1.2 ว2.1 ว2.2 ว2.3 ว3.1 ว3.2 ว4.2 (30 ตัวชี้วัด)
    standards: { 'ว 1.2': 10, 'ว 2.1': 5, 'ว 2.2': 5, 'ว 2.3': 10, 'ว 3.1': 5, 'ว 3.2': 15, 'ว 4.2': 20 },
    endYear: 30,
  },
};

// น้ำหนักคณิตศาสตร์ แยกตามระดับชั้น — อ้างอิงเอกสารตัวชี้วัดระหว่างทาง/ปลายทาง กลุ่มสาระคณิตศาสตร์ (ฉบับปรับปรุง พ.ศ. 2560)
// จำนวนตัวชี้วัดรวม: ป.1=10, ป.2=16, ป.3=28, ป.4=22, ป.5=19, ป.6=21
// (ค 1.3 และ ค 3.2 ไม่มีตัวชี้วัดในระดับประถมศึกษา) กระจายคะแนนระหว่างปี 70 + ปลายปี 30 = 100
const MATH_WEIGHTS_BY_GRADE: {
  [grade: string]: { standards: { [stdCode: string]: number }; endYear: number };
} = {
  'ป.1': { standards: { 'ค 1.1': 30, 'ค 1.2': 10, 'ค 2.1': 15, 'ค 2.2': 10, 'ค 3.1': 5 }, endYear: 30 },
  'ป.2': { standards: { 'ค 1.1': 35, 'ค 2.1': 25, 'ค 2.2': 5, 'ค 3.1': 5 }, endYear: 30 },
  'ป.3': { standards: { 'ค 1.1': 28, 'ค 1.2': 5, 'ค 2.1': 30, 'ค 2.2': 4, 'ค 3.1': 3 }, endYear: 30 },
  'ป.4': { standards: { 'ค 1.1': 45, 'ค 2.1': 12, 'ค 2.2': 8, 'ค 3.1': 5 }, endYear: 30 },
  'ป.5': { standards: { 'ค 1.1': 35, 'ค 2.1': 15, 'ค 2.2': 15, 'ค 3.1': 5 }, endYear: 30 },
  'ป.6': { standards: { 'ค 1.1': 40, 'ค 1.2': 4, 'ค 2.1': 10, 'ค 2.2': 12, 'ค 3.1': 4 }, endYear: 30 },
};

// น้ำหนักสังคมศึกษาฯ แยกตามระดับชั้น — อ้างอิงเอกสารตัวชี้วัดระหว่างทาง/ปลายทาง กลุ่มสาระสังคมศึกษา ศาสนาและวัฒนธรรม (สพฐ.)
// จำนวนตัวชี้วัดรวม: ป.1=31, ป.2=34, ป.3=39, ป.4=38, ป.5=36, ป.6=39 — กระจายคะแนนระหว่างปี 70 ตามสัดส่วนตัวชี้วัดของแต่ละมาตรฐาน + ปลายปี 30 = 100
const SOCIAL_WEIGHTS_BY_GRADE: {
  [grade: string]: { standards: { [stdCode: string]: number }; endYear: number };
} = {
  'ป.1': { standards: { 'ส 1.1': 8, 'ส 1.2': 7, 'ส 2.1': 5, 'ส 2.2': 7, 'ส 3.1': 7, 'ส 3.2': 2, 'ส 4.1': 7, 'ส 4.2': 5, 'ส 4.3': 7, 'ส 5.1': 8, 'ส 5.2': 7 }, endYear: 30 },
  'ป.2': { standards: { 'ส 1.1': 15, 'ส 1.2': 4, 'ส 2.1': 9, 'ส 2.2': 4, 'ส 3.1': 8, 'ส 3.2': 4, 'ส 4.1': 4, 'ส 4.2': 4, 'ส 4.3': 4, 'ส 5.1': 6, 'ส 5.2': 8 }, endYear: 30 },
  'ป.3': { standards: { 'ส 1.1': 12, 'ส 1.2': 6, 'ส 2.1': 6, 'ส 2.2': 6, 'ส 3.1': 6, 'ส 3.2': 6, 'ส 4.1': 4, 'ส 4.2': 6, 'ส 4.3': 6, 'ส 5.1': 4, 'ส 5.2': 8 }, endYear: 30 },
  'ป.4': { standards: { 'ส 1.1': 14, 'ส 1.2': 5, 'ส 2.1': 8, 'ส 2.2': 5, 'ส 3.1': 6, 'ส 3.2': 4, 'ส 4.1': 6, 'ส 4.2': 4, 'ส 4.3': 6, 'ส 5.1': 6, 'ส 5.2': 6 }, endYear: 30 },
  'ป.5': { standards: { 'ส 1.1': 13, 'ส 1.2': 6, 'ส 2.1': 7, 'ส 2.2': 6, 'ส 3.1': 6, 'ส 3.2': 4, 'ส 4.1': 6, 'ส 4.2': 4, 'ส 4.3': 8, 'ส 5.1': 4, 'ส 5.2': 6 }, endYear: 30 },
  'ป.6': { standards: { 'ส 1.1': 16, 'ส 1.2': 7, 'ส 2.1': 9, 'ส 2.2': 5, 'ส 3.1': 5, 'ส 3.2': 4, 'ส 4.1': 4, 'ส 4.2': 4, 'ส 4.3': 7, 'ส 5.1': 4, 'ส 5.2': 5 }, endYear: 30 },
};

const getDefaultWeight = (groupId: string, gradeKey: string) => {
  if (groupId === 'science') {
    return SCIENCE_WEIGHTS_BY_GRADE[gradeKey] ?? DEFAULT_WEIGHTS.science;
  }
  if (groupId === 'math') {
    return MATH_WEIGHTS_BY_GRADE[gradeKey] ?? DEFAULT_WEIGHTS.math;
  }
  if (groupId === 'social') {
    return SOCIAL_WEIGHTS_BY_GRADE[gradeKey] ?? DEFAULT_WEIGHTS.social;
  }
  return DEFAULT_WEIGHTS[groupId];
};


const ScoreRatioConfig: React.FC<ScoreRatioConfigProps> = ({
  selectedGrade,
  selectedSemester,
  selectedAcademicYear,
  onBack,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [ratios, setRatios] = useState<SubjectGroupRatio[]>([]);

  const gradeKey = selectedGrade; // e.g. 'ป.1'

  // Initialize from curriculum data
  const buildDefaultRatios = (): SubjectGroupRatio[] => {
    return allSubjectGroups.map(group => {
      const defaultWeight = getDefaultWeight(group.id, gradeKey);
      const strandMap = new Map<string, StandardScore[]>();

      group.subjects.forEach(subject => {
        subject.standards.forEach(standard => {
          const indicators = standard.indicators[gradeKey];
          if (indicators && indicators.length > 0) {
            const existing = strandMap.get(subject.strand) || [];
            existing.push({
              standardCode: standard.code,
              score: defaultWeight?.standards[standard.code] ?? 0,
            });
            strandMap.set(subject.strand, existing);
          }
        });
      });

      const strands = Array.from(strandMap.entries()).map(([strandName, standards]) => ({
        strandName,
        standards,
      }));

      const midYearTotal = strands.reduce(
        (sum, st) => sum + st.standards.reduce((s2, s) => s2 + s.score, 0),
        0
      );

      return {
        groupId: group.id,
        groupName: group.name,
        strands,
        midYearTotal,
        endYearScore: defaultWeight?.endYear ?? 0,
      };
    }).filter(g => g.strands.length > 0);
  };

  // Extra elective subject ratio entries (no curriculum standards — single editable row)
  const ELECTIVE_RATIO_GROUPS: { groupId: string; groupName: string }[] = [
    { groupId: 'elective-anticorrupt', groupName: 'รายวิชาเพิ่มเติม - ป้องกันการทุจริต' },
    { groupId: 'elective-english-comm', groupName: 'รายวิชาเพิ่มเติม - ภาษาอังกฤษเพื่อการสื่อสาร' },
  ];

  const buildElectiveRatios = (): SubjectGroupRatio[] => {
    return ELECTIVE_RATIO_GROUPS.map(g => ({
      groupId: g.groupId,
      groupName: g.groupName,
      strands: [
        {
          strandName: 'ผลการเรียนรู้',
          standards: [{ standardCode: 'รวมคะแนนระหว่างปี', score: 80 }],
        },
      ],
      midYearTotal: 80,
      endYearScore: 20,
    }));
  };

  const buildAllDefaults = (): SubjectGroupRatio[] => {
    return [...buildDefaultRatios(), ...buildElectiveRatios()];
  };

  useEffect(() => {
    const key = getStorageKey(gradeKey, selectedAcademicYear, selectedSemester);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed: SubjectGroupRatio[] = JSON.parse(saved);
        // Ensure elective groups exist (for backwards compatibility with old saves)
        const existingIds = new Set(parsed.map(g => g.groupId));
        const missingElectives = buildElectiveRatios().filter(g => !existingIds.has(g.groupId));
        setRatios([...parsed, ...missingElectives]);
        return;
      } catch (e) {
        console.error('Error loading score ratios:', e);
      }
    }
    setRatios(buildAllDefaults());
  }, [gradeKey, selectedAcademicYear, selectedSemester]);

  const updateStandardScore = (groupId: string, strandIdx: number, stdIdx: number, value: number) => {
    setRatios(prev => prev.map(g => {
      if (g.groupId !== groupId) return g;
      const newStrands = g.strands.map((strand, si) => {
        if (si !== strandIdx) return strand;
        const newStds = strand.standards.map((s, i) => i === stdIdx ? { ...s, score: value } : s);
        return { ...strand, standards: newStds };
      });
      const midYearTotal = newStrands.reduce((sum, st) => sum + st.standards.reduce((s2, s) => s2 + s.score, 0), 0);
      return { ...g, strands: newStrands, midYearTotal };
    }));
  };

  const updateEndYearScore = (groupId: string, value: number) => {
    setRatios(prev => prev.map(g => g.groupId === groupId ? { ...g, endYearScore: value } : g));
  };

  const handleSave = () => {
    const key = getStorageKey(gradeKey, selectedAcademicYear, selectedSemester);
    localStorage.setItem(key, JSON.stringify(ratios));
    toast.success(`บันทึกสัดส่วนคะแนน ${gradeKey} สำเร็จ`);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=900,width=700');
    if (!printWindow || !printRef.current) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>สัดส่วนคะแนน ${gradeKey}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'TH SarabunPSK', 'TH Sarabun', 'Sarabun', sans-serif; font-size: 16pt; padding: 10mm; }
            h1 { font-size: 18pt; text-align: center; margin-bottom: 8px; }
            h2 { font-size: 16pt; margin-top: 16px; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
            th, td { border: 1px solid #333; padding: 4px 8px; font-size: 14pt; }
            th { background: #e0e0e0; text-align: center; }
            .strand { background: #f5f5f5; font-weight: bold; }
            .total-row { background: #e8f5e9; font-weight: bold; }
            .end-row { background: #fff3e0; font-weight: bold; }
            .grand-row { background: #ffcdd2; font-weight: bold; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .page-break { page-break-before: always; }
            @media print { body { padding: 10mm; } }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const colorKeys = Object.keys(SUBJECT_GROUP_COLORS);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> กลับ
          </Button>
          <div>
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <Settings className="w-5 h-5" />
              กำหนดสัดส่วนน้ำหนักคะแนนการประเมินผล
            </h2>
            <p className="text-sm text-muted-foreground">
              ชั้น{gradeKey} ปีการศึกษา {selectedAcademicYear} ภาคเรียนที่ {selectedSemester}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline" className="gap-1">
            <Printer className="w-4 h-4" /> พิมพ์ A4
          </Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 gap-1">
            <Save className="w-4 h-4" /> บันทึก
          </Button>
        </div>
      </div>

      {/* Subject Group Tables */}
      {ratios.map((group, gi) => {
        const colorKey = colorKeys[gi % colorKeys.length];
        const colors = SUBJECT_GROUP_COLORS[colorKey];
        const totalStandards = group.midYearTotal;
        const grandTotal = totalStandards + group.endYearScore;

        return (
          <Card key={group.groupId} className={`border-2 shadow-md`}>
            <CardHeader className={`${colors.header} text-white py-3 rounded-t-lg`}>
              <CardTitle className="text-base">
                การกำหนดสัดส่วนน้ำหนักคะแนนการประเมินผล - {group.groupName}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className={colors.stripe}>
                    <th className="border border-gray-300 px-3 py-2 text-left w-2/3">สาระ / มาตรฐาน</th>
                    <th className="border border-gray-300 px-3 py-2 text-center w-1/3">น้ำหนักคะแนน</th>
                  </tr>
                </thead>
                <tbody>
                  {group.strands.map((strand, si) => (
                    <React.Fragment key={si}>
                      {/* Strand header */}
                      <tr className={colors.bg}>
                        <td colSpan={2} className={`border border-gray-300 px-3 py-1.5 font-bold ${colors.text}`}>
                          {strand.strandName}
                        </td>
                      </tr>
                      {/* Standard rows */}
                      {strand.standards.map((std, stdIdx) => (
                        <tr key={std.standardCode} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-6 py-1.5">
                            มาตรฐาน {std.standardCode}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-center">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={std.score}
                              onChange={(e) => updateStandardScore(group.groupId, si, stdIdx, parseInt(e.target.value) || 0)}
                              className="w-20 h-8 text-center mx-auto text-sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  {/* Summary rows */}
                  <tr className="bg-green-100">
                    <td className="border border-gray-300 px-3 py-2 text-right font-bold">
                      รวมคะแนนระหว่างปี
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-bold text-lg">
                      {totalStandards}
                    </td>
                  </tr>
                  <tr className="bg-orange-100">
                    <td className="border border-gray-300 px-3 py-2 text-right font-bold">
                      คะแนนปลายปี
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={group.endYearScore}
                        onChange={(e) => updateEndYearScore(group.groupId, parseInt(e.target.value) || 0)}
                        className="w-20 h-8 text-center mx-auto text-sm font-bold"
                      />
                    </td>
                  </tr>
                  <tr className={`${grandTotal === 100 ? 'bg-emerald-200' : 'bg-red-200'}`}>
                    <td className="border border-gray-300 px-3 py-2 text-right font-bold text-lg">
                      รวมคะแนน
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-bold text-lg">
                      {grandTotal}
                      {grandTotal !== 100 && (
                        <span className="text-xs text-red-600 ml-1">(ต้องเป็น 100)</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        );
      })}

      {/* Hidden print content */}
      <div className="hidden">
        <div ref={printRef}>
          <h1>การกำหนดสัดส่วนน้ำหนักคะแนนการประเมินผล</h1>
          <p style={{ textAlign: 'center', marginBottom: '12px' }}>
            ชั้นประถมศึกษาปีที่ {gradeKey.replace('ป.', '')} ปีการศึกษา {selectedAcademicYear} ภาคเรียนที่ {selectedSemester} | โรงเรียนบ้านดอนมูล
          </p>

          {ratios.map((group, gi) => {
            const totalStandards = group.midYearTotal;
            const grandTotal = totalStandards + group.endYearScore;

            return (
              <div key={group.groupId} className={gi > 0 ? 'page-break' : ''}>
                <h2>{group.groupName}</h2>
                <table>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', width: '70%' }}>สาระ / มาตรฐาน</th>
                      <th style={{ width: '30%' }}>น้ำหนักคะแนน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.strands.map((strand, si) => (
                      <React.Fragment key={si}>
                        <tr className="strand">
                          <td colSpan={2}>{strand.strandName}</td>
                        </tr>
                        {strand.standards.map((std) => (
                          <tr key={std.standardCode}>
                            <td style={{ paddingLeft: '24px' }}>มาตรฐาน {std.standardCode}</td>
                            <td className="text-center">{std.score}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                    <tr className="total-row">
                      <td className="text-right">รวมคะแนนระหว่างปี</td>
                      <td className="text-center">{totalStandards}</td>
                    </tr>
                    <tr className="end-row">
                      <td className="text-right">คะแนนปลายปี</td>
                      <td className="text-center">{group.endYearScore}</td>
                    </tr>
                    <tr className="grand-row">
                      <td className="text-right">รวมคะแนน</td>
                      <td className="text-center">{grandTotal}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScoreRatioConfig;
