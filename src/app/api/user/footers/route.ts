import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  if (!session || !userId) {
    return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
  }
  try {
    const { footers } = await request.json();
    if (typeof footers !== 'object' || footers === null) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db();
    await db.collection('accounts').updateOne(
      { userId: new ObjectId(userId), provider: 'facebook' },
      { $set: { page_footers: footers } }
    );
    return NextResponse.json({ success: true, message: 'Đã lưu cài đặt footer.' });
  } catch (err) {
    console.error("Lỗi khi lưu footer:", err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}