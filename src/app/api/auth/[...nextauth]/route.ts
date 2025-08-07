import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions"; // Import cấu hình từ file lib

// Khởi tạo handler của NextAuth với cấu hình đã được định nghĩa ở nơi khác
const handler = NextAuth(authOptions);

// Export handler cho các phương thức GET và POST, đúng theo yêu cầu của Next.js App Router
export { handler as GET, handler as POST };