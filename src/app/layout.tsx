"use client";
import type { Metadata } from "next";
import "./globals.css";
import { useEffect, useState } from "react";

export const metadata: Metadata = {
  title: "Obasanjo Farms",
  description: "Modern Investment Opportunities in Agriculture",
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000); // ৩ সেকেন্ড পর হাইড হবে
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {loading ? (
          <div className="flex items-center justify-center h-screen bg-white">
            <div className="relative flex flex-col items-center">
              {/* সবুজ লটারির মত ঘূর্ণায়মান আইকন */}
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-green-600 border-t-transparent"></div>
              <p className="mt-4 text-green-700 font-semibold text-lg animate-pulse">
                Loading...
              </p>
            </div>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
