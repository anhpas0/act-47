"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAdmin = (user as any)?.role === 'admin';

  return (
    <header className="sticky top-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="Logo" width={120} height={41} />
              <span className="font-bold text-xl text-gray-800 hidden sm:block">Auto Caption FB</span>
            </Link>
          </div>
          <nav className="hidden md:flex md:items-center md:space-x-8">
            {status === 'authenticated' && (
                <>
                    <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">Bảng điều khiển</Link>
                    {isAdmin && <Link href="/admin" className="text-gray-600 hover:text-blue-600 font-medium">Quản trị</Link>}
                </>
            )}
          </nav>
          <div className="flex items-center">
            {status === 'authenticated' ? (
              <button onClick={() => signOut({ callbackUrl: '/login' })} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Đăng xuất</button>
            ) : status === 'unauthenticated' ? (
              <div className="space-x-2">
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Đăng nhập</Link>
                <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Đăng ký</Link>
              </div>
            ) : <div className="h-9 w-20 bg-gray-200 rounded-md animate-pulse"></div>}
          </div>
        </div>
      </div>
    </header>
  );
}