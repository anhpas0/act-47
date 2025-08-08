// File: src/app/api/admin/users/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { ObjectId } from 'mongodb';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session && (session.user as any)?.role === 'admin';
}

// Hàm GET không đổi
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  const client = await clientPromise;
  const users = await client.db().collection("users").find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(users);
}

// Hàm POST đã được nâng cấp
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  
  try {
    const { userId, action, plan } = await request.json();
    if (!userId || !action) return NextResponse.json({ error: 'Thiếu thông tin cần thiết' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();
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

    if (action === 'activate') {
      if (!plan) return NextResponse.json({ error: 'Cần chọn gói cước để kích hoạt' }, { status: 400 });
      
      const expiryDate = calculateExpiryDate(plan);
      if (expiryDate === 'invalid_plan') return NextResponse.json({ error: 'Gói cước không hợp lệ' }, { status: 400 });

      updates.status = 'active';
      updates.plan = plan;
      updates.planExpiresAt = expiryDate;

    } else if (action === 'deactivate') {
      updates.status = 'inactive';

    } 
    // === LOGIC MỚI ĐỂ THAY ĐỔI GÓI CƯỚC ===
    else if (action === 'change_plan') {
        if (!plan) return NextResponse.json({ error: 'Cần chọn gói cước mới' }, { status: 400 });

        const expiryDate = calculateExpiryDate(plan);
        if (expiryDate === 'invalid_plan') return NextResponse.json({ error: 'Gói cước không hợp lệ' }, { status: 400 });
        
        // Chỉ cập nhật gói và ngày hết hạn, không đụng đến status
        updates.plan = plan;
        updates.planExpiresAt = expiryDate;
    }
    else {
      return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 });
    }
    
    await db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: updates });
    return NextResponse.json({ success: true, message: `Đã cập nhật tài khoản thành công.` });

  } catch (err) {
    console.error("Lỗi khi cập nhật user:", err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}