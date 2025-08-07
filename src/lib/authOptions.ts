// File: src/lib/authOptions.ts

import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { AuthOptions, User, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import { MongoClient } from "mongodb";

// EXPORT TỪ ĐÂY
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
        const user = await client.db().collection("users").findOne({ username: credentials.username });
        if (user && bcrypt.compareSync(credentials.password, user.password as string)) {
          if (user.status !== 'active') {
            throw new Error("Tài khoản chưa được kích hoạt hoặc đã bị khóa.");
          }
          return { id: user._id.toString(), name: user.username, role: user.role };
        }
        return null;
      },
    }),
  ],
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