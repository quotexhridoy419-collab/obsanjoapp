"use client";

import "./globals.css";
import { useState, useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // যখনই page load হবে, তখন loader আসবে
    if (document.readyState === "complete") {
      setLoading(false);
    } else {
      window.addEventListener("load", () => setLoading(false));
    }
  }, []);

  return (
    <html lang="en">
      <body>
        {loading ? (
          <div className="flex items-center justify-center h-screen bg-white">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-green-600"></div>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
w
