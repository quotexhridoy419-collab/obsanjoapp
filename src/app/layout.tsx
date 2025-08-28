import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Obasanjo Farms",
  description: "Obasanjo Farms Limited",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* লোডার */}
        <div
          id="loader"
          className="fixed inset-0 flex items-center justify-center bg-white z-50"
        >
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* আসল কন্টেন্ট */}
        <div id="content" className="hidden">
          {children}
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener("load", () => {
                document.getElementById("loader").style.display = "none";
                document.getElementById("content").classList.remove("hidden");
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
