import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import SubscriptionPage from '@/components/SubscriptionPage';

export default async function Subscribe() {
    const session = await getServerSession(authOptions);

    // Lấy username nếu người dùng đã đăng nhập, nếu không thì để trống.
    // Component SubscriptionPage sẽ xử lý trường hợp này.
    const username = session?.user?.name || '';

    // === LOGIC MỚI ===
    // Chúng ta KHÔNG còn redirect người dùng đi đâu cả.
    // Mọi người đều có thể truy cập trang này.
    // Tuy nhiên, nếu một người dùng đã ACTIVE rồi, chúng ta có thể chuyển họ đi.
    if (session) {
        // (Tùy chọn) Kiểm tra nếu user đã active thì chuyển về dashboard
        // Phần này cần truy vấn DB, chúng ta có thể thêm sau để giữ cho logic đơn giản
    }

    return <SubscriptionPage username={username} />;
}