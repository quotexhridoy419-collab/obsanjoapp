import { ArrowRight, Send } from "lucide-react";
import Image from "next/image";

export default function ServicePage() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* হেডার */}
      <h1 className="text-xl font-bold mb-4 text-center text-green-700">গ্রাহক সেবা</h1>

      {/* সাহায্য ও সমর্থন */}
      <div className="bg-white shadow rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">সাহাযতা ও সমর্থন</h2>

        <div className="space-y-3">
          <a
            href="https://t.me/Hridoy_mirza559"
            target="_blank"
            className="flex items-center justify-between border p-3 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="flex items-center space-x-3">
              <Image src="/telegram-logo.png" alt="Telegram" width={28} height={28} />
              <div>
                <p className="font-medium text-gray-800">সাহায্য কেন্দ্র</p>
                <p className="text-sm text-gray-500">সকাল ৯ টা থেকে সন্ধ্যা ৬ টা পর্যন্ত</p>
              </div>
            </div>
            <ArrowRight className="text-gray-400" />
          </a>

          <a
            href="https://t.me/OBASANJO_FARMS"
            target="_blank"
            className="flex items-center justify-between border p-3 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="flex items-center space-x-3">
              <Image src="/telegram-logo.png" alt="Telegram" width={28} height={28} />
              <div>
                <p className="font-medium text-gray-800">অফিসিয়াল গ্রুপ</p>
                <p className="text-sm text-gray-500">সকাল ১০ টা থেকে বিকাল ৫ টা পর্যন্ত</p>
              </div>
            </div>
            <ArrowRight className="text-gray-400" />
          </a>

          <a
            href="https://t.me/obasanjo_farms_bd"
            target="_blank"
            className="flex items-center justify-between border p-3 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="flex items-center space-x-3">
              <Image src="/telegram-logo.png" alt="Telegram" width={28} height={28} />
              <div>
                <p className="font-medium text-gray-800">অফিসিয়াল চ্যানেল</p>
                <p className="text-sm text-gray-500">সব সময় আপডেট দেখতে পারবেন</p>
              </div>
            </div>
            <ArrowRight className="text-gray-400" />
          </a>
        </div>
      </div>

      {/* গুরুত্বপূর্ণ পরামর্শ */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">গুরুত্বপূর্ণ পরামর্শ</h2>
        <p className="text-sm text-gray-600 mb-4">নিরাপদ থাকুন এবং সঠিক উপায়ে সাহায্য নিন।</p>

        <h3 className="font-medium text-gray-800 mb-2">কেন আমাদের সাথে যোগাযোগ করবেন?</h3>
        <p className="text-sm text-gray-600 mb-4">
          যেকোনো ধরণের অ্যাকাউন্ট, রিচার্জ বা উত্তোলন সংক্রান্ত সমস্যার দ্রুত এবং নির্ভরযোগ্য সমাধানের জন্য
          শুধুমাত্র আমাদের অফিসিয়াল গ্রাহক সেবা ব্যবহার করুন।
        </p>

        <h3 className="font-medium text-gray-800 mb-2">কিভাবে প্রতারণা থেকে বাঁচবেন?</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>
            প্ল্যাটফর্মের কোনো প্রতিনিধি বা এডমিন কখনো আপনার পাসওয়ার্ড, পিন বা ব্যক্তিগত তথ্য চাইবে না।
          </li>
          <li>
            অপরিচিত কোনো নম্বর বা সোশ্যাল মিডিয়া থেকে আসা মেসেজে উত্তর দেবেন না, তারা এডমিন দাবি করলেও।
          </li>
          <li>
            শুধুমাত্র উপরে তালিকাভুক্ত অফিসিয়াল চ্যানেলের মাধ্যমেই যোগাযোগ করুন।
          </li>
          <li>
            আপনার লগইন তথ্য বা লেনদেন সম্পর্কিত পাসওয়ার্ড কারও সাথে শেয়ার করবেন না।
          </li>
        </ul>
      </div>
    </div>
  );
}
