"use client";
import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; // Import signIn

export default function RegisterForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);
        setIsSuccess(false);

        try {
            // 1. Gọi API để tạo tài khoản trong DB
            const registerRes = await axios.post('/api/auth/register', { username, password });
            
            setMessage(registerRes.data.message);
            setIsSuccess(true);
            
            // === SỬA ĐỔI QUAN TRỌNG NHẤT ===
            // 2. Nếu đăng ký thành công, dùng thông tin đó để gọi signIn
            if (registerRes.data.success && registerRes.data.user) {
                const signInRes = await signIn('credentials', {
                    redirect: false, // Rất quan trọng: Tự xử lý redirect
                    username: registerRes.data.user.username,
                    password: password, // Dùng mật khẩu gốc người dùng vừa nhập
                });

                // 3. Sau khi đăng nhập xong, chuyển đến trang subscribe
                if (signInRes?.ok) {
                    router.push('/subscribe');
                } else {
                    // Trường hợp hiếm gặp: đăng ký được nhưng đăng nhập lỗi
                    setMessage('Đăng ký thành công nhưng không thể tự động đăng nhập. Vui lòng thử đăng nhập thủ công.');
                }
            }

        } catch (err: any) {
            setMessage(err.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.');
            setIsSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen-minus-header bg-gray-50 p-4">
             <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold text-center text-gray-800">Tạo tài khoản mới</h1>
                
                {message && (
                    <div className={`text-sm text-center p-3 rounded-md ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <p>{message}</p>
                        {isLoading && <div className="mt-2 h-1 bg-blue-200 rounded animate-pulse"></div>}
                    </div>
                )}

                {!isSuccess && (
                     <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Tên đăng nhập</label>
                            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
                            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                        </button>
                    </form>
                )}

                <p className="text-sm text-center text-gray-600">
                    Đã có tài khoản?{' '}
                    <Link href="/login" className="font-medium text-blue-600 hover:underline">
                        Đăng nhập ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}