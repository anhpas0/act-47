import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { AuthOptions } from "next-auth";
import { MongoClient } from "mongodb";

export const authOptions: AuthOptions = {
  // Sử dụng MongoDBAdapter để NextAuth tự động quản lý dữ liệu trong MongoDB
  // Nó sẽ tự tạo các collection như `users`, `accounts`, `sessions` khi cần.
  adapter: MongoDBAdapter(clientPromise as Promise<MongoClient>),

  // Cấu hình các nhà cung cấp dịch vụ xác thực
  providers: [
    // 1. Nhà cung cấp Facebook (với cấu hình can thiệp sâu)
    FacebookProvider({
      clientId: process.env.FACEBOOK_APP_ID as string,
      clientSecret: process.env.FACEBOOK_APP_SECRET as string,
      
      // === SỬA ĐỔI QUAN TRỌNG NHẤT ===
      // Ghi đè hoàn toàn URL và các tham số xác thực mặc định của NextAuth.
      // Việc này đảm bảo yêu cầu gửi đến Facebook chỉ chứa các scope chúng ta muốn.
      authorization: {
        url: "https://www.facebook.com/v19.0/dialog/oauth",
        params: {
          // Các quyền được yêu cầu, phân tách bằng dấu cách. KHÔNG có 'email'.
          scope: "public_profile pages_show_list pages_manage_posts pages_read_engagement",
        },
      },
    }),
    
    // 2. Nhà cung cấp Credentials (Đăng nhập bằng Tên đăng nhập / Mật khẩu)
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
          if (user.status !== 'active') {
            throw new Error("Tài khoản chưa được kích hoạt hoặc đã bị khóa.");
          }
          return {
            id: user._id.toString(),
            name: user.username,
            role: user.role,
          };
        }
        return null;
      },
    }),
  ],

  // Cấu hình Session
  session: {
    strategy: "jwt",
  },

  // Callbacks để tùy chỉnh token và session
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id; // Quan trọng: Thêm ID vào token
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).id = token.id; // Quan trọng: Đưa ID vào session
      }
      return session;
    },
},

  // Khóa bí mật
  secret: process.env.NEXTAUTH_SECRET,

  // Tùy chỉnh các trang
  pages: {
    signIn: '/login',
    error: '/login',
  }
};

// Khởi tạo và xuất handler của NextAuth
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };