
'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, HelpCircle, Check, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { db } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

const amounts = [600, 1000, 2000, 3000, 5000, 10000, 25000, 30000, 50000];

interface PaymentMethod {
  id: string;
  name: string;
  color: string;
  logo: string;
  number?: string;
  link?: string;
}

const initialPaymentMethods: PaymentMethod[] = [
    { id: 'bkash', name: 'bKash', color: 'text-[#e2136e]', logo: 'https://i.ibb.co/pWx2xN2/bkash.png' },
    { id: 'nagad', name: 'Nagad', color: 'text-[#f58220]', logo: 'https://i.ibb.co/qjqNq1k/nagad.png' },
];

export default function RechargePage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(600);
  const [selectedMethod, setSelectedMethod] = useState<string>('bkash');
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const { user } = useAuth();
  const router = useRouter();


  useEffect(() => {
    const fetchPaymentDetails = async () => {
        try {
            const detailsRef = ref(db, 'paymentDetails');
            const snapshot = await get(detailsRef);
            if (snapshot.exists()) {
                const details = snapshot.val();
                const availableMethods = initialPaymentMethods.map(method => ({
                    ...method,
                    logo: details[method.id]?.logo || method.logo,
                    number: details[method.id]?.number,
                    link: details[method.id]?.link,
                })).filter(method => {
                    return !!method.number;
                });
                setPaymentMethods(availableMethods);
                 if (availableMethods.length > 0 && !availableMethods.find(m => m.id === selectedMethod)) {
                    setSelectedMethod(availableMethods[0].id);
                }
            }
        } catch (error) {
            console.error("Error fetching payment details:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchPaymentDetails();
  }, []);

  const handleRechargeClick = () => {
    const methodDetails = paymentMethods.find(m => m.id === selectedMethod);
    if (!methodDetails) return;

    router.push(`/dashboard/recharge/payment?amount=${selectedAmount}&method=${selectedMethod}`);
  };


  return (
    <div className="bg-background min-h-screen">
      <header className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
        <Link href="/dashboard" className="text-primary-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-headline font-bold">রিচার্জ</h1>
        <Link href="/dashboard/recharge/history" className="text-sm text-primary-foreground/90">
          ইতিহাস রেকর্ড
        </Link>
      </header>

      <main className="p-4 container mx-auto max-w-3xl">
        <Card>
          <CardHeader>
             <CardTitle className="text-base font-medium text-muted-foreground">রিচার্জ পরিমাণ নির্বাচন করুন</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {amounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  className={cn(
                    "h-14 rounded-lg border-primary bg-transparent text-lg text-primary hover:bg-primary/10 hover:text-primary",
                    selectedAmount === amount && "bg-primary border-primary text-primary-foreground font-bold hover:bg-primary/90"
                  )}
                  onClick={() => setSelectedAmount(amount)}
                >
                  ৳{amount}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
             <CardTitle className="text-base font-medium text-muted-foreground">পেমেন্ট পদ্ধতি</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
             {isLoading ? <div className="text-sm">লোড হচ্ছে...</div> :
             paymentMethods.map((method) => (
                <div 
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={cn(
                        "flex items-center justify-between rounded-lg border bg-transparent p-4 cursor-pointer transition-all",
                        selectedMethod === method.id ? 'border-primary ring-2 ring-primary' : 'border-border'
                    )}
                >
                    <div className="flex items-center gap-3">
                         <Image
                            src={method.logo}
                            alt={`${method.name} logo`}
                            width={40}
                            height={40}
                            className="h-8 w-auto object-contain"
                            data-ai-hint={`${method.name} logo`}
                            priority
                         />
                         <span className={cn("text-lg font-bold", method.color)}>{method.name}</span>
                    </div>
                    <div className={cn(
                        "h-6 w-6 rounded-full border-2 flex items-center justify-center",
                         selectedMethod === method.id ? 'bg-primary border-primary' : 'border-muted-foreground'
                    )}>
                        {selectedMethod === method.id && <Check className="h-4 w-4 text-primary-foreground" />}
                    </div>
                </div>
            ))}
          </CardContent>
        </Card>

        <Button onClick={handleRechargeClick} className="w-full h-14 mt-8 rounded-lg bg-primary text-primary-foreground text-xl font-bold hover:bg-primary/90">
            রিচার্জ
        </Button>

        <div className="text-center mt-4">
           <AlertDialog>
            <AlertDialogTrigger asChild>
                <button className="text-sm text-muted-foreground inline-flex items-center gap-1">
                    <HelpCircle className="h-4 w-4" />
                    কিভাবে রিচার্জ করবেন জানতে এখানে ক্লিক করুন
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>রিচার্জ করার নির্দেশিকা</AlertDialogTitle>
                <AlertDialogDescription asChild>
                    <div className="space-y-2 mt-2 text-left text-sm text-muted-foreground">
                       <div>১. প্রথমে আপনার পছন্দের পেমেন্ট পদ্ধতি (যেমন: বিকাশ বা নগদ) নির্বাচন করুন।</div>
                       <div>২. প্রদর্শিত দোকানদারের অ্যাকাউন্ট নম্বরটি কপি করুন এবং আপনার অ্যাপ থেকে <span className="font-bold text-primary">"সেন্ড মানি"</span> অপশনটি ব্যবহার করে নির্ধারিত পরিমাণ টাকা পাঠান।</div>
                       <div>৩. টাকা পাঠানোর পর, আপনি একটি ১০-সংখ্যার লেনদেন আইডি (TrxID) পাবেন। সেই আইডিটি কপি করুন।</div>
                       <div>৪. আমাদের সাইটে ফিরে এসে নির্দিষ্ট জায়গায় লেনদেন আইডিটি পেস্ট করুন এবং "পেমেন্ট নিশ্চিত করুন" বাটনে ক্লিক করুন।</div>
                       <div>৫. অনলাইন পেমেন্ট নির্বাচন করলে আপনাকে সরাসরি পেমেন্ট গেটওয়েতে নিয়ে যাওয়া হবে।</div>
                       <div>আপনার পেমেন্ট কিছুক্ষণের মধ্যেই যাচাই করে অ্যাকাউন্টে যোগ করে দেওয়া হবে।</div>
                    </div>
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogAction>বুঝেছি</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
            </AlertDialog>
        </div>

        <section className="mt-10 text-muted-foreground text-sm space-y-3">
          <h3 className="text-lg text-foreground font-semibold mb-3">রিচার্জ বিধি</h3>
          <p>১. অর্ডার পরিমাণ অনুযায়ী অর্থ প্রদান করতে হবে।</p>
          <p>২. অর্থ প্রদানের পরে, অর্থ 10 মিনিটের মধ্যে ক্রেডিট করা হবে, দয়া করে ধৈর্য্যশীলভাবে অপেক্ষা করুন।</p>
          <p>৩. যদি আপনার অ্যাকাউন্টে 30 মিনিটের মধ্যে রিচার্জ না পায়, তাহলে পরামর্শের জন্য গ্রাহক সেবার সাথে যোগাযোগ করুন।</p>
        </section>
      </main>
    </div>
  );
}
