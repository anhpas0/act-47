// File: src/app/terms-of-service/page.tsx

import type { Metadata } from "next";

export const metadata: Metadata = { 
  title: "Điều khoản dịch vụ - SaaS Poster",
  description: "Các quy tắc và điều kiện khi sử dụng dịch vụ của chúng tôi." 
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="prose prose-lg mx-auto">
          <h1>Điều khoản Dịch vụ</h1>
          <p className="lead">Cập nhật lần cuối: 09/08/2025</p>

          <p>
            Vui lòng đọc kỹ các Điều khoản Dịch vụ này trước khi sử dụng trang web và dịch vụ 47.pro.vn - Auto Caption FB do chúng tôi điều hành.
          </p>
          <p>
            Việc bạn truy cập và sử dụng Dịch vụ phụ thuộc vào việc bạn chấp nhận và tuân thủ các Điều khoản này. Các Điều khoản này áp dụng cho tất cả khách truy cập, người dùng và những người khác truy cập hoặc sử dụng Dịch vụ.
          </p>

          <h2>1. Tài khoản</h2>
          <p>
            Khi bạn tạo tài khoản với chúng tôi, bạn phải cung cấp thông tin chính xác, đầy đủ và cập nhật. Bạn chịu trách nhiệm bảo mật mật khẩu của mình và cho bất kỳ hoạt động nào xảy ra dưới tài khoản của bạn.
          </p>
          <p>
            Chúng tôi có quyền từ chối dịch vụ, chấm dứt tài khoản, hoặc hủy kích hoạt tài khoản theo quyết định riêng của chúng tôi, đặc biệt trong các trường hợp vi phạm Điều khoản.
          </p>
          
          <h2>2. Nội dung</h2>
          <p>
            Dịch vụ của chúng tôi cho phép bạn đăng, liên kết, lưu trữ và chia sẻ một số thông tin, văn bản, đồ họa . Bạn hoàn toàn chịu trách nhiệm về Nội dung mà bạn đăng lên các nền tảng của bên thứ ba (như Facebook) thông qua Dịch vụ của chúng tôi.
          </p>
          <p>
            Bạn cam kết rằng bạn có quyền sử dụng tất cả Nội dung bạn đăng và Nội dung đó không vi phạm bản quyền, quyền riêng tư hoặc bất kỳ quyền nào khác của bất kỳ bên thứ ba nào.
          </p>
          <p>
            Chúng tôi không chịu trách nhiệm về nội dung do người dùng tạo ra và bạn đồng ý rằng bạn sẽ không sử dụng dịch vụ của chúng tôi để đăng tải nội dung bất hợp pháp, xúc phạm, hoặc vi phạm chính sách của Facebook.
          </p>

          <h2>3. Gói cước và Thanh toán</h2>
          <p>
            Một số phần của Dịch vụ có thể được tính phí theo dạng đăng ký theo tháng, theo năm hoặc mua một lần. Bạn sẽ được yêu cầu cung cấp thông tin thanh toán hợp lệ.
          </p>
          <p>
            Chúng tôi có quyền thay đổi giá Gói cước bất kỳ lúc nào. Bất kỳ thay đổi giá nào sẽ có hiệu lực vào cuối chu kỳ thanh toán hiện tại.
          </p>
          
          <h2>4. Chấm dứt</h2>
          <p>
            Chúng tôi có thể chấm dứt hoặc tạm ngưng quyền truy cập vào Dịch vụ của bạn ngay lập tức, không cần thông báo trước, vì bất kỳ lý do gì, bao gồm cả việc bạn vi phạm Điều khoản.
          </p>
          
          <h2>5. Giới hạn Trách nhiệm</h2>
          <p>
            Trong mọi trường hợp, chúng tôi sẽ không chịu trách nhiệm cho bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt nào phát sinh từ việc bạn sử dụng Dịch vụ.
          </p>
          
          <h2>6. Thay đổi</h2>
          <p>
            Chúng tôi có quyền, theo quyết định riêng của mình, sửa đổi hoặc thay thế các Điều khoản này bất kỳ lúc nào.
          </p>

          <h2>7. Liên hệ với chúng tôi</h2>
          <p>
            Nếu bạn có bất kỳ câu hỏi nào về các Điều khoản này, vui lòng liên hệ với chúng tôi: hotro@47.info.vn.
          </p>
        </div>
      </div>
    </div>
  );
}