// File: src/app/api/user/pages/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import axios from 'axios';
import { ObjectId } from 'mongodb'; // Import ObjectId

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!session || !userId) {
    return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // === SỬA LỖI QUAN TRỌNG NHẤT ===
    // Truy vấn collection 'accounts' bằng userId, nhưng đảm bảo chuyển chuỗi ID
    // từ session thành một đối tượng ObjectId để khớp với database.
    const facebookAccount = await db.collection('accounts').findOne({
      userId: new ObjectId(userId), 
      provider: 'facebook'
    });

    if (!facebookAccount || !facebookAccount.access_token) {
      console.error(`Không tìm thấy access token cho user ObjectId: ${userId}`);
      return NextResponse.json({ pages: [], footers: {} });
    }

    const userAccessToken = facebookAccount.access_token;
    const url = `https://graph.facebook.com/me/accounts?fields=id,name,access_token&access_token=${userAccessToken}`;
    const response = await axios.get(url);

    return NextResponse.json({
      pages: response.data.data || [],
      footers: facebookAccount.page_footers || {},
    });

  } catch (error: any) {
    // Thêm kiểm tra lỗi ObjectId không hợp lệ
    if (error.name === 'BSONError') {
      console.error("Lỗi BSON: userId từ session không phải là một ObjectId hợp lệ.", userId);
      return NextResponse.json({ error: 'Session ID không hợp lệ.' }, { status: 400 });
    }
    console.error("Lỗi khi lấy danh sách Fanpage:", error.response?.data || error);
    return NextResponse.json({ error: 'Không thể lấy danh sách Fanpage từ Facebook.' }, { status: 500 });
  }
}