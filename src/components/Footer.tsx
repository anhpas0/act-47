// src/components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cột 1: Giới thiệu */}
          <div>
            <h3 className="text-lg font-semibold text-white">Về 47.pro.vn</h3>
            <p className="mt-4 text-sm">
              Công cụ tự động hóa Fanpage sử dụng trí tuệ nhân tạo, giúp bạn tiết kiệm thời gian và tăng tương tác hiệu quả.
            </p>
          </div>
          {/* Cột 2: Liên kết nhanh */}
          <div>
            <h3 className="text-lg font-semibold text-white">Liên kết</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/dashboard" className="hover:text-white">Bảng điều khiển</Link></li>
              <li><Link href="/subscribe" className="hover:text-white">Gói cước</Link></li>
              {/* Thêm các link khác nếu có */}
            </ul>
          </div>
          {/* Cột 3: Thông tin liên hệ */}
          <div>
            <h3 className="text-lg font-semibold text-white">Liên hệ</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>Email: <a href="mailto:hotro@47.info.vn" className="hover:text-white">hotro@47.info.vn</a></li>
              <li>Zalo/SĐT: <a href="tel:0941280777" className="hover:text-white">0941.280.777</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} 47.pro.vn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}