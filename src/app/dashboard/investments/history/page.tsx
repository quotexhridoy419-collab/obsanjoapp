
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useToast } from '@/hooks/use-toast';

interface IncomeRecord {
  id: string; // Firebase key
  investmentTitle: string;
  amount: number;
  date: string;
}

const IncomeRecordCard = ({ record }: { record: IncomeRecord }) => {
    const recordDate = new Date(record.date);
    const isValidDate = !isNaN(recordDate.getTime());

    return (
        <Card className="shadow">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                     <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="font-semibold text-lg text-foreground">{record.investmentTitle}</p>
                        {isValidDate && (
                            <p className="text-sm text-muted-foreground">
                                {recordDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                {' '}
                                {recordDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </p>
                        )}
                    </div>
                </div>
                <p className="font-bold text-xl text-green-600">+৳{record.amount.toFixed(2)}</p>
            </CardContent>
        </Card>
    );
};

export default function InvestmentHistoryPage() {
  const [incomeHistory, setIncomeHistory] = useState<IncomeRecord[]>([]);
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
        try {
            const historyData = user.incomeHistory || {};
            const historyList = Object.keys(historyData).map(key => ({
                id: key,
                ...historyData[key]
            })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setIncomeHistory(historyList);
        } catch (error) {
            toast({ variant: 'destructive', title: 'ত্রুটি', description: 'আয়ের ইতিহাস আনতে সমস্যা হয়েছে।' });
        }
    }
  }, [user, toast]);

  if (isLoading) {
    return <div className="text-center p-8">লোড হচ্ছে...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center bg-primary p-4 text-primary-foreground">
        <Link href="/dashboard/investments" className="text-primary-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="flex-grow text-center font-headline text-xl font-bold">আয়ের ইতিহাস</h1>
        <div className="w-6"></div>
      </header>

      <main className="container mx-auto max-w-3xl p-4">
        {incomeHistory.length > 0 ? (
          <div className="space-y-3">
            {incomeHistory.map((record) => (
              <IncomeRecordCard key={record.id} record={record} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">এখনো কোনো আয়ের রেকর্ড নেই।</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
