"use client";
import { useEffect } from 'react';
import { useFacebookSdk } from '@/context/FacebookSdkContext';
import Script from 'next/script';

export default function FacebookSdkScript() {
  const { setIsSdkReady } = useFacebookSdk();

  useEffect(() => {
    // Gắn hàm khởi tạo vào window để script có thể gọi
    (window as any).fbAsyncInit = function() {
      window.FB.init({
        appId      : process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        cookie     : true,
        xfbml      : true,
        version    : 'v19.0'
      });
      // Sau khi khởi tạo xong, báo cho Context biết là SDK đã sẵn sàng
      setIsSdkReady(true);
      console.log("Facebook SDK is ready.");
    };
  }, [setIsSdkReady]);

  return (
    <Script
      id="facebook-jssdk"
      src="https://connect.facebook.net/vi_VN/sdk.js"
      strategy="lazyOnload"
      onLoad={() => {
        // Script đã được tải về, nhưng fbAsyncInit có thể chưa chạy
        console.log("Facebook SDK script has been loaded.");
      }}
    />
  );
}