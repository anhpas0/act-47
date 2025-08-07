import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!session || !userId) {
    return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // Tìm tài khoản Facebook của người dùng đang đăng nhập
    const facebookAccount = await db.collection('accounts').findOne({
      userId: new ObjectId(userId),
      provider: 'facebook'
    });

    // Trả về một object cho biết đã kết nối hay chưa và thông tin cơ bản
    if (facebookAccount) {
        return NextResponse.json({
            isConnected: true,
            provider: 'facebook',
            userName: session.user?.name || 'Không rõ'
        });
    } else {
        return NextResponse.json({ isConnected: false });
    }

  } catch (error) {
    console.error("Lỗi khi lấy tài khoản đã kết nối:", error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}