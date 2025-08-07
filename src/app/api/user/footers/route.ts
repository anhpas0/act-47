// File: src/app/api/user/footers/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb'; // Import ObjectId

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!session || !userId) {
    return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
  }

  try {
    const { footers } = await request.json();
    if (typeof footers !== 'object' || footers === null) {
      return NextResponse.json({ error: 'Dữ liệu footer không hợp lệ' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // === SỬA LỖI Ở ĐÂY ===
    // Dùng new ObjectId(userId) để tìm đúng tài khoản cần cập nhật
    const result = await db.collection('accounts').updateOne(
      { userId: new ObjectId(userId), provider: 'facebook' },
      { $set: { page_footers: footers } }
    );
    
    // ... (phần còn lại của file giữ nguyên)
    
    return NextResponse.json({ success: true, message: 'Đã lưu cài đặt footer.' });
  } catch (error) {
    console.error("Lỗi khi lưu footer:", error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}