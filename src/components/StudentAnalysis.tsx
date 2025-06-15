
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, FileText, Upload, Download } from 'lucide-react';

const StudentAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 opacity-10 rounded-3xl"></div>
          <div className="relative text-center bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl mb-4 animate-pulse">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              วิเคราะห์ผู้เรียน
            </h2>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">📊</span>
              <p className="text-lg text-slate-600 font-medium">
                วิเคราะห์ผลการเรียนรายวิชา แบ่งกลุ่มตามระดับผลการเรียน
              </p>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border border-purple-200">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
              <span className="text-sm font-medium text-purple-700">ระบบพร้อมใช้งาน</span>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8 bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 rounded-xl overflow-hidden">
              <TabsTrigger 
                value="overview" 
                className="relative overflow-hidden group data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg mx-1 my-1"
              >
                <div className="flex items-center gap-2 relative z-10">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">ภาพรวม</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="analysis"
                className="relative overflow-hidden group data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg mx-1 my-1"
              >
                <div className="flex items-center gap-2 relative z-10">
                  <BarChart3 className="w-4 h-4" />
                  <span className="font-medium">วิเคราะห์</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="groups"
                className="relative overflow-hidden group data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg mx-1 my-1"
              >
                <div className="flex items-center gap-2 relative z-10">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">จัดกลุ่ม</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="import"
                className="relative overflow-hidden group data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg mx-1 my-1"
              >
                <div className="flex items-center gap-2 relative z-10">
                  <Upload className="w-4 h-4" />
                  <span className="font-medium">นำเข้า</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="report"
                className="relative overflow-hidden group data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg mx-1 my-1"
              >
                <div className="flex items-center gap-2 relative z-10">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">รายงาน</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="animate-fade-in">
              <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl p-6 border border-purple-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <span className="text-xl">🌟</span>
                        กลุ่มเก่ง
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">0</div>
                      <p className="text-green-100 text-sm">คะแนน 80-100</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <span className="text-xl">📊</span>
                        กลุ่มปานกลาง
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">0</div>
                      <p className="text-orange-100 text-sm">คะแนน 60-79</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white border-0 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <span className="text-xl">🔄</span>
                        กลุ่มต้องช่วยเหลือ
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">0</div>
                      <p className="text-pink-100 text-sm">คะแนน 0-59</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      ภาพรวมการวิเคราะห์
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-gray-500">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">ยังไม่มีข้อมูลการวิเคราะห์</p>
                      <p className="text-sm">กรุณานำเข้าข้อมูลคะแนนเพื่อเริ่มการวิเคราะห์</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="animate-fade-in">
              <div className="bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-xl p-6 border border-blue-100">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      การวิเคราะห์รายละเอียด
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-gray-500">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">เตรียมพร้อมสำหรับการวิเคราะห์</p>
                      <p className="text-sm">ฟีเจอร์การวิเคราะห์รายละเอียดจะพร้อมใช้งานเมื่อมีข้อมูล</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="groups" className="animate-fade-in">
              <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl p-6 border border-green-100">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      การจัดกลุ่มผู้เรียน
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-gray-500">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">พร้อมจัดกลุ่มผู้เรียน</p>
                      <p className="text-sm">ระบบจะจัดกลุ่มผู้เรียนตามผลการเรียนโดยอัตโนมัติ</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="import" className="animate-fade-in">
              <div className="bg-gradient-to-br from-orange-50/50 to-red-50/50 rounded-xl p-6 border border-orange-100">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5 text-orange-600" />
                      นำเข้าข้อมูลคะแนน
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center bg-orange-50/50">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        อัปโหลดไฟล์ Excel
                      </h3>
                      <p className="text-gray-600 mb-4">
                        รองรับไฟล์ .xlsx และ .xls สำหรับการนำเข้าข้อมูลคะแนน
                      </p>
                      <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                        <Upload className="w-4 h-4 mr-2" />
                        เลือกไฟล์
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-orange-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">รูปแบบไฟล์ที่รองรับ</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-gray-600">
                          <ul className="space-y-1">
                            <li>• ไฟล์ Excel (.xlsx, .xls)</li>
                            <li>• มีข้อมูลรหัสนักเรียน</li>
                            <li>• มีข้อมูลชื่อ-นามสกุล</li>
                            <li>• มีข้อมูลคะแนนรายวิชา</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border-orange-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">คำแนะนำ</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-gray-600">
                          <ul className="space-y-1">
                            <li>• นำเข้าได้ทีละชั้นเรียน</li>
                            <li>• ตรวจสอบข้อมูลก่อนอัปโหลด</li>
                            <li>• ระบบจะแจ้งเตือนหากมีข้อผิดพลาด</li>
                            <li>• สามารถดาวน์โหลดเทมเพลตได้</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="report" className="animate-fade-in">
              <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-xl p-6 border border-indigo-100">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      รายงานการวิเคราะห์
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col gap-2 border-indigo-200 hover:bg-indigo-50"
                        disabled
                      >
                        <Download className="w-6 h-6 text-indigo-600" />
                        <span>ส่งออก PDF</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col gap-2 border-indigo-200 hover:bg-indigo-50"
                        disabled
                      >
                        <Download className="w-6 h-6 text-indigo-600" />
                        <span>ส่งออก Excel</span>
                      </Button>
                    </div>

                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">รายงานพร้อมใช้งาน</p>
                      <p className="text-sm">เมื่อมีข้อมูลการวิเคราะห์แล้ว คุณจะสามารถส่งออกรายงานได้</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center">
          <div className="flex items-center gap-4 text-4xl opacity-20">
            <span className="animate-bounce" style={{ animationDelay: '0s' }}>📊</span>
            <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🎯</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>📈</span>
            <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>🏆</span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>💡</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalysis;
