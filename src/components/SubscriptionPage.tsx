"use client";
import { useState } from 'react';
import Image from 'next/image';

// Định nghĩa cấu trúc cho một gói cước
interface Plan {
    id: string; // Key để gửi về backend, ví dụ: '1_month'
    name: string;
    price: string;
    description: string;
}

// Danh sách các gói cước - bạn có thể dễ dàng thay đổi giá và mô tả ở đây
const plans: Plan[] = [
    { id: '1_month', name: 'Gói 1 Tháng', price: '99.000đ', description: 'Phù hợp để trải nghiệm các tính năng.' },
    { id: '3_months', name: 'Gói 3 Tháng', price: '279.000đ', description: 'Tiết kiệm hơn cho người dùng thường xuyên.' },
    { id: '6_months', name: 'Gói 6 Tháng', price: '549.000đ', description: 'Lựa chọn tối ưu cho doanh nghiệp nhỏ.' },
    { id: '1_year', name: 'Gói 1 Năm', price: '999.000đ', description: 'Cam kết dài hạn, tiết kiệm tối đa.' },
    { id: 'lifetime', name: 'Gói Vĩnh viễn', price: '2.999.000đ', description: 'Sử dụng mãi mãi, không lo gia hạn.' },
];

// Component nhận 'username' từ trang cha (page.tsx)
export default function SubscriptionPage({ username }: { username: string }) {
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [showQR, setShowQR] = useState(false);
    
    // State để người dùng có thể tự nhập username nếu chưa được truyền vào
    const [inputUsername, setInputUsername] = useState(username);
    const [copySuccess, setCopySuccess] = useState('');

    // Nội dung chuyển khoản sẽ ưu tiên lấy từ inputUsername, nếu không có thì mới lấy từ prop
    const finalUsername = inputUsername.trim() || username.trim();
    const paymentContent = selectedPlan ? `${finalUsername} kich hoat goi ${selectedPlan.id}`.replace(/_/g, '') : '';

    const handleConfirmPlan = () => {
        if (!selectedPlan) {
            alert('Vui lòng chọn một gói cước.');
            return;
        }
        setShowQR(true); // Chỉ cần hiển thị khu vực QR code
    };

    const handleCopyContent = () => {
        if (!paymentContent || !finalUsername) {
            alert("Vui lòng nhập tên đăng nhập của bạn.");
            return;
        };
        navigator.clipboard.writeText(paymentContent);
        setCopySuccess('Đã sao chép!');
        setTimeout(() => setCopySuccess(''), 2000); // Ẩn thông báo sau 2 giây
    };
    
    return (
        <div className="min-h-screen-minus-header bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto">
                {!showQR ? (
                    // GIAO DIỆN CHỌN GÓI
                    <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                        <h1 className="text-3xl font-bold text-gray-800">Chọn gói cước của bạn</h1>
                        <p className="mt-2 text-gray-600">
                            {username 
                                ? `Tài khoản của bạn (${username}) đang chờ kích hoạt.` 
                                : "Cảm ơn bạn đã đăng ký!"
                            }
                            <br/>
                            Vui lòng chọn một gói cước và thực hiện thanh toán để được kích hoạt.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                            {plans.map(plan => (
                                <div 
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan)}
                                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all text-center
                                                ${selectedPlan?.id === plan.id 
                                                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' 
                                                    : 'border-gray-200 bg-white hover:border-gray-400'}`}
                                >
                                    <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                                    <p className="text-3xl font-bold my-4 text-blue-600">{plan.price}</p>
                                    <p className="text-gray-500 text-sm">{plan.description}</p>
                                </div>
                            ))}
                        </div>
                        
                        <button
                            onClick={handleConfirmPlan}
                            disabled={!selectedPlan}
                            className="mt-8 px-10 py-3 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                        >
                            Xác nhận và Thanh toán
                        </button>
                    </div>
                ) : (
                    // GIAO DIỆN HIỂN THỊ QR CODE
                    <div className="bg-white p-8 rounded-xl shadow-lg text-center animate-fade-in">
                         <h1 className="text-2xl font-bold text-green-600">Bước cuối cùng: Thanh toán</h1>
                         <p className="mt-2 text-gray-600 mb-6">Vui lòng quét mã QR dưới đây để thanh toán. Tài khoản sẽ được kích hoạt ngay sau khi Admin xác nhận.</p>
                         
                         <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                            <Image src="/payment-qr.png" alt="Mã QR thanh toán" width={250} height={250} className="border rounded-lg shadow-sm" />
                            <div className="text-left p-4 bg-gray-50 rounded-lg border w-full md:w-auto">
                                <h3 className="font-semibold mb-2 text-gray-800">Thông tin chuyển khoản:</h3>
                                
                                {/* Thêm ô nhập username nếu chưa có (người dùng vừa đăng ký) */}
                                {!username && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1 text-gray-700">Vui lòng nhập lại Tên đăng nhập của bạn:</label>
                                        <input 
                                            type="text" 
                                            value={inputUsername} 
                                            onChange={(e) => setInputUsername(e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            placeholder="Tên đăng nhập đã đăng ký"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <p><strong>Số tiền:</strong> <span className="text-red-600 font-bold text-lg">{selectedPlan?.price}</span></p>
                                    <p><strong>Nội dung chuyển khoản (bắt buộc):</strong></p>
                                    <div className="mt-1 p-2 bg-gray-200 rounded font-mono text-sm break-all">
                                        {paymentContent}
                                    </div>
                                    <div className="text-center">
                                        <button 
                                            onClick={handleCopyContent}
                                            className="mt-2 text-xs text-blue-600 hover:underline disabled:text-gray-400"
                                            disabled={!paymentContent || !finalUsername}
                                        >
                                            {copySuccess ? copySuccess : 'Sao chép nội dung'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                         </div>
                         <button onClick={() => setShowQR(false)} className="mt-8 text-sm text-gray-600 hover:underline">
                            ← Quay lại chọn gói khác
                         </button>
                    </div>
                )}
            </div>
        </div>
    );
}