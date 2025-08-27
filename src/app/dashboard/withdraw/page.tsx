
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PlusCircle, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth.tsx';
import { db } from '@/lib/firebase';
import { ref, get, push, runTransaction } from 'firebase/database';
import Image from 'next/image';

interface BankCard {
  name: string;
  paymentMethod: 'bKash' | 'Nagad';
  accountNumber: string;
}

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

const AddCardPrompt = () => (
  <Card className="text-center">
    <CardHeader>
      <CardTitle>কোনো ব্যাংক কার্ড পাওয়া যায়নি</CardTitle>
      <CardDescription>টাকা তোলার জন্য অনুগ্রহ করে প্রথমে আপনার ব্যাংক কার্ড যোগ করুন।</CardDescription>
    </CardHeader>
    <CardContent>
      <Button asChild>
        <Link href="/dashboard/withdraw/add-card">
          <PlusCircle className="mr-2 h-4 w-4" />
          নতুন কার্ড যোগ করুন
        </Link>
      </Button>
    </CardContent>
  </Card>
);

const WithdrawalForm = ({ card, siteSettings, userPassword, balance, refetchUser }: { card: BankCard, siteSettings: { isWithdrawalEnabled: boolean }, userPassword: string, balance: number, refetchUser: () => void }) => {
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [password, setPassword] = useState('');
    
    const MINIMUM_WITHDRAWAL = 200;
    const SERVICE_CHARGE_PERCENTAGE = 7;
    
    const logoMap = {
        bKash: 'https://firebasestorage.googleapis.com/v0/b/nurislam5.appspot.com/o/1756140642069.jpg?alt=media&token=cdde89be-9a9c-454b-a2c5-23881c020cbb',
        Nagad: 'https://firebasestorage.googleapis.com/v0/b/nurislam5.appspot.com/o/1756140728273.jpg?alt=media&token=ac83ce6d-e551-4c0e-a97c-4bcbe5fb1472'
    };

    const handleWithdraw = async () => {
        if (!siteSettings.isWithdrawalEnabled) {
            toast({ variant: 'destructive', title: 'অক্ষম', description: 'এই মুহূর্তে উত্তোলন অক্ষম করা হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।' });
            return;
        }

        const withdrawalAmount = parseFloat(amount);
        if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
            toast({ variant: 'destructive', title: 'ত্রুটি', description: 'অনুগ্রহ করে একটি সঠিক পরিমাণ লিখুন।' });
            return;
        }
        if (withdrawalAmount < MINIMUM_WITHDRAWAL) {
             toast({ variant: 'destructive', title: 'ত্রুটি', description: `সর্বনিম্ন উত্তোলনের পরিমাণ ${MINIMUM_WITHDRAWAL} টাকা।` });
            return;
        }
        if (withdrawalAmount > balance) {
            toast({ variant: 'destructive', title: 'অপর্যাপ্ত ব্যালেন্স', description: 'আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই।' });
            return;
        }
        
        if (password !== userPassword) {
            toast({ variant: 'destructive', title: 'ত্রুটি', description: 'আপনার পাসওয়ার্ড সঠিক নয়।' });
            return;
        }
        
        if (!user) return;

        const serviceCharge = withdrawalAmount * (SERVICE_CHARGE_PERCENTAGE / 100);
        const receivedAmount = withdrawalAmount - serviceCharge;
        
        const userRef = ref(db, `users/${user.id}`);
        try {
            await runTransaction(userRef, (currentUserData) => {
                if (currentUserData) {
                    if ((currentUserData.balance || 0) < withdrawalAmount) {
                        return; 
                    }
                    currentUserData.balance = (currentUserData.balance || 0) - withdrawalAmount;
                    
                    const newWithdrawal: Omit<WithdrawalHistory, 'id'> = {
                        date: new Date().toISOString(),
                        amount: withdrawalAmount,
                        charge: serviceCharge,
                        received: receivedAmount,
                        status: 'প্রক্রিয়াধীন',
                        paymentMethod: card.paymentMethod,
                        accountNumber: card.accountNumber,
                    };

                    if (!currentUserData.withdrawalHistory) {
                        currentUserData.withdrawalHistory = {};
                    }
                    const newRequestRef = push(ref(db, `users/${user.id}/withdrawalHistory`));
                    currentUserData.withdrawalHistory[newRequestRef.key!] = newWithdrawal;
                }
                return currentUserData;
            });

            refetchUser();
            toast({ title: 'সফল', description: `আপনার ৳${withdrawalAmount.toFixed(2)} তোলার অনুরোধ জমা দেওয়া হয়েছে।` });
            setAmount('');
            setPassword('');
            router.push('/dashboard/withdraw/history');
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'ত্রুটি', description: 'উত্তোলনের অনুরোধ প্রক্রিয়া করতে ব্যর্থ হয়েছে।' });
        }
    };
    
  return (
    <div className="space-y-4">
        <Card className="bg-primary/90 text-primary-foreground text-center shadow-lg">
             <CardContent className="p-4">
                <p className="text-sm opacity-90">বর্তমান ব্যালেন্স</p>
                <p className="text-3xl font-bold">৳ {balance.toFixed(2)}</p>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>আপনার ব্যাংক কার্ড</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                    <Image 
                        src={logoMap[card.paymentMethod]} 
                        alt={`${card.paymentMethod} logo`}
                        fill
                        className="object-cover"
                    />
                </div>
              <div>
                <p className="font-semibold">{card.name}</p>
                <p className="text-sm text-muted-foreground">
                  {card.paymentMethod} - {card.accountNumber}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardContent className="p-4 space-y-4">
                <div>
                    <Label htmlFor="withdrawal-amount" className="text-muted-foreground">টাকার পরিমাণ</Label>
                    <Input 
                        id="withdrawal-amount"
                        type="number" 
                        placeholder="200 - 50000" 
                        className="h-12 mt-1 text-base border-primary/20 focus-visible:ring-primary/20" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
                 <div>
                    <Label htmlFor="withdrawal-password">লগইন পাসওয়ার্ড</Label>
                    <Input
                        id="withdrawal-password"
                        type="password"
                        placeholder="আপনার লগইন পাসওয়ার্ড দিন"
                        className="h-12 mt-1 text-base border-primary/20 focus-visible:ring-primary/20"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </CardContent>
        </Card>

        <Button onClick={handleWithdraw} className="w-full h-14 text-xl font-bold bg-primary hover:bg-primary/90 rounded-lg shadow-lg" disabled={!siteSettings.isWithdrawalEnabled}>
           {siteSettings.isWithdrawalEnabled ? 'এখনই উত্তোলন করুন' : 'উত্তোলন অক্ষম'}
        </Button>

        <Card className="mt-6 text-sm text-muted-foreground">
             <CardHeader>
                <CardTitle className="text-base text-foreground">উত্তোলনের নিয়মাবলী</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <p>১. উত্তোলনের সময়: সকাল ১০:০০ থেকে বিকাল ৫:০০ পর্যন্ত।</p>
                <p>২. সর্বনিম্ন উত্তোলনের পরিমাণ {MINIMUM_WITHDRAWAL} টাকা।</p>
                <p>৩. উত্তোলন ফি {SERVICE_CHARGE_PERCENTAGE}%।</p>
                <p>৪. আপনার অ্যাকাউন্টে ২৪ ঘন্টার মধ্যে টাকা পৌঁছে যাবে।</p>
            </CardContent>
        </Card>
    </div>
  );
};

