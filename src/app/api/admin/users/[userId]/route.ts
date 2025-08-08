// File: src/app/api/admin/users/[userId]/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { ObjectId } from 'mongodb';

// Hàm helper để kiểm tra quyền Admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session && (session.user as any)?.role === 'admin';
}

// Hàm DELETE để xóa một người dùng
export async function DELETE(
    request: Request,
    { params }: { params: { userId: string } }
) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const userId = params.userId;
    if (!userId) {
        return NextResponse.json({ error: 'Thiếu User ID' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        // Xóa người dùng khỏi collection 'users'
        const userDeleteResult = await db.collection("users").deleteOne({
            _id: new ObjectId(userId)
        });

        if (userDeleteResult.deletedCount === 0) {
            return NextResponse.json({ error: 'Không tìm thấy người dùng để xóa.' }, { status: 404 });
        }

        // Đồng thời xóa các tài khoản liên kết (Facebook, etc.) trong collection 'accounts'
        await db.collection("accounts").deleteMany({
            userId: new ObjectId(userId)
        });

        return NextResponse.json({ success: true, message: 'Đã xóa tài khoản người dùng và các kết nối liên quan thành công.' });

    } catch (err) {
        console.error("Lỗi khi xóa user:", err);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}