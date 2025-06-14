
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HealthImportExport from './student-health/HealthImportExport';

const StudentHealth: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-school-primary mb-2">
          บันทึกน้ำหนักและส่วนสูง
        </h2>
        <p className="text-muted-foreground">
          จัดการข้อมูลน้ำหนักและส่วนสูงของนักเรียน
        </p>
      </div>

      <Tabs defaultValue="import-export" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="import-export">นำเข้า / ส่งออกข้อมูล</TabsTrigger>
        </TabsList>

        <TabsContent value="import-export" className="mt-6">
          <HealthImportExport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentHealth;
