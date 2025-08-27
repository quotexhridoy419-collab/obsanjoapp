
'use client';

import { useState, Suspense, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Copy, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { ref, get, push, set } from 'firebase/database';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

interface PaymentStyle {
    name: string;
    color: string;
    bgColor: string;
    hoverBgColor: string;
    logo: string;
}

const paymentMethodStyles: { [key: string]: PaymentStyle } = {
    bkash: { name: 'bKash', color: 'text-[#e2136e]', bgColor: 'bg-[#e2136e]', hoverBgColor: 'hover:bg-[#d81b60]', logo: 'https://i.ibb.co/pWx2xN2/bkash.png' },
    nagad: { name: 'Nagad', color: 'text-[#f58220]', bgColor: 'bg-[#f58220]', hoverBgColor: 'hover:bg-[#ef6c00]', logo: 'https://i.ibb.co/qjqNq1k/nagad.png' }
};

function PaymentComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const [trxId, setTrxId] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [paymentNumber, setPaymentNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const amountString = searchParams.get('amount');
  const method = searchParams.get('method') || 'bkash';
  const orderAmount = amountString ? parseInt(amountString, 10) : 0;
  
  const [selectedPaymentStyle, setSelectedPaymentStyle] = useState<PaymentStyle>(paymentMethodStyles[method] || paymentMethodStyles.bkash);
  
  useEffect(() => {
    const initialize = async () => {
        setIsLoading(true);
        try {
            const detailsRef = ref(db, 'paymentDetails');
            const snapshot = await get(detailsRef);
            if (snapshot.exists()) {
                const details = snapshot.val();
                if (details && details[method]) {
                    setPaymentNumber(details[method].number);
                    setSelectedPaymentStyle(prev => ({ ...prev, logo: details[method].logo || prev.logo }));
                } else {
                    setPaymentNumber('N/A');
                }
            }
        } catch (error) {
            console.error("Initialization error:", error);
            setPaymentNumber('N/A');
        } finally {
            setIsLoading(false);
        }
    };

    const updateDateTime = () => {
        const now = new Date();
        setCurrentDateTime(now.toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        }));
    };
    
    initialize();
    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);

    return () => clearInterval(intervalId);

  }, [method, router, toast]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'কপি করা হয়েছে',
      description: `${text} ক্লিপবোর্ডে কপি করা হয়েছে।`,
    });
  }, [toast]);

  const handleSubmit = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'ত্রুটি', description: 'ব্যবহারকারী লগইন করেননি।'});
        return;
    }
    
    const trxIdRegex = /^[a-zA-Z0-9]{10}$/;
    if (!trxIdRegex.test(trxId)) {
      toast({ variant: 'destructive', title: 'ত্রুটি', description: 'অনুগ্রহ করে একটি সঠিক ১০-সংখ্যার লেনদেন আইডি দিন।' });
      return;
    }
    
    // Check for duplicate trxId across all users
    const usersRef = ref(db, 'users');
    const usersSnapshot = await get(usersRef);
    if (usersSnapshot.exists()) {
        const usersData = usersSnapshot.val();
        for (const userId in usersData) {
            const history = usersData[userId].rechargeHistory;
            if (history) {
                for (const key in history) {
                    if (history[key].trxId === trxId) {
                        toast({ variant: 'destructive', title: 'ত্রুটি', description: 'এই লেনদেন আইডি ইতিমধ্যে ব্যবহার করা হয়েছে।' });
                        return;
                    }
                }
            }
        }
    }
    
    const userHistoryRef = ref(db, `users/${user.id}/rechargeHistory`);
    const newRequestRef = push(userHistoryRef);
    
    const newRecharge = {
      date: new Date().toISOString(),
      amount: orderAmount,
      status: 'প্রক্রিয়াধীন' as const,
      trxId: trxId,
    };
    
    try {
        await set(newRequestRef, newRecharge);
        toast({ title: 'অনুরোধ জমা হয়েছে!', description: `আপনার রিচার্জ অনুরোধ পর্যালোচনা করা হচ্ছে।` });
        router.push('/dashboard/recharge/history');
    } catch (error) {
        console.error("Recharge submission error:", error);
        toast({ variant: 'destructive', title: 'ত্রুটি', description: 'আপনার অনুরোধ জমা দিতে সমস্যা হয়েছে।'});
    }
  };

  if (authLoading || isLoading) {
    return <div className="flex min-h-screen items-center justify-center">লোড হচ্ছে...</div>;
  }
  if (!orderAmount) {
     return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="text-center p-8">
                <CardContent className="flex flex-col items-center gap-4">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                    <p className="text-lg font-medium">অবৈধ অনুরোধ। অনুগ্রহ করে রিচার্জ পৃষ্ঠা থেকে আবার চেষ্টা করুন।</p>
                    <Button onClick={() => router.push('/dashboard/recharge')}>ফিরে যান</Button>
                </CardContent>
            </Card>
        </div>
     )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex flex-col items-center bg-gray-100 p-6 text-center">
        <h1 className="text-3xl font-bold text-black">পেমেন্ট</h1>
        <p className="text-sm text-gray-500">{currentDateTime}</p>
      </header>
      <main className="container mx-auto max-w-md p-4">
        <div className={cn("rounded-lg p-6 text-white shadow-lg", selectedPaymentStyle.bgColor)}>
            <div className="text-center mb-4 space-y-2">
                 <p>সমস্যা এড়াতে অনুগ্রহ করে সঠিক পরিমাণ স্থানান্তর করুন এবং সঠিক TxnID পূরণ করুন।</p>
                 <p>এই {selectedPaymentStyle.name} এজেন্ট অ্যাকাউন্টে অর্থ প্রদানের জন্য <span className="font-bold">"সেন্ড মানি"</span> ব্যবহার করুন।</p>
            </div>
            
            <div className="rounded-lg bg-white p-4 text-gray-800 space-y-3 mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-gray-500">ওয়ালেট</span>
                    <div className="flex items-center gap-2">
                        <Image
                            src={selectedPaymentStyle.logo}
                            alt={`${selectedPaymentStyle.name} logo`}
                            width={24}
                            height={24}
                            className="h-6 w-auto object-contain"
                            data-ai-hint={`${selectedPaymentStyle.name} logo`}
                            priority
                         />
                        <span className={cn("font-bold", selectedPaymentStyle.color)}>{selectedPaymentStyle.name}</span>
                    </div>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-gray-500">নম্বর</span>
                    <div className="flex items-center gap-2">
                        <span className={cn("font-semibold", selectedPaymentStyle.color)}>{paymentNumber}</span>
                        <Copy className="h-4 w-4 text-gray-500 cursor-pointer" onClick={() => handleCopy(paymentNumber)} />
                    </div>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-gray-500">পরিমাণ</span>
                    <div className="flex items-center gap-2">
                         <span className={cn("font-semibold", selectedPaymentStyle.color)}>{orderAmount}</span>
                         <Copy className="h-4 w-4 text-gray-500 cursor-pointer" onClick={() => handleCopy(orderAmount.toString())} />
                    </div>
                </div>
            </div>

            <div>
                <label htmlFor="trxId" className="block text-sm mb-2">সম্পূর্ণ করতে অনুগ্রহ করে TxnID লিখুন</label>
                <Input
                    id="trxId"
                    placeholder=""
                    className="h-12 text-center text-lg tracking-widest bg-white text-black border-gray-300 focus:ring-pink-500"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    required
                />
            </div>

            <Button
                onClick={handleSubmit}
                className={cn("mt-6 h-12 w-full text-lg font-bold rounded-lg shadow-lg text-white", selectedPaymentStyle.bgColor, selectedPaymentStyle.hoverBgColor)}
            >
                জমা দিন
            </Button>
        </div>
      </main>
    </div>
  );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">লোড হচ্ছে...</div>}>
            <PaymentComponent />
        </Suspense>
    )
}
