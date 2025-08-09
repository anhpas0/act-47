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
      authorization: {
        url: "https://www.facebook.com/v19.0/dialog/oauth",
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
      async authorize(credentials) {
        if (!credentials) return null;

        const client = await clientPromise;
        const db = client.db();
        
        const user = await db.collection("users").findOne({ username: credentials.username });

        if (user && bcrypt.compareSync(credentials.password, user.password as string)) {
          
          // === BẮT ĐẦU LOGIC KIỂM TRA HẠN SỬ DỤNG MỚI ===
          const now = new Date();
          
          // 1. Kiểm tra xem tài khoản có ngày hết hạn và ngày đó đã qua chưa
          // (Bỏ qua kiểm tra này nếu plan là 'lifetime' hoặc planExpiresAt là null)
          if (user.plan !== 'lifetime' && user.planExpiresAt && new Date(user.planExpiresAt) < now) {
              // Nếu đã hết hạn, cập nhật status thành 'inactive' trong DB
              if (user.status !== 'inactive') {
                  await db.collection("users").updateOne({ _id: user._id }, { $set: { status: 'inactive' } });
              }
              // Ném lỗi để hiển thị cho người dùng ở trang login
              throw new Error("Gói cước của bạn đã hết hạn. Vui lòng liên hệ Admin.");
          }
          
          // 2. Kiểm tra trạng thái chung của tài khoản (vẫn giữ lại)
          if (user.status !== 'active') {
            throw new Error("Tài khoản chưa được kích hoạt hoặc đã bị khóa.");
          }
          // === KẾT THÚC LOGIC KIỂM TRA HẠN SỬ DỤNG MỚI ===

          // Nếu mọi thứ đều ổn, trả về thông tin user
          return { id: user._id.toString(), name: user.username, role: user.role };
        }
        // Nếu mật khẩu sai, trả về null
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    // Callbacks của bạn đã đúng, không cần thay đổi
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