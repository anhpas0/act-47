"use client";
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get('error');

  // Hiển thị lỗi từ NextAuth (ví dụ: tài khoản bị khóa)
  useState(() => {
    if (callbackError) {
      setError("Tài khoản chưa được kích hoạt hoặc thông tin không chính xác.");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác.');
      setIsLoading(false);
    } else if (result?.ok) {
      router.replace('/dashboard'); // Dùng replace để không lưu trang login vào lịch sử
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen-minus-header bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">Đăng nhập</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="text-sm font-medium text-gray-700">Tên đăng nhập</label>
            <input id="username" name="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Mật khẩu</label>
            <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          {error && <p className="text-sm text-center text-red-600">{error}</p>}
          <div>
            <button type="submit" disabled={isLoading} className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </div>
        </form>
         <p className="text-sm text-center text-gray-600">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:underline">
                Đăng ký ngay
            </Link>
        </p>
      </div>
    </div>
  );
}