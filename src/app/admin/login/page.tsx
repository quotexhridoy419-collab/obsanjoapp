
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'MR69550';

export default function AdminLoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            localStorage.setItem('adminLoggedIn', 'true');
            toast({
                title: 'লগইন সফল',
                description: 'অ্যাডমিন প্যানেলে স্বাগতম।',
            });
            router.push('/admin/dashboard');
        } else {
            toast({
                variant: 'destructive',
                title: 'লগইন ব্যর্থ',
                description: 'ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়।',
            });
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">অ্যাডমিন লগইন</CardTitle>
                    <CardDescription>আপনার অ্যাডমিন তথ্য দিয়ে প্রবেশ করুন।</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">ইউজারনেম</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">পাসওয়ার্ড</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            লগইন করুন
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
