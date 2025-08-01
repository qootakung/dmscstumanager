import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NotebookPen, Save, Printer, FileText } from 'lucide-react';
import { toast } from 'sonner';

export const NotesPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    author: '',
    content: '',
    notes: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate save delay
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

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
          บันทึกข้อความ
        </h2>
        <p className="text-gray-600 text-lg">
          สร้างและแก้ไขบันทึกข้อความสำหรับแบบประเมินสมรรถนะ
        </p>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl text-green-700">
            <NotebookPen className="h-6 w-6" />
            ข้อมูลบันทึก
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  หัวข้อบันทึก
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="ระบุหัวข้อบันทึก"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                  วันที่
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <Label htmlFor="author" className="text-sm font-medium text-gray-700">
                ผู้บันทึก
              </Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                placeholder="ระบุชื่อผู้บันทึก"
                className="w-full"
              />
            </div>

            <div className="space-y-2 mb-6">
              <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                เนื้อหาบันทึก
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="เขียนเนื้อหาบันทึกที่นี่..."
                className="min-h-[200px] w-full resize-none"
              />
            </div>

            <div className="space-y-2 mb-6">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                หมายเหตุเพิ่มเติม
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="หมายเหตุหรือข้อสังเกตเพิ่มเติม..."
                className="min-h-[100px] w-full resize-none"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
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
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {(formData.title || formData.content) && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-gray-700">ตัวอย่างรายงาน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="print-area">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {formData.title || 'บันทึกข้อความ'}
                  </h3>
                  <p className="text-gray-600">
                    วันที่: {new Date(formData.date).toLocaleDateString('th-TH')}
                  </p>
                  {formData.author && (
                    <p className="text-gray-600">
                      ผู้บันทึก: {formData.author}
                    </p>
                  )}
                </div>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">เนื้อหา</h4>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {formData.content || 'ยังไม่มีเนื้อหา'}
                  </div>
                </div>

                {formData.notes && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">หมายเหตุ</h4>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {formData.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};