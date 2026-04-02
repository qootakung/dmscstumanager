
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Printer } from 'lucide-react';
import { allSubjectGroups } from '@/data/curriculumIndicators';
import { getStudents } from '@/utils/studentStorage';
import { Student } from '@/types/student';

interface AchievementChartReportProps {
  selectedGrade: string;
  selectedSemester: string;
  selectedAcademicYear: string;
  onBack: () => void;
}

const ALL_SUBJECTS = [
  { menuId: 'thai', groupId: 'thai', strandFilter: undefined, shortName: 'ภาษาไทย', creditDefault: 5.0 },
  { menuId: 'math', groupId: 'math', strandFilter: undefined, shortName: 'คณิตศาสตร์', creditDefault: 5.0 },
  { menuId: 'science', groupId: 'science', strandFilter: undefined, shortName: 'วิทยาศาสตร์และเทคโนโลยี', creditDefault: 2.0 },
  { menuId: 'social', groupId: 'social', strandFilter: (s: string) => !s.includes('ประวัติศาสตร์'), shortName: 'สังคมศึกษา ศาสนาและวัฒนธรรม', creditDefault: 1.0 },
  { menuId: 'history', groupId: 'social', strandFilter: (s: string) => s.includes('ประวัติศาสตร์'), shortName: 'ประวัติศาสตร์', creditDefault: 1.0 },
  { menuId: 'health', groupId: 'health', strandFilter: undefined, shortName: 'สุขศึกษาและพลศึกษา', creditDefault: 1.0 },
  { menuId: 'art', groupId: 'arts', strandFilter: undefined, shortName: 'ศิลปะ', creditDefault: 1.0 },
  { menuId: 'career', groupId: 'career', strandFilter: undefined, shortName: 'การงานอาชีพ', creditDefault: 1.0 },
  { menuId: 'english', groupId: 'english', strandFilter: undefined, shortName: 'ภาษาอังกฤษ', creditDefault: 1.0 },
  { menuId: 'english-comm', groupId: null, strandFilter: undefined, shortName: 'ภาษาอังกฤษเพื่อการสื่อสาร', creditDefault: 1.0 },
  { menuId: 'anti-corruption', groupId: null, strandFilter: undefined, shortName: 'ป้องกันการทุจริต', creditDefault: 1.0 },
  { menuId: 'elective1', groupId: null, strandFilter: undefined, shortName: 'วิชาเพิ่มเติม 1', creditDefault: 1.0 },
  { menuId: 'elective2', groupId: null, strandFilter: undefined, shortName: 'วิชาเพิ่มเติม 2', creditDefault: 1.0 },
  { menuId: 'elective3', groupId: null, strandFilter: undefined, shortName: 'วิชาเพิ่มเติม 3', creditDefault: 1.0 },
  { menuId: 'elective4', groupId: null, strandFilter: undefined, shortName: 'วิชาเพิ่มเติม 4', creditDefault: 1.0 },
  { menuId: 'elective5', groupId: null, strandFilter: undefined, shortName: 'วิชาเพิ่มเติม 5', creditDefault: 1.0 },
];

const getScoreStorageKey = (menuId: string, grade: string, year: string, semester: string) =>
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

// Beautiful gradient colors for bar charts
const BAR_COLORS = [
  '#3B82F6', '#2563EB', '#1D4ED8', '#6366F1',
  '#8B5CF6', '#A855F7', '#EC4899', '#F43F5E',
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#14B8A6', '#06B6D4',
];

