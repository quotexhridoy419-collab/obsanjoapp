
'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminTransactionsPage from '@/components/admin/AdminTransactions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function TransactionsContent() {
    const searchParams = useSearchParams();
    const type = searchParams.get('type') as 'recharge' | 'withdrawal' | null;
    const status = searchParams.get('status') as 'pending' | 'successful' | 'failed' | null;

    // This state is used to trigger a re-fetch in the child component
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleStatusChange = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    const pageTitleMap = {
        recharge: {
            pending: 'পেন্ডিং রিচার্জ অনুরোধ',
            successful: 'সফল রিচার্জসমূহ',
            failed: 'ব্যর্থ রিচার্জসমূহ',
        },
        withdrawal: {
            pending: 'পেন্ডিং উত্তোলন অনুরোধ',
            successful: 'সফল উত্তোলনসমূহ',
            failed: 'ব্যর্থ উত্তোলনসমূহ',
        },
    };
    
    const pageDescriptionMap = {
        recharge: {
            pending: 'ব্যবহারকারীদের রিচার্জ অনুরোধ পর্যালোচনা এবং অনুমোদন করুন।',
            successful: 'সকল সফলভাবে সম্পন্ন হওয়া রিচার্জের তালিকা দেখুন।',
            failed: 'সকল ব্যর্থ বা বাতিল হওয়া রিচার্জের তালিকা দেখুন।',
        },
        withdrawal: {
            pending: 'ব্যবহারকারীদের উত্তোলনের অনুরোধ পর্যালোচনা এবং প্রক্রিয়া করুন।',
            successful: 'সকল সফলভাবে সম্পন্ন হওয়া উত্তোলনের তালিকা দেখুন।',
            failed: 'সকল ব্যর্থ বা বাতিল হওয়া উত্তোলনের তালিকা দেখুন।',
        },
    };

    const title = type && status ? pageTitleMap[type]?.[status] || 'লেনদেন' : 'লেনদেন';
    const description = type && status ? pageDescriptionMap[type]?.[status] || 'লেনদেন দেখুন এবং পরিচালনা করুন।' : 'লেনদেন দেখুন এবং পরিচালনা করুন।';


    if (!type || !status) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>অবৈধ পৃষ্ঠা</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>অনুগ্রহ করে সাইডবার থেকে একটি সঠিক বিকল্প নির্বাচন করুন।</p>
                </CardContent>
            </Card>
        )
    }

    return (
         <div className="flex flex-col gap-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </header>
            <AdminTransactionsPage 
                onStatusChange={handleStatusChange} 
                key={refreshTrigger} 
                filterType={type}
                filterStatus={status}
            />
        </div>
    );
}

export default function TransactionsContainerPage() {
    return (
        <Suspense fallback={<div className="text-center p-8">লোড হচ্ছে...</div>}>
            <TransactionsContent />
        </Suspense>
    );
}
