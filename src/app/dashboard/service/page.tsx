'use client';

import Link from 'next/link';
import { ArrowLeft, ChevronRight, Send } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';

interface ServiceItem {
  icon: LucideIcon;
  label: string;
  description: string;
  href: string;
}

const services: ServiceItem[] = [
  {
    icon: Send,
    label: "সাহায্য কেন্দ্র",
    description: "যেকোনো প্রশ্নের জন্য আমাদের Telegram সাপোর্টে যোগাযোগ করুন",
    href: "https://t.me/Hridoy_mirza559"
  },
  {
    icon: Send,
    label: "অফিসিয়াল গ্রুপ",
    description: "আমাদের অফিসিয়াল Telegram গ্রুপে যোগ দিন",
    href: "https://t.me/OBASANJO_FARMS"
  },
  {
    icon: Send,
    label: "অফিসিয়াল চ্যানেল",
    description: "সর্বশেষ আপডেট পেতে আমাদের অফিসিয়াল Telegram চ্যানেল ফলো করুন",
    href: "https://t.me/obasanjo_farms_bd"
  }
];

const ServiceMenuItem = ({ item }: { item: ServiceItem }) => (
  <Link
    href={item.href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center p-4 transition-colors rounded-lg hover:bg-muted"
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
      <item.icon className="h-5 w-5 text-primary" />
    </div>
    <div className="ml-4 flex-grow">
      <span className="font-medium text-foreground">{item.label}</span>
      <p className="text-sm text-muted-foreground">{item.description}</p>
    </div>
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
  </Link>
);

export default function ServicePage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="flex items-center mb-6">
        <ArrowLeft className="mr-2 h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-bold">গ্রাহক সেবা</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>আমাদের সাপোর্ট অপশন</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.map((item, index) => (
            <ServiceMenuItem key={index} item={item} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
