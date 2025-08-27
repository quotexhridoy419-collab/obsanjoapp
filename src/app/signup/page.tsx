
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Smartphone, MessageSquare, KeyRound, Gift, User } from 'lucide-react';
import { db } from '@/lib/firebase';
import { ref, get, set, query, orderByChild, equalTo } from 'firebase/database';


const InputField = ({ icon, placeholder, type = 'text', value, onChange, children, ...props }: { icon: React.ElementType, placeholder: string, type?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, children?: React.ReactNode, [key: string]: any }) => (
    <div className="relative flex items-center">
        <div className="absolute left-3">
            {React.createElement(icon, { className: "h-5 w-5 text-muted-foreground" })}
        </div>
        <Input
            type={type}
            placeholder={placeholder}
            className="pl-10 h-12 bg-gray-100 border-none focus-visible:ring-1 focus-visible:ring-primary"
            value={value}
            onChange={onChange}
            required
            {...props}
        />
        {children}
    </div>
);


function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [recommendationCode, setRecommendationCode] = useState('');
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const refCodeFromUrl = searchParams.get('ref');

  useEffect(() => {
    if (refCodeFromUrl) {
      setRecommendationCode(refCodeFromUrl);
    }
  }, [refCodeFromUrl]);
  
  const handleSendOtp = () => {
    const mobileRegex = /^01[3-9]\d{8}$/;
    if (!mobileRegex.test(mobileNumber)) {
        toast({ variant: 'destructive', title: 'ত্রুটি', description: 'অনুগ্রহ করে একটি সঠিক মোবাইল নম্বর দিন।' });
        return;
    }
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    toast({
        title: 'Verification Code',
        description: `আপনার OTP হল: ${generatedOtp}`,
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!fullName) {
      toast({ variant: 'destructive', title: 'ত্রুটি', description: 'অনুগ্রহ করে আপনার সম্পূর্ণ নাম লিখুন।' });
      setIsLoading(false);
      return;
    }
    const mobileRegex = /^01[3-9]\d{8}$/;
    if (!mobileRegex.test(mobileNumber)) {
        toast({ variant: 'destructive', title: 'ত্রুটি', description: 'অনুগ্রহ করে একটি সঠিক ১১-সংখ্যার মোবাইল নম্বর দিন।' });
        setIsLoading(false);
        return;
    }
    if (password.length < 6) {
      toast({ variant: 'destructive', title: 'ত্রুটি', description: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
      setIsLoading(false);
      return;
    }
    if (!agree) {
      toast({ variant: 'destructive', title: 'ত্রুটি', description: 'অনুগ্রহ করে Privacy Policy-তে সম্মত হন।' });
      setIsLoading(false);
      return;
    }

    try {
        const userId = `uid_${mobileNumber}`;
        const userRef = ref(db, `users/${userId}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            toast({ variant: 'destructive', title: 'ত্রুটি', description: 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা হয়েছে।' });
            setIsLoading(false);
            return;
        }

        let referrerId: string | null = null;
        let referrerCode: string | null = null;

        if (recommendationCode) {
            const usersRef = ref(db, 'users');
            const referrerQuery = query(usersRef, orderByChild('referralCode'), equalTo(recommendationCode));
            const referrerSnapshot = await get(referrerQuery);

            if (referrerSnapshot.exists()) {
                const referrerData = referrerSnapshot.val();
                const foundReferrerId = Object.keys(referrerData)[0];
                referrerId = foundReferrerId;
                referrerCode = referrerData[foundReferrerId].referralCode;
            } else {
                toast({ variant: 'destructive', title: 'ত্রুটি', description: 'প্রদত্ত সুপারিশ কোডটি সঠিক নয়।' });
                setIsLoading(false);
                return;
            }
        }
        
        const newReferralCode = Math.floor(10000 + Math.random() * 90000).toString();

        await set(ref(db, `users/${userId}`), {
            id: userId,
            mobileNumber: mobileNumber,
            fullName: fullName,
            password: password,
            balance: 0,
            rechargeBalance: 0,
            totalIncome: 0,
            teamCommission: 0,
            investments: {},
            rechargeHistory: {},
            withdrawalHistory: {},
            commissionHistory: {},
            incomeHistory: {},
            bankCard: null,
            lastBonusClaimTime: null,
            referralCode: newReferralCode,
            referrerId: referrerId,
            referrerCode: referrerCode,
            registrationDate: new Date().toISOString(),
        });
        
        toast({
            title: 'সফল',
            description: 'আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। অনুগ্রহ করে লগইন করুন।',
        });
        router.push('/');

    } catch (error: any) {
        console.error("Signup Error: ", error);
        toast({ variant: 'destructive', title: 'ত্রুটি', description: `অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে: ${error.message}` });
    } finally {
        setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center bg-primary p-4 text-primary-foreground">
        <Link href="/" className="text-primary-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="flex-grow text-center font-headline text-xl font-bold">রেজিস্টার</h1>
        <div className="w-6"></div>
      </header>
      
      <main className="p-6">
         <form onSubmit={handleSignup} className="space-y-5">
            <InputField 
                icon={User} 
                placeholder="সম্পূর্ণ নাম" 
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
            />
            <InputField 
                icon={Smartphone} 
                placeholder="মোবাইল নম্বর" 
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
            />
            
            <InputField 
                icon={MessageSquare} 
                placeholder="ভেরিফিকেশন কোড"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
            >
                <Button 
                    variant="outline" 
                    type="button" 
                    className="absolute right-1 top-1 h-10 bg-white"
                    onClick={handleSendOtp}
                >
                    OTP পাঠান
                </Button>
            </InputField>

            <InputField 
                icon={KeyRound} 
                placeholder="পাসওয়ার্ড" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            {refCodeFromUrl && (
              <InputField 
                  icon={Gift} 
                  placeholder="সুপারিশ কোড"
                  value={recommendationCode}
                  onChange={(e) => setRecommendationCode(e.target.value)}
                  readOnly={!!refCodeFromUrl}
              />
            )}

            <div className="flex items-center space-x-2">
                <Checkbox id="terms" checked={agree} onCheckedChange={(checked) => setAgree(!!checked)} />
                <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    আমি <Link href="#" className="text-primary underline">Privacy Policy</Link>-তে সম্মত।
                </label>
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? 'প্রসেসিং...' : 'রেজিস্টার'}
            </Button>
          </form>

           <div className="mt-6 text-center text-sm">
            ইতিমধ্যে একটি অ্যাকাউন্ট আছে?{' '}
            <Link href="/" className="underline text-primary">
              লগইন করুন
            </Link>
          </div>
      </main>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">লোড হচ্ছে...</div>}>
      <SignupPageContent />
    </Suspense>
  );
}
