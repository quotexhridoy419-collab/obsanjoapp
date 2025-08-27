
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

type RechargeStatus = 'সফল' | 'ব্যর্থ' | 'প্রক্রিয়াধীন';

interface RechargeHistory {
  id: string;
  date: string;
  amount: number;
  status: RechargeStatus;
}

const StatusBadge = ({ status }: { status: RechargeStatus }) => {
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

export default function RechargeHistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [history, setHistory] = useState<RechargeHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        
        try {
            const historyRef = ref(db, `users/${user.id}/rechargeHistory`);
            const snapshot = await get(historyRef);
            if (snapshot.exists()) {
                const historyData = snapshot.val();
                const historyList = Object.keys(historyData).map(key => ({
                    id: key,
                    ...historyData[key]
                })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setHistory(historyList);
            }
        } catch (error) {
            console.error("Failed to fetch recharge history", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!authLoading) {
      fetchHistory();
    }
  }, [user, authLoading]);

  if (authLoading || isLoading) {
    return <div className="text-center p-8">লোড হচ্ছে...</div>;
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="flex items-center p-4 bg-primary text-primary-foreground">
        <Link href="/dashboard/recharge" className="text-primary-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="flex-grow text-center text-xl font-headline font-bold">রিচার্জ ইতিহাস</h1>
        <div className="w-6"></div>
      </header>

      <main className="p-4 container mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>আমার রিচার্জসমূহ</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>তারিখ ও সময়</TableHead>
                  <TableHead className="text-right">পরিমাণ</TableHead>
                  <TableHead className="text-center">স্ট্যাটাস</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length > 0 ? (
                  history.map((item) => {
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
                          <TableCell className="text-right font-medium">৳{item.amount}</TableCell>
                          <TableCell className="text-center">
                            <StatusBadge status={item.status} />
                          </TableCell>
                        </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      কোনো ইতিহাস পাওয়া যায়নি।
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
