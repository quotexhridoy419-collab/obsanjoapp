
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth.tsx';

type Status = 'সফল' | 'ব্যর্থ' | 'প্রক্রিয়াধীন';

interface HistoryItem {
  id: string;
  date: string;
  amount: number;
  status: Status;
}

const StatusBadge = ({ status }: { status: Status }) => {
  return (
    <Badge
      className={cn({
        'bg-green-100 text-green-800 hover:bg-green-200': status === 'সফল',
        'bg-red-100 text-red-800 hover:bg-red-200': status === 'ব্যর্থ',
        'bg-yellow-100 text-yellow-800 hover:bg-yellow-200': status === 'প্রক্রিয়াধীন',
      })}
    >
      {status}
    </Badge>
  );
};

const HistoryTable = ({ data, type }: { data: HistoryItem[], type: 'recharge' | 'withdrawal' }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>তারিখ ও সময়</TableHead>
        <TableHead className="text-right">পরিমাণ</TableHead>
        <TableHead className="text-center">স্ট্যাটাস</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.length > 0 ? (
        data.map((item) => {
            const itemDate = new Date(item.date);
            const isValidDate = !isNaN(itemDate.getTime());
            return (
              <TableRow key={item.id}>
                <TableCell>
                  {isValidDate && (
                    <>
                      <div>{itemDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      <div className="text-xs text-muted-foreground">{itemDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                    </>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">৳{item.amount.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  <StatusBadge status={item.status} />
                </TableCell>
              </TableRow>
            )
        })
      ) : (
        <TableRow>
          <TableCell colSpan={3} className="text-center text-muted-foreground">
            {type === 'recharge' ? 'কোনো রিচার্জ ইতিহাস পাওয়া যায়নি।' : 'কোনো উত্তোলনের ইতিহাস পাওয়া যায়নি।'}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);


export default function TransactionHistoryPage() {
  const { user, isLoading } = useAuth();
  const [rechargeHistory, setRechargeHistory] = useState<HistoryItem[]>([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (user) {
        const rechargesData = user.rechargeHistory || {};
        const recharges = Object.keys(rechargesData).map(key => ({
            id: key,
            ...rechargesData[key]
        }));

        const withdrawalsData = user.withdrawalHistory || {};
        const withdrawals = Object.keys(withdrawalsData).map(key => ({
            id: key,
            ...withdrawalsData[key]
        }));

        setRechargeHistory(recharges.sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setWithdrawalHistory(withdrawals.sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
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
        <h1 className="flex-grow text-center text-xl font-headline font-bold">লেনদেনের ইতিহাস</h1>
        <div className="w-6"></div>
      </header>

      <main className="p-4 container mx-auto max-w-3xl">
        <Card>
          <CardContent className="p-4">
            <Tabs defaultValue="recharge">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="recharge">রিচার্জ</TabsTrigger>
                <TabsTrigger value="withdrawal">উত্তোলন</TabsTrigger>
              </TabsList>
              <TabsContent value="recharge" className="mt-4">
                <HistoryTable data={rechargeHistory} type="recharge" />
              </TabsContent>
              <TabsContent value="withdrawal" className="mt-4">
                <HistoryTable data={withdrawalHistory} type="withdrawal" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
