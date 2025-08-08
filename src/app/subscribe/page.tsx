import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import SubscriptionPage from '@/components/SubscriptionPage';

export default async function Subscribe() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/login');
    }

    // Lấy thông tin user từ DB để kiểm tra trạng thái
    const client = await clientPromise;
    const user = await client.db().collection('users').findOne({ _id: new ObjectId((session.user as any).id) });

    // Nếu user không tồn tại hoặc đã active, chuyển về dashboard
    if (!user || user.status === 'active') {
        redirect('/dashboard');
    }

    // Truyền username xuống component để tạo nội dung chuyển khoản
    return <SubscriptionPage username={user.username} />;
}