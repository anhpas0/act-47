import RegisterForm from "@/components/RegisterForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  // Nếu đã đăng nhập, chuyển hướng đi
  if (session) {
    redirect('/dashboard');
  }

  // Hiển thị form đăng ký
  return <RegisterForm />;
}