const AchievementChartReport: React.FC<AchievementChartReportProps> = ({
  selectedGrade,
  selectedSemester,
  selectedAcademicYear,
  onBack,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const gradeKey = selectedGrade;
  const gradeNum = gradeKey.replace('ป.', '');

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      const allStudents = await getStudents();
      const filtered = allStudents.filter(s =>
        s.grade === selectedGrade && s.academicYear === selectedAcademicYear
      );
      setStudents(filtered);
      setLoading(false);
    };
    loadStudents();
  }, [selectedGrade, selectedAcademicYear, selectedSemester]);

  // Calculate subject averages and per-student averages
  const { subjectAverages, studentAverages } = useMemo(() => {
    if (students.length === 0) return { subjectAverages: [], studentAverages: [] };

    const ratioKey = getRatioStorageKey(gradeKey, selectedAcademicYear, selectedSemester);
    const savedRatios = localStorage.getItem(ratioKey);
    let ratioData: any[] = [];
    if (savedRatios) {
      try { ratioData = JSON.parse(savedRatios); } catch {}
    }

    // Calculate per subject per student scores
    const subjectData = ALL_SUBJECTS.map(subject => {
      const scoreKey = getScoreStorageKey(subject.menuId, gradeKey, selectedAcademicYear, selectedSemester);
      const saved = localStorage.getItem(scoreKey);
      let scoreData = { maxScorePerIndicator: 10, studentScores: {} as any };
      if (saved) {
        try { scoreData = JSON.parse(saved); } catch {}
      }

      let midYearWeight = 0;
      let endYearWeight = 0;
      let standardWeights: Record<string, number> = {};

      if (subject.groupId) {
        const matchingGroup = ratioData.find((r: any) => r.groupId === subject.groupId);
        if (matchingGroup) {
          endYearWeight = matchingGroup.endYearScore || 0;
          matchingGroup.strands?.forEach((strand: any) => {
            if (subject.strandFilter && !subject.strandFilter(strand.strandName)) return;
            strand.standards?.forEach((std: any) => {
              standardWeights[std.standardCode] = std.score;
              midYearWeight += std.score;
            });
          });
        }
      }

      const grandTotalWeight = midYearWeight + endYearWeight;

      const group = subject.groupId ? allSubjectGroups.find(g => g.id === subject.groupId) : null;
      const indicatorGroups: { standardCode: string; weight: number; indicators: { id: string }[] }[] = [];
      if (group) {
        group.subjects.forEach(sub => {
          if (subject.strandFilter && !subject.strandFilter(sub.strand)) return;
          sub.standards.forEach(standard => {
            const indicators = standard.indicators[gradeKey];
            if (!indicators || indicators.length === 0) return;
            indicatorGroups.push({
              standardCode: standard.code,
              weight: standardWeights[standard.code] || 0,
              indicators: indicators.map(ind => ({ id: ind.id })),
            });
          });
        });
      }

      const studentScores: Record<string, number> = {};
      students.forEach(student => {
        const scores = scoreData.studentScores[student.id];
        if (!scores) {
          studentScores[student.id] = 0;
          return;
        }

        let midYearTotal = 0;
        indicatorGroups.forEach(ig => {
          if (ig.weight === 0) return;
          const totalMax = ig.indicators.length * scoreData.maxScorePerIndicator;
          if (totalMax === 0) return;
          const totalScore = ig.indicators.reduce((sum, ind) => {
            return sum + (scores.indicators?.[ind.id] ?? 0);
          }, 0);
          midYearTotal += (totalScore / totalMax) * ig.weight;
        });

        const endYear = scores.endYearScore ?? 0;
        const total = midYearTotal + endYear;
        const score100 = grandTotalWeight > 0 ? (total / grandTotalWeight) * 100 : 0;
        studentScores[student.id] = parseFloat(score100.toFixed(2));
      });

      // Average for this subject
      const allScores = students.map(s => studentScores[s.id] || 0);
      const avg = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;

      return {
        shortName: subject.shortName,
        avg: parseFloat(avg.toFixed(1)),
        studentScores,
      };
    });

    // Per-student overall average
    const stAvgs = students.map(student => {
      const scores = subjectData.map(sd => sd.studentScores[student.id] || 0);
      const validScores = scores.filter(s => s > 0);
      const avg = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;
      return {
        student,
        avg: parseFloat(avg.toFixed(2)),
      };
    });

    return {
      subjectAverages: subjectData.map(sd => ({ name: sd.shortName, avg: sd.avg })),
      studentAverages: stAvgs,
    };
  }, [students, gradeKey, selectedAcademicYear, selectedSemester]);

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=900,width=700');
    if (!printWindow) return;

    const titlePage1 = `แผนภูมิแสดงคะแนนเฉลี่ยของนักเรียนทั้งชั้นแยกเป็นกลุ่มสาระการเรียนรู้`;
    const subtitlePage1 = `ชั้นประถมศึกษาปีที่ ${gradeNum} ปีการศึกษา ${selectedAcademicYear}`;
    const titlePage2 = `แผนภูมิแสดงคะแนนเฉลี่ยทุกกลุ่มสาระการเรียนรู้ของนักเรียนแยกเป็นรายบุคคล`;

    // Generate SVG bar chart for subjects
    const svgSubject = generateBarChartSVG(
      subjectAverages.map((s, i) => ({ label: `${i + 1}`, value: s.avg })),
      'คะแนนเฉลี่ยทั้งชั้นแยกตามกลุ่มสาระการเรียนรู้',
      680, 360
    );

    // Generate SVG bar chart for students
    const svgStudent = generateBarChartSVG(
      studentAverages.map((s, i) => ({
        label: `${i + 1}`,
        value: s.avg,
      })),
      'คะแนนเฉลี่ยรายบุคคล',
      680, 360
    );

    // Legend table (2 columns, 8 rows)
    const legendRows = [];
    const half = Math.ceil(ALL_SUBJECTS.length / 2);
    for (let i = 0; i < half; i++) {
      const left = ALL_SUBJECTS[i];
      const right = ALL_SUBJECTS[i + half];
      legendRows.push(`
        <tr>
          <td style="padding:2px 8px; font-size:14px;">${i + 1} = ${left?.shortName || ''}</td>
          <td style="padding:2px 8px; font-size:14px;">${right ? `${i + half + 1} = ${right.shortName}` : ''}</td>
        </tr>
      `);
    }

    // Student legend for page 2
    const studentLegendRows = [];
    const stHalf = Math.ceil(studentAverages.length / 2);
    for (let i = 0; i < stHalf; i++) {
      const left = studentAverages[i];
      const right = studentAverages[i + stHalf];
      const leftName = left ? `${left.student.titleTh || ''}${left.student.firstNameTh || ''} ${left.student.lastNameTh || ''}` : '';
      const rightName = right ? `${right.student.titleTh || ''}${right.student.firstNameTh || ''} ${right.student.lastNameTh || ''}` : '';
      studentLegendRows.push(`
        <tr>
          <td style="padding:1px 6px; font-size:13px;">${i + 1} = ${leftName}</td>
          <td style="padding:1px 6px; font-size:13px;">${right ? `${i + stHalf + 1} = ${rightName}` : ''}</td>
        </tr>
      `);
    }

    printWindow.document.write(`
      <html>
      <head>
        <title>แผนภูมิผลสัมฤทธิ์ทางการเรียน</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'TH SarabunPSK', 'TH Sarabun', 'Sarabun', sans-serif; }
          @page { size: A4 portrait; margin: 12mm; }
          .page { width: 100%; min-height: 257mm; page-break-after: always; display: flex; flex-direction: column; align-items: center; padding: 10mm 5mm; }
          .page:last-child { page-break-after: auto; }
          .page-title { 
            text-align: center; font-size: 18px; font-weight: bold;
            background: linear-gradient(135deg, #dbeafe, #e0f2fe);
            border: 2px solid #60a5fa; border-radius: 8px;
            padding: 8px 20px; margin-bottom: 12px; width: 100%;
            color: #1e40af;
          }
          .chart-container {
            border: 2px solid #94a3b8; border-radius: 10px;
            padding: 12px; margin: 8px 0; width: 100%;
            background: linear-gradient(180deg, #fefce8 0%, #fffbeb 50%, #fef3c7 100%);
          }
          .legend-container {
            border: 2px solid #94a3b8; border-radius: 8px;
            padding: 10px 16px; margin: 8px 0; width: 90%;
            background: #fff7ed;
          }
          .legend-title {
            text-align: center; font-weight: bold; font-size: 16px;
            margin-bottom: 6px; color: #1e3a5f;
          }
          .legend-table { width: 100%; border-collapse: collapse; }
          .legend-table td { vertical-align: top; width: 50%; }
          @media print {
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        </style>
      </head>
      <body>
        <!-- Page 1: Subject Average Chart -->
        <div class="page">
          <div class="page-title">
            ${titlePage1}<br/>${subtitlePage1}
          </div>
          <div class="chart-container">
            ${svgSubject}
          </div>
          <div class="legend-container">
            <div class="legend-title">กลุ่มสาระการเรียนรู้</div>
            <table class="legend-table">
              ${legendRows.join('')}
            </table>
          </div>
        </div>

        <!-- Page 2: Individual Student Average Chart -->
        <div class="page">
          <div class="page-title">
            ${titlePage2}<br/>${subtitlePage1}
          </div>
          <div class="chart-container">
            ${svgStudent}
          </div>
          <div class="legend-container">
            <div class="legend-title">รายชื่อนักเรียน</div>
            <table class="legend-table">
              ${studentLegendRows.join('')}
            </table>
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 800);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">กำลังโหลดข้อมูล...</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> กลับ
        </Button>
        <h2 className="text-xl font-bold">แผนภูมิผลสัมฤทธิ์ทางการเรียน</h2>
        <div className="ml-auto">
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="w-4 h-4 mr-2" /> พิมพ์ A4
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-lg">
            แผนภูมิแสดงคะแนนเฉลี่ยของนักเรียนทั้งชั้นแยกเป็นกลุ่มสาระการเรียนรู้
            <div className="text-base font-normal text-muted-foreground">
              ชั้นประถมศึกษาปีที่ {gradeNum} ปีการศึกษา {selectedAcademicYear}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <SubjectBarChart data={subjectAverages} />
          </div>
          <div className="mt-4 border rounded-lg p-4 bg-orange-50">
            <h4 className="text-center font-bold mb-2">กลุ่มสาระการเรียนรู้</h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              {ALL_SUBJECTS.map((s, i) => (
                <div key={s.menuId}>{i + 1} = {s.shortName}</div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-lg">
            แผนภูมิแสดงคะแนนเฉลี่ยทุกกลุ่มสาระการเรียนรู้ของนักเรียนแยกเป็นรายบุคคล
            <div className="text-base font-normal text-muted-foreground">
              ชั้นประถมศึกษาปีที่ {gradeNum} ปีการศึกษา {selectedAcademicYear}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <StudentBarChart data={studentAverages} />
          </div>
          <div className="mt-4 border rounded-lg p-4 bg-blue-50">
            <h4 className="text-center font-bold mb-2">รายชื่อนักเรียน</h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              {studentAverages.map((s, i) => (
                <div key={s.student.id}>
                  {i + 1} = {s.student.titleTh}{s.student.firstNameTh} {s.student.lastNameTh}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ---- SVG Bar Chart Components (React) ----

interface SubjectBarChartProps {
  data: { name: string; avg: number }[];
}

const SubjectBarChart: React.FC<SubjectBarChartProps> = ({ data }) => {
  const width = 700;
  const height = 350;
  const marginLeft = 50;
  const marginRight = 20;
  const marginTop = 30;
  const marginBottom = 50;
  const chartW = width - marginLeft - marginRight;
  const chartH = height - marginTop - marginBottom;
  const maxVal = 100;
  const barW = Math.min(chartW / data.length * 0.7, 40);
  const gap = chartW / data.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[700px] mx-auto" style={{ background: 'linear-gradient(180deg, #fefce8, #fffbeb, #fef3c7)', borderRadius: 10 }}>
      {/* Grid lines */}
      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(v => {
        const y = marginTop + chartH - (v / maxVal) * chartH;
        return (
          <g key={v}>
            <line x1={marginLeft} y1={y} x2={marginLeft + chartW} y2={y} stroke="#d1d5db" strokeWidth={0.5} />
            <text x={marginLeft - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#6b7280">{v.toFixed(1)}</text>
          </g>
        );
      })}
      {/* Bars */}
      {data.map((d, i) => {
        const x = marginLeft + i * gap + gap / 2 - barW / 2;
        const barH = (d.avg / maxVal) * chartH;
        const y = marginTop + chartH - barH;
        const color = BAR_COLORS[i % BAR_COLORS.length];
        return (
          <g key={i}>
            <defs>
              <linearGradient id={`bar-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={color} stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <rect x={x} y={y} width={barW} height={barH} fill={`url(#bar-grad-${i})`} rx={3} />
            <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#1e3a5f">{d.avg > 0 ? d.avg : ''}</text>
            <text x={x + barW / 2} y={marginTop + chartH + 16} textAnchor="middle" fontSize={11} fill="#374151">{i + 1}</text>
          </g>
        );
      })}
      {/* Axes */}
      <line x1={marginLeft} y1={marginTop} x2={marginLeft} y2={marginTop + chartH} stroke="#374151" strokeWidth={1.5} />
      <line x1={marginLeft} y1={marginTop + chartH} x2={marginLeft + chartW} y2={marginTop + chartH} stroke="#374151" strokeWidth={1.5} />
      {/* X axis label */}
      <text x={marginLeft + chartW / 2} y={height - 5} textAnchor="middle" fontSize={13} fill="#374151" fontWeight="bold">กลุ่มสาระการเรียนรู้</text>
    </svg>
  );
};

