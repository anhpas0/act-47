// File: src/lib/authOptions.ts

import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { AuthOptions } from "next-auth";
import { MongoClient } from "mongodb";

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise as Promise<MongoClient>),
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_APP_ID as string,
      clientSecret: process.env.FACEBOOK_APP_SECRET as string,
      
      // === SỬA LỖI BUILD TRÊN VERCEL ===
      // Di chuyển 'scope' vào đúng vị trí bên trong 'authorization.params'
      authorization: {
        params: {
          scope: "public_profile pages_show_list pages_manage_posts pages_read_engagement",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Tên đăng nhập", type: "text" },
        password: { label: "Mật khẩu", type: "password" },
      },
      // GIỮ NGUYÊN HOÀN TOÀN LOGIC AUTHORIZE ĐANG HOẠT ĐỘNG CỦA BẠN
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const client = await clientPromise;
        const db = client.db();
        
        const user = await db.collection("users").findOne({ username: credentials.username });

        if (user && bcrypt.compareSync(credentials.password, user.password as string)) {
          const now = new Date();
          
          if (user.plan !== 'lifetime' && user.planExpiresAt && new Date(user.planExpiresAt) < now) {
              if (user.status !== 'inactive') {
                  await db.collection("users").updateOne({ _id: user._id }, { $set: { status: 'inactive' } });
              }
              throw new Error("Gói cước của bạn đã hết hạn. Vui lòng liên hệ Admin.");
          }
          
          if (user.status !== 'active') {
            throw new Error("Tài khoản chưa được kích hoạt hoặc đã bị khóa.");
          }
          
          return { id: user._id.toString(), name: user.username, role: user.role };
        }
        return null;
      },
    }),
  ],

  // GIỮ LẠI `strategy: "jwt"` VÀ CÁC CALLBACK GỐC ĐÃ HOẠT ĐỘNG CỦA BẠN
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/login', error: '/login' }
};