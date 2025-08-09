"use client";
import axios from 'axios';
import { useState } from 'react';

declare global { interface Window { FB: any; } }

export default function FacebookConnectButton({ onSuccess }: { onSuccess: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // === TÁCH LOGIC BẤT ĐỒNG BỘ RA HÀM RIÊNG ===
    const processFacebookToken = async (accessToken: string) => {
        try {
            // Gửi token về backend để liên kết tài khoản
            await axios.post('/api/user/link-facebook', { accessToken });
            onSuccess(); // Gọi callback để component cha cập nhật UI
        } catch (err: any) {
            setError(err.response?.data?.error || 'Lỗi khi liên kết tài khoản.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnect = () => {
        setIsLoading(true);
        setError('');

        if (typeof window.FB === 'undefined' || !window.FB) {
            setError('SDK chưa tải xong. Vui lòng thử lại sau giây lát.');
            setIsLoading(false);
            return;
        }

        // === SỬA LỖI Ở ĐÂY ===
        // Callback bây giờ là một hàm đồng bộ thông thường
        window.FB.login((response: any) => {
            if (response.authResponse) {
                // Lấy token và gọi hàm bất đồng bộ đã được tách ra
                const accessToken = response.authResponse.accessToken;
                processFacebookToken(accessToken); 
            } else {
                // Người dùng đã hủy đăng nhập
                setError('Kết nối Facebook đã bị hủy.');
                setIsLoading(false); // Đảm bảo luôn tắt loading
            }
        }, { scope: 'public_profile,pages_show_list,pages_manage_posts,pages_read_engagement' });
    };

    return (
        <div>
            <button 
                onClick={handleConnect} 
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
                {/* ... SVG Icon ... */}
                <span>{isLoading ? 'Đang xử lý...' : 'Kết nối với Facebook'}</span>
            </button>
            {error && <p className="text-sm text-center text-red-600 mt-2">{error}</p>}
        </div>
    );
}