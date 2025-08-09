"use client";
import { useState, useEffect } from "react";
import type { Session } from "next-auth";
import Poster from "./Poster";
import axios from 'axios';
import FacebookConnectButton from "./FacebookConnectButton";

export default function UserDashboard({ session }: { session: Session }) {
    const [hasFacebookConnection, setHasFacebookConnection] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState('');

    const checkConnection = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/user/accounts');
            setHasFacebookConnection(res.data.isConnected);
        } catch (error) {
            console.error("Lỗi khi kiểm tra kết nối Facebook", error);
            setHasFacebookConnection(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
          checkConnection();
        }
    }, [session]);
    
    // ... (hàm handleDisconnectFacebook giữ nguyên)

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
                        {/* <button onClick={handleDisconnectFacebook} ... >Gỡ kết nối</button> */}
                    </div>
                    <Poster session={session} />
                </div>
            ) : (
                <div className="text-center p-8 mt-10 bg-white border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Bắt đầu nào!</h2>
                    <p className="mb-6 text-gray-600">Bạn cần kết nối tài khoản Facebook của mình để có thể lấy danh sách Fanpage và đăng bài.</p>
                    <div className="max-w-xs mx-auto">
                       <FacebookConnectButton onSuccess={checkConnection} />
                    </div>
                </div>
            )}
        </div>
    );
}