interface StudentBarChartProps {
  data: { student: Student; avg: number }[];
}

const StudentBarChart: React.FC<StudentBarChartProps> = ({ data }) => {
  const width = 700;
  const height = 350;
  const marginLeft = 50;
  const marginRight = 20;
  const marginTop = 30;
  const marginBottom = 50;
  const chartW = width - marginLeft - marginRight;
  const chartH = height - marginTop - marginBottom;
  const maxVal = 100;
  const barW = Math.min(chartW / Math.max(data.length, 1) * 0.7, 30);
  const gap = chartW / Math.max(data.length, 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[700px] mx-auto" style={{ background: 'linear-gradient(180deg, #eff6ff, #dbeafe, #bfdbfe)', borderRadius: 10 }}>
      {/* Grid lines */}
      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(v => {
        const y = marginTop + chartH - (v / maxVal) * chartH;
        return (
          <g key={v}>
            <line x1={marginLeft} y1={y} x2={marginLeft + chartW} y2={y} stroke="#93c5fd" strokeWidth={0.5} />
            <text x={marginLeft - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#6b7280">{v.toFixed(2)}</text>
          </g>
        );
      })}
      {/* Bars */}
      {data.map((d, i) => {
        const x = marginLeft + i * gap + gap / 2 - barW / 2;
        const barH = (d.avg / maxVal) * chartH;
        const y = marginTop + chartH - barH;
        return (
          <g key={i}>
            <defs>
              <linearGradient id={`st-bar-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <rect x={x} y={y} width={barW} height={barH} fill={`url(#st-bar-grad-${i})`} rx={2} />
            {data.length <= 25 && (
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#1e3a5f">{d.avg > 0 ? d.avg.toFixed(1) : ''}</text>
            )}
            <text x={x + barW / 2} y={marginTop + chartH + 14} textAnchor="middle" fontSize={10} fill="#374151">{i + 1}</text>
          </g>
        );
      })}
      {/* Axes */}
      <line x1={marginLeft} y1={marginTop} x2={marginLeft} y2={marginTop + chartH} stroke="#374151" strokeWidth={1.5} />
      <line x1={marginLeft} y1={marginTop + chartH} x2={marginLeft + chartW} y2={marginTop + chartH} stroke="#374151" strokeWidth={1.5} />
      <text x={marginLeft + chartW / 2} y={height - 5} textAnchor="middle" fontSize={13} fill="#374151" fontWeight="bold">ลำดับที่นักเรียน</text>
    </svg>
  );
};

// ---- SVG generation for print (string) ----

function generateBarChartSVG(
  data: { label: string; value: number }[],
  title: string,
  svgWidth: number,
  svgHeight: number,
): string {
  const marginLeft = 50;
  const marginRight = 20;
  const marginTop = 35;
  const marginBottom = 45;
  const chartW = svgWidth - marginLeft - marginRight;
  const chartH = svgHeight - marginTop - marginBottom;
  const maxVal = 100;
  const barW = Math.min(chartW / Math.max(data.length, 1) * 0.7, 38);
  const gap = chartW / Math.max(data.length, 1);

  let gridLines = '';
  for (let v = 0; v <= 100; v += 10) {
    const y = marginTop + chartH - (v / maxVal) * chartH;
    gridLines += `<line x1="${marginLeft}" y1="${y}" x2="${marginLeft + chartW}" y2="${y}" stroke="#d1d5db" stroke-width="0.5"/>`;
    gridLines += `<text x="${marginLeft - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#6b7280">${v.toFixed(1)}</text>`;
  }

  let bars = '';
  data.forEach((d, i) => {
    const x = marginLeft + i * gap + gap / 2 - barW / 2;
    const barH = (d.value / maxVal) * chartH;
    const y = marginTop + chartH - barH;
    const color = BAR_COLORS[i % BAR_COLORS.length];
    bars += `
      <defs><linearGradient id="pg-${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity="0.9"/><stop offset="100%" stop-color="${color}" stop-opacity="0.6"/></linearGradient></defs>
      <rect x="${x}" y="${y}" width="${barW}" height="${barH}" fill="url(#pg-${i})" rx="3"/>
      <text x="${x + barW / 2}" y="${y - 4}" text-anchor="middle" font-size="10" font-weight="bold" fill="#1e3a5f">${d.value > 0 ? d.value : ''}</text>
      <text x="${x + barW / 2}" y="${marginTop + chartH + 14}" text-anchor="middle" font-size="10" fill="#374151">${d.label}</text>
    `;
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" style="font-family:'TH SarabunPSK','Sarabun',sans-serif">
      <text x="${svgWidth / 2}" y="18" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e3a5f">${title}</text>
      ${gridLines}
      ${bars}
      <line x1="${marginLeft}" y1="${marginTop}" x2="${marginLeft}" y2="${marginTop + chartH}" stroke="#374151" stroke-width="1.5"/>
      <line x1="${marginLeft}" y1="${marginTop + chartH}" x2="${marginLeft + chartW}" y2="${marginTop + chartH}" stroke="#374151" stroke-width="1.5"/>
    </svg>
  `;
}

export default AchievementChartReport;
