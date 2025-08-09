// File: src/lib/authOptions.ts

import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook"; // Thêm lại FacebookProvider
import bcrypt from "bcryptjs";
import { AuthOptions } from "next-auth";
import { MongoClient } from "mongodb";

export const authOptions: AuthOptions = {
  // Sử dụng MongoDBAdapter để NextAuth tự động quản lý dữ liệu trong MongoDB
  adapter: MongoDBAdapter(clientPromise as Promise<MongoClient>),

  // Cấu hình các "nhà cung cấp" dịch vụ xác thực
  providers: [
    // 1. Nhà cung cấp Facebook: Dùng cho việc kết nối tài khoản
    FacebookProvider({
      clientId: process.env.FACEBOOK_APP_ID as string,
      clientSecret: process.env.FACEBOOK_APP_SECRET as string,
      // Vẫn giữ lại scope tùy chỉnh để tránh lỗi "Invalid Scopes: email"
      scope: 'public_profile,pages_show_list,pages_manage_posts,pages_read_engagement',
    }),

    // 2. Nhà cung cấp Credentials: Dùng cho việc đăng nhập username/password
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

  // Không chỉ định 'strategy'. Để NextAuth tự dùng 'database' khi có adapter.
  
  // Callbacks để tùy chỉnh session
  callbacks: {
    // Với strategy "database", callback 'session' nhận được 'user' từ database
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id; // Lấy ID từ đối tượng user của DB
        (session.user as any).role = (user as any).role; // Lấy role từ đối tượng user của DB
      }
      return session;
    },
    // JWT callback vẫn chạy trước và có thể hữu ích để xử lý token từ provider
    async jwt({ token, user, account }) {
        if (user) {
            token.id = user.id;
            token.role = (user as any).role;
        }
        if (account) {
            // Lưu access_token của Facebook vào token để có thể dùng sau nếu cần
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