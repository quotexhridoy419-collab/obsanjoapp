
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, User, Banknote, History, Lock, LogOut, Gift, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth.tsx';
import Image from 'next/image';

interface ProfileMenuItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  action?: () => void;
}

const ProfileMenuItem = ({ item }: { item: ProfileMenuItemProps }) => {
    const content = (
        <div className="flex items-center p-4 transition-colors hover:bg-muted/50" onClick={item.action}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
            </div>
            <span className="ml-4 flex-grow font-medium text-foreground">{item.label}</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
    );
    
    return item.href ? <Link href={item.href}>{content}</Link> : <div className="cursor-pointer">{content}</div>;
};


export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser, isLoading } = useAuth();
  const [profileStats, setProfileStats] = useState({
      totalIncome: 0,
      dailyIncome: 0,
      rechargeAmount: 0,
      totalWithdrawal: 0,
      vipLevel: null as string | null,
  });
  
  useEffect(() => {
    if (currentUser) {
        const rechargeHistory = currentUser.rechargeHistory ? Object.values(currentUser.rechargeHistory) : [];
        const totalRecharge = rechargeHistory
            .filter((t: any) => t.status === 'সফল')
            .reduce((sum: number, t: any) => sum + t.amount, 0);
        
        const withdrawalHistory = currentUser.withdrawalHistory ? Object.values(currentUser.withdrawalHistory) : [];
        const totalWithdrawal = withdrawalHistory
            .filter((t: any) => t.status === 'সফল' || t.status === 'প্রক্রিয়াধীন')
            .reduce((sum: number, t: any) => sum + t.amount, 0);

        const teamCommission = currentUser.teamCommission || 0;
        
        const investments = currentUser.investments ? Object.values(currentUser.investments) : [];
        const dailyInvestmentIncome = investments.reduce((sum: number, inv: any) => sum + inv.dailyIncome, 0);
        
        const totalInvestmentForBonus = investments.reduce((sum: number, item: any) => sum + item.price, 0);
        const dailyBonus = totalInvestmentForBonus * (0.50 / 100);
        
        const calculatedDailyIncome = teamCommission + dailyInvestmentIncome + dailyBonus;

        const getVipLevel = () => {
            if (!investments || investments.length === 0) {
                return null;
            }
            
            // Find the investment with the highest price
            const highestInvestment = investments.reduce((max, inv) => (inv.price > max.price ? inv : max), investments[0]);
            
            // Return the tag of the highest priced investment
            return highestInvestment.tag || null;
        }

        setProfileStats({
            totalIncome: currentUser.totalIncome || 0,
            dailyIncome: calculatedDailyIncome,
            rechargeAmount: totalRecharge,
            totalWithdrawal: totalWithdrawal,
            vipLevel: getVipLevel(),
        });
    }
  }, [currentUser]);
  
  const handleLogout = () => {
    localStorage.removeItem('loggedInUserId');
    toast({
      title: 'লগ আউট সফল',
      description: 'আপনি সফলভাবে লগ আউট করেছেন।',
    });
    router.push('/');
  };

  const menuItems: ProfileMenuItemProps[] = [
    { icon: User, label: 'ব্যক্তিগত তথ্য', href: '/dashboard/profile/info' },
    { icon: Banknote, label: 'ব্যাংক অ্যাকাউন্ট', href: '/dashboard/withdraw/add-card' },
    { icon: History, label: 'লেনদেনের ইতিহাস', href: '/dashboard/profile/history' },
    { icon: Gift, label: 'কমিশন রেকর্ড', href: '/dashboard/profile/commission' },
    { icon: LogOut, label: 'লগ আউট', action: handleLogout },
  ];

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">লোড হচ্ছে...</div>;
  }
  
  if (!currentUser) {
    return null;
  }

  const userName = currentUser.fullName || 'ব্যবহারকারী';
  const userId = currentUser.mobileNumber || 'N/A';


  return (
    <div className="bg-background min-h-screen">
       <div className="bg-primary p-6 text-primary-foreground">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary-foreground">
                <AvatarImage asChild src="https://firebasestorage.googleapis.com/v0/b/nurislam5.appspot.com/o/images.png?alt=media&token=6bad2b65-059d-4687-9758-2ff07f3ef0c1">
                    <Image src="https://firebasestorage.googleapis.com/v0/b/nurislam5.appspot.com/o/images.png?alt=media&token=6bad2b65-059d-4687-9758-2ff07f3ef0c1" alt="User" width={64} height={64} priority />
                </AvatarImage>
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                 <h1 className="text-xl font-bold">{userName}</h1>
                 {profileStats.vipLevel && (
                    <Badge variant="secondary" className="bg-yellow-400 text-yellow-900 font-bold">
                        <Star className="h-3 w-3 mr-1"/>
                        {profileStats.vipLevel}
                    </Badge>
                 )}
              </div>
              <p className="text-sm opacity-90">ID: {userId}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl p-4 space-y-4">
        <Card className="shadow-lg">
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4 text-center">
             <div>
              <p className="text-sm text-muted-foreground">মোট আয়</p>
              <p className="text-lg font-bold text-accent">৳{profileStats.totalIncome.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">মোট রিচার্জ</p>
              <p className="text-lg font-bold text-primary">৳{profileStats.rechargeAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">দৈনিক আয়</p>
              <p className="text-lg font-bold text-accent">৳{profileStats.dailyIncome.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">মোট উত্তোলন</p>
              <p className="text-lg font-bold text-destructive">৳{profileStats.totalWithdrawal.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>আমার অ্যাকাউন্ট</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-border">
                {menuItems.map((item) => (
                    <ProfileMenuItem key={item.label} item={item} />
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
