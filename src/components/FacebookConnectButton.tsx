"use client";
import axios from 'axios';
import { useState } from 'react';
import { useFacebookSdk } from '@/context/FacebookSdkContext'; // Import hook mới

declare global { interface Window { FB: any; } }

export default function FacebookConnectButton({ onSuccess }: { onSuccess: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { isSdkReady } = useFacebookSdk(); // Lấy trạng thái từ Context

    const handleConnect = () => {
        setIsLoading(true);
        setError('');
        
        // Không cần kiểm tra typeof window.FB nữa vì nút đã bị disabled
        window.FB.login(async (response: any) => {
            if (response.authResponse) {
                const accessToken = response.authResponse.accessToken;
                try {
                    await axios.post('/api/user/link-facebook', { accessToken });
                    onSuccess();
                } catch (err: any) {
                    setError(err.response?.data?.error || 'Lỗi khi liên kết tài khoản.');
                }
            } else {
                setError('Kết nối Facebook đã bị hủy.');
            }
            setIsLoading(false);
        }, { scope: 'public_profile,pages_show_list,pages_manage_posts,pages_read_engagement' });
    };

    const buttonText = isLoading ? 'Đang xử lý...' : (isSdkReady ? 'Kết nối với Facebook' : 'Đang tải SDK...');

    return (
        <div>
            <button 
                onClick={handleConnect} 
                // Nút sẽ bị vô hiệu hóa nếu đang loading HOẶC SDK chưa sẵn sàng
                disabled={isLoading || !isSdkReady}
                className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
                {buttonText}
            </button>
            {error && <p className="text-sm text-center text-red-600 mt-2">{error}</p>}
        </div>
    );
}