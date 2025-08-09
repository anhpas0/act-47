"use client";
import { SessionProvider } from "next-auth/react";
import { FacebookSdkProvider } from "@/context/FacebookSdkContext"; // Import Provider mới

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    // Bọc FacebookSdkProvider ở ngoài cùng
    <FacebookSdkProvider>
      <SessionProvider>{children}</SessionProvider>
    </FacebookSdkProvider>
  );
}