import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppProvider from "@/components/AppProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; // Import component Footer

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = { title: "47.pro.vn - Auto Caption FB", description: "Công cụ đăng bài AI" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="h-full">
      <body className={`${inter.className} flex flex-col h-full`}>
        <AppProvider>
          <Header />
          {/* Phần main sẽ tự động co giãn để đẩy footer xuống dưới */}
          <main className="flex-grow">
            {children}
          </main>
          {/* Thêm Footer vào đây */}
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}