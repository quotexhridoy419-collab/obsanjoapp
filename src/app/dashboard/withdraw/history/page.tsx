
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

type WithdrawalStatus = 'সফল' | 'ব্যর্থ' | 'প্রক্রিয়াধীন';

interface WithdrawalHistory {
  id: string;
  date: string;
  amount: number;
  charge: number;
  received: number;
  status: WithdrawalStatus;
  paymentMethod: string;
  accountNumber: string;
}

const StatusBadge = ({ status }: { status: WithdrawalStatus }) => {
  return (
    <Badge
      className={cn({
        'bg-green-500 text-white hover:bg-green-600': status === 'সফল',
        'bg-red-500 text-white hover:bg-red-600': status === 'ব্যর্থ',
        'bg-yellow-500 text-white hover:bg-yellow-600': status === 'প্রক্রিয়াধীন',
      })}
    >
      {status}
    </Badge>
  );
};

const HistoryItemCard = ({ item }: { item: WithdrawalHistory }) => {
    const itemDate = new Date(item.date);
    const isValidDate = !isNaN(itemDate.getTime());
    return (
        <Card className="overflow-hidden shadow-lg mb-4">
            <div className="bg-primary p-3 text-primary-foreground">
                <h3 className="font-semibold">অর্ডার নম্বর : {item.id}</h3>
            </div>
            <CardContent className="p-4 space-y-3 bg-card">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">উত্তোলনের পরিমাণ</span>
                    <span className="font-bold text-red-600 text-lg">৳{item.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">সার্ভিস চার্জ (৭%)</span>
                    <span className="font-medium text-red-500">- ৳{item.charge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">প্রাপ্ত পরিমাণ</span>
                    <span className="font-bold text-green-600 text-lg">৳{item.received.toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">অবস্থা</span>
                    <StatusBadge status={item.status} />
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">পেমেন্ট পদ্ধতি</span>
                    <span className="font-medium">{item.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">অ্যাকাউন্ট</span>
                    <span className="font-medium">{item.accountNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">তারিখ</span>
                     {isValidDate && <span className="text-muted-foreground">{itemDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} {itemDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>}
                </div>
                 <Button asChild className="w-full bg-primary hover:bg-primary/90 mt-2">
                    <Link href="https://t.me/+rVThh-_OpYo3ODBl" target="_blank" rel="noopener noreferrer">
                        উত্তোলনের প্রমাণ যোগ করুন
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
};

export default function WithdrawalHistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [history, setHistory] = useState<WithdrawalHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchHistory = async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        try {
            const historyRef = ref(db, `users/${user.id}/withdrawalHistory`);
            const snapshot = await get(historyRef);
            if (snapshot.exists()) {
                const historyData = snapshot.val();
                const historyList = Object.keys(historyData).map(key => ({
                    id: key,
                    ...historyData[key]
                })).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setHistory(historyList);
            }
        } catch (error) {
            console.error("Could not parse user data from Firebase", error);
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
      <header className="flex items-center p-4 bg-primary text-primary-foreground shadow-md">
        <Link href="/dashboard/withdraw" className="text-primary-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="flex-grow text-center text-xl font-headline font-bold">উত্তোলনের রেকর্ড</h1>
        <div className="w-6"></div>
      </header>

      <main className="p-4 container mx-auto max-w-3xl">
        {history.length > 0 ? (
            history.map((item) => (
                <HistoryItemCard key={item.id} item={item} />
            ))
        ) : (
            <Card>
                <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">
                        কোনো ইতিহাস পাওয়া যায়নি।
                    </p>
                </CardContent>
            </Card>
        )}
      </main>
    </div>
  );
}
