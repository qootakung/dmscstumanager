import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, Printer, Users, Activity, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const DentalMilkTracking = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedGrade, setSelectedGrade] = useState('all');

  // Mock data - in real implementation, this would come from the database
  const mockData = {
    totalStudents: 245,
    todayBrushing: 187,
    todayMilk: 201,
    completionRate: 82.5,
    gradeData: [
      { grade: 'อ.1', students: 42, brushing: 35, milk: 38, brushingRate: 83.3, milkRate: 90.5 },
      { grade: 'อ.2', students: 38, brushing: 31, milk: 33, brushingRate: 81.6, milkRate: 86.8 },
      { grade: 'อ.3', students: 45, brushing: 39, milk: 42, brushingRate: 86.7, milkRate: 93.3 },
      { grade: 'อ.4', students: 41, brushing: 33, milk: 36, brushingRate: 80.5, milkRate: 87.8 },
      { grade: 'อ.5', students: 39, brushing: 28, milk: 31, brushingRate: 71.8, milkRate: 79.5 },
      { grade: 'อ.6', students: 40, brushing: 21, milk: 21, brushingRate: 52.5, milkRate: 52.5 },
    ]
  };

  const handleExportExcel = () => {
    toast({
      title: "กำลังส่งออกข้อมูล",
      description: "ข้อมูลการแปรงฟันและดื่มนมกำลังถูกส่งออกเป็นไฟล์ Excel",
    });
  };

  const handlePrint = () => {
    toast({
      title: "กำลังพิมพ์รายงาน",
      description: "รายงานการแปรงฟันและดื่มนมกำลังถูกส่งไปยังเครื่องพิมพ์",
    });
  };

  const months = [
    { value: 1, label: 'มกราคม' },
    { value: 2, label: 'กุมภาพันธ์' },
    { value: 3, label: 'มีนาคม' },
    { value: 4, label: 'เมษายน' },
    { value: 5, label: 'พฤษภาคม' },
    { value: 6, label: 'มิถุนายน' },
    { value: 7, label: 'กรกฎาคม' },
    { value: 8, label: 'สิงหาคม' },
    { value: 9, label: 'กันยายน' },
    { value: 10, label: 'ตุลาคม' },
    { value: 11, label: 'พฤศจิกายน' },
    { value: 12, label: 'ธันวาคม' },
  ];

  const years = [2023, 2024, 2025, 2026, 2027];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-school-primary">
            บันทึกแปรงฟันดื่มนม
          </h1>
          <p className="text-muted-foreground mt-2">
            ระบบติดตามการแปรงฟันและดื่มนมของนักเรียนแบบรายวันและรายเดือน
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleExportExcel} variant="outline" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
            <Download className="w-4 h-4 mr-2" />
            ส่งออก Excel
          </Button>
          <Button onClick={handlePrint} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
            <Printer className="w-4 h-4 mr-2" />
            พิมพ์รายงาน
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex space-x-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">เดือน</label>
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">ปี</label>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">ระดับชั้น</label>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกระดับชั้น</SelectItem>
              <SelectItem value="อ.1">อนุบาล 1</SelectItem>
              <SelectItem value="อ.2">อนุบาล 2</SelectItem>
              <SelectItem value="อ.3">อนุบาล 3</SelectItem>
              <SelectItem value="อ.4">ประถม 1</SelectItem>
              <SelectItem value="อ.5">ประถม 2</SelectItem>
              <SelectItem value="อ.6">ประถม 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">นักเรียนทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{mockData.totalStudents}</div>
            <p className="text-xs text-blue-600 mt-1">คน</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">แปรงฟันวันนี้</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{mockData.todayBrushing}</div>
            <p className="text-xs text-green-600 mt-1">คน ({((mockData.todayBrushing / mockData.totalStudents) * 100).toFixed(1)}%)</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">ดื่มนมวันนี้</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{mockData.todayMilk}</div>
            <p className="text-xs text-purple-600 mt-1">คน ({((mockData.todayMilk / mockData.totalStudents) * 100).toFixed(1)}%)</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">อัตราการปฏิบัติ</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{mockData.completionRate}%</div>
            <p className="text-xs text-orange-600 mt-1">เฉลี่ยรวม</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">แดชบอร์ด</TabsTrigger>
          <TabsTrigger value="daily">บันทึกรายวัน</TabsTrigger>
          <TabsTrigger value="monthly">รายงานรายเดือน</TabsTrigger>
          <TabsTrigger value="approval">รับรองข้อมูล</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Grade-wise Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>สถิติตามระดับชั้น</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">ระดับชั้น</th>
                      <th className="text-center py-2">จำนวนนักเรียน</th>
                      <th className="text-center py-2">แปรงฟัน</th>
                      <th className="text-center py-2">อัตรา (%)</th>
                      <th className="text-center py-2">ดื่มนม</th>
                      <th className="text-center py-2">อัตรา (%)</th>
                      <th className="text-center py-2">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockData.gradeData.map((grade) => (
                      <tr key={grade.grade} className="border-b">
                        <td className="py-3 font-medium">{grade.grade}</td>
                        <td className="text-center py-3">{grade.students}</td>
                        <td className="text-center py-3 text-green-700">{grade.brushing}</td>
                        <td className="text-center py-3">
                          <Badge variant={grade.brushingRate >= 80 ? "default" : "secondary"} 
                                 className={grade.brushingRate >= 80 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                            {grade.brushingRate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="text-center py-3 text-purple-700">{grade.milk}</td>
                        <td className="text-center py-3">
                          <Badge variant={grade.milkRate >= 80 ? "default" : "secondary"} 
                                 className={grade.milkRate >= 80 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                            {grade.milkRate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="text-center py-3">
                          {grade.brushingRate >= 80 && grade.milkRate >= 80 ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-yellow-500 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>บันทึกข้อมูลรายวัน</CardTitle>
              <p className="text-sm text-muted-foreground">
                บันทึกการแปรงฟันและดื่มนมของนักเรียนแต่ละคน
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">ฟีเจอร์กำลังพัฒนา</h3>
                <p className="text-gray-600">
                  ระบบบันทึกข้อมูลรายวันจะเปิดให้บริการเร็วๆ นี้
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>รายงานรายเดือน</CardTitle>
              <p className="text-sm text-muted-foreground">
                สรุปข้อมูลการแปรงฟันและดื่มนมรายเดือน
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">รายงานรายเดือน</h3>
                <p className="text-gray-600">
                  ข้อมูลสำหรับเดือน{months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval">
          <Card>
            <CardHeader>
              <CardTitle>รับรองข้อมูลโดยผู้อำนวยการ</CardTitle>
              <p className="text-sm text-muted-foreground">
                ระบบรับรองความถูกต้องของข้อมูลโดยผู้บริหาร
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">ระบบรับรองข้อมูล</h3>
                <p className="text-gray-600">
                  กรุณารอการอนุมัติจากผู้อำนวยการ
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DentalMilkTracking;