// File: src/app/page.tsx

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";

// Đây là một Server Component, nó sẽ chạy ở phía server trước khi gửi bất cứ thứ gì về trình duyệt.
export default async function HomePage() {
  // 1. Lấy thông tin phiên làm việc (session) của người dùng ở phía server.
  const session = await getServerSession(authOptions);

  // 2. Logic chuyển hướng:
  if (session) {
    // Nếu đã có session (người dùng đã đăng nhập), chuyển hướng đến trang dashboard.
    redirect("/dashboard");
  } else {
    // Nếu chưa có session (người dùng chưa đăng nhập), chuyển hướng đến trang login.
    redirect("/login");
  }

  // Lưu ý: Hàm redirect() của Next.js sẽ ném một lỗi đặc biệt để dừng việc render
  // và thực hiện chuyển hướng, vì vậy không cần return JSX từ component này.
}