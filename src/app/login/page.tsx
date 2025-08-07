import LoginForm from "@/components/LoginForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { Suspense } from 'react';

function LoginPageContent() {
  return <LoginForm />;
}

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  // Nếu đã đăng nhập, chuyển hướng đi, không cho ở lại trang login
  if (session) {
    redirect('/dashboard');
  }

  // Hiển thị form đăng nhập. Bọc trong Suspense để hỗ trợ useSearchParams
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <LoginPageContent />
    </Suspense>
  );
}