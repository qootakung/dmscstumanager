
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const StudentImport: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>นำเข้าข้อมูลจากไฟล์ Excel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            อัปโหลดไฟล์ Excel เพื่อนำเข้าข้อมูลนักเรียนจำนวนมาก
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600 mb-2">
              คลิกหรือลากไฟล์มาวางที่นี่
            </p>
            <p className="text-sm text-gray-500">
              รองรับไฟล์ .xlsx และ .xls เท่านั้น
            </p>
            <Button className="mt-4" variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              เลือกไฟล์
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentImport;
