import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Hàm GET (không đổi)
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!session || !userId) return NextResponse.json([], { status: 401 }); // Trả về mảng rỗng

  try {
    const client = await clientPromise;
    const db = client.db();
    const accounts = await db.collection('accounts').find({
      userId: new ObjectId(userId)
    }).project({ provider: 1 }).toArray();
    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Lỗi khi lấy tài khoản đã kết nối:", error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}

// === HÀM DELETE MỚI ĐỂ GỠ KẾT NỐI ===
export async function DELETE() {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!session || !userId) {
        return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        // Xóa bản ghi tài khoản Facebook của người dùng đang đăng nhập
        const result = await db.collection("accounts").deleteOne({
            userId: new ObjectId(userId),
            provider: 'facebook'
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Không tìm thấy kết nối Facebook để gỡ.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Đã gỡ kết nối tài khoản Facebook thành công.' });

    } catch (err) {
        console.error("Lỗi khi gỡ kết nối Facebook:", err);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}