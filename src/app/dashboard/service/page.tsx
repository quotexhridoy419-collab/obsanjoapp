const services: ServiceItem[] = [
  {
    icon: Send,
    label: "সাহায্য কেন্দ্র",
    description: "যেকোনো প্রশ্নের জন্য আমাদের Telegram সাপোর্টে যোগাযোগ করুন",
    href: "https://t.me/Hridoy_mirza559"   // 👉 সাহায্য কেন্দ্র (User ID)
  },
  {
    icon: Send,
    label: "অফিসিয়াল গ্রুপ",
    description: "আমাদের অফিসিয়াল Telegram গ্রুপে যোগ দিন",
    href: "https://t.me/OBASANJO_FARMS"   // 👉 অফিসিয়াল গ্রুপ
  },
  {
    icon: Send,
    label: "অফিসিয়াল চ্যানেল",
    description: "সর্বশেষ আপডেট পেতে আমাদের অফিসিয়াল Telegram চ্যানেল ফলো করুন",
    href: "https://t.me/obasanjo_farms_bd"   // 👉 অফিসিয়াল চ্যানেল
  }
];

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
