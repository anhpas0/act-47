import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import axios from 'axios';
import { ObjectId } from 'mongodb';

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!session || !userId) {
    return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
  }
  try {
    const client = await clientPromise;
    const db = client.db();
    const facebookAccount = await db.collection('accounts').findOne({
      userId: new ObjectId(userId),
      provider: 'facebook'
    });
    if (!facebookAccount || !facebookAccount.access_token) {
      return NextResponse.json({ pages: [], footers: {} });
    }
    const userAccessToken = facebookAccount.access_token;
    const url = `https://graph.facebook.com/me/accounts?fields=id,name,access_token&access_token=${userAccessToken}`;
    const response = await axios.get(url);
    return NextResponse.json({
      pages: response.data.data || [],
      footers: facebookAccount.page_footers || {},
    });
  } catch (error) {
    const err = error as any;
    console.error("Lỗi khi lấy danh sách Fanpage:", err.response?.data || err);
    return NextResponse.json({ error: 'Không thể lấy danh sách Fanpage.' }, { status: 500 });
  }
}