export default function WithdrawPage() {
  const { user, isLoading, refetchUser } = useAuth();
  const [siteSettings, setSiteSettings] = useState({ isWithdrawalEnabled: true });
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
        setIsSettingsLoading(true);
        try {
            const settingsRef = ref(db, 'siteSettings');
            const settingsSnapshot = await get(settingsRef);
            if (settingsSnapshot.exists()) {
                setSiteSettings(settingsSnapshot.val());
            }
        } catch (error) {
            console.error('Failed to fetch site settings from Firebase', error);
        } finally {
            setIsSettingsLoading(false);
        }
    }
    fetchSettings();
  }, []);

  if (isLoading || isSettingsLoading) {
    return <div className="text-center p-8">লোড হচ্ছে...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center bg-primary p-4 text-primary-foreground">
        <Link href="/dashboard" className="text-primary-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="flex-grow text-center font-headline text-xl font-bold">উত্তোলন</h1>
        <Link href="/dashboard/withdraw/history" className="text-primary-foreground">
            <History className="h-6 w-6" />
        </Link>
      </header>
      <main className="container mx-auto max-w-3xl p-4">
        {user?.bankCard && user.password ? (
          <WithdrawalForm card={user.bankCard} siteSettings={siteSettings} userPassword={user.password} balance={user.balance || 0} refetchUser={refetchUser} />
        ) : (
          <AddCardPrompt />
        )}
      </main>
    </div>
  );
}
