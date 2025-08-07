"use client";
import { SessionProvider } from "next-auth/react";

// Component này chỉ đơn giản là render SessionProvider của NextAuth
export default function AppProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}