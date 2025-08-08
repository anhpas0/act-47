// File: src/app/api/admin/users/route.ts

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

// Hàm GET để lấy danh sách người dùng (không thay đổi)
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }
  const client = await clientPromise;
  const users = await client.db().collection("users").find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(users);
}

// Hàm POST giờ đây xử lý tất cả các hành động: Kích hoạt, Hủy, Đổi gói, và Xóa
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }
  
  try {
    const { userId, action, plan } = await request.json();
    if (!userId || !action) {
      return NextResponse.json({ error: 'Thiếu thông tin cần thiết (userId, action)' }, { status: 400 });
    }

    // Kiểm tra xem userId có hợp lệ không trước khi thực hiện bất kỳ hành động nào
    if (!ObjectId.isValid(userId)) {
        return NextResponse.json({ error: 'User ID không hợp lệ' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // === NHÁNH LOGIC MỚI ĐỂ XÓA USER ===
    if (action === 'delete_user') {
        // Xóa người dùng khỏi collection 'users'
        const userDeleteResult = await db.collection("users").deleteOne({ _id: new ObjectId(userId) });

        if (userDeleteResult.deletedCount === 0) {
            return NextResponse.json({ error: 'Không tìm thấy người dùng để xóa.' }, { status: 404 });
        }

        // Đồng thời xóa các tài khoản liên kết (Facebook, etc.)
        await db.collection("accounts").deleteMany({ userId: new ObjectId(userId) });

        return NextResponse.json({ success: true, message: 'Đã xóa tài khoản người dùng thành công.' });
    }

    // --- Các logic cũ cho việc cập nhật user ---
    const updates: { [key: string]: any } = {};
    const activationDate = new Date();

    const planDurationsInDays: Record<string, number | null> = {
        '1_month': 31,
        '3_months': 93,
        '6_months': 180,
        '1_year': 365,
        'lifetime': null,
    };

    const calculateExpiryDate = (selectedPlan: string) => {
        const durationInDays = planDurationsInDays[selectedPlan];
        if (durationInDays === undefined) return 'invalid_plan';
        if (durationInDays === null) return null;
        const expiryDate = new Date(activationDate);
        expiryDate.setDate(expiryDate.getDate() + durationInDays);
        return expiryDate;
    };

    if (action === 'activate' || action === 'change_plan') {
      if (!plan) return NextResponse.json({ error: 'Cần chọn gói cước' }, { status: 400 });
      const expiryDate = calculateExpiryDate(plan);
      if (expiryDate === 'invalid_plan') return NextResponse.json({ error: 'Gói cước không hợp lệ' }, { status: 400 });
      
      updates.plan = plan;
      updates.planExpiresAt = expiryDate;
      if (action === 'activate') {
        updates.status = 'active';
      }
    } else if (action === 'deactivate') {
      updates.status = 'inactive';
    } else {
      return NextResponse.json({ error: `Hành động '${action}' không hợp lệ` }, { status: 400 });
    }
    
    await db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: updates });
    return NextResponse.json({ success: true, message: `Đã cập nhật tài khoản thành công.` });

  } catch (err) {
    console.error("Lỗi khi cập nhật/xóa user:", err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}