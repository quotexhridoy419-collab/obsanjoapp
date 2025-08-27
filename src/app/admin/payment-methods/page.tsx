
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { db } from '@/lib/firebase';
import { ref, set, get } from 'firebase/database';
import Image from 'next/image';

const defaultPaymentDetails = {
    bkash: { name: 'bKash', number: '', logo: 'https://i.ibb.co/pWx2xN2/bkash.png' },
    nagad: { name: 'Nagad', number: '', logo: 'https://i.ibb.co/qjqNq1k/nagad.png' },
};

export default function AdminPaymentMethodsPage() {
    const { toast } = useToast();
    const [paymentDetails, setPaymentDetails] = useState(defaultPaymentDetails);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            try {
                const detailsRef = ref(db, 'paymentDetails');
                const snapshot = await get(detailsRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    // Merge fetched data with defaults to ensure all keys are present
                    const mergedDetails = {
                        bkash: { ...defaultPaymentDetails.bkash, ...(data.bkash || {}) },
                        nagad: { ...defaultPaymentDetails.nagad, ...(data.nagad || {}) },
                    };
                    setPaymentDetails(mergedDetails);
                } else {
                    setPaymentDetails(defaultPaymentDetails);
                }
            } catch (error) {
                console.error("Error fetching payment details from Firebase:", error);
                toast({ variant: 'destructive', title: 'ত্রুটি', description: 'পেমেন্টের তথ্য আনতে সমস্যা হয়েছে।' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [toast]);

    const handleInputChange = (method: 'bkash' | 'nagad', field: 'number' | 'logo', value: string) => {
        setPaymentDetails(prev => ({
            ...prev,
            [method]: { ...prev[method], [field]: value }
        }));
    };

    const handleSaveChanges = async () => {
        setIsLoading(true);
        try {
            await set(ref(db, 'paymentDetails'), paymentDetails);
            toast({
                title: 'সফল',
                description: 'পেমেন্ট মেথড সফলভাবে সেভ করা হয়েছে।',
            });
        } catch (error) {
            console.error("Error saving payment details:", error);
            toast({
                variant: 'destructive',
                title: 'ত্রুটি',
                description: 'তথ্য সেভ করতে সমস্যা হয়েছে।',
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
                  <h1 className="text-3xl font-bold tracking-tight">পেমেন্ট মেথড পরিচালনা</h1>
                  <p className="text-muted-foreground">ব্যবহারকারীদের জন্য পেমেন্ট অপশন সেট করুন।</p>
                </div>
                <Button onClick={handleSaveChanges} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? 'সেভ হচ্ছে...' : 'পরিবর্তন সেভ করুন'}
                </Button>
            </header>
            <Card>
                <CardContent className="p-6">
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }} className="space-y-8">
                        {/* bKash */}
                        <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="text-lg font-medium text-[#e2136e]">bKash</h3>
                            <div className="space-y-2">
                                <Label htmlFor="bkash-number">bKash নম্বর</Label>
                                <Input
                                    id="bkash-number"
                                    placeholder="বিকাশ এজেন্ট নম্বর"
                                    value={paymentDetails.bkash.number}
                                    onChange={(e) => handleInputChange('bkash', 'number', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bkash-logo">bKash লোগো URL</Label>
                                <div className="flex items-center gap-4">
                                     <Image 
                                        src={paymentDetails.bkash.logo || 'https://placehold.co/80x80.png'} 
                                        alt="bKash Logo Preview" 
                                        width={40}
                                        height={40}
                                        className="h-10 w-10 rounded-md border object-contain"
                                     />
                                    <Input
                                        id="bkash-logo"
                                        placeholder="লোগোর URL পেস্ট করুন"
                                        value={paymentDetails.bkash.logo}
                                        onChange={(e) => handleInputChange('bkash', 'logo', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Nagad */}
                         <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="text-lg font-medium text-[#f58220]">Nagad</h3>
                            <div className="space-y-2">
                                <Label htmlFor="nagad-number">Nagad নম্বর</Label>
                                <Input
                                    id="nagad-number"
                                    placeholder="নগদ এজেন্ট নম্বর"
                                    value={paymentDetails.nagad.number}
                                    onChange={(e) => handleInputChange('nagad', 'number', e.target.value)}
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="nagad-logo">Nagad লোগো URL</Label>
                                <div className="flex items-center gap-4">
                                    <Image 
                                        src={paymentDetails.nagad.logo || 'https://placehold.co/80x80.png'} 
                                        alt="Nagad Logo Preview" 
                                        width={40}
                                        height={40}
                                        className="h-10 w-10 rounded-md border object-contain"
                                     />
                                    <Input
                                        id="nagad-logo"
                                        placeholder="লোগোর URL পেস্ট করুন"
                                        value={paymentDetails.nagad.logo}
                                        onChange={(e) => handleInputChange('nagad', 'logo', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
