
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FinancialReports = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">รายงานการเงิน</h2>
          <p className="text-muted-foreground">
            จัดการและดูรายงานทางการเงินของโรงเรียน
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>รายงานรายรับ</CardTitle>
            <CardDescription>
              ดูรายงานรายรับของโรงเรียน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              ฟีเจอร์นี้กำลังพัฒนา
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>รายงานรายจ่าย</CardTitle>
            <CardDescription>
              ดูรายงานรายจ่ายของโรงเรียน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              ฟีเจอร์นี้กำลังพัฒนา
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>รายงานงบประมาณ</CardTitle>
            <CardDescription>
              ดูรายงานการใช้งบประมาณ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              ฟีเจอร์นี้กำลังพัฒนา
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialReports;
