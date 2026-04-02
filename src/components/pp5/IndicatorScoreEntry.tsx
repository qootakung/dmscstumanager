
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Printer } from 'lucide-react';
import { allSubjectGroups, SubjectGroup } from '@/data/curriculumIndicators';
import { getStudents } from '@/utils/studentStorage';
import { Student } from '@/types/student';
import { toast } from 'sonner';
import { generateEmptyRowsHtml } from '@/utils/pp5PrintUtils';

// ============ Types ============
interface IndicatorScoreEntryProps {
  subjectMenuId: string; // 'thai', 'math', 'social', 'history', etc.
  selectedGrade: string;
  selectedSemester: string;
  selectedAcademicYear: string;
  onBack: () => void;
}

interface StandardColumnGroup {
  strandName: string;
  strandIndex: number;
  standardCode: string;
  standardWeight: number; // from score ratio config
  indicators: { id: string; index: number }[];
}

interface ScoreData {
  maxScorePerIndicator: number;
  studentScores: {
    [studentId: string]: {
      indicators: { [indicatorId: string]: number };
      endYearScore: number;
    };
  };
}

// ============ Config ============
const SUBJECT_CONFIG: Record<string, { groupId: string; strandFilter?: (strandName: string) => boolean; displayName: string }> = {
  'thai': { groupId: 'thai', displayName: 'กลุ่มสาระการเรียนรู้ภาษาไทย' },
  'math': { groupId: 'math', displayName: 'กลุ่มสาระการเรียนรู้คณิตศาสตร์' },
  'science': { groupId: 'science', displayName: 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี' },
  'social': { groupId: 'social', strandFilter: (s) => !s.includes('ประวัติศาสตร์'), displayName: 'กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนาและวัฒนธรรม' },
  'history': { groupId: 'social', strandFilter: (s) => s.includes('ประวัติศาสตร์'), displayName: 'ประวัติศาสตร์' },
  'health': { groupId: 'health', displayName: 'กลุ่มสาระการเรียนรู้สุขศึกษาและพลศึกษา' },
  'art': { groupId: 'arts', displayName: 'กลุ่มสาระการเรียนรู้ศิลปะ' },
  'career': { groupId: 'career', displayName: 'กลุ่มสาระการเรียนรู้การงานอาชีพ' },
  'english': { groupId: 'english', displayName: 'กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ (ภาษาอังกฤษ)' },
};

const MAX_INDICATOR_COLS_PER_PAGE = 13;

const getStorageKey = (menuId: string, grade: string, year: string, semester: string) =>
  `pp5-indicator-scores-${menuId}-${grade}-${year}-${semester}`;

const getRatioStorageKey = (grade: string, year: string, semester: string) =>
  `pp5-score-ratio-${grade}-${year}-${semester}`;

const calculateGradeLevel = (totalScore: number): number => {
  if (totalScore >= 80) return 4;
  if (totalScore >= 75) return 3.5;
  if (totalScore >= 70) return 3;
  if (totalScore >= 65) return 2.5;
  if (totalScore >= 60) return 2;
  if (totalScore >= 55) return 1.5;
  if (totalScore >= 50) return 1;
  return 0;
};

// ============ Component ============
const IndicatorScoreEntry: React.FC<IndicatorScoreEntryProps> = ({
  subjectMenuId,
  selectedGrade,
  selectedSemester,
  selectedAcademicYear,
  onBack,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [scoreData, setScoreData] = useState<ScoreData>({ maxScorePerIndicator: 10, studentScores: {} });
  const [loading, setLoading] = useState(true);

  const config = SUBJECT_CONFIG[subjectMenuId];
  const gradeKey = selectedGrade;
  const gradeNum = gradeKey.replace('ป.', '');

  // Build column structure from curriculum data
  const columnGroups = useMemo((): StandardColumnGroup[] => {
    if (!config) return [];
    const group = allSubjectGroups.find(g => g.id === config.groupId);
    if (!group) return [];

    const groups: StandardColumnGroup[] = [];
    let strandIdx = 0;

    group.subjects.forEach(subject => {
      if (config.strandFilter && !config.strandFilter(subject.strand)) return;

      const strandName = subject.strand;
      strandIdx++;

      subject.standards.forEach(standard => {
        const indicators = standard.indicators[gradeKey];
        if (!indicators || indicators.length === 0) return;

        groups.push({
          strandName,
          strandIndex: strandIdx,
          standardCode: standard.code,
          standardWeight: 0, // will be loaded from ratio config
          indicators: indicators.map((ind, i) => ({ id: ind.id, index: i + 1 })),
        });
      });
    });

    return groups;
  }, [config, gradeKey]);

  // Load score ratios and set weights
  const columnGroupsWithWeights = useMemo(() => {
    const ratioKey = getRatioStorageKey(gradeKey, selectedAcademicYear, selectedSemester);
    const savedRatios = localStorage.getItem(ratioKey);
    let ratioMap: { [stdCode: string]: number } = {};
    let endYearWeight = 0;

    if (savedRatios) {
      try {
        const ratios = JSON.parse(savedRatios);
        const matchingGroup = ratios.find((r: any) => r.groupId === config?.groupId);
        if (matchingGroup) {
          endYearWeight = matchingGroup.endYearScore || 0;
          matchingGroup.strands.forEach((strand: any) => {
            if (config?.strandFilter && !config.strandFilter(strand.strandName)) return;
            strand.standards.forEach((std: any) => {
              ratioMap[std.standardCode] = std.score;
            });
          });
        }
      } catch (e) {
        console.error('Error loading ratios:', e);
      }
    }

    const midYearWeight = Object.values(ratioMap).reduce((sum, v) => sum + v, 0);

    return {
      groups: columnGroups.map(g => ({
        ...g,
        standardWeight: ratioMap[g.standardCode] || 0,
      })),
      midYearWeight,
      endYearWeight,
    };
  }, [columnGroups, gradeKey, selectedAcademicYear, selectedSemester, config]);

  // Load students
  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      const allStudents = await getStudents();
      const filtered = allStudents.filter(s =>
        s.grade === selectedGrade &&
        s.academicYear === selectedAcademicYear
      );
      // Deduplicate by studentId (students may exist in both semesters)
      const seen = new Set<string>();
      const unique = filtered.filter(s => {
        const key = s.studentId || s.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setStudents(filtered);
      setLoading(false);
    };
    loadStudents();
  }, [selectedGrade, selectedAcademicYear, selectedSemester]);

  // Load saved scores
  useEffect(() => {
    const key = getStorageKey(subjectMenuId, gradeKey, selectedAcademicYear, selectedSemester);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setScoreData(JSON.parse(saved));
      } catch (e) {
        setScoreData({ maxScorePerIndicator: 10, studentScores: {} });
      }
    } else {
      setScoreData({ maxScorePerIndicator: 10, studentScores: {} });
    }
  }, [subjectMenuId, gradeKey, selectedAcademicYear, selectedSemester]);

  const getScore = (studentId: string, indicatorId: string): number => {
    return scoreData.studentScores[studentId]?.indicators?.[indicatorId] ?? 0;
  };

  const getEndYearScore = (studentId: string): number => {
    return scoreData.studentScores[studentId]?.endYearScore ?? 0;
  };

  const updateScore = useCallback((studentId: string, indicatorId: string, value: number) => {
    setScoreData(prev => ({
      ...prev,
      studentScores: {
        ...prev.studentScores,
        [studentId]: {
          indicators: {
            ...(prev.studentScores[studentId]?.indicators || {}),
            [indicatorId]: value,
          },
          endYearScore: prev.studentScores[studentId]?.endYearScore ?? 0,
        },
      },
    }));
  }, []);

  const updateEndYearScore = useCallback((studentId: string, value: number) => {
    setScoreData(prev => ({
      ...prev,
      studentScores: {
        ...prev.studentScores,
        [studentId]: {
          indicators: prev.studentScores[studentId]?.indicators || {},
          endYearScore: value,
        },
      },
    }));
  }, []);

  // Calculate standard summary for a student
  const calcStandardSummary = (studentId: string, group: StandardColumnGroup): number => {
    if (group.standardWeight === 0) return 0;
    const maxPerIndicator = scoreData.maxScorePerIndicator;
    const totalMax = group.indicators.length * maxPerIndicator;
    if (totalMax === 0) return 0;
    const totalScore = group.indicators.reduce((sum, ind) => sum + getScore(studentId, ind.id), 0);
    return parseFloat(((totalScore / totalMax) * group.standardWeight).toFixed(1));
  };

  const calcMidYearTotal = (studentId: string): number => {
    return columnGroupsWithWeights.groups.reduce((sum, g) => sum + calcStandardSummary(studentId, g), 0);
  };

  const handleSave = () => {
    const key = getStorageKey(subjectMenuId, gradeKey, selectedAcademicYear, selectedSemester);
    localStorage.setItem(key, JSON.stringify(scoreData));
    toast.success(`บันทึกคะแนน ${config?.displayName || subjectMenuId} สำเร็จ`);
  };

  // ============ Print ============
  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=900,width=700');
    if (!printWindow) return;

    const { groups, midYearWeight, endYearWeight } = columnGroupsWithWeights;
    const maxScore = scoreData.maxScorePerIndicator;
    const displayName = config?.displayName || '';
    const title = `แบบประเมินนักเรียนตามตัวชี้วัด ${displayName}`;
    const subtitle = `โรงเรียนบ้านดอนมูล ชั้นประถมศึกษาปีที่ ${gradeNum} ปีการศึกษา ${selectedAcademicYear}`;

    // Paginate columns
    const pages: StandardColumnGroup[][] = [];
    let currentPage: StandardColumnGroup[] = [];
    let currentCols = 0;

    groups.forEach(g => {
      const colsNeeded = g.indicators.length + 1; // indicators + สรุป
      if (currentCols + colsNeeded > MAX_INDICATOR_COLS_PER_PAGE && currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [g];
        currentCols = colsNeeded;
      } else {
        currentPage.push(g);
        currentCols += colsNeeded;
      }
    });
    if (currentPage.length > 0) pages.push(currentPage);

    // Generate indicator pages
    let pagesHtml = '';
    pages.forEach((pageGroups, pageIdx) => {
      // Group strands for merged headers
      const strandSpans: { name: string; colspan: number }[] = [];
      let lastStrand = '';
      pageGroups.forEach(g => {
        const cols = g.indicators.length + 1;
        if (g.strandName === lastStrand) {
          strandSpans[strandSpans.length - 1].colspan += cols;
        } else {
          strandSpans.push({ name: g.strandName, colspan: cols });
          lastStrand = g.strandName;
        }
      });

      pagesHtml += `
        <div class="page">
          <div class="title">${title}</div>
          <div class="subtitle">${subtitle}</div>
          <table>
            <thead>
              <tr>
                <th rowspan="4" style="width:25px">ที่</th>
                <th rowspan="4" style="min-width:80px">ชื่อ-นามสกุล</th>
                ${strandSpans.map(s => `<th colspan="${s.colspan}">${s.name}</th>`).join('')}
              </tr>
              <tr>
                ${pageGroups.map(g => `<th colspan="${g.indicators.length + 1}">มาตรฐาน ${g.standardCode}</th>`).join('')}
              </tr>
              <tr>
                ${pageGroups.map(g =>
                  g.indicators.map(ind => `<th>${ind.index}</th>`).join('') +
                  `<th class="summary-col">สรุป</th>`
                ).join('')}
              </tr>
              <tr>
                ${pageGroups.map(g =>
                  g.indicators.map(() => `<th>${maxScore}</th>`).join('') +
                  `<th class="summary-col">${g.standardWeight.toFixed(1)}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody>
              ${students.map((student, idx) => `
                <tr class="${idx % 2 === 0 ? 'even' : ''}">
                  <td class="text-center">${idx + 1}</td>
                  <td class="name-cell">${student.titleTh || ''}${student.firstNameTh || ''} ${student.lastNameTh || ''}</td>
                  ${pageGroups.map(g => {
                    const summary = calcStandardSummary(student.id, g);
                    return g.indicators.map(ind => {
                      const score = getScore(student.id, ind.id);
                      return `<td class="text-center">${score || ''}</td>`;
                    }).join('') + `<td class="text-center summary-col">${summary.toFixed(1)}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
              ${generateEmptyRowsHtml(students.length, pageGroups.reduce((sum, g) => sum + g.indicators.length + 1, 0) + 2, true)}
            </tbody>
          </table>
        </div>
      `;
    });

    // Summary page
    const grandTotal = midYearWeight + endYearWeight;
    pagesHtml += `
      <div class="page">
        <div class="title">${title}</div>
        <div class="subtitle">${subtitle}</div>
        <table>
          <thead>
            <tr>
              <th rowspan="2" style="width:25px">ที่</th>
              <th rowspan="2" style="min-width:120px">ชื่อ-นามสกุล</th>
              <th>รวม<br/>ระหว่างปี</th>
              <th>สอบ<br/>ปลายปี</th>
              <th>รวม<br/>คะแนน<br/>ทั้งปี</th>
              <th>ระดับ</th>
            </tr>
            <tr>
              <th>${midYearWeight}</th>
              <th>${endYearWeight}</th>
              <th>${grandTotal}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${students.map((student, idx) => {
              const midYear = parseFloat(calcMidYearTotal(student.id).toFixed(1));
              const endYear = getEndYearScore(student.id);
              const total = parseFloat((midYear + endYear).toFixed(1));
              const grade = grandTotal > 0 ? calculateGradeLevel((total / grandTotal) * 100) : 0;
              return `
                <tr class="${idx % 2 === 0 ? 'even' : ''}">
                  <td class="text-center">${idx + 1}</td>
                  <td class="name-cell">${student.titleTh || ''}${student.firstNameTh || ''} ${student.lastNameTh || ''}</td>
                  <td class="text-center">${midYear.toFixed(1)}</td>
                  <td class="text-center">${endYear}</td>
                  <td class="text-center font-bold">${total.toFixed(1)}</td>
                  <td class="text-center font-bold">${grade}</td>
                </tr>
              `;
            }).join('')}
            ${generateEmptyRowsHtml(students.length, 6, true)}
          </tbody>
        </table>
      </div>
    `;

    // Semester report page
    const semesterMaxScore = grandTotal > 0 ? grandTotal / 2 : 50;
    pagesHtml += `
      <div class="page">
        <div class="title">แบบรายงานผลการเรียนภาคเรียนที่ ${selectedSemester} ${displayName}</div>
        <div class="subtitle">ชั้นประถมศึกษาปีที่ ${gradeNum} ปีการศึกษา ${selectedAcademicYear}</div>
        <table>
          <thead>
            <tr>
              <th rowspan="2" style="width:25px">ที่</th>
              <th rowspan="2" style="min-width:120px">ชื่อ-นามสกุล</th>
              <th>คะแนนเต็ม</th>
              <th>ได้</th>
            </tr>
            <tr>
              <th>${semesterMaxScore}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${students.map((student, idx) => {
              const midYear = parseFloat(calcMidYearTotal(student.id).toFixed(2));
              const endYear = getEndYearScore(student.id);
              const total = parseFloat((midYear + endYear).toFixed(2));
              const semesterScore = parseFloat((total / 2).toFixed(2));
              return `
                <tr class="${idx % 2 === 0 ? 'even' : ''}">
                  <td class="text-center">${idx + 1}</td>
                  <td class="name-cell">${student.titleTh || ''}${student.firstNameTh || ''} ${student.lastNameTh || ''}</td>
                  <td class="text-center">${semesterMaxScore}</td>
                  <td class="text-center">${semesterScore.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
            ${generateEmptyRowsHtml(students.length, 4, true)}
          </tbody>
        </table>
      </div>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'TH SarabunPSK', 'TH Sarabun', 'Sarabun', sans-serif; font-size: 14pt; }
            @page { size: A4 portrait; margin: 10mm; }
            .page { page-break-after: always; padding: 5mm 0; }
            .page:last-child { page-break-after: auto; }
            .title { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 2px; color: #00695c; }
            .subtitle { font-size: 14pt; text-align: center; margin-bottom: 8px; color: #00695c; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #333; padding: 2px 3px; font-size: 11pt; }
            th { background: #e0f2f1; text-align: center; font-weight: bold; font-size: 10pt; }
            td.text-center { text-align: center; }
            td.name-cell { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px; font-size: 11pt; }
            tr.even { background: #f5f5f5; }
            .summary-col { background: #fff9c4; font-weight: bold; }
            .font-bold { font-weight: bold; }
            @media print { body { padding: 0; } .page { padding: 0; } }
          </style>
        </head>
        <body>${pagesHtml}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // ============ Render ============
  if (!config) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> กลับ</Button>
        <Card><CardContent className="py-8 text-center text-muted-foreground">ยังไม่รองรับรายวิชานี้</CardContent></Card>
      </div>
    );
  }

  const { groups, midYearWeight, endYearWeight } = columnGroupsWithWeights;
  const grandTotalWeight = midYearWeight + endYearWeight;

  // Build strand span info for display header
  const strandSpans: { name: string; colspan: number }[] = [];
  let lastStrand = '';
  groups.forEach(g => {
    const cols = g.indicators.length + 1;
    if (g.strandName === lastStrand) {
      strandSpans[strandSpans.length - 1].colspan += cols;
    } else {
      strandSpans.push({ name: g.strandName, colspan: cols });
      lastStrand = g.strandName;
    }
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> กลับ
          </Button>
          <div>
            <h2 className="text-lg font-bold text-primary">
              แบบประเมินนักเรียนตามตัวชี้วัด {config.displayName}
            </h2>
            <p className="text-sm text-muted-foreground">
              ชั้น{gradeKey} ปีการศึกษา {selectedAcademicYear} ภาคเรียนที่ {selectedSemester}
              {midYearWeight > 0 && ` | ระหว่างปี ${midYearWeight} + ปลายปี ${endYearWeight} = ${grandTotalWeight}`}
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

      {loading ? (
        <Card><CardContent className="py-8 text-center">กำลังโหลดข้อมูล...</CardContent></Card>
      ) : students.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">ไม่พบข้อมูลนักเรียนในชั้น {gradeKey}</CardContent></Card>
      ) : groups.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">ไม่พบข้อมูลตัวชี้วัดสำหรับชั้น {gradeKey}</CardContent></Card>
      ) : (
        <>
          {/* Score Entry Table */}
          <Card className="border-2 shadow-md">
            <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-t-lg">
              <CardTitle className="text-base">ตารางกรอกคะแนนตามตัวชี้วัด (คะแนนเต็มต่อตัวชี้วัด: {scoreData.maxScorePerIndicator})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse min-w-max">
                  <thead>
                    {/* Row 1: Strand names */}
                    <tr className="bg-teal-100">
                      <th rowSpan={4} className="border border-gray-300 px-2 py-1 text-center sticky left-0 bg-teal-100 z-10 w-8">ที่</th>
                      <th rowSpan={4} className="border border-gray-300 px-2 py-1 text-left sticky left-8 bg-teal-100 z-10 min-w-[120px]">ชื่อ-นามสกุล</th>
                      {strandSpans.map((s, i) => (
                        <th key={i} colSpan={s.colspan} className="border border-gray-300 px-1 py-1 text-center bg-cyan-100 text-cyan-800 text-[10px]">
                          {s.name}
                        </th>
                      ))}
                      <th rowSpan={4} className="border border-gray-300 px-1 py-1 text-center bg-green-100 text-green-800 w-12">รวม<br/>ระหว่าง<br/>ปี</th>
                      <th rowSpan={4} className="border border-gray-300 px-1 py-1 text-center bg-orange-100 text-orange-800 w-12">สอบ<br/>ปลาย<br/>ปี</th>
                      <th rowSpan={4} className="border border-gray-300 px-1 py-1 text-center bg-red-100 text-red-800 w-12">รวม<br/>ทั้งปี</th>
                      <th rowSpan={4} className="border border-gray-300 px-1 py-1 text-center bg-purple-100 text-purple-800 w-12">ระดับ</th>
                    </tr>
                    {/* Row 2: Standard codes */}
                    <tr className="bg-teal-50">
                      {groups.map((g, i) => (
                        <th key={i} colSpan={g.indicators.length + 1} className="border border-gray-300 px-1 py-1 text-center text-[10px]">
                          {g.standardCode}
                        </th>
                      ))}
                    </tr>
                    {/* Row 3: Indicator numbers */}
                    <tr className="bg-gray-50">
                      {groups.map(g =>
                        g.indicators.map(ind => (
                          <th key={ind.id} className="border border-gray-300 px-1 py-0.5 text-center w-9 text-[10px]">{ind.index}</th>
                        )).concat([
                          <th key={`${g.standardCode}-summary`} className="border border-gray-300 px-1 py-0.5 text-center bg-yellow-50 text-[10px] w-10">สรุป</th>
                        ])
                      )}
                    </tr>
                    {/* Row 4: Max scores */}
                    <tr className="bg-gray-100">
                      {groups.map(g =>
                        g.indicators.map(ind => (
                          <th key={`max-${ind.id}`} className="border border-gray-300 px-1 py-0.5 text-center text-[10px] font-normal">{scoreData.maxScorePerIndicator}</th>
                        )).concat([
                          <th key={`max-${g.standardCode}`} className="border border-gray-300 px-1 py-0.5 text-center bg-yellow-50 text-[10px]">{g.standardWeight.toFixed(1)}</th>
                        ])
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, idx) => {
                      const midYear = parseFloat(calcMidYearTotal(student.id).toFixed(1));
                      const endYear = getEndYearScore(student.id);
                      const total = parseFloat((midYear + endYear).toFixed(1));
                      const grade = grandTotalWeight > 0 ? calculateGradeLevel((total / grandTotalWeight) * 100) : 0;

                      return (
                        <tr key={student.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-1 py-0.5 text-center sticky left-0 bg-inherit z-10 text-xs">{idx + 1}</td>
                          <td className="border border-gray-300 px-1 py-0.5 text-left sticky left-8 bg-inherit z-10 whitespace-nowrap text-xs">
                            {student.titleTh}{student.firstNameTh} {student.lastNameTh}
                          </td>
                          {groups.map(g => (
                            <React.Fragment key={g.standardCode}>
                              {g.indicators.map(ind => (
                                <td key={ind.id} className="border border-gray-300 p-0 text-center">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={scoreData.maxScorePerIndicator}
                                    value={getScore(student.id, ind.id) || ''}
                                    onChange={(e) => updateScore(student.id, ind.id, parseInt(e.target.value) || 0)}
                                    className="w-9 h-6 text-center text-xs border-0 p-0 rounded-none focus:ring-1 focus:ring-teal-400"
                                  />
                                </td>
                              ))}
                              <td className="border border-gray-300 px-1 py-0.5 text-center bg-yellow-50 font-semibold text-xs">
                                {calcStandardSummary(student.id, g).toFixed(1)}
                              </td>
                            </React.Fragment>
                          ))}
                          <td className="border border-gray-300 px-1 py-0.5 text-center bg-green-50 font-semibold text-xs">{midYear.toFixed(1)}</td>
                          <td className="border border-gray-300 p-0 text-center bg-orange-50">
                            <Input
                              type="number"
                              min={0}
                              max={endYearWeight}
                              value={endYear || ''}
                              onChange={(e) => updateEndYearScore(student.id, parseInt(e.target.value) || 0)}
                              className="w-12 h-6 text-center text-xs border-0 p-0 rounded-none focus:ring-1 focus:ring-orange-400"
                            />
                          </td>
                          <td className={`border border-gray-300 px-1 py-0.5 text-center font-bold text-xs ${total > 0 ? 'bg-red-50' : ''}`}>
                            {total.toFixed(1)}
                          </td>
                          <td className={`border border-gray-300 px-1 py-0.5 text-center font-bold text-xs ${
                            grade >= 3 ? 'text-green-700 bg-green-50' :
                            grade >= 2 ? 'text-yellow-700 bg-yellow-50' :
                            grade >= 1 ? 'text-orange-700 bg-orange-50' :
                            'text-red-700 bg-red-50'
                          }`}>
                            {grade}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Reminder about score ratio */}
          {midYearWeight === 0 && (
            <Card className="border-amber-300 bg-amber-50">
              <CardContent className="py-3 text-center text-amber-700 text-sm">
                ⚠️ ยังไม่ได้กำหนดสัดส่วนคะแนน กรุณาไปที่ "ข้อมูลพื้นฐาน → กำหนดสัดส่วนคะแนน" เพื่อกำหนดน้ำหนักคะแนนแต่ละมาตรฐานก่อน
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default IndicatorScoreEntry;
