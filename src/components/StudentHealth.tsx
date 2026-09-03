
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HealthImportExport from './student-health/HealthImportExport';
import HealthDataTable from './student-health/HealthDataTable';
import HealthComparison from './student-health/HealthComparison';

const StudentHealth: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto p-6 space-y-8">

        {/* Enhanced Tabs with Beautiful Styling */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
          <Tabs defaultValue="data-table" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 rounded-xl overflow-hidden">
              <TabsTrigger 
                value="data-table" 
                className="relative overflow-hidden group data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg mx-1 my-1"
              >
                <div className="flex items-center gap-2 relative z-10">
                  <span className="text-lg">📋</span>
                  <span className="font-medium">ข้อมูลสุขภาพนักเรียน</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="comparison"
                className="relative overflow-hidden group data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg mx-1 my-1"
              >
                <div className="flex items-center gap-2 relative z-10">
                  <span className="text-lg">📊</span>
                  <span className="font-medium">เปรียบเทียบเทอม 1-2</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="import-export"
                className="relative overflow-hidden group data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg mx-1 my-1"
              >
                <div className="flex items-center gap-2 relative z-10">
                  <span className="text-lg">📥</span>
                  <span className="font-medium">นำเข้า / ส่งออกข้อมูล</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="data-table" className="animate-fade-in">
              <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl p-6 border border-blue-100">
                <HealthDataTable />
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="animate-fade-in">
              <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl p-6 border border-purple-100">
                <HealthComparison />
              </div>
            </TabsContent>
            
            <TabsContent value="import-export" className="animate-fade-in">
              <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-xl p-6 border border-emerald-100">
                <HealthImportExport />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center">
          <div className="flex items-center gap-4 text-4xl opacity-20">
            <span className="animate-bounce" style={{ animationDelay: '0s' }}>⚖️</span>
            <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>📏</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>📊</span>
            <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>🏥</span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>📋</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHealth;
