"use client";

import "./globals.css";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000); // ৩ সেকেন্ড পরে হাইড হবে
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <body>
        {loading ? (
          <div className="flex items-center justify-center h-screen bg-white">
            <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-green-600"></div>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
