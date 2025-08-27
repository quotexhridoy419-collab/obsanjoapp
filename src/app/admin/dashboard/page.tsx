
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Package, Wallet, Landmark, UserPlus, TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    href: string;
}

const StatCard = ({ title, value, icon: Icon, href }: StatCardProps) => (
  <Link href={href}>
    <Card className="bg-primary text-primary-foreground transition-transform hover:scale-105">
        <CardContent className="p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium">{title}</h3>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/20">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
            </div>
        </CardContent>
    </Card>
   </Link>
);

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activePackages: 0,
        totalRecharge: 0,
        totalWithdrawal: 0,
        todayUsers: 0,
        todayRecharge: 0,
        todayWithdrawal: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    const loadStats = useCallback(async () => {
        setIsLoading(true);
        try {
            const usersRef = ref(db, 'users');
            const snapshot = await get(usersRef);
            if (!snapshot.exists()) {
                setIsLoading(false);
                return;
            }
            
            const usersData = snapshot.val();
            const users = Object.values(usersData) as any[];

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const totalUsers = users.length;
            const activePackages = users.reduce((sum: number, user: any) => sum + (user.investments?.length || 0), 0);

            let totalRecharge = 0;
            let totalWithdrawal = 0;
            let todayRecharge = 0;
            let todayWithdrawal = 0;
            let todayUsers = 0;

            users.forEach((user: any) => {
                if (user.registrationDate && new Date(user.registrationDate) >= today) {
                    todayUsers++;
                }
                
                const rechargeHistory = user.rechargeHistory ? Object.values(user.rechargeHistory) : [];
                rechargeHistory.forEach((item: any) => {
                    if (item.status === 'সফল') {
                        totalRecharge += item.amount;
                        if (new Date(item.date) >= today) {
                            todayRecharge += item.amount;
                        }
                    }
                });

                const withdrawalHistory = user.withdrawalHistory ? Object.values(user.withdrawalHistory) : [];
                withdrawalHistory.forEach((item: any) => {
                     if (item.status === 'সফল') {
                        totalWithdrawal += item.amount;
                        if (new Date(item.date) >= today) {
                            todayWithdrawal += item.amount;
                        }
                    }
                });
            });

            setStats({
                totalUsers,
                activePackages,
                totalRecharge,
                totalWithdrawal,
                todayUsers,
                todayRecharge,
                todayWithdrawal,
            });
        } catch (error) {
            console.error("Error loading stats from Firebase:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    if (isLoading) {
        return <div>ড্যাশবোর্ড লোড হচ্ছে...</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">ড্যাশবোর্ড</h1>
                <p className="text-muted-foreground">আপনার সাইটের একটি সারসংক্ষেপ দেখুন।</p>
            </header>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="আজকের ইউজার" value={stats.todayUsers} icon={UserPlus} href="/admin/users" />
                <StatCard title="আজকের রিচার্জ" value={`৳${stats.todayRecharge.toLocaleString()}`} icon={TrendingUp} href="/admin/transactions?type=recharge&status=successful" />
                <StatCard title="আজকের উত্তোলন" value={`৳${stats.todayWithdrawal.toLocaleString()}`} icon={TrendingDown} href="/admin/transactions?type=withdrawal&status=successful" />
            </div>

             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="মোট ব্যবহারকারী" value={stats.totalUsers} icon={Users} href="/admin/users" />
                <StatCard title="সক্রিয় প্যাকেজ" value={stats.activePackages} icon={Package} href="/admin/users" />
                <StatCard title="মোট রিচার্জ" value={`৳${stats.totalRecharge.toLocaleString()}`} icon={Wallet} href="/admin/transactions?type=recharge&status=successful" />
                <StatCard title="মোট উত্তোলন" value={`৳${stats.totalWithdrawal.toLocaleString()}`} icon={Landmark} href="/admin/transactions?type=withdrawal&status=successful" />
            </div>
        </div>
    );
}
