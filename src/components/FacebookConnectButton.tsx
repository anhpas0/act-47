"use client";
import axios from 'axios';
import { useState } from 'react';
import { useSession } from 'next-auth/react'; // Import useSession

declare global { interface Window { FB: any; } }

// Component này bây giờ không cần callback onSuccess nữa
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
                    
                    // === SỬA ĐỔI QUAN TRỌNG NHẤT ===
                    // Sau khi liên kết thành công, gọi hàm update() của NextAuth
                    // để buộc nó phải làm mới lại session và JWT.
                    await update();
                    
                    // Không cần làm gì thêm, session mới sẽ tự động kích hoạt
                    // re-render ở UserDashboard.
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
                {/* ... SVG Icon ... */}
                <span>{isLoading ? 'Đang xử lý...' : 'Kết nối với Facebook'}</span>
            </button>
            {error && <p className="text-sm text-center text-red-600 mt-2">{error}</p>}
        </div>
    );
}