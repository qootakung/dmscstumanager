import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Printer, FileText, Save } from 'lucide-react';
import { getStudents } from '@/utils/studentStorage';
import { sortStudents, getBasicInfo } from '@/utils/pp5GradeCalc';
import { openPrintWindow } from '@/utils/pp5Print';
import { toast } from 'sonner';

interface Props {
  selectedGrade: string;
  selectedSemester: string;
  selectedAcademicYear: string;
  onBack: () => void;
}

interface CoverData {
  documentName: string;
  schoolName: string;
  subDistrict: string;
  district: string;
  province: string;
  area: string;
  teacher1: string;
  teacher2: string;
  academicHead: string;
  administratorName: string;
  administratorPosition: string;
}

const PP5Cover: React.FC<Props> = ({ selectedGrade, selectedSemester, selectedAcademicYear, onBack }) => {
  const storageKey = `pp5-cover-${selectedGrade}-${selectedAcademicYear}-${selectedSemester}`;
  const info = useMemo(
    () => getBasicInfo(selectedGrade, selectedAcademicYear, selectedSemester),
    [selectedGrade, selectedAcademicYear, selectedSemester]
  );

  const [studentCount, setStudentCount] = useState({ total: 0, male: 0, female: 0 });
  const [data, setData] = useState<CoverData>({
    documentName: 'แบบบันทึกผลการเรียนประจำรายวิชา (ปพ.5)',
    schoolName: 'บ้านดอนมูล',
    subDistrict: '', district: '', province: '',
    area: '', teacher1: '', teacher2: '',
    academicHead: '', administratorName: '', administratorPosition: 'ผู้อำนวยการโรงเรียน',
  });

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { setData(prev => ({ ...prev, ...JSON.parse(saved) })); return; } catch { /* noop */ }
    }
    if (info) {
      setData(prev => ({
        ...prev,
        schoolName: info.schoolName || prev.schoolName,
        subDistrict: info.subDistrict || '',
        district: info.district || '',
        province: info.province || '',
        area: info.primaryEducationArea || '',
        teacher1: info.homeTeacher1 || '',
        teacher2: info.homeTeacher2 || '',
        academicHead: info.academicHead || '',
        administratorName: info.administratorName || '',
        administratorPosition: info.administratorPosition || 'ผู้อำนวยการโรงเรียน',
      }));
    }
  }, [storageKey, info]);

  useEffect(() => {
    (async () => {
      const all = await getStudents();
      const list = sortStudents(all.filter(s => s.grade === selectedGrade && s.academicYear === selectedAcademicYear));
      setStudentCount({
        total: list.length,
        male: list.filter(s => (s.gender || '').startsWith('ช')).length,
        female: list.filter(s => (s.gender || '').startsWith('ห') || (s.gender || '').startsWith('ญ')).length,
      });
    })();
  }, [selectedGrade, selectedAcademicYear]);

  const set = (k: keyof CoverData, v: string) => setData(prev => ({ ...prev, [k]: v }));
  const handleSave = () => { localStorage.setItem(storageKey, JSON.stringify(data)); toast.success('บันทึกหน้าปกเรียบร้อย'); };

  const coverHtml = () => `
    <div style="text-align:center;padding-top:22mm;line-height:1.9">
      <div style="font-size:30pt;font-weight:bold">ปพ.5</div>
      <div style="font-size:24pt;font-weight:bold;margin-top:6mm">${data.documentName}</div>
      <div style="font-size:22pt;margin-top:4mm">ชั้นประถมศึกษาปีที่ ${selectedGrade.replace('ป.', '')}</div>
      <div style="font-size:20pt">ภาคเรียนที่ ${selectedSemester} ปีการศึกษา ${selectedAcademicYear}</div>
      <div style="font-size:18pt;margin-top:3mm">จำนวนนักเรียน ${studentCount.total} คน (ชาย ${studentCount.male} คน หญิง ${studentCount.female} คน)</div>
      <div style="font-size:22pt;margin-top:16mm">โรงเรียน${data.schoolName}</div>
      <div style="font-size:18pt">ตำบล${data.subDistrict} อำเภอ${data.district} จังหวัด${data.province}</div>
      <div style="font-size:18pt">${data.area}</div>
      <div style="font-size:18pt;margin-top:14mm">ครูประจำชั้น</div>
      <div style="font-size:18pt">${data.teacher1 || '.....................................................'}</div>
      ${data.teacher2 ? `<div style="font-size:18pt">${data.teacher2}</div>` : ''}
      <div style="margin-top:18mm;display:flex;justify-content:space-around;font-size:17pt;line-height:1.8">
        <div>
          ลงชื่อ .............................................<br/>
          ( ${data.academicHead || '.............................................'} )<br/>
          หัวหน้าฝ่ายวิชาการ
        </div>
        <div>
          ลงชื่อ .............................................<br/>
          ( ${data.administratorName || '.............................................'} )<br/>
          ${data.administratorPosition}
        </div>
      </div>
    </div>`;

  const handlePrint = () => {
    handleSave();
    if (!openPrintWindow(`หน้าปก ปพ.5 ${selectedGrade}`, coverHtml(), 'portrait')) {
      toast.error('กรุณาอนุญาต pop-ups เพื่อพิมพ์');
    }
  };

  const fields: { key: keyof CoverData; label: string }[] = [
    { key: 'documentName', label: 'ชื่อเอกสาร' },
    { key: 'schoolName', label: 'โรงเรียน' },
    { key: 'subDistrict', label: 'ตำบล' },
    { key: 'district', label: 'อำเภอ' },
    { key: 'province', label: 'จังหวัด' },
    { key: 'area', label: 'สังกัด/เขตพื้นที่' },
    { key: 'teacher1', label: 'ครูประจำชั้น 1' },
    { key: 'teacher2', label: 'ครูประจำชั้น 2' },
    { key: 'academicHead', label: 'หัวหน้าฝ่ายวิชาการ' },
    { key: 'administratorName', label: 'ผู้บริหาร' },
    { key: 'administratorPosition', label: 'ตำแหน่งผู้บริหาร' },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-600 to-violet-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />กลับ
            </Button>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6" />หน้าปก ปพ.5
            </CardTitle>
            <div className="text-white text-sm">ภาคเรียนที่ {selectedSemester} / {selectedAcademicYear}</div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-4 space-y-3">
            {fields.map(f => (
              <div key={f.key} className="flex items-center gap-2">
                <Label className="w-40 shrink-0 text-sm">{f.label}</Label>
                <Input value={data[f.key]} onChange={e => set(f.key, e.target.value)} />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleSave}><Save className="w-4 h-4 mr-1" />บันทึก</Button>
              <Button onClick={handlePrint} className="bg-violet-700 hover:bg-violet-800">
                <Printer className="w-4 h-4 mr-1" />พิมพ์หน้าปก (A4 แนวตั้ง)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">ตัวอย่างหน้าปก</CardTitle></CardHeader>
          <CardContent>
            <div
              className="border rounded bg-white p-4 text-center"
              style={{ fontFamily: "'TH SarabunPSK','Sarabun',sans-serif", aspectRatio: '1 / 1.414', overflow: 'hidden' }}
              dangerouslySetInnerHTML={{ __html: coverHtml() }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PP5Cover;