import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';
import { Session } from 'next-auth';

export default async function AdminPage() {
  // Lấy thông tin session ở phía server
  const session: Session | null = await getServerSession(authOptions);

  // Bảo vệ route: Nếu chưa đăng nhập hoặc không phải là admin, chuyển hướng về dashboard
  if (!session || (session.user as any)?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Nếu là admin, hiển thị component dashboard của admin
  return <AdminDashboard />;
}