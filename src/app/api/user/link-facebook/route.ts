import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import clientPromise from '@/lib/mongodb';
import axios from 'axios';
import { ObjectId } from 'mongodb';

async function verifyFacebookToken(accessToken: string) {
    const url = `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`;
    const response = await axios.get(url);
    return response.data;
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!session || !userId) {
        return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
    }
    try {
        const { accessToken } = await request.json();
        if (!accessToken) return NextResponse.json({ error: 'Không có access token' }, { status: 400 });

        const fbUser = await verifyFacebookToken(accessToken);
        if (!fbUser || !fbUser.id) return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 });

        const client = await clientPromise;
        const db = client.db();
        const accountsCollection = db.collection("accounts");
        
        await accountsCollection.updateOne(
            { userId: new ObjectId(userId), provider: 'facebook' },
            {
                $set: {
                    type: 'oauth',
                    providerAccountId: fbUser.id,
                    access_token: accessToken,
                },
                $setOnInsert: {
                    userId: new ObjectId(userId),
                    provider: 'facebook',
                }
            },
            { upsert: true }
        );
        
        return NextResponse.json({ success: true, message: "Đã liên kết tài khoản Facebook thành công." });

    } catch (error: any) {
        console.error("Lỗi khi liên kết Facebook:", error.response?.data || error);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}