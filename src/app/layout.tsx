// File: src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import AppProvider from "@/components/AppProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FacebookSdkScript from "@/components/FacebookSdkScript";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = { 
  title: "47.pro.vn - Auto Caption FB", 
  description: "Công cụ đăng bài AI" 
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="h-full">
      <body className={`${inter.className} flex flex-col h-full bg-gray-50`}>
        
        {/* AppProvider bọc toàn bộ mọi thứ, bao gồm cả SDK Script */}
        <AppProvider>
          <Header />
          
          <main className="flex-grow">
            {children}
          </main>
          
          <Footer />

          {/* === SỬA LỖI Ở ĐÂY === */}
          {/* Di chuyển FacebookSdkScript vào bên trong AppProvider */}
          {/* Nó vẫn sẽ được render ở cuối DOM, nhưng nằm trong cây component của Provider */}
          <FacebookSdkScript />
        </AppProvider>
        
      </body>
    </html>
  );
}