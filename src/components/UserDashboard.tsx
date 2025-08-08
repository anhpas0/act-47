"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import type { Session } from "next-auth";
import Poster from "./Poster";
import axios from 'axios';

interface ConnectedAccount {
    provider: string;
}

export default function UserDashboard({ session }: { session: Session }) {
    const [hasFacebookConnection, setHasFacebookConnection] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState('');

    const checkConnection = async () => {
        setIsLoading(true);
        try {
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

    useEffect(() => {
        checkConnection();
    }, []);

    // === HÀM MỚI ĐỂ GỠ KẾT NỐI ===
    const handleDisconnectFacebook = async () => {
        if (window.confirm("Bạn có chắc chắn muốn gỡ kết nối tài khoản Facebook hiện tại? Bạn sẽ cần kết nối lại để tiếp tục sử dụng dịch vụ.")) {
            setStatusMessage("Đang gỡ kết nối...");
            try {
                await axios.delete('/api/user/accounts');
                setStatusMessage("Gỡ kết nối thành công!");
                setHasFacebookConnection(false); // Cập nhật lại giao diện ngay lập tức
            } catch (err: any) {
                setStatusMessage(err.response?.data?.error || "Gỡ kết nối thất bại.");
            }
        }
    };

    if (isLoading) {
        return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Bảng điều khiển</h1>
            
            {statusMessage && <div className="p-3 my-4 rounded text-center bg-blue-100 text-blue-700">{statusMessage}</div>}

            {hasFacebookConnection ? (
                <div>
                    <div className="p-4 mb-6 bg-green-50 border-l-4 border-green-500 rounded-r-lg flex justify-between items-center">
                        <p className="font-semibold text-green-800">Đã kết nối với tài khoản Facebook.</p>
                        <button 
                            onClick={handleDisconnectFacebook}
                            className="text-xs text-red-600 hover:text-red-800 hover:underline"
                        >
                            Gỡ kết nối
                        </button>
                    </div>
                    <Poster session={session} />
                </div>
            ) : (
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