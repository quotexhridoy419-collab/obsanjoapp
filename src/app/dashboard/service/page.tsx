
'use client';

import Link from 'next/link';
import { ArrowLeft, ChevronRight, Send } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

interface ServiceItem {
  icon: LucideIcon;
  label: string;
  description: string;
  href: string;
}

const ServiceMenuItem = ({ item }: { item: ServiceItem }) => (
    <Link href={item.href} target="_blank" rel="noopener noreferrer">
        <div className="flex items-center p-4 transition-colors hover:bg-muted/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
            </div>
            <div className="ml-4 flex-grow">
                <span className="font-medium text-foreground">{item.label}</span>
                <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
    </Link>
);

export default function ServicePage() {
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([
      { icon: Send, label: 'সাহায্য কেন্দ্র', description: 'সকাল ৯ টা থেকে সন্ধ্যা ৬টা পর্যন্ত', href: '#' },@Hridoy_mirza559
      { icon: Send, label: 'অফিসিয়াল গ্রুপ', description: 'সকাল দশটা থেকে বিকাল পাঁচটা পর্যন্ত', href: '#' },https://t.me/OBASANJO_FARMS
      { icon: Send, label: 'অফিসিয়াল চ্যানেল', description: 'সব সময় আপডেট দেখতে পারবেন', href: '#' },https://t.me/obasanjo_farms_bd
  ]);

  useEffect(() => {
    const fetchServiceLinks = async () => {
        try {
            const contentRef = ref(db, 'siteContent/serviceLinks');
            const snapshot = await get(contentRef);
            if (snapshot.exists()) {
                const storedLinks = snapshot.val();
                setServiceItems([
                    { ...serviceItems[0], href: storedLinks.helpCenter || '#' },
                    { ...serviceItems[1], href: storedLinks.officialGroup || '#' },
                    { ...serviceItems[2], href: storedLinks.officialChannel || '#' },
                ]);
            }
        } catch (error) {
            console.error("Error fetching service links from Firebase:", error);
        }
    };
    fetchServiceLinks();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center bg-primary p-4 text-primary-foreground">
        <Link href="/dashboard" className="text-primary-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="flex-grow text-center font-headline text-xl font-bold">গ্রাহক সেবা</h1>
        <div className="w-6"></div>
      </header>

      <main className="container mx-auto max-w-3xl p-4">
        <Card className="shadow-lg">
           <CardHeader>
            <CardTitle>সহায়তা ও সমর্থন</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-border">
                {serviceItems.map((item) => (
                    <ServiceMenuItem key={item.label} item={item} />
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle>গুরুত্বপূর্ণ পরামর্শ</CardTitle>
            <CardDescription>নিরাপদ থাকুন এবং সঠিক উপায়ে সাহায্য নিন।</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">কেন আমাদের সাথে যোগাযোগ করবেন?</h4>
              <p>যেকোনো ধরনের অ্যাকাউন্ট, রিচার্জ বা উত্তোলন সংক্রান্ত সমস্যার দ্রুত এবং নির্ভরযোগ্য সমাধানের জন্য শুধুমাত্র আমাদের অফিসিয়াল গ্রাহক সেবা ব্যবহার করুন।</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">কিভাবে প্রতারণা থেকে বাঁচবেন?</h4>
              <ul className="list-disc space-y-2 pl-5">
                <li>প্ল্যাটফর্মের কোনো প্রতিনিধি বা এডমিন কখনও আপনার পাসওয়ার্ড, পিন বা অন্য কোনো গোপনীয় তথ্য জানতে চাইবে না।</li>
                <li>অপরিচিত কোনো ব্যক্তিগত নম্বর বা সোশ্যাল মিডিয়া অ্যাকাউন্ট থেকে আসা মেসেজের উত্তর দেবেন না, এমনকি তারা নিজেদের এডমিন দাবি করলেও।</li>
                <li>শুধুমাত্র উপরে তালিকাভুক্ত অফিসিয়াল চ্যানেলগুলোর মাধ্যমেই আমাদের সাথে যোগাযোগ করুন।</li>
                <li>আপনার লগইন তথ্য বা লেনদেন পাসওয়ার্ড কারও সাথে শেয়ার করবেন না।</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
