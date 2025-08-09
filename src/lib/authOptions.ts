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
    // 1. Nhà cung cấp Facebook (với cấu hình đã sửa lỗi)
    FacebookProvider({
      clientId: process.env.FACEBOOK_APP_ID as string,
      clientSecret: process.env.FACEBOOK_APP_SECRET as string,
      
      // Thuộc tính 'scope' phải nằm bên trong object 'authorization.params'
      authorization: {
        params: {
          scope: "public_profile pages_show_list pages_manage_posts pages_read_engagement",
          // Lưu ý: Các scope ở đây phân tách bằng dấu cách
        },
      },
    }),
    
    // 2. Nhà cung cấp Credentials (giữ nguyên không đổi)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Tên đăng nhập", type: "text" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }
        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection("users").findOne({ username: credentials.username });
        if (!user) {
          return null;
        }
        if (bcrypt.compareSync(credentials.password, user.password as string)) {
          const now = new Date();
          if (user.plan !== 'lifetime' && user.planExpiresAt && new Date(user.planExpiresAt) < now) {
            if (user.status !== 'inactive') {
              await db.collection("users").updateOne({ _id: user._id }, { $set: { status: 'inactive' } });
            }
            throw new Error("Gói cước của bạn đã hết hạn.");
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

  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
        (session.user as any).role = (user as any).role;
      }
      return session;
    },
    async jwt({ token, user, account }) {
        if (user) {
            token.id = user.id;
            token.role = (user as any).role;
        }
        if (account) {
            token.accessToken = account.access_token;
        }
        return token;
    }
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: { 
    signIn: '/login', 
    error: '/login' 
  }
};