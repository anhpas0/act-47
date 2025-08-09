"use client";
import { createContext, useState, useContext, ReactNode } from 'react';

// Định nghĩa kiểu dữ liệu cho Context
interface SdkContextType {
  isSdkReady: boolean;
  setIsSdkReady: (isReady: boolean) => void;
}

// Tạo Context với giá trị mặc định
const FacebookSdkContext = createContext<SdkContextType | undefined>(undefined);

// Tạo Provider component
export function FacebookSdkProvider({ children }: { children: ReactNode }) {
  const [isSdkReady, setIsSdkReady] = useState(false);
  
  return (
    <FacebookSdkContext.Provider value={{ isSdkReady, setIsSdkReady }}>
      {children}
    </FacebookSdkContext.Provider>
  );
}

// Tạo một custom hook để dễ dàng sử dụng Context
export function useFacebookSdk() {
  const context = useContext(FacebookSdkContext);
  if (context === undefined) {
    throw new Error('useFacebookSdk must be used within a FacebookSdkProvider');
  }
  return context;
}