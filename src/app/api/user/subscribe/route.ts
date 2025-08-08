import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!session || !userId) {
    return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
  }

  try {
    const { plan } = await request.json();
    if (!plan) {
      return NextResponse.json({ error: 'Vui lòng chọn một gói cước.' }, { status: 400 });
    }
    
    const validPlans = ['1_month', '3_months', '6_months', '1_year', 'lifetime'];
    if (!validPlans.includes(plan)) {
        return NextResponse.json({ error: 'Gói cước không hợp lệ.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Cập nhật gói cước mà người dùng đã chọn vào tài khoản của họ
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { plan: plan } } // Chỉ cập nhật trường 'plan'
    );

    return NextResponse.json({ success: true, message: 'Đã ghi nhận lựa chọn gói cước của bạn.' });
  } catch (error) {
    console.error("Lỗi khi đăng ký gói:", error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}