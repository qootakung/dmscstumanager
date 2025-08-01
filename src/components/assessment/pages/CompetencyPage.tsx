import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Target, Save, Printer, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CompetencyPageProps {
  competencyNumber: number;
  title: string;
}

interface Assessment {
  criteria: string;
  level: string;
  evidence: string;
  notes: string;
}

export const CompetencyPage = ({ competencyNumber, title }: CompetencyPageProps) => {
  const [assessments, setAssessments] = useState<Assessment[]>([
    { criteria: '', level: '', evidence: '', notes: '' }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const addAssessment = () => {
    setAssessments([...assessments, { criteria: '', level: '', evidence: '', notes: '' }]);
  };

  const removeAssessment = (index: number) => {
    setAssessments(assessments.filter((_, i) => i !== index));
  };

  const updateAssessment = (index: number, field: keyof Assessment, value: string) => {
    const updated = assessments.map((assessment, i) => 
      i === index ? { ...assessment, [field]: value } : assessment
    );
    setAssessments(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('บันทึกข้อมูลสำเร็จ');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getCompetencyColor = (number: number) => {
    const colors = [
      'from-red-500 to-pink-600',
      'from-blue-500 to-indigo-600', 
      'from-green-500 to-emerald-600',
      'from-purple-500 to-violet-600',
      'from-orange-500 to-yellow-600'
    ];
    return colors[(number - 1) % colors.length];
  };

  const getCompetencyBg = (number: number) => {
    const backgrounds = [
      'from-red-50 to-pink-50',
      'from-blue-50 to-indigo-50',
      'from-green-50 to-emerald-50', 
      'from-purple-50 to-violet-50',
      'from-orange-50 to-yellow-50'
    ];
    return backgrounds[(number - 1) % backgrounds.length];
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-bold bg-gradient-to-r ${getCompetencyColor(competencyNumber)} bg-clip-text text-transparent mb-3`}>
          {title}
        </h2>
        <p className="text-gray-600 text-lg">
          ประเมินและบันทึกข้อมูลสมรรถนะของนักเรียน
        </p>
      </div>

      <Card className={`border-0 shadow-lg bg-gradient-to-br ${getCompetencyBg(competencyNumber)}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-700">
            <Target className="h-6 w-6" />
            การประเมินสมรรถนะ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {assessments.map((assessment, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  รายการประเมินที่ {index + 1}
                </h3>
                {assessments.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeAssessment(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    ลบรายการ
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    เกณฑ์การประเมิน
                  </Label>
                  <Textarea
                    value={assessment.criteria}
                    onChange={(e) => updateAssessment(index, 'criteria', e.target.value)}
                    placeholder="ระบุเกณฑ์หรือตัวชี้วัดการประเมิน..."
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    ระดับความสามารถ
                  </Label>
                  <RadioGroup
                    value={assessment.level}
                    onValueChange={(value) => updateAssessment(index, 'level', value)}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  >
                    {[
                      { value: 'excellent', label: 'ดีเยี่ยม', color: 'text-green-600' },
                      { value: 'good', label: 'ดี', color: 'text-blue-600' },
                      { value: 'fair', label: 'พอใช้', color: 'text-yellow-600' },
                      { value: 'poor', label: 'ต้องปรับปรุง', color: 'text-red-600' }
                    ].map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`${index}-${option.value}`} />
                        <Label 
                          htmlFor={`${index}-${option.value}`} 
                          className={`text-sm cursor-pointer ${option.color}`}
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    หลักฐานการประเมิน
                  </Label>
                  <Textarea
                    value={assessment.evidence}
                    onChange={(e) => updateAssessment(index, 'evidence', e.target.value)}
                    placeholder="ระบุหลักฐานหรือตัวอย่างงานที่ใช้ในการประเมิน..."
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    ข้อสังเกต/คำแนะนำ
                  </Label>
                  <Textarea
                    value={assessment.notes}
                    onChange={(e) => updateAssessment(index, 'notes', e.target.value)}
                    placeholder="บันทึกข้อสังเกตหรือคำแนะนำเพิ่มเติม..."
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-center">
            <Button
              onClick={addAssessment}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              เพิ่มรายการประเมิน
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t bg-white rounded-lg p-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 bg-gradient-to-r ${getCompetencyColor(competencyNumber)} text-white`}
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </Button>
            
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              พิมพ์รายงาน
            </Button>
            
            <Button
              variant="ghost"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              ตัวอย่างรายงาน
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-gray-700">สรุปผลการประเมิน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { level: 'excellent', label: 'ดีเยี่ยม', count: assessments.filter(a => a.level === 'excellent').length, color: 'bg-green-100 text-green-800' },
                { level: 'good', label: 'ดี', count: assessments.filter(a => a.level === 'good').length, color: 'bg-blue-100 text-blue-800' },
                { level: 'fair', label: 'พอใช้', count: assessments.filter(a => a.level === 'fair').length, color: 'bg-yellow-100 text-yellow-800' },
                { level: 'poor', label: 'ต้องปรับปรุง', count: assessments.filter(a => a.level === 'poor').length, color: 'bg-red-100 text-red-800' }
              ].map((stat) => (
                <div key={stat.level} className={`p-3 rounded-lg ${stat.color}`}>
                  <div className="text-2xl font-bold">{stat.count}</div>
                  <div className="text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};