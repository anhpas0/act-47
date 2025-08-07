/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cấu hình này sẽ bảo Next.js bỏ qua các lỗi từ ESLint (bao gồm cả các quy tắc của TypeScript)
  // trong quá trình build cho môi trường production.
  eslint: {
    // Cảnh báo: Việc bật tùy chọn này sẽ cho phép ứng dụng của bạn build thành công
    // ngay cả khi nó có các lỗi ESLint. Điều này hữu ích để deploy nhanh,
    // nhưng bạn nên quay lại sửa các lỗi đó sau để đảm bảo chất lượng code.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;