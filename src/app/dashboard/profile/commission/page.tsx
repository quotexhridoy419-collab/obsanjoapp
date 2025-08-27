
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth.tsx';

interface CommissionRecord {
  from: string;
  level: number;
  amount: number;
  date: string;
}

export default function CommissionRecordPage() {
  const { user, isLoading } = useAuth();
  const [records, setRecords] = useState<CommissionRecord[]>([]);
  const [totalCommission, setTotalCommission] = useState(0);

  useEffect(() => {
    if (user) {
        const commissionHistoryData = user.commissionHistory ? Object.values(user.commissionHistory) : [];
        setRecords((commissionHistoryData as CommissionRecord[]).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setTotalCommission(user.teamCommission || 0);
    }
  }, [user]);

  if (isLoading) {
    return <div className="text-center p-8">লোড হচ্ছে...</div>;
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="flex items-center p-4 bg-primary text-primary-foreground">
        <Link href="/dashboard/profile" className="text-primary-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="flex-grow text-center text-xl font-headline font-bold">কমিশন রেকর্ড</h1>
        <div className="w-6"></div>
      </header>

      <main className="p-4 container mx-auto max-w-3xl">
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>মোট কমিশন আয়</CardTitle>
                <CardDescription className="text-2xl font-bold text-primary pt-2">
                    ৳{totalCommission.toFixed(2)}
                </CardDescription>
            </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>কমিশনের বিবরণ</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>তারিখ</TableHead>
                  <TableHead>ব্যবহারকারী আইডি</TableHead>
                  <TableHead>স্তর</TableHead>
                  <TableHead className="text-right">পরিমাণ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length > 0 ? (
                  records.map((item, index) => {
                    const recordDate = new Date(item.date);
                    const isValidDate = !isNaN(recordDate.getTime());
                    return (
                        <TableRow key={index}>
                          <TableCell>
                            {isValidDate && (
                                <div>{recordDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                            )}
                          </TableCell>
                          <TableCell>{item.from}</TableCell>
                          <TableCell>
                            <Badge variant="outline">স্তর {item.level}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            +৳{item.amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      কোনো কমিশন রেকর্ড পাওয়া যায়নি।
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
