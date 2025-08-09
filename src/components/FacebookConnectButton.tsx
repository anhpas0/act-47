"use client";
import axios from 'axios';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

declare global { interface Window { FB: any; } }

export default function FacebookConnectButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { update } = useSession();

    // Hàm này sẽ bọc FB.login trong một Promise
    const facebookLoginPromise = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            // Callback đồng bộ được truyền cho FB.login
            const loginCallback = (response: any) => {
                if (response.authResponse) {
                    // Nếu thành công, resolve Promise với accessToken
                    resolve(response.authResponse.accessToken);
                } else {
                    // Nếu thất bại, reject Promise với thông báo lỗi
                    reject('Kết nối Facebook đã bị hủy bởi người dùng.');
                }
            };

            window.FB.login(loginCallback, { 
                scope: 'public_profile,pages_show_list,pages_manage_posts,pages_read_engagement' 
            });
        });
    };

    const handleConnect = async () => {
        setIsLoading(true);
        setError('');

        if (typeof window.FB === 'undefined' || !window.FB) {
            setError('SDK chưa tải xong. Vui lòng thử lại sau giây lát.');
            setIsLoading(false);
            return;
        }

        try {
            // === SỬA ĐỔI QUAN TRỌNG NHẤT LÀ Ở ĐÂY ===
            // 1. Chờ cho Promise của FB.login hoàn thành
            const accessToken = await facebookLoginPromise();

            // 2. Nếu thành công, tiếp tục xử lý logic bất đồng bộ
            await axios.post('/api/user/link-facebook', { accessToken });

            // 3. Cập nhật session để làm mới giao diện
            await update();

        } catch (err: any) {
            // Bắt lỗi từ cả Promise (khi người dùng hủy) và từ axios
            setError(typeof err === 'string' ? err : 'Lỗi khi liên kết tài khoản.');
        } finally {
            setIsLoading(false);
        }
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