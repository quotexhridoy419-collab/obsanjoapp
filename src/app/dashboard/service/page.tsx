"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ServiceItem {
  label: string;
  description: string;
  href: string;
}

const services: ServiceItem[] = [
  {
    label: "সাহায্য কেন্দ্র",
    description: "যেকোনো প্রশ্নের জন্য আমাদের Telegram সাপোর্টে যোগাযোগ করুন",
    href: "https://t.me/Hridoy_mirza559"
  },
  {
    label: "অফিসিয়াল গ্রুপ",
    description: "আমাদের অফিসিয়াল Telegram গ্রুপে যোগ দিন",
    href: "https://t.me/OBASANJO_FARMS"
  },
  {
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
    className="flex items-center p-4 border rounded-xl hover:bg-gray-50 transition"
  >
    {/* Telegram Logo */}
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
      <Image
        src="/telegram-logo.png" // 👉 এখানে public/telegram-logo.png রাখতে হবে
        alt="Telegram"
        width={24}
        height={24}
      />
    </div>

    <div className="ml-4 flex-grow">
      <span className="font-medium text-gray-900">{item.label}</span>
      <p className="text-sm text-gray-500">{item.description}</p>
    </div>

    <ChevronRight className="h-5 w-5 text-gray-400" />
  </Link>
);

export default function ServicePage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto max-w-2xl p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <ArrowLeft className="mr-2 h-5 w-5 text-gray-500" />
          <h1 className="text-xl font-bold">গ্রাহক সেবা</h1>
        </div>

        {/* Card */}
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

        {/* Warning Notice */}
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-gray-800 font-semibold mb-2">
            ⚠️ সতর্কতা: প্রতারণা থেকে সাবধান থাকুন!
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            আমাদের অফিসিয়াল গ্রাহক সেবা কেবলমাত্র উপরে দেওয়া Telegram সাহায্য কেন্দ্র, 
            অফিসিয়াল গ্রুপ ও অফিসিয়াল চ্যানেলের মাধ্যমেই পরিচালিত হয়।  
            অন্য কোনো লিঙ্ক, ফোন নম্বর বা আইডি থেকে যোগাযোগ করলে সেটি প্রতারণা হতে পারে।
          </p>
          <ul className="text-sm text-gray-700 mt-2 list-disc list-inside space-y-1">
            <li>সবসময় আমাদের অফিসিয়াল লিঙ্ক ব্যবহার করুন।</li>
            <li>ব্যক্তিগতভাবে টাকা পাঠানোর আগে ভালোভাবে যাচাই করুন।</li>
            <li>সন্দেহজনক বার্তা পেলে আমাদের সাহায্য কেন্দ্রে রিপোর্ট করুন।</li>
          </ul>
          <p className="mt-2 text-sm font-medium text-gray-800">
            ✅ মনে রাখবেন: অফিসিয়াল যোগাযোগের জন্য কেবল এই পেজে দেওয়া লিঙ্কগুলোই ব্যবহারযোগ্য।
          </p>
        </div>
      </div>
    </div>
  );
}
