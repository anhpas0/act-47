import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
    const client = await clientPromise;
    const db = client.db();
    const existingUser = await db.collection("users").findOne({ username });
    if (existingUser) return NextResponse.json({ error: 'Tên đăng nhập đã tồn tại' }, { status: 409 });
    const hashedPassword = bcrypt.hashSync(password, 10);
    await db.collection("users").insertOne({
      username,
      password: hashedPassword,
      role: 'guest',
      status: 'pending',
      plan: null,
      planExpiresAt: null,
      createdAt: new Date(),
    });
    return NextResponse.json({ success: true, message: 'Đăng ký thành công! Vui lòng chờ Admin kích hoạt tài khoản.' });
  } catch (err) { // Sửa 'error' thành 'err'
    console.error("Lỗi khi đăng ký:", err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}