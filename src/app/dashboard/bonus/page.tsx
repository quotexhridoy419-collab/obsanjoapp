
'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Gift, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth.tsx';
import { db } from '@/lib/firebase';
import { ref, update, runTransaction } from 'firebase/database';


const BONUS_PERCENTAGE = 0.50;
const COUNTDOWN_HOURS = 24;

export default function BonusPage() {
  const { toast } = useToast();
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [dailyBonus, setDailyBonus] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canClaim, setCanClaim] = useState(false);
  const { user, isLoading, refetchUser } = useAuth();
  const [isClaiming, setIsClaiming] = useState(false);


  useEffect(() => {
    const calculateBonusInfo = () => {
        if (user) {
            const userInvestments = user.investments ? Object.values(user.investments) : [];
            const total = userInvestments.reduce((sum: number, item: any) => sum + item.price, 0);
            setTotalInvestment(total);
            const calculatedBonus = total * (BONUS_PERCENTAGE / 100);
            setDailyBonus(calculatedBonus);

            const lastClaimedTime = user.lastBonusClaimTime ? new Date(user.lastBonusClaimTime) : null;
            const now = new Date();

            if (lastClaimedTime) {
                const timeSinceLastClaim = now.getTime() - lastClaimedTime.getTime();
                const countdownDuration = COUNTDOWN_HOURS * 60 * 60 * 1000;

                if (timeSinceLastClaim >= countdownDuration) {
                    setCanClaim(true);
                    setTimeLeft(0);
                } else {
                    setCanClaim(false);
                    setTimeLeft(countdownDuration - timeSinceLastClaim);
                }
            } else {
                setCanClaim(true);
                setTimeLeft(0);
            }
        }
    };
    calculateBonusInfo();
  }, [user]);

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

  const handleClaimBonus = async () => {
    if (!canClaim || dailyBonus <= 0 || !user) return;
    setIsClaiming(true);

    try {
      const userRef = ref(db, `users/${user.id}`);
      await runTransaction(userRef, (currentUser) => {
        if (currentUser) {
            currentUser.balance = (currentUser.balance || 0) + dailyBonus;
            currentUser.totalIncome = (currentUser.totalIncome || 0) + dailyBonus;
            currentUser.lastBonusClaimTime = new Date().toISOString();
        }
        return currentUser;
      });
      
      refetchUser();
      setCanClaim(false);
      setTimeLeft(COUNTDOWN_HOURS * 60 * 60 * 1000);
      toast({
          title: 'বোনাস সংগ্রহ সফল!',
          description: `আপনার অ্যাকাউন্টে ৳${dailyBonus.toFixed(2)} যোগ করা হয়েছে।`,
      });

    } catch (error) {
       toast({
          variant: 'destructive',
          title: 'ত্রুটি',
          description: 'বোনাস সংগ্রহ করতে সমস্যা হয়েছে।',
      });
    }

    setIsClaiming(false);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = timeLeft > 0 ? 100 - (timeLeft / (COUNTDOWN_HOURS * 60 * 60 * 1000)) * 100 : 100;

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">লোড হচ্ছে...</div>;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center bg-primary p-4 text-primary-foreground">
        <Link href="/dashboard" className="text-primary-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="flex-grow text-center font-headline text-xl font-bold">দৈনিক বোনাস</h1>
        <div className="w-6"></div>
      </header>

      <main className="container mx-auto max-w-3xl p-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Gift /> বোনাস নির্দেশিকা</CardTitle>
            <CardDescription>
              আপনার মোট বিনিয়োগের উপর ভিত্তি করে প্রতিদিন ০.৫০% বোনাস সংগ্রহ করুন। ২৪ ঘন্টা পর পর আপনি এই বোনাস সংগ্রহ করতে পারবেন।
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            {totalInvestment > 0 ? (
                <>
                    <div>
                        <p className="text-sm text-muted-foreground">আপনার মোট বিনিয়োগ</p>
                        <p className="text-2xl font-bold text-primary">৳{totalInvestment.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">আপনার দৈনিক বোনাস</p>
                        <p className="text-3xl font-bold text-accent">৳{dailyBonus.toFixed(2)}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">পরবর্তী বোনাসের জন্য অপেক্ষা করুন</p>
                        <div className="text-4xl font-mono font-bold text-foreground">
                           {formatTime(timeLeft)}
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                    <Button 
                        onClick={handleClaimBonus} 
                        disabled={!canClaim || isClaiming} 
                        className="w-full h-14 text-lg font-bold"
                    >
                       {isClaiming ? 'প্রসেসিং...' : canClaim ? 'এখনই সংগ্রহ করুন' : 'অপেক্ষা করুন'}
                    </Button>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                    <p className="text-lg font-medium text-muted-foreground">
                        বোনাস পেতে অনুগ্রহ করে প্রথমে বিনিয়োগ করুন।
                    </p>
                    <Button asChild>
                        <Link href="/dashboard">বিনিয়োগ করতে যান</Link>
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
