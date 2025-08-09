// File: src/lib/authOptions.ts

import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { AuthOptions } from "next-auth";
import { MongoClient } from "mongodb";

// Định nghĩa các tùy chọn xác thực cho NextAuth
export const authOptions: AuthOptions = {
  // Sử dụng MongoDBAdapter để NextAuth tự động quản lý dữ liệu trong MongoDB
  adapter: MongoDBAdapter(clientPromise as Promise<MongoClient>),

  // Cấu hình các "nhà cung cấp" dịch vụ xác thực
  providers: [
    // Chỉ còn lại CredentialsProvider cho việc đăng nhập username/password
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Tên đăng nhập", type: "text" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        // SỬA LỖI: Kiểm tra xem credentials có tồn tại và có chứa username/password không
        // trước khi truy cập chúng.
        if (!credentials?.username || !credentials?.password) {
            return null;
        }

        const client = await clientPromise;
        const db = client.db();
        
        // Bây giờ TypeScript đã biết chắc chắn credentials.username tồn tại
        const user = await db.collection("users").findOne({ username: credentials.username });

        // Nếu không tìm thấy user, trả về null
        if (!user) {
          return null;
        }

        // Nếu mật khẩu đúng, tiếp tục kiểm tra
        if (bcrypt.compareSync(credentials.password, user.password as string)) {
          
          const now = new Date();
          
          // Logic kiểm tra hạn sử dụng gói cước
          if (user.plan !== 'lifetime' && user.planExpiresAt && new Date(user.planExpiresAt) < now) {
              if (user.status !== 'inactive') {
                  await db.collection("users").updateOne({ _id: user._id }, { $set: { status: 'inactive' } });
              }
              throw new Error("Gói cước của bạn đã hết hạn. Vui lòng liên hệ Admin.");
          }
          
          // Logic kiểm tra trạng thái chung của tài khoản
          if (user.status !== 'active') {
            throw new Error("Tài khoản chưa được kích hoạt hoặc đã bị khóa.");
          }

          // Nếu mọi thứ đều ổn, trả về thông tin user
          return { id: user._id.toString(), name: user.username, role: user.role };
        }
        
        // Nếu mật khẩu sai, trả về null
        return null;
      },
    }),
  ],

  session: { strategy: "jwt" },
  
  // Callbacks để truyền thêm dữ liệu vào session
  callbacks: {
    async jwt({ token, user }) {
      // Khi đăng nhập, thêm 'role' và 'id' vào JWT
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Thêm 'role' và 'id' từ JWT vào đối tượng session để sử dụng ở client và server
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },

  // Khóa bí mật
  secret: process.env.NEXTAUTH_SECRET,

  // Tùy chỉnh các trang
  pages: { 
    signIn: '/login', 
    error: '/login' // Chuyển về trang login nếu có lỗi (ví dụ: tài khoản hết hạn)
  }
};