
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth.tsx';
import { db } from '@/lib/firebase';
import { ref, update } from 'firebase/database';

export default function ProfileInfoPage() {
  const { user: userData, isLoading, refetchUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (userData) {
      setFullName(userData.fullName);
    }
  }, [userData]);

  const handleUpdateName = async () => {
    if (!userData || !fullName) return;
    
    try {
        const userRef = ref(db, `users/${userData.id}`);
        await update(userRef, { fullName: fullName });
        refetchUser(); // Refetch user data to update context
        toast({
            title: 'সফল',
            description: 'আপনার নাম সফলভাবে আপডেট করা হয়েছে।',
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'ত্রুটি',
            description: 'নাম আপডেট করতে সমস্যা হয়েছে।',
        });
    }
  };
  
  if (isLoading) {
    return <div className="text-center p-8">লোড হচ্ছে...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center bg-primary p-4 text-primary-foreground">
        <Link href="/dashboard/profile" className="text-primary-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="flex-grow text-center font-headline text-xl font-bold">ব্যক্তিগত তথ্য</h1>
        <div className="w-6"></div>
      </header>

      <main className="container mx-auto max-w-3xl p-4">
        {userData ? (
          <Card>
            <CardHeader>
              <CardTitle>আপনার বিবরণ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="userId">ব্যবহারকারী আইডি</Label>
                <Input id="userId" value={userData.id} readOnly disabled />
              </div>
               <div className="space-y-2">
                <Label htmlFor="fullName">সম্পূর্ণ নাম</Label>
                <Input 
                  id="fullName" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <Button onClick={handleUpdateName} className="w-full">আপডেট করুন</Button>
            </CardContent>
          </Card>
        ) : (
          <p className="text-center text-muted-foreground">ব্যবহারকারীর তথ্য পাওয়া যায়নি।</p>
        )}
      </main>
    </div>
  );
}
