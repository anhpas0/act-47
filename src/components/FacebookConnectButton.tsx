"use client";
import axios from 'axios';
import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useFacebookSdk } from '@/context/FacebookSdkContext';

declare global { interface Window { FB: any; } }

export default function FacebookConnectButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { update } = useSession();
    const { isSdkReady } = useFacebookSdk();

    // Hàm này sẽ bọc FB.login trong một Promise an toàn
    const facebookLoginPromise = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            // Hàm callback này LÀ MỘT HÀM ĐỒNG BỘ THÔNG THƯỜNG
            const loginCallback = (response: any) => {
                if (response && response.authResponse) {
                    resolve(response.authResponse.accessToken);
                } else {
                    reject(new Error('Kết nối Facebook đã bị hủy hoặc thất bại.'));
                }
            };
            
            // Chỉ gọi login khi SDK đã thực sự sẵn sàng
            if (window.FB) {
                window.FB.login(loginCallback, { 
                    scope: 'public_profile,pages_show_list,pages_manage_posts,pages_read_engagement' 
                });
            } else {
                reject(new Error("SDK của Facebook chưa sẵn sàng."));
            }
        });
    };

    // Sử dụng useCallback để ổn định hàm handleConnect
    const handleConnect = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            // 1. Chờ cho Promise của FB.login hoàn thành
            const accessToken = await facebookLoginPromise();

            // 2. Nếu thành công, tiếp tục xử lý logic bất đồng bộ
            await axios.post('/api/user/link-facebook', { accessToken });

            // 3. Cập nhật session để làm mới giao diện
            await update();

        } catch (err: any) {
            // Bắt lỗi từ cả Promise và axios
            setError(err.message || 'Đã có lỗi xảy ra.');
        } finally {
            setIsLoading(false);
        }
    }, [update]); // Phụ thuộc vào hàm `update` của useSession

    const buttonText = isLoading 
        ? 'Đang xử lý...' 
        : (isSdkReady ? 'Kết nối với Facebook' : 'Đang tải SDK...');

    return (
        <div>
            <button 
                onClick={handleConnect} 
                disabled={isLoading || !isSdkReady}
                className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
                {/* SVG Icon */}
                <svg className="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"></path></svg>
                <span>{buttonText}</span>
            </button>
            {error && <p className="text-sm text-center text-red-600 mt-2">{error}</p>}
        </div>
    );
}