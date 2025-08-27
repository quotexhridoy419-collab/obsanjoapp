
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { db } from '@/lib/firebase';
import { ref, set, get } from 'firebase/database';

const defaultSettings = {
    isSiteOnline: true,
    isWithdrawalEnabled: true,
};

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [settings, setSettings] = useState(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const settingsRef = ref(db, 'siteSettings');
                const snapshot = await get(settingsRef);
                if (snapshot.exists()) {
                    setSettings({ ...defaultSettings, ...snapshot.val() });
                } else {
                    setSettings(defaultSettings);
                }
            } catch (error) {
                console.error("Error fetching settings from Firebase:", error);
                toast({ variant: 'destructive', title: 'ত্রুটি', description: 'সেটিংস আনতে সমস্যা হয়েছে।' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [toast]);

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveChanges = async () => {
        setIsLoading(true);
        try {
            await set(ref(db, 'siteSettings'), settings);
            toast({
                title: 'সফল',
                description: 'সেটিংস সফলভাবে সেভ করা হয়েছে।',
            });
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({
                variant: 'destructive',
                title: 'ত্রুটি',
                description: 'সেটিংস সেভ করতে সমস্যা হয়েছে।',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isLoading) {
        return <div>লোড হচ্ছে...</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">সাইট সেটিংস</h1>
                    <p className="text-muted-foreground">সাইটের বিভিন্ন কার্যক্রম নিয়ন্ত্রণ করুন।</p>
                </div>
                <Button onClick={handleSaveChanges} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? 'সেভ হচ্ছে...' : 'পরিবর্তন সেভ করুন'}
                </Button>
            </header>
            <Card>
                <CardContent className="p-6 space-y-8">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="site-status" className="text-base font-medium">সাইট স্ট্যাটাস</Label>
                            <p className="text-sm text-muted-foreground">
                                সাইটটি অফলাইন করলে ব্যবহারকারীরা একটি রক্ষণাবেক্ষণ বার্তা দেখতে পাবে।
                            </p>
                        </div>
                        <Switch
                            id="site-status"
                            checked={settings.isSiteOnline}
                            onCheckedChange={() => handleToggle('isSiteOnline')}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="withdrawal-status" className="text-base font-medium">উত্তোলন স্ট্যাটাস</Label>
                            <p className="text-sm text-muted-foreground">
                                এটি বন্ধ করলে কোনো ব্যবহারকারী টাকা তোলার অনুরোধ করতে পারবে না।
                            </p>
                        </div>
                        <Switch
                            id="withdrawal-status"
                            checked={settings.isWithdrawalEnabled}
                            onCheckedChange={() => handleToggle('isWithdrawalEnabled')}
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
