'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Smartphone, KeyRound } from 'lucide-react';
import { db } from '@/lib/firebase';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';

const InputField = ({ icon, placeholder, type = 'text', value, onChange }: { icon: React.ElementType, placeholder: string, type?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="relative flex items-center">
        <div className="absolute left-3">
            {React.createElement(icon, { className: "h-5 w-5 text-muted-foreground" })}
        </div>
        <Input
            type={type}
            placeholder={placeholder}
            className="pl-10 h-12 bg-white border-gray-300 focus-visible:ring-1 focus-visible:ring-primary"
            value={value}
            onChange={onChange}
            required
        />
    </div>
);

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const mobileRegex = /^01[3-9]\d{8}$/;
    if (!mobileRegex.test(mobileNumber)) {
        toast({ variant: 'destructive', title: 'ত্রুটি', description: 'অনুগ্রহ করে একটি সঠিক ১১-সংখ্যার মোবাইল নম্বর দিন।' });
        setIsLoading(false);
        return;
    }

    try {
        const usersRef = ref(db, 'users');
        const userQuery = query(usersRef, orderByChild('mobileNumber'), equalTo(mobileNumber));
        const snapshot = await get(userQuery);

        if (snapshot.exists()) {
            const usersData = snapshot.val();
            const userId = Object.keys(usersData)[0];
            const user = usersData[userId];

            if (user.password === password) {
                localStorage.setItem('loggedInUserId', user.id);
                toast({
                    title: 'সফল',
                    description: 'আপনি সফলভাবে লগইন করেছেন।',
                });
                router.push('/dashboard');
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'ত্রুটি',
                    description: 'আপনার মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়।',
                });
            }
        } else {
            toast({
                variant: 'destructive',
                title: 'ত্রুটি',
                description: 'আপনার মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়।',
            });
        }
    } catch (error) {
         toast({
            variant: 'destructive',
            title: 'ত্রুটি',
            description: 'লগইন করার সময় একটি সমস্যা হয়েছে।',
        });
        console.error("Login error:", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
        <header className="flex items-center bg-primary p-4 text-primary-foreground">
            <button onClick={() => router.back()} className="text-primary-foreground">
            <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="flex-grow text-center font-headline text-xl font-bold">লগইন</h1>
            <div className="w-6"></div>
        </header>
        
        <main className="p-6">
            <form onSubmit={handleLogin} className="space-y-6">
                <InputField 
                    icon={Smartphone} 
                    placeholder="মোবাইল নম্বর" 
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                />
                
                <InputField 
                    icon={KeyRound} 
                    placeholder="পাসওয়ার্ড" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button type="submit" className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? 'প্রসেসিং...' : 'লগইন'}
                </Button>

                <div className="flex justify-between mt-4">
                    <Button variant="outline" asChild>
                        <Link href="/signup">রেজিস্টার</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="#">পাসওয়ার্ড ভুলে গেছেন?</Link>
                    </Button>
                </div>
            </form>
        </main>
    </div>
  );
}
