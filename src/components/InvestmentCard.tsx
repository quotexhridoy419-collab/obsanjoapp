
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Diamond } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth.tsx';
import { db } from '@/lib/firebase';
import { ref, update, get, runTransaction } from 'firebase/database';

type InvestmentCardProps = {
  id: string;
  title: string;
  price: number;
  dailyIncome: number;
  cycle: number;
  totalIncome: number;
  quotaCurrent: number;
  quotaMax: number;
  image: string;
  dataAiHint: string;
  tag?: string;
  initialRechargeBalance: number;
  isInitiallyPurchased: boolean;
};


export default function InvestmentCard({
  id,
  title,
  price,
  dailyIncome,
  cycle,
  totalIncome,
  quotaCurrent,
  quotaMax,
  image,
  dataAiHint,
  tag,
  initialRechargeBalance,
  isInitiallyPurchased,
}: InvestmentCardProps) {
  const { toast } = useToast();
  const { user, refetchUser } = useAuth();
  const [isPurchased, setIsPurchased] = useState(isInitiallyPurchased);
  const [isLoading, setIsLoading] = useState(false);

  const applyCommission = async (purchasePrice: number, buyerId: string) => {
    const commissionRates = { level1: 0.15, level2: 0.03, level3: 0.02 };

    let referrerChain: string[] = [];
    let currentUserId = buyerId;
    
    try {
        for (let i = 0; i < 3; i++) {
            const currentUserSnapshot = await get(ref(db, `users/${currentUserId}`));
            if (currentUserSnapshot.exists()) {
                const referrerId = currentUserSnapshot.val().referrerId;
                if (referrerId) {
                    referrerChain.push(referrerId);
                    currentUserId = referrerId;
                } else break;
            } else break;
        }

        for (let i = 0; i < referrerChain.length; i++) {
            const referrerId = referrerChain[i];
            const level = i + 1;
            const commissionRate = commissionRates[`level${level}` as keyof typeof commissionRates];
            const commissionAmount = purchasePrice * commissionRate;
            
            const referrerRef = ref(db, `users/${referrerId}`);
            await runTransaction(referrerRef, (referrerData) => {
                if (referrerData) {
                    referrerData.balance = (referrerData.balance || 0) + commissionAmount;
                    referrerData.teamCommission = (referrerData.teamCommission || 0) + commissionAmount;
                    referrerData.totalIncome = (referrerData.totalIncome || 0) + commissionAmount;
                    
                    const commissionRecord = { from: buyerId, level, amount: commissionAmount, date: new Date().toISOString() };
                    if (!referrerData.commissionHistory) {
                        referrerData.commissionHistory = {};
                    }
                    const newHistoryKey = `comm_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                    referrerData.commissionHistory[newHistoryKey] = commissionRecord;
                }
                return referrerData;
            });
        }
    } catch (error) {
        console.error("Commission application failed: ", error);
        // Do not show error toast to user, as this is a background process
    }
  }

  const handlePurchase = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'ত্রুটি', description: 'অনুগ্রহ করে আবার লগইন করুন।' });
      return;
    }

    if (isPurchased) {
        toast({
            variant: 'destructive',
            title: 'ব্যর্থ',
            description: 'আপনি ইতিমধ্যে এই প্যাকেজটি কিনেছেন।',
        });
        return;
    }

    if (initialRechargeBalance < price) {
        toast({
            variant: 'destructive',
            title: 'ব্যর্থ',
            description: 'প্যাকেজটি কেনার জন্য আপনার রিচার্জ ব্যালেন্সে পর্যাপ্ত টাকা নেই।',
        });
        return;
    }


    setIsLoading(true);

    try {
        const userRef = ref(db, `users/${user.id}`);
        const result = await runTransaction(userRef, (currentUserData) => {
            if (currentUserData) {
                if ((currentUserData.rechargeBalance || 0) < price) {
                    // Abort transaction
                    return; 
                }
                const investments = currentUserData.investments || {};
                const hasPurchased = Object.values(investments).some((inv: any) => inv.id === id);

                if (hasPurchased) {
                    // Abort transaction
                    return;
                }

                currentUserData.rechargeBalance -= price;
                
                const newInvestment = { 
                    id, title, price, dailyIncome, cycle, image, tag, dataAiHint,
                    purchaseDate: new Date().toISOString(),
                    lastClaimTime: new Date().toISOString() 
                };
                
                if (!currentUserData.investments) {
                    currentUserData.investments = {};
                }
                const investmentKey = `inv_${Date.now()}`;
                currentUserData.investments[investmentKey] = newInvestment;
            }
            return currentUserData;
        });

        if (result.committed) {
             setIsPurchased(true);
             refetchUser();
             toast({
                 title: 'সফল!',
                 description: `${title} প্যাকেজটি সফলভাবে কেনা হয়েছে।`,
             });
             // Apply commission asynchronously
             applyCommission(price, user.id);
        } else {
             const snapshot = await get(userRef);
             const latestUserData = snapshot.val();
             if ((latestUserData.rechargeBalance || 0) < price) {
                 toast({ variant: 'destructive', title: 'ব্যর্থ', description: 'প্যাকেজটি কেনার জন্য আপনার রিচার্জ ব্যালেন্সে পর্যাপ্ত টাকা নেই।' });
             } else if (Object.values(latestUserData.investments || {}).some((inv: any) => inv.id === id)) {
                 toast({ variant: 'destructive', title: 'ব্যর্থ', description: 'আপনি ইতিমধ্যে এই প্যাকেজটি কিনেছেন।' });
             } else {
                 toast({ variant: 'destructive', title: 'ব্যর্থ', description: 'প্যাকেজ কিনতে সমস্যা হয়েছে।' });
             }
        }

    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'ব্যর্থ',
            description: 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।',
        });
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="overflow-hidden shadow-md">
      <div className="flex">
        <div className="relative w-1/3 flex-shrink-0">
            <Image
              src={image}
              alt={title}
              fill
              className="object-contain p-2"
              data-ai-hint={dataAiHint}
              sizes="(max-width: 768px) 33vw, 150px"
            />
        </div>
        <CardContent className="flex flex-col justify-between flex-grow p-3 space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                <h3 className="font-headline font-semibold text-foreground">{title}</h3>
                {tag && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-600 font-bold text-xs px-1.5 py-0.5">
                        <Diamond className="mr-1 h-3 w-3" />
                        {tag}
                    </Badge>
                )}
                </div>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-xs">
                কোটা {quotaCurrent}/{quotaMax}
                </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground">রাজস্ব চক্র {cycle} দিন</p>

            <div className="flex items-end justify-between">
                <div className='text-left'>
                <p className="text-xs text-muted-foreground">দৈনিক আয়</p>
                <p className="font-semibold text-primary">Tk {dailyIncome.toFixed(2)}</p>
                </div>
                <div className='text-left'>
                <p className="text-xs text-muted-foreground">মোট আয়</p>
                <p className="font-semibold text-primary">Tk {totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
            </div>

            <Button 
                className="w-full h-auto rounded-full px-5 py-2 text-sm font-bold"
                onClick={handlePurchase}
                disabled={isPurchased || isLoading}
            >
                {isLoading ? 'প্রসেসিং...' : isPurchased ? 'কেনা হয়েছে' : `কিনুন ${price.toLocaleString()}`}
            </Button>
        </CardContent>
      </div>
    </Card>
  );
}
