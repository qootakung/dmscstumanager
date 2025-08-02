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

interface CompetencyItem {
  id: string;
  description: string;
  score: number;
}

interface Assessment {
  items: CompetencyItem[];
  totalScore: number;
  grade: string;
}

const getCompetencyItems = (competencyNumber: number): CompetencyItem[] => {
  const competencyData = {
    1: [
      { id: '1.1', description: 'มีความสามารถในการรับสาร – ส่งสาร', score: 0 },
      { id: '1.2', description: 'มีความสามารถในการถ่ายทอดความรู้ ความคิด ความเข้าใจของตนเอง โดยใช้ภาษาอย่างเหมาะสม', score: 0 },
      { id: '1.3', description: 'ใช้วิธีการสื่อสารที่เหมาะสม มีประสิทธิภาพ', score: 0 },
      { id: '1.4', description: 'เจรจาต่อรอง เพื่อขจัดและลดปัญหาความขัดแย้งต่าง ๆ ได้', score: 0 },
      { id: '1.5', description: 'เลือกรับและไม่รับข้อมูลข่าวสารด้วยเหตุผลและถูกต้อง', score: 0 }
    ],
    2: [
      { id: '2.1', description: 'มีความสามารถในการคิดวิเคราะห์ สังเคราะห์', score: 0 },
      { id: '2.2', description: 'มีทักษะในการคิดนอกกรอบอย่างสร้างสรรค์', score: 0 },
      { id: '2.3', description: 'สามารถคิดอย่างมีวิจารณญาณ', score: 0 },
      { id: '2.4', description: 'มีความสามารถในการคิดอย่างมีระบบ', score: 0 },
      { id: '2.5', description: 'ตัดสินใจแก้ปัญหาเกี่ยวกับตนเองได้อย่างเหมาะสม', score: 0 }
    ],
    3: [
      { id: '3.1', description: 'สามารถแก้ปัญหาและอุปสรรคต่าง ๆ ที่เผชิญได้', score: 0 },
      { id: '3.2', description: 'ใช้เหตุผลในการแก้ปัญหา', score: 0 },
      { id: '3.3', description: 'เข้าใจความสัมพันธ์และการเปลี่ยนแปลงในสังคม', score: 0 },
      { id: '3.4', description: 'แสวงหาความรู้ ประยุกต์ความรู้มาใช้ในการป้องกันและแก้ไขปัญหา', score: 0 },
      { id: '3.5', description: 'สามารถตัดสินใจได้เหมาะสมตามวัย', score: 0 }
    ],
    4: [
      { id: '4.1', description: 'เรียนรู้ด้วยตนเองได้เหมาะสมตามวัย', score: 0 },
      { id: '4.2', description: 'สามารถทำงานกลุ่มร่วมกับผู้อื่นได้', score: 0 },
      { id: '4.3', description: 'นำความรู้ที่ได้ไปใช้ประโยชน์ในชีวิตประจำวัน', score: 0 },
      { id: '4.4', description: 'จัดการปัญหาและความขัดแย้งได้เหมาะสม', score: 0 },
      { id: '4.5', description: 'หลีกเลี่ยงพฤติกรรมไม่พึงประสงค์ที่ส่งผลกระทบต่อตนเอง', score: 0 }
    ],
    5: [
      { id: '5.1', description: 'เลือกและใช้เทคโนโลยีได้เหมาะสมตามวัย', score: 0 },
      { id: '5.2', description: 'มีทักษะกระบวนการทางเทคโนโลยี', score: 0 },
      { id: '5.3', description: 'สามารถนำเทคโนโลยีไปใช้พัฒนาตนเอง', score: 0 },
      { id: '5.4', description: 'ใช้เทคโนโลยีในการแก้ปัญหาอย่างสร้างสรรค์', score: 0 },
      { id: '5.5', description: 'มีคุณธรรม จริยธรรม ในการใช้เทคโนโลยี', score: 0 }
    ]
  };
  return competencyData[competencyNumber as keyof typeof competencyData] || [];
};

