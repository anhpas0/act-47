import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import UserDashboard from '@/components/UserDashboard';
import { Session } from 'next-auth';

export default async function DashboardPage() {
  // Lấy thông tin session ở phía server
  const session: Session | null = await getServerSession(authOptions);

  // Bảo vệ route: Nếu chưa đăng nhập, chuyển hướng về trang login
  if (!session) {
    redirect('/login');
  }

  // Nếu đã đăng nhập, hiển thị component dashboard của người dùng và truyền session vào
  return <UserDashboard session={session} />;
}