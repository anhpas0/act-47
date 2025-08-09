"use client";
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useFacebookSdk } from '@/context/FacebookSdkContext';

declare global { interface Window { FB: any; } }

// Component này không cần callback onSuccess nữa
export default function FacebookConnectButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { isSdkReady } = useFacebookSdk();

    const handleConnect = () => {
        setIsLoading(true);
        setError('');
        
        // Dùng signIn của NextAuth, nhưng nó sẽ tự động phát hiện
        // nếu người dùng đã đăng nhập qua SDK và sử dụng thông tin đó
        // thay vì redirect. Đây là một tính năng thông minh của NextAuth.
        signIn('facebook', {
            // Chúng ta muốn quay trở lại trang dashboard sau khi kết nối
            callbackUrl: '/dashboard',
        }).catch(err => {
            console.error("Lỗi khi gọi signIn('facebook'):", err);
            setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
            setIsLoading(false);
        });
    };

    const buttonText = isLoading ? 'Đang xử lý...' : (isSdkReady ? 'Kết nối với Facebook' : 'Đang tải SDK...');

    return (
        <div>
            <button 
                onClick={handleConnect} 
                disabled={isLoading || !isSdkReady}
                className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
                {/* ... SVG Icon ... */}
                <span>{buttonText}</span>
            </button>
            {error && <p className="text-sm text-center text-red-600 mt-2">{error}</p>}
        </div>
    );
}