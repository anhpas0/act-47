import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppProvider from "@/components/AppProvider";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = { title: "SaaS Poster", description: "Công cụ đăng bài AI" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AppProvider>
          <Header />
          <main className="bg-gray-50">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}