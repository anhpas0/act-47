// File: src/app/privacy-policy/page.tsx

import type { Metadata } from "next";

export const metadata: Metadata = { 
  title: "Chính sách quyền riêng tư - SaaS Poster",
  description: "Tìm hiểu cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn." 
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="prose prose-lg mx-auto">
          <h1>Chính sách Quyền riêng tư</h1>
          <p className="lead">Cập nhật lần cuối: 09/08/2025</p>

          <p>
            Chào mừng bạn đến với 47.pro.vn - Auto Caption FB. Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. Chính sách Quyền riêng tư này giải thích cách chúng tôi thu thập, sử dụng, tiết lộ và bảo vệ thông tin của bạn khi bạn sử dụng dịch vụ của chúng tôi.
          </p>

          <h2>1. Thông tin chúng tôi thu thập</h2>
          <p>Chúng tôi có thể thu thập các loại thông tin sau:</p>
          <ul>
            <li>
              <strong>Thông tin cá nhân:</strong> Tên đăng nhập, mật khẩu (đã mã hóa), địa chỉ email (nếu bạn cung cấp khi kết nối với Facebook).
            </li>
            <li>
              <strong>Thông tin từ Facebook:</strong> Khi bạn kết nối tài khoản Facebook, chúng tôi sẽ nhận được Tên công khai, ID người dùng, và danh sách các Fanpage bạn quản lý cùng với Access Token cho các trang đó. Chúng tôi chỉ sử dụng các quyền cần thiết như <code>pages_show_list</code> và <code>pages_manage_posts</code> để thực hiện chức năng đăng bài.
            </li>
            <li>
              <strong>Dữ liệu nội dung:</strong> Các hình ảnh, prompt, và văn bản bạn tạo ra hoặc tải lên để sử dụng trong ứng dụng.
            </li>
          </ul>

          <h2>2. Cách chúng tôi sử dụng thông tin của bạn</h2>
          <p>Chúng tôi sử dụng thông tin thu thập được để:</p>
          <ul>
            <li>Cung cấp, vận hành và duy trì Dịch vụ của chúng tôi.</li>
            <li>Cho phép bạn kết nối và đăng bài lên các Fanpage Facebook.</li>
            <li>Quản lý tài khoản của bạn, bao gồm việc kích hoạt và xử lý các gói cước.</li>
            <li>Liên lạc với bạn, bao gồm việc gửi email thông báo và hỗ trợ.</li>
            <li>Cải thiện và cá nhân hóa trải nghiệm của bạn.</li>
          </ul>

          <h2>3. Chia sẻ thông tin của bạn</h2>
          <p>
            Chúng tôi không bán, trao đổi, hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba. Chúng tôi chỉ chia sẻ thông tin với các nhà cung cấp dịch vụ bên thứ ba khi cần thiết để vận hành ứng dụng (ví dụ: gửi dữ liệu đến API của Facebook, OpenAI, Google Gemini để thực hiện các chức năng bạn yêu cầu).
          </p>

          <h2>4. Lưu trữ và Bảo mật dữ liệu</h2>
          <p>
            Chúng tôi thực hiện các biện pháp bảo mật hợp lý để bảo vệ thông tin của bạn. Mật khẩu được lưu trữ dưới dạng mã hóa (hashed). Access Token của Facebook được lưu trữ an toàn trong cơ sở dữ liệu của chúng tôi và chỉ được sử dụng để thực hiện các yêu cầu API mà bạn ủy quyền.
          </p>

          <h2>5. Quyền của bạn</h2>
          <p>
            Bạn có quyền truy cập, sửa đổi hoặc yêu cầu xóa thông tin cá nhân của mình. Bạn cũng có thể gỡ kết nối tài khoản Facebook của mình khỏi dịch vụ của chúng tôi bất kỳ lúc nào từ trang Dashboard.
          </p>

          <h2>6. Thay đổi đối với Chính sách này</h2>
          <p>
            Chúng tôi có thể cập nhật Chính sách Quyền riêng tư này theo thời gian. Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào bằng cách đăng chính sách mới trên trang này.
          </p>
          
          <h2>7. Liên hệ với chúng tôi</h2>
          <p>
            Nếu bạn có bất kỳ câu hỏi nào về Chính sách Quyền riêng tư này, vui lòng liên hệ với chúng tôi qua email: [Email hỗ trợ của bạn].
          </p>
        </div>
      </div>
    </div>
  );
}