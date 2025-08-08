"use client";
import { useState, useEffect } from "react";
import axios from "axios";

interface User {
  _id: string;
  username: string;
  role: string;
  status: 'pending' | 'active' | 'inactive';
  plan?: string;
  planExpiresAt?: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get<User[]>('/api/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      setStatusMessage("Lỗi khi tải danh sách người dùng.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, action: 'activate' | 'deactivate' | 'change_plan', plan?: string) => {
    setStatusMessage('Đang cập nhật...');
    try {
      const res = await axios.post('/api/admin/users', { userId, action, plan });
      setStatusMessage(res.data.message);
      fetchUsers();
    } catch (err: any) {
      setStatusMessage(err.response?.data?.error || 'Cập nhật thất bại.');
    }
  };

  // === HÀM MỚI ĐỂ XÓA USER ===
  const handleDeleteUser = async (userId: string, username: string) => {
      if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản '${username}'? Hành động này không thể hoàn tác.`)) {
          setStatusMessage(`Đang xóa tài khoản ${username}...`);
          try {
              // Gọi đến API DELETE mới với userId trên URL
              const res = await axios.delete(`/api/admin/users/${userId}`);
              setStatusMessage(res.data.message);
              fetchUsers(); // Tải lại danh sách sau khi xóa
          } catch (err: any) {
              setStatusMessage(err.response?.data?.error || 'Xóa tài khoản thất bại.');
          }
      }
  };
  
  const formatDate = (dateString?: string) => {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString('vi-VN', {
          day: '2-digit', month: '2-digit', year: 'numeric'
      });
  }

  const AdminActions = ({ user }: { user: User }) => {
    // ... (Component này giữ nguyên không đổi)
    if (user.status === 'pending') { /*...*/ }
    if (user.status === 'active') { /*...*/ }
    if (user.status === 'inactive') { /*...*/ }
    return null;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard - Quản lý người dùng</h1>
      {statusMessage && <div className={`p-3 my-4 rounded text-center ${statusMessage.includes('Lỗi') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{statusMessage}</div>}
      <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gói</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày hết hạn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? ( <tr><td colSpan={5} className="text-center p-4">Đang tải...</td></tr> ) : (
              users.map(user => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : (user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')}`}>{user.status}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.plan || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.plan === 'lifetime' ? 'Vĩnh viễn' : formatDate(user.planExpiresAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-4">
                    {/* Component AdminActions vẫn xử lý Kích hoạt/Thay đổi gói/Hủy kích hoạt */}
                    <AdminActions user={user} />
                    
                    {/* === NÚT XÓA MỚI === */}
                    <button 
                        onClick={() => handleDeleteUser(user._id, user.username)} 
                        className="text-gray-400 hover:text-red-600"
                        title="Xóa vĩnh viễn tài khoản"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}