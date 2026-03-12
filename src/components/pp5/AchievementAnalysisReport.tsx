
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Printer } from 'lucide-react';
import { allSubjectGroups } from '@/data/curriculumIndicators';
import { getStudents } from '@/utils/studentStorage';
import { Student } from '@/types/student';

interface AchievementAnalysisReportProps {
  selectedGrade: string;
  selectedSemester: string;
  selectedAcademicYear: string;
  onBack: () => void;
}

const SUBJECT_CONFIG: {
  menuId: string;
  groupId: string | null;
  strandFilter?: (s: string) => boolean;
  displayName: string;
}[] = [
  { menuId: 'thai', groupId: 'thai', displayName: 'กลุ่มสาระการเรียนรู้ภาษาไทย' },
  { menuId: 'math', groupId: 'math', displayName: 'กลุ่มสาระการเรียนรู้คณิตศาสตร์' },
  { menuId: 'science', groupId: 'science', displayName: 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี' },
  { menuId: 'social', groupId: 'social', strandFilter: (s) => !s.includes('ประวัติศาสตร์'), displayName: 'กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนาและวัฒนธรรม' },
  { menuId: 'history', groupId: 'social', strandFilter: (s) => s.includes('ประวัติศาสตร์'), displayName: 'ประวัติศาสตร์' },
  { menuId: 'health', groupId: 'health', displayName: 'กลุ่มสาระการเรียนรู้สุขศึกษาและพลศึกษา' },
  { menuId: 'art', groupId: 'arts', displayName: 'กลุ่มสาระการเรียนรู้ศิลปะ' },
  { menuId: 'career', groupId: 'career', displayName: 'กลุ่มสาระการเรียนรู้การงานอาชีพ' },
  { menuId: 'english', groupId: 'english', displayName: 'กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ (ภาษาอังกฤษ)' },
];

const getScoreStorageKey = (menuId: string, grade: string, year: string, semester: string) =>
  `pp5-indicator-scores-${menuId}-${grade}-${year}-${semester}`;
const getRatioStorageKey = (grade: string, year: string, semester: string) =>
  `pp5-score-ratio-${grade}-${year}-${semester}`;

interface StrandAnalysis {
  index: number;
  name: string;
  avgPercent: number;
  cv: number;
}

interface SubjectAnalysis {
  displayName: string;
  avgPercent: number;
  cv: number;
  totalStudents: number;
  groupImprove: number;
  groupFair: number;
  groupGood: number;
  percentImprove: number;
  percentFair: number;
  percentGood: number;
  strands: StrandAnalysis[];
  overallAvg: number;
  overallCV: number;
  lowestStrand: StrandAnalysis | null;
}

const calculateCV = (scores: number[]): number => {
  if (scores.length <= 1) return 0;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  if (mean === 0) return 0;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  const sd = Math.sqrt(variance);
  return (sd / mean) * 100;
};

const AchievementAnalysisReport: React.FC<AchievementAnalysisReportProps> = ({
  selectedGrade, selectedSemester, selectedAcademicYear, onBack
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const gradeKey = selectedGrade;
  const gradeNum = gradeKey.replace('ป.', '');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const all = await getStudents();
      setStudents(all.filter(s => s.grade === selectedGrade && s.academicYear === selectedAcademicYear && s.semester === selectedSemester));
      setLoading(false);
    };
    load();
  }, [selectedGrade, selectedAcademicYear, selectedSemester]);

  const subjectAnalyses = useMemo(() => {
    if (students.length === 0) return [];

    const ratioKey = getRatioStorageKey(gradeKey, selectedAcademicYear, selectedSemester);
    const savedRatios = localStorage.getItem(ratioKey);
    let ratioData: any[] = [];
    if (savedRatios) { try { ratioData = JSON.parse(savedRatios); } catch {} }

    return SUBJECT_CONFIG.map(subject => {
      if (!subject.groupId) return null;

      const scoreKey = getScoreStorageKey(subject.menuId, gradeKey, selectedAcademicYear, selectedSemester);
      const saved = localStorage.getItem(scoreKey);
      let scoreData = { maxScorePerIndicator: 10, studentScores: {} as any };
      if (saved) { try { scoreData = JSON.parse(saved); } catch {} }

      const group = allSubjectGroups.find(g => g.id === subject.groupId);
      if (!group) return null;

      const matchingRatio = ratioData.find((r: any) => r.groupId === subject.groupId);
      let endYearWeight = matchingRatio?.endYearScore || 0;
      const standardWeights: Record<string, number> = {};
      let midYearWeight = 0;

      matchingRatio?.strands?.forEach((strand: any) => {
        if (subject.strandFilter && !subject.strandFilter(strand.strandName)) return;
        strand.standards?.forEach((std: any) => {
          standardWeights[std.standardCode] = std.score;
          midYearWeight += std.score;
        });
      });

      const grandTotalWeight = midYearWeight + endYearWeight;

      // Build strand info
      const strandInfos: { strandName: string; standards: { code: string; weight: number; indicators: { id: string }[] }[] }[] = [];
      group.subjects.forEach(sub => {
        if (subject.strandFilter && !subject.strandFilter(sub.strand)) return;
        const existing = strandInfos.find(s => s.strandName === sub.strand);
        const entry = existing || { strandName: sub.strand, standards: [] };
        if (!existing) strandInfos.push(entry);
        sub.standards.forEach(standard => {
          const indicators = standard.indicators[gradeKey];
          if (!indicators || indicators.length === 0) return;
          entry.standards.push({
            code: standard.code,
            weight: standardWeights[standard.code] || 0,
            indicators: indicators.map(ind => ({ id: ind.id })),
          });
        });
      });

      // Per-student total score (as percent)
      const studentScores100: number[] = [];
      const strandScoresPerStudent: Record<string, number[]> = {};
      strandInfos.forEach(si => { strandScoresPerStudent[si.strandName] = []; });

      students.forEach(student => {
        const scores = scoreData.studentScores[student.id];
        if (!scores) {
          studentScores100.push(0);
          strandInfos.forEach(si => strandScoresPerStudent[si.strandName].push(0));
          return;
        }

        let totalMid = 0;
        strandInfos.forEach(si => {
          let strandWeightedScore = 0;
          let strandTotalWeight = 0;
          si.standards.forEach(std => {
            if (std.weight === 0) return;
            const totalMax = std.indicators.length * scoreData.maxScorePerIndicator;
            if (totalMax === 0) return;
            const totalScore = std.indicators.reduce((sum, ind) => sum + (scores.indicators?.[ind.id] ?? 0), 0);
            const pct = (totalScore / totalMax) * 100;
            strandWeightedScore += pct * std.weight;
            strandTotalWeight += std.weight;
            totalMid += (totalScore / totalMax) * std.weight;
          });
          const strandPct = strandTotalWeight > 0 ? strandWeightedScore / strandTotalWeight : 0;
          strandScoresPerStudent[si.strandName].push(strandPct);
        });

        const endYear = scores.endYearScore ?? 0;
        const total = totalMid + endYear;
        const score100 = grandTotalWeight > 0 ? (total / grandTotalWeight) * 100 : 0;
        studentScores100.push(parseFloat(score100.toFixed(2)));
      });

      const avgPercent = studentScores100.length > 0 ? studentScores100.reduce((a, b) => a + b, 0) / studentScores100.length : 0;
      const cv = calculateCV(studentScores100);

      // Classify students
      const groupGood = studentScores100.filter(s => s >= 60).length;
      const groupFair = studentScores100.filter(s => s >= 40 && s < 60).length;
      const groupImprove = studentScores100.filter(s => s < 40).length;
      const total = students.length;

      // Per-strand analysis
      const strands: StrandAnalysis[] = strandInfos.map((si, idx) => {
        const scores = strandScoresPerStudent[si.strandName];
        const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        // Extract short strand name (remove "สาระที่ X ")
        const shortName = si.strandName.replace(/^สาระที่\s*\d+\s*/, '').trim() || si.strandName;
        return {
          index: idx + 1,
          name: shortName,
          avgPercent: parseFloat(avg.toFixed(2)),
          cv: parseFloat(calculateCV(scores).toFixed(2)),
        };
      });

      // Sort by avg to find development priority
      const sortedStrands = [...strands].sort((a, b) => a.avgPercent - b.avgPercent);
      sortedStrands.forEach((s, i) => { s.index = i + 1; }); // re-index by priority

      // Assign development ranking
      const strandWithRank = strands.map(s => ({
        ...s,
        index: sortedStrands.findIndex(ss => ss.name === s.name) + 1,
      }));

      const overallAvg = strands.length > 0 ? strands.reduce((a, b) => a + b.avgPercent, 0) / strands.length : 0;
      const overallCV = strands.length > 0 ? strands.reduce((a, b) => a + b.cv, 0) / strands.length : 0;

      const lowestStrand = sortedStrands.length > 0 ? sortedStrands[0] : null;

      return {
        displayName: subject.displayName,
        avgPercent: parseFloat(avgPercent.toFixed(2)),
        cv: parseFloat(cv.toFixed(2)),
        totalStudents: total,
        groupImprove,
        groupFair,
        groupGood,
        percentImprove: total > 0 ? parseFloat(((groupImprove / total) * 100).toFixed(2)) : 0,
        percentFair: total > 0 ? parseFloat(((groupFair / total) * 100).toFixed(2)) : 0,
        percentGood: total > 0 ? parseFloat(((groupGood / total) * 100).toFixed(2)) : 0,
        strands: strandWithRank,
        overallAvg: parseFloat(overallAvg.toFixed(2)),
        overallCV: parseFloat(overallCV.toFixed(2)),
        lowestStrand,
      } as SubjectAnalysis;
    }).filter(Boolean) as SubjectAnalysis[];
  }, [students, gradeKey, selectedAcademicYear, selectedSemester]);

  const handlePrint = () => {
    const pw = window.open('', '', 'height=900,width=700');
    if (!pw) return;

    const pages = subjectAnalyses.map((subj, pageIdx) => {
      const strandRows = subj.strands.map((s, i) => `
        <tr>
          <td style="padding:4px 8px; text-align:left;">${i + 1} ${s.name}</td>
          <td style="padding:4px 8px; text-align:center;">-</td>
          <td style="padding:4px 8px; text-align:center;">-</td>
          <td style="padding:4px 8px; text-align:center;">${s.avgPercent.toFixed(2)}</td>
          <td style="padding:4px 8px; text-align:center;">${s.cv.toFixed(2)}</td>
          <td style="padding:4px 8px; text-align:center;">${s.index}</td>
        </tr>
      `).join('');

      const lowestName = subj.lowestStrand ? subj.lowestStrand.name : '-';
      const lowestIdx = subj.lowestStrand ? subj.strands.findIndex(s => s.name === subj.lowestStrand!.name) + 1 : 0;
      const lowestAvg = subj.lowestStrand ? subj.lowestStrand.avgPercent.toFixed(2) : '0';

      // Extract short subject name for analysis text
      const shortSubjectName = subj.displayName.replace('กลุ่มสาระการเรียนรู้', '').trim();

      return `
        <div class="page" style="${pageIdx < subjectAnalyses.length - 1 ? 'page-break-after: always;' : ''}">
          <div style="text-align:center; margin-bottom:8px; line-height:1.2;">
            <div style="font-size:16pt; font-weight:bold;">วิเคราะห์ผลสัมฤทธิ์ทางการเรียน</div>
            <div style="font-size:16pt; font-weight:bold;">${subj.displayName}</div>
            <div style="font-size:16pt; font-weight:bold;">ชั้นประถมศึกษาปีที่ ${gradeNum} ปีการศึกษา ${selectedAcademicYear}</div>
            <div style="font-size:14pt;">โรงเรียนบ้านดอนมูล</div>
            <div style="font-size:14pt;">ศูนย์พัฒนาคุณภาพการศึกษา</div>
            <div style="font-size:14pt;">สำนักงานเขตพื้นที่การศึกษาประถมศึกษาลำพูน เขต 2</div>
          </div>

          <!-- ตารางผลการทดสอบ -->
          <table style="width:100%; border-collapse:collapse; margin-bottom:8px; font-size:14pt;">
            <thead>
              <tr>
                <th rowspan="2" style="border:1px solid #000; padding:2px 6px; text-align:left; width:28%;">ผลการทดสอบ</th>
                <th rowspan="2" style="border:1px solid #000; padding:2px 6px; text-align:center; width:14%;">เฉลี่ยร้อยละ</th>
                <th rowspan="2" style="border:1px solid #000; padding:2px 6px; text-align:center; width:10%;">C.V.</th>
                <th colspan="3" style="border:1px solid #000; padding:2px 6px; text-align:center;">ร้อยละนักเรียนตามเกณฑ์ประเมิน</th>
              </tr>
              <tr>
                <th style="border:1px solid #000; padding:2px 6px; text-align:center; width:16%;">ปรับปรุง</th>
                <th style="border:1px solid #000; padding:2px 6px; text-align:center; width:16%;">พอใช้</th>
                <th style="border:1px solid #000; padding:2px 6px; text-align:center; width:16%;">ดี</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border:1px solid #000; padding:2px 6px; text-align:center;">ข้อสอบระดับโรงเรียน</td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:center;">${subj.avgPercent.toFixed(2)}</td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:center;">${subj.cv.toFixed(2)}</td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:center;">${subj.percentImprove.toFixed(2)}</td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:center;">${subj.percentFair.toFixed(2)}</td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:center;">${subj.percentGood.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="border:1px solid #000; padding:2px 6px; text-align:right;">จำนวนนักเรียนที่อยู่ในกลุ่มปรับปรุง</td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:center;">${subj.groupImprove}</td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:left;">คน</td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:left;">คิดเป็นจำนวนร้อยละ</td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:center;">${subj.percentImprove.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="border:1px solid #000; padding:2px 6px; text-align:right;">พอใช้</td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:center;">${subj.groupFair}</td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:left;">คน</td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:left;">คิดเป็นจำนวนร้อยละ</td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:center;">${subj.percentFair.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="border:1px solid #000; padding:2px 6px; text-align:right;">ดี</td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:center;">${subj.groupGood}</td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:left;">คน</td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:left;">คิดเป็นจำนวนร้อยละ</td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:center;">${subj.percentGood.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <!-- ตารางสาระการเรียนรู้ -->
          <table style="width:100%; border-collapse:collapse; margin-bottom:8px; font-size:14pt;">
            <thead>
              <tr>
                <th rowspan="2" style="border:1px solid #000; padding:2px 6px; text-align:left; width:30%;">สาระการเรียนรู้</th>
                <th colspan="2" style="border:1px solid #000; padding:2px 6px; text-align:center;">ระดับศูนย์ฯ</th>
                <th colspan="2" style="border:1px solid #000; padding:2px 6px; text-align:center;">ระดับชั้น</th>
                <th rowspan="2" style="border:1px solid #000; padding:2px 6px; text-align:center; width:12%;">ลำดับที่<br/>การพัฒนา</th>
              </tr>
              <tr>
                <th style="border:1px solid #000; padding:2px 6px; text-align:center;">เฉลี่ยร้อยละ</th>
                <th style="border:1px solid #000; padding:2px 6px; text-align:center;">C.V.</th>
                <th style="border:1px solid #000; padding:2px 6px; text-align:center;">เฉลี่ยร้อยละ</th>
                <th style="border:1px solid #000; padding:2px 6px; text-align:center;">C.V.</th>
              </tr>
            </thead>
            <tbody>
              ${strandRows}
              <tr style="font-weight:bold;">
                <td style="border:1px solid #000; padding:2px 6px; text-align:right;">ค่าเฉลี่ย</td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:center;"></td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:center;"></td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:center; font-weight:bold;">${subj.overallAvg.toFixed(2)}</td>
                <td style="border:1px solid #000; padding:2px 6px; text-align:center; font-weight:bold;">${subj.overallCV.toFixed(2)}</td>
                <td style="border:1px solid #000; padding:2px 6px;"></td>
              </tr>
            </tbody>
          </table>

          <!-- ผลการวิเคราะห์ข้อมูล -->
          <div style="font-size:16pt; line-height:1.2; margin-top:10px;">
            <p style="font-weight:bold; margin:0 0 2px 0;">ผลการวิเคราะห์ข้อมูล</p>
            <p style="text-indent:2.5cm; margin:0;">ผลการประเมินคุณภาพการศึกษาขั้นพื้นฐาน ชั้นประถมศึกษาปีที่ ${gradeNum} ปีการศึกษา ${selectedAcademicYear} ในสำนักงานเขตพื้นที่การศึกษาประถมศึกษาลำพูน เขต 2 พบว่านักเรียนมีค่าคะแนนเฉลี่ยทุกสาระการเรียนรู้ร้อยละ ${subj.overallAvg.toFixed(2)} และค่าเฉลี่ยสัมประสิทธิ์การกระจาย (C.V.) เท่ากับ ${subj.overallCV.toFixed(2)}</p>
            <p style="text-indent:2.5cm; margin:0;">เมื่อวิเคราะห์ผลการเรียนรู้เป็นรายสาระการเรียนรู้ พบว่า ค่าคะแนนเฉลี่ยสาระการเรียนรู้ที่มีค่าน้อยที่สุด คือ สาระที่ ${lowestIdx} ${lowestName} มีค่าเฉลี่ยร้อยละ ${lowestAvg}</p>
            <p style="text-indent:2.5cm; margin:0;">ดังนั้นใน${subj.displayName} จึงควรพัฒนาการเรียนการสอนในสาระการเรียนรู้ ที่มีค่าเฉลี่ยร้อยละน้อยที่สุดเป็นอันดับแรกคือ สาระที่ ${lowestIdx} ${lowestName} ซึ่งมีค่าเฉลี่ยร้อยละ ${lowestAvg}</p>
          </div>
        </div>
      `;
    }).join('');

    pw.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>วิเคราะห์ผลสัมฤทธิ์ทางการเรียน</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:'TH SarabunPSK','TH Sarabun','Sarabun',sans-serif; font-size:16pt; }
          @page { size:A4 portrait; margin:1.5cm 2cm; }
          @media print {
            .page { page-break-inside: avoid; }
          }
          table { border-collapse:collapse; }
          th, td { border:1px solid #000; vertical-align:middle; }
          th { background-color:#f9f9f9; }
        </style>
      </head>
      <body>${pages}</body>
      </html>
    `);
    pw.document.close();
    setTimeout(() => pw.print(), 500);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>กำลังโหลดข้อมูล...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> กลับ
        </Button>
        <h2 className="text-xl font-bold">วิเคราะห์ผลสัมฤทธิ์ทางการเรียน</h2>
        <span className="text-sm text-muted-foreground">
          {selectedGrade} ภาคเรียนที่ {selectedSemester} ปีการศึกษา {selectedAcademicYear}
        </span>
        <Button onClick={handlePrint} className="ml-auto" size="sm">
          <Printer className="w-4 h-4 mr-1" /> พิมพ์ A4 ทุกวิชา
        </Button>
      </div>

      {subjectAnalyses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>ไม่พบข้อมูลนักเรียนหรือคะแนน กรุณากรอกคะแนนตามตัวชี้วัดก่อน</p>
          </CardContent>
        </Card>
      ) : (
        subjectAnalyses.map((subj, idx) => (
          <Card key={idx} className="overflow-hidden">
            <CardHeader className="py-3 bg-muted/50">
              <CardTitle className="text-base">{subj.displayName}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* ตารางผลการทดสอบ */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th rowSpan={2} className="border px-3 py-2 text-left">ผลการทดสอบ</th>
                      <th rowSpan={2} className="border px-3 py-2 text-center">เฉลี่ยร้อยละ</th>
                      <th rowSpan={2} className="border px-3 py-2 text-center">C.V.</th>
                      <th colSpan={3} className="border px-3 py-2 text-center">ร้อยละนักเรียนตามเกณฑ์ประเมิน</th>
                    </tr>
                    <tr className="bg-muted">
                      <th className="border px-3 py-2 text-center">ปรับปรุง</th>
                      <th className="border px-3 py-2 text-center">พอใช้</th>
                      <th className="border px-3 py-2 text-center">ดี</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-3 py-2 text-center">ข้อสอบระดับโรงเรียน</td>
                      <td className="border px-3 py-2 text-center">{subj.avgPercent.toFixed(2)}</td>
                      <td className="border px-3 py-2 text-center">{subj.cv.toFixed(2)}</td>
                      <td className="border px-3 py-2 text-center">{subj.percentImprove.toFixed(2)}</td>
                      <td className="border px-3 py-2 text-center">{subj.percentFair.toFixed(2)}</td>
                      <td className="border px-3 py-2 text-center">{subj.percentGood.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="border px-3 py-2 text-right">จำนวนนักเรียนที่อยู่ในกลุ่มปรับปรุง</td>
                      <td className="border px-3 py-2 text-center">{subj.groupImprove}</td>
                      <td className="border px-3 py-2">คน</td>
                      <td className="border px-3 py-2">คิดเป็นจำนวนร้อยละ</td>
                      <td className="border px-3 py-2 text-center">{subj.percentImprove.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="border px-3 py-2 text-right">พอใช้</td>
                      <td className="border px-3 py-2 text-center">{subj.groupFair}</td>
                      <td className="border px-3 py-2">คน</td>
                      <td className="border px-3 py-2">คิดเป็นจำนวนร้อยละ</td>
                      <td className="border px-3 py-2 text-center">{subj.percentFair.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="border px-3 py-2 text-right">ดี</td>
                      <td className="border px-3 py-2 text-center">{subj.groupGood}</td>
                      <td className="border px-3 py-2">คน</td>
                      <td className="border px-3 py-2">คิดเป็นจำนวนร้อยละ</td>
                      <td className="border px-3 py-2 text-center">{subj.percentGood.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ตารางสาระการเรียนรู้ */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th rowSpan={2} className="border px-3 py-2 text-left">สาระการเรียนรู้</th>
                      <th colSpan={2} className="border px-3 py-2 text-center">ระดับศูนย์ฯ</th>
                      <th colSpan={2} className="border px-3 py-2 text-center">ระดับชั้น</th>
                      <th rowSpan={2} className="border px-3 py-2 text-center">ลำดับที่<br/>การพัฒนา</th>
                    </tr>
                    <tr className="bg-muted">
                      <th className="border px-3 py-2 text-center">เฉลี่ยร้อยละ</th>
                      <th className="border px-3 py-2 text-center">C.V.</th>
                      <th className="border px-3 py-2 text-center">เฉลี่ยร้อยละ</th>
                      <th className="border px-3 py-2 text-center">C.V.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subj.strands.map((s, i) => (
                      <tr key={i}>
                        <td className="border px-3 py-2">{i + 1} {s.name}</td>
                        <td className="border px-3 py-2 text-center">-</td>
                        <td className="border px-3 py-2 text-center">-</td>
                        <td className="border px-3 py-2 text-center">{s.avgPercent.toFixed(2)}</td>
                        <td className="border px-3 py-2 text-center">{s.cv.toFixed(2)}</td>
                        <td className="border px-3 py-2 text-center">{s.index}</td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td className="border px-3 py-2 text-right">ค่าเฉลี่ย</td>
                      <td className="border px-3 py-2 text-center"></td>
                      <td className="border px-3 py-2 text-center"></td>
                      <td className="border px-3 py-2 text-center">{subj.overallAvg.toFixed(2)}</td>
                      <td className="border px-3 py-2 text-center">{subj.overallCV.toFixed(2)}</td>
                      <td className="border px-3 py-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ผลการวิเคราะห์ */}
              <div className="text-sm leading-relaxed bg-muted/30 rounded-lg p-4">
                <p className="font-bold mb-2">ผลการวิเคราะห์ข้อมูล</p>
                <p className="indent-8 mb-1">
                  ผลการประเมินคุณภาพการศึกษาขั้นพื้นฐาน ชั้นประถมศึกษาปีที่ {gradeNum} ปีการศึกษา {selectedAcademicYear} 
                  {' '}พบว่านักเรียนมีค่าคะแนนเฉลี่ยทุกสาระการเรียนรู้ร้อยละ {subj.overallAvg.toFixed(2)} 
                  {' '}และค่าเฉลี่ยสัมประสิทธิ์การกระจาย (C.V.) เท่ากับ {subj.overallCV.toFixed(2)}
                </p>
                {subj.lowestStrand && (
                  <>
                    <p className="indent-8 mb-1">
                      เมื่อวิเคราะห์ผลการเรียนรู้เป็นรายสาระการเรียนรู้ พบว่า ค่าคะแนนเฉลี่ยสาระการเรียนรู้ที่มีค่าน้อยที่สุด 
                      คือ สาระที่ {subj.strands.findIndex(s => s.name === subj.lowestStrand!.name) + 1} {subj.lowestStrand.name} มีค่าเฉลี่ยร้อยละ {subj.lowestStrand.avgPercent.toFixed(2)}
                    </p>
                    <p className="indent-8">
                      ดังนั้นใน{subj.displayName} จึงควรพัฒนาการเรียนการสอนในสาระการเรียนรู้ ที่มีค่าเฉลี่ยร้อยละน้อยที่สุดเป็นอันดับแรกคือ 
                      สาระที่ {subj.strands.findIndex(s => s.name === subj.lowestStrand!.name) + 1} {subj.lowestStrand.name} ซึ่งมีค่าเฉลี่ยร้อยละ {subj.lowestStrand.avgPercent.toFixed(2)}
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default AchievementAnalysisReport;
