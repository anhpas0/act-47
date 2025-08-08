"use client";

import type { Session } from "next-auth";
import { signOut, signIn } from "next-auth/react";
import Poster from "./Poster"; // Import Poster component
import { useEffect, useState } from "react";
import axios from "axios";

// Định nghĩa lại interface Account để rõ ràng hơn
interface ConnectedAccount {
    provider: string;
}

export default function UserDashboard({ session }: { session: Session }) {
    const [hasFacebookConnection, setHasFacebookConnection] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkConnection = async () => {
            setIsLoading(true);
            try {
                // Chúng ta vẫn cần API này để biết có nên hiển thị nút "Kết nối" hay không
                const res = await axios.get('/api/user/accounts');
                const facebookAccount = res.data.find((acc: ConnectedAccount) => acc.provider === 'facebook');
                setHasFacebookConnection(!!facebookAccount);
            } catch (error) {
                console.error("Lỗi khi kiểm tra kết nối Facebook", error);
                setHasFacebookConnection(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkConnection();
    }, []);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto p-8 text-center">
                <p>Đang tải dữ liệu, vui lòng chờ...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Bảng điều khiển</h1>
                <div>
                    <span className="text-sm text-gray-600 mr-4">Chào, {session.user?.name}!</span>
                    <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-sm font-medium text-red-600 hover:text-red-800">
                        Đăng xuất
                    </button>
                </div>
            </div>

            {hasFacebookConnection ? (
                // Nếu ĐÃ kết nối, render thẳng component Poster
                <Poster session={session} />
            ) : (
                // Nếu CHƯA kết nối, hiển thị nút để bắt đầu
                <div className="text-center p-8 mt-10 bg-white border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Bắt đầu nào!</h2>
                    <p className="mb-6 text-gray-600">Bạn cần kết nối tài khoản Facebook của mình để có thể lấy danh sách Fanpage và đăng bài.</p>
                    <button
                        onClick={() => signIn("facebook")}
                        className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Kết nối với Facebook
                    </button>
                </div>
            )}
        </div>
    );
}