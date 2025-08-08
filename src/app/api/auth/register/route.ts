import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    // Kiểm tra xem tên đăng nhập đã tồn tại chưa
    const existingUser = await db.collection("users").findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: 'Tên đăng nhập đã tồn tại' }, { status: 409 });
    }
    
    // Mã hóa mật khẩu
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Tạo bản ghi người dùng mới với trạng thái pending
    await db.collection("users").insertOne({
      username,
      password: hashedPassword,
      role: 'guest',
      status: 'pending', // Trạng thái mặc định là chờ kích hoạt
      plan: null,
      planExpiresAt: null,
      createdAt: new Date(),
    });
    
    // === SỬA ĐỔI QUAN TRỌNG NHẤT ===
    // Trả về thêm trường 'redirect' để báo cho frontend biết cần chuyển trang
    return NextResponse.json({ 
        success: true, 
        message: 'Đăng ký thành công! Đang chuyển đến trang chọn gói cước...',
        redirect: '/subscribe' 
    });

  } catch (err) {
    console.error("Lỗi khi đăng ký:", err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}