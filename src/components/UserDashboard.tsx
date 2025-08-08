"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import type { Session } from "next-auth";
import Poster from "./Poster";
import axios from 'axios';

interface ConnectionStatus {
  isConnected: boolean;
  provider?: string;
  userName?: string;
}

export default function UserDashboard({ session }: { session: Session }) {
  // State mới để lưu trạng thái kết nối lấy từ API
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect sẽ gọi API mới để kiểm tra trạng thái
  useEffect(() => {
    const fetchConnectionStatus = async () => {
      setIsLoading(true);
      try {
        // Gọi đến API route mới mà chúng ta vừa tạo
        const res = await axios.get<ConnectionStatus>('/api/user/accounts');
        setConnectionStatus(res.data);
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái kết nối", error);
        // Mặc định là chưa kết nối nếu có lỗi
        setConnectionStatus({ isConnected: false });
      } finally {
        setIsLoading(false);
      }
    };

    // Chỉ chạy khi có session
    if (session) {
        fetchConnectionStatus();
    }
  }, [session]);

  if (isLoading) {
    return <div className="text-center p-10">Đang tải dữ liệu tài khoản...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Bảng điều khiển</h1>
      
      {/* Dựa vào trạng thái từ API để hiển thị giao diện */}
      {connectionStatus?.isConnected ? (
        <div>
          <div className="p-4 mb-6 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
            <p className="font-semibold text-green-800">Đã kết nối với tài khoản Facebook.</p>
          </div>
          {/* Truyền session vào Poster, Poster sẽ tự lấy fanpage */}
          <Poster session={session} /> 
        </div>
      ) : (
        <div className="text-center p-8 bg-white border-2 border-dashed rounded-lg">
          <p className="mb-4 text-gray-600">Bạn chưa kết nối tài khoản Facebook. Hãy kết nối để bắt đầu đăng bài.</p>
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