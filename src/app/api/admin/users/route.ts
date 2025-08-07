import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session && (session.user as any)?.role === 'admin';
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  const client = await clientPromise;
  const users = await client.db().collection("users").find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  try {
    const { userId, action, plan } = await request.json();
    if (!userId || !action) return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
    const client = await clientPromise;
    const db = client.db();
    const updates: { [key: string]: any } = {}; // Định nghĩa kiểu rõ ràng
    if (action === 'activate') {
      if (!plan) return NextResponse.json({ error: 'Cần chọn gói cước' }, { status: 400 });
      updates.status = 'active';
      updates.plan = plan;
      if (plan === 'monthly') updates.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      else if (plan === 'yearly') updates.planExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      else updates.planExpiresAt = null;
    } else if (action === 'deactivate') {
      updates.status = 'inactive';
    } else {
      return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 });
    }
    await db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: updates });
    return NextResponse.json({ success: true, message: `Đã cập nhật tài khoản.` });
  } catch (err) { // Sửa 'error' thành 'err'
    console.error("Lỗi khi cập nhật user:", err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}