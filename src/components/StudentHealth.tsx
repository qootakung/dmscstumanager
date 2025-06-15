
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HealthImportExport from './student-health/HealthImportExport';
import HealthDataTable from './student-health/HealthDataTable';

const StudentHealth: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Beautiful Header Section */}
      <div className="text-center bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-xl border border-emerald-200 shadow-lg">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          <h2 className="text-4xl font-bold mb-3">
            📊 บันทึกน้ำหนักและส่วนสูง
          </h2>
        </div>
        <p className="text-emerald-700 text-lg font-medium">
          🏥 จัดการข้อมูลน้ำหนักและส่วนสูงของนักเรียน
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-emerald-600 font-medium">ระบบติดตามสุขภาพนักเรียน</span>
        </div>
      </div>

      {/* Beautiful Tabs Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <Tabs defaultValue="data-table" className="w-full">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
            <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm border border-blue-200 shadow-md">
              <TabsTrigger 
                value="data-table" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-blue-50"
              >
                📋 ข้อมูลสุขภาพนักเรียน
              </TabsTrigger>
              <TabsTrigger 
                value="import-export"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-green-50"
              >
                📁 นำเข้า / ส่งออกข้อมูล
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="data-table" className="mt-0">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <HealthDataTable />
              </div>
            </TabsContent>
            <TabsContent value="import-export" className="mt-0">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <HealthImportExport />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentHealth;
