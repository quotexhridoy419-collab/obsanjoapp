
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase, AlertTriangle, Timer, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth.tsx';
import { db } from '@/lib/firebase';
import { ref, get, runTransaction, update } from 'firebase/database';

interface Investment {
  id: string; // chicken-farm etc.
  key: string; // The unique key from Firebase (e.g., inv_1720...)
  title: string;
  price: number;
  dailyIncome: number;
  cycle: number;
  purchaseDate: string;
  lastClaimTime?: string;
  image?: string;
  dataAiHint?: string;
}

const COUNTDOWN_HOURS = 24;

const InvestmentItem = ({ investment, onClaim }: { investment: Investment, onClaim: (investment: Investment) => void }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [canClaim, setCanClaim] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    const countdownDuration = COUNTDOWN_HOURS * 60 * 60 * 1000;
    const lastClaimOrPurchaseTime = investment.lastClaimTime ? new Date(investment.lastClaimTime).getTime() : new Date(investment.purchaseDate).getTime();
    const now = new Date().getTime();
    
    const timeSinceLastAction = now - lastClaimOrPurchaseTime;

    if (timeSinceLastAction >= countdownDuration) {
      setCanClaim(true);
      setTimeLeft(0);
    } else {
      setCanClaim(false);
      setTimeLeft(countdownDuration - timeSinceLastAction);
    }
  }, [investment]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        if (prevTimeLeft <= 1000) {
          setCanClaim(true);
          clearInterval(intervalId);
          return 0;
        }
        return prevTimeLeft - 1000;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const handleClaimClick = async () => {
      setIsClaiming(true);
      await onClaim(investment);
      setIsClaiming(false);
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const purchaseDate = new Date(investment.purchaseDate);
  const expiryDate = new Date(purchaseDate);
  expiryDate.setDate(purchaseDate.getDate() + investment.cycle);
  const today = new Date();
  const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const isValidDate = !isNaN(purchaseDate.getTime());


  return (
    <Card className="shadow-md overflow-hidden">
        <div className="flex">
            <div className="relative w-1/3 flex-shrink-0">
                 <Image
                    src={investment.image || "https://placehold.co/150x150.png"}
                    alt={investment.title}
                    fill
                    className="object-contain"
                    data-ai-hint={investment.dataAiHint}
                    sizes="(max-width: 768px) 33vw, 150px"
                    onError={(e) => e.currentTarget.src = 'https://placehold.co/150x150.png'}
                />
            </div>
            <CardContent className="p-4 flex flex-col gap-4 flex-grow">
                <div>
                    <h3 className="font-bold text-lg text-foreground">{investment.title}</h3>
                    {isValidDate && <p className="text-sm text-muted-foreground">কেনার তারিখ: {purchaseDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <p className="text-muted-foreground">দৈনিক আয়</p>
                        <p className="font-semibold text-primary">৳{investment.dailyIncome.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">বাকি দিন</p>
                        <p className="font-semibold text-primary">{daysRemaining} দিন</p>
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><Timer size={16} /> পরবর্তী আয়</p>
                    <div className="text-2xl font-mono font-bold text-accent">
                        {formatTime(timeLeft)}
                    </div>
                </div>
                <Button onClick={handleClaimClick} disabled={!canClaim || isClaiming} className="w-full font-bold">
                {isClaiming ? 'প্রসেসিং...' : canClaim ? 'আয় সংগ্রহ করুন' : 'অপেক্ষা করুন'}
                </Button>
            </CardContent>
        </div>
    </Card>
  )
}


export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const { toast } = useToast();
  const { user, isLoading, refetchUser } = useAuth();

  useEffect(() => {
    if (user) {
        try {
            const userInvestmentsData = user.investments || {};
            const userInvestments = Object.keys(userInvestmentsData).map((key: any) => ({
                ...userInvestmentsData[key],
                key: key,
            }));
            setInvestments(userInvestments);
        } catch (error) {
            toast({ variant: 'destructive', title: 'ত্রুটি', description: 'বিনিয়োগের তথ্য আনতে সমস্যা হয়েছে।' });
        }
    }
  }, [user, toast]);


  const handleClaimIncome = async (investmentToClaim: Investment) => {
    if (!user) return;
    
    try {
        const userRef = ref(db, `users/${user.id}`);
        await runTransaction(userRef, (currentUser) => {
            if (currentUser) {
                // Update balances
                currentUser.balance = (currentUser.balance || 0) + investmentToClaim.dailyIncome;
                currentUser.totalIncome = (currentUser.totalIncome || 0) + investmentToClaim.dailyIncome;

                // Update investment last claim time
                if (currentUser.investments && currentUser.investments[investmentToClaim.key]) {
                    currentUser.investments[investmentToClaim.key].lastClaimTime = new Date().toISOString();
                }

                // Add to income history
                 const newIncomeRecord = {
                    investmentTitle: investmentToClaim.title,
                    amount: investmentToClaim.dailyIncome,
                    date: new Date().toISOString(),
                };
                if (!currentUser.incomeHistory) {
                    currentUser.incomeHistory = {};
                }
                const newHistoryKey = `income_${Date.now()}`;
                currentUser.incomeHistory[newHistoryKey] = newIncomeRecord;
            }
            return currentUser;
        });

        refetchUser(); // This will trigger a re-render and update the investment list
        toast({
            title: 'আয় সংগ্রহ সফল!',
            description: `আপনার অ্যাকাউন্টে ৳${investmentToClaim.dailyIncome.toFixed(2)} যোগ করা হয়েছে।`,
        });
    } catch (error) {
        toast({ variant: 'destructive', title: 'ত্রুটি', description: 'আয় সংগ্রহ করতে সমস্যা হয়েছে।' });
    }
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">লোড হচ্ছে...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between bg-primary p-4 text-primary-foreground">
        <Link href="/dashboard" className="text-primary-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="flex-grow text-center font-headline text-xl font-bold">আমার বিনিয়োগ</h1>
        <Link href="/dashboard/investments/history" className="text-primary-foreground">
          <History className="h-6 w-6" />
        </Link>
      </header>

      <main className="container mx-auto max-w-3xl p-4">
        {investments.length > 0 ? (
          <div className="space-y-4">
            {investments.map((item) => (
                <InvestmentItem key={item.key} investment={item} onClaim={handleClaimIncome} />
            ))}
          </div>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
              <AlertTriangle className="h-16 w-16 text-destructive" />
              <p className="text-lg font-medium text-muted-foreground text-center">
                আপনার কোনো সক্রিয় বিনিয়োগ নেই।
              </p>
              <Button asChild>
                <Link href="/dashboard">এখনই বিনিয়োগ করুন</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
