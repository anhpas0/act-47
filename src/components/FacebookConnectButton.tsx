"use client";
import axios from 'axios';
import { useState } from 'react';
import { useSession } from 'next-auth/react'; // Import useSession

declare global { interface Window { FB: any; } }

// Component này không cần callback onSuccess nữa vì nó sẽ tự kích hoạt cập nhật session
export default function FacebookConnectButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { update } = useSession(); // Lấy hàm update từ useSession

    const handleConnect = () => {
        setIsLoading(true);
        setError('');

        if (typeof window.FB === 'undefined' || !window.FB) {
            setError('SDK chưa tải xong. Vui lòng thử lại sau giây lát.');
            setIsLoading(false);
            return;
        }

        window.FB.login(async (response: any) => {
            if (response.authResponse) {
                const accessToken = response.authResponse.accessToken;
                try {
                    // Gửi token về backend để liên kết tài khoản
                    await axios.post('/api/user/link-facebook', { accessToken });
                    
                    // === SỬA ĐỔI QUAN TRỌNG NHẤT LÀ Ở ĐÂY ===
                    // Sau khi liên kết thành công, gọi hàm update() của NextAuth.
                    // Hàm này sẽ âm thầm gọi lại API /api/auth/session,
                    // lấy JWT và session mới nhất, và cập nhật trạng thái toàn cục.
                    await update();

                } catch (err: any) {
                    setError(err.response?.data?.error || 'Lỗi khi liên kết tài khoản.');
                }
            } else {
                setError('Kết nối Facebook đã bị hủy.');
            }
            setIsLoading(false);
        }, { scope: 'public_profile,pages_show_list,pages_manage_posts,pages_read_engagement' });
    };

    return (
        <div>
            <button 
                onClick={handleConnect} 
                disabled={isLoading}
                className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
                {/* SVG Icon */}
                <svg className="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"></path></svg>
                <span>{isLoading ? 'Đang xử lý...' : 'Kết nối với Facebook'}</span>
            </button>
            {error && <p className="text-sm text-center text-red-600 mt-2">{error}</p>}
        </div>
    );
}