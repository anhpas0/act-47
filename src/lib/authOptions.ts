import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { AuthOptions } from "next-auth";
import { MongoClient } from "mongodb";

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise as Promise<MongoClient>),
  providers: [
    // Chỉ còn lại CredentialsProvider
    CredentialsProvider({
      name: "Credentials",
      credentials: { /* ... */ },
      async authorize(credentials) {
        if (!credentials) return null;
        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection("users").findOne({ username: credentials.username });

        if (user && bcrypt.compareSync(credentials.password, user.password as string)) {
          if (user.plan !== 'lifetime' && user.planExpiresAt && new Date(user.planExpiresAt) < new Date()) {
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
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/login', error: '/login' }
};