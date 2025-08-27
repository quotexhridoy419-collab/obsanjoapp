import Link from "next/link";
import { Send, ChevronRight, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// 👉 আপনার সার্ভিস লিঙ্ক লিস্ট
const services = [
  {
    icon: Send,
    label: "সাহায্য কেন্দ্র",
    description: "যেকোনো প্রশ্নের জন্য আমাদের Telegram সাপোর্টে যোগাযোগ করুন",
    href: "https://t.me/Hridoy_mirza559",
  },
  {
    icon: Send,
    label: "অফিসিয়াল গ্রুপ",
    description: "আমাদের অফিসিয়াল Telegram গ্রুপে যোগ দিন",
    href: "https://t.me/OBASANJO_FARMS",
  },
  {
    icon: Send,
    label: "অফিসিয়াল চ্যানেল",
    description: "সর্বশেষ আপডেট পেতে আমাদের অফিসিয়াল Telegram চ্যানেল ফলো করুন",
    href: "https://t.me/obasanjo_farms_bd",
  },
];

// 👉 একেকটা মেনু আইটেম কিভাবে দেখাবে
const ServiceMenuItem = ({ item }: { item: (typeof services)[0] }) => (
  <Link
    href={item.href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center p-4 transition-colors hover:bg-muted rounded-lg"
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
      <item.icon className="h-5 w-5 text-primary" />
    </div>
    <div className="ml-4 flex-grow">
      <span className="font-medium text-foreground">{item.label}</span>
      <p className="text-sm text-muted-foreground">{item.description}</p>
    </div>
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
  </Link>
);

// 👉 প্রধান পেজ
export default function ServicePage() {
  return (
    <div className="container mx-auto max-w-2xl p-4">
      {/* হেডার */}
      <div className="flex items-center mb-6">
        <ArrowLeft className="mr-2 h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-bold">গ্রাহক সেবা</h1>
      </div>

      {/* লিঙ্ক সেকশন */}
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

      {/* ⚠️ সতর্কীকরণ বার্তা */}
      <div className="mt-6">
        <Card className="border border-yellow-300 bg-yellow-50">
          <CardHeader className="flex flex-row items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-200">
              ⚠️
            </div>
            <CardTitle className="text-yellow-800 font-semibold">
              সতর্কতা: প্রতারণা থেকে সাবধান থাকুন
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-yellow-700 leading-relaxed">
            <p>
              আমাদের অফিসিয়াল গ্রাহক সেবা কেবলমাত্র উপরে দেওয়া{" "}
              <span className="font-medium">
                Telegram সাহায্য কেন্দ্র, অফিসিয়াল গ্রুপ ও চ্যানেল
              </span>{" "}
              এর মাধ্যমেই পরিচালিত হয়। অন্য কোনো লিঙ্ক, ফোন নম্বর বা আইডি থেকে
              যোগাযোগ করলে সেটি প্রতারণা হতে পারে।
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>সবসময় আমাদের অফিসিয়াল লিঙ্ক ব্যবহার করুন।</li>
              <li>কোনো টাকা পাঠানোর আগে ভালোভাবে যাচাই করুন।</li>
              <li>সন্দেহজনক বার্তা পেলে আমাদের সাহায্য কেন্দ্রে রিপোর্ট করুন।</li>
            </ul>
            <div className="pt-2 border-t border-yellow-200">
              <p className="text-sm font-medium text-yellow-800">
                ✅ মনে রাখবেন: অফিসিয়াল যোগাযোগের জন্য কেবল এই পেজে দেওয়া
                লিঙ্কগুলোই ব্যবহারযোগ্য।
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
