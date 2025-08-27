
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, PlusCircle, Trash2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { ref, set, get } from 'firebase/database';
import Image from 'next/image';

const defaultInvestment = {
    id: `inv_${Date.now()}`,
    title: 'নতুন প্যাকেজ',
    price: 1000,
    dailyIncome: 60,
    cycle: 45,
    tag: 'VIP 1',
    image: 'https://placehold.co/80x80.png',
    dataAiHint: 'investment',
};

const defaultBanner = 'https://firebasestorage.googleapis.com/v0/b/nurislam5.appspot.com/o/images%20(2).jpeg?alt=media&token=1b5d48e6-0de7-428e-bb92-039150276d4a';

export default function AdminInvestmentSettingsPage() {
    const { toast } = useToast();
    const [investments, setInvestments] = useState<any[]>([]);
    const [banners, setBanners] = useState<string[]>(['']);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const contentRef = ref(db, 'siteContent');
            const snapshot = await get(contentRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                setInvestments(data.investments || [defaultInvestment]);
                const bannerUrls = data.banners ? Object.values(data.banners).filter(url => typeof url === 'string' && url) : [];
                setBanners(bannerUrls.length > 0 ? bannerUrls as string[] : [defaultBanner]);
            } else {
                setInvestments([defaultInvestment]);
                setBanners([defaultBanner]);
            }
        } catch (error) {
            console.error("Error fetching site content:", error);
            toast({ variant: 'destructive', title: 'ত্রুটি', description: 'সাইটের তথ্য আনতে সমস্যা হয়েছে।' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleInvestmentChange = (index: number, field: string, value: string | number) => {
        const updatedInvestments = [...investments];
        updatedInvestments[index] = { ...updatedInvestments[index], [field]: value };
        setInvestments(updatedInvestments);
    };
    
    const handleBannerChange = (index: number, value: string) => {
        const updatedBanners = [...banners];
        updatedBanners[index] = value;
        setBanners(updatedBanners);
    };

    const addInvestment = () => {
        setInvestments([...investments, { ...defaultInvestment, id: `inv_${Date.now()}` }]);
    };
    
    const removeInvestment = (index: number) => {
        const updatedInvestments = investments.filter((_, i) => i !== index);
        setInvestments(updatedInvestments);
    };

    const addBanner = () => {
        setBanners([...banners, '']);
    };
    
    const removeBanner = (index: number) => {
        const updatedBanners = banners.filter((_, i) => i !== index);
        setBanners(updatedBanners);
    };


    const handleSaveChanges = async () => {
        setIsLoading(true);
        try {
            const investmentsWithCalculatedIncome = investments.map(inv => ({
                ...inv,
                totalIncome: Number(inv.price) * (Number(inv.dailyIncome) / (Number(inv.price) / 100)) * Number(inv.cycle) / 100
            }));
            
            const dataToSave = {
                investments: investmentsWithCalculatedIncome,
                banners: banners.filter(url => url.trim() !== ''),
            };
            
            await set(ref(db, 'siteContent'), dataToSave);
            toast({ title: 'সফল', description: 'তথ্য সফলভাবে সেভ করা হয়েছে।' });
        } catch (error) {
            console.error("Error saving content:", error);
            toast({ variant: 'destructive', title: 'ত্রুটি', description: 'তথ্য সেভ করতে সমস্যা হয়েছে।' });
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
                    <h1 className="text-3xl font-bold tracking-tight">ইনভেস্টমেন্ট সেটিংস</h1>
                    <p className="text-muted-foreground">ব্যানার এবং ইনভেস্টমেন্ট প্যাকেজ পরিচালনা করুন।</p>
                </div>
                <Button onClick={handleSaveChanges} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? 'সেভ হচ্ছে...' : 'পরিবর্তন সেভ করুন'}
                </Button>
            </header>
            
            <Card>
                <CardHeader>
                    <CardTitle>ব্যানার ম্যানেজমেন্ট</CardTitle>
                    <CardDescription>ড্যাশবোর্ডে প্রদর্শিত ব্যানার যোগ বা পরিবর্তন করুন।</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {banners.map((banner, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                type="text"
                                placeholder="ব্যানার ইমেজের URL দিন"
                                value={banner}
                                onChange={(e) => handleBannerChange(index, e.target.value)}
                            />
                            <Button variant="destructive" size="icon" onClick={() => removeBanner(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" onClick={addBanner}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        নতুন ব্যানার যোগ করুন
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>ইনভেস্টমেন্ট প্যাকেজ</CardTitle>
                    <CardDescription>ব্যবহারকারীদের জন্য ইনভেস্টমেন্ট প্যাকেজ তৈরি ও সম্পাদনা করুন।</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {investments.map((inv, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-4 relative">
                            <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeInvestment(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>প্যাকেজের নাম</Label>
                                    <Input value={inv.title} onChange={(e) => handleInvestmentChange(index, 'title', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>দাম (Price)</Label>
                                    <Input type="number" value={inv.price} onChange={(e) => handleInvestmentChange(index, 'price', Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>দৈনিক আয় (Daily Income)</Label>
                                    <Input type="number" value={inv.dailyIncome} onChange={(e) => handleInvestmentChange(index, 'dailyIncome', Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>সাইকেল (দিন)</Label>
                                    <Input type="number" value={inv.cycle} onChange={(e) => handleInvestmentChange(index, 'cycle', Number(e.target.value))} />
                                </div>
                                 <div className="space-y-2">
                                    <Label>ট্যাগ (e.g., VIP 1)</Label>
                                    <Input value={inv.tag} onChange={(e) => handleInvestmentChange(index, 'tag', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>ছবি URL</Label>
                                    <Input value={inv.image} onChange={(e) => handleInvestmentChange(index, 'image', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    ))}
                    <Button variant="outline" onClick={addInvestment}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        নতুন প্যাকেজ যোগ করুন
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