const getGradeFromScore = (score: number): string => {
  if (score >= 13) return 'ดีเยี่ยม';
  if (score >= 9) return 'ดี';
  if (score >= 5) return 'ผ่าน';
  return 'ไม่ผ่าน';
};

const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'ดีเยี่ยม': return 'bg-green-100 text-green-800';
    case 'ดี': return 'bg-blue-100 text-blue-800';
    case 'ผ่าน': return 'bg-yellow-100 text-yellow-800';
    case 'ไม่ผ่าน': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const CompetencyPage = ({ competencyNumber, title }: CompetencyPageProps) => {
  const [assessment, setAssessment] = useState<Assessment>(() => {
    const items = getCompetencyItems(competencyNumber);
    const totalScore = items.reduce((sum, item) => sum + item.score, 0);
    return {
      items,
      totalScore,
      grade: getGradeFromScore(totalScore)
    };
  });
  const [isSaving, setIsSaving] = useState(false);

  const updateItemScore = (itemId: string, score: number) => {
    const updatedItems = assessment.items.map(item => 
      item.id === itemId ? { ...item, score } : item
    );
    const totalScore = updatedItems.reduce((sum, item) => sum + item.score, 0);
    const grade = getGradeFromScore(totalScore);
    
    setAssessment({
      items: updatedItems,
      totalScore,
      grade
    });
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
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="mb-6">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-blue-800 mb-2">เกณฑ์การให้คะแนน:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div className="text-green-700">ดีเยี่ยม = 3 คะแนน</div>
                  <div className="text-blue-700">ดี = 2 คะแนน</div>
                  <div className="text-yellow-700">ผ่าน = 1 คะแนน</div>
                  <div className="text-red-700">ไม่ผ่าน = 0 คะแนน</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {assessment.items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 mb-2">
                        {item.id} {item.description}
                      </h4>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      ระดับคะแนน
                    </Label>
                    <RadioGroup
                      value={item.score.toString()}
                      onValueChange={(value) => updateItemScore(item.id, parseInt(value))}
                      className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                      {[
                        { value: '3', label: 'ดีเยี่ยม (3)', color: 'text-green-600' },
                        { value: '2', label: 'ดี (2)', color: 'text-blue-600' },
                        { value: '1', label: 'ผ่าน (1)', color: 'text-yellow-600' },
                        { value: '0', label: 'ไม่ผ่าน (0)', color: 'text-red-600' }
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={`${item.id}-${option.value}`} />
                          <Label 
                            htmlFor={`${item.id}-${option.value}`} 
                            className={`text-sm cursor-pointer ${option.color}`}
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score Summary */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">สรุปผลคะแนน</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{assessment.totalScore}</div>
                <div className="text-sm text-blue-700">คะแนนรวม</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">15</div>
                <div className="text-sm text-gray-700">คะแนนเต็ม</div>
              </div>
              <div className={`text-center p-4 rounded-lg ${getGradeColor(assessment.grade)}`}>
                <div className="text-2xl font-bold">{assessment.grade}</div>
                <div className="text-sm">ผลการประเมิน</div>
              </div>
            </div>
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

      {/* Grading Criteria */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-gray-700">เกณฑ์การสรุปผล</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              {[
                { label: 'ดีเยี่ยม', range: '13-15 คะแนน', color: 'bg-green-100 text-green-800' },
                { label: 'ดี', range: '9-12 คะแนน', color: 'bg-blue-100 text-blue-800' },
                { label: 'ผ่าน', range: '5-8 คะแนน', color: 'bg-yellow-100 text-yellow-800' },
                { label: 'ไม่ผ่าน', range: '0-4 คะแนน', color: 'bg-red-100 text-red-800' }
              ].map((criteria) => (
                <div key={criteria.label} className={`p-4 rounded-lg ${criteria.color}`}>
                  <div className="text-lg font-bold">{criteria.label}</div>
                  <div className="text-sm font-medium">{criteria.range}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};