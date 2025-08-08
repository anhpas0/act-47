"use client";
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Import useRouter

interface Plan {
    id: string;
    name: string;
    price: string;
    description: string;
    qrCodeUrl?: string; // Tùy chọn cho gói dùng thử
}

// Cập nhật danh sách các gói cước
const plans: Plan[] = [
    // === GÓI DÙNG THỬ MỚI ===
    { id: 'free_trial', name: 'Gói Dùng thử', price: '0đ', description: 'Liên hệ Zalo: 0941.280.777', qrCodeUrl: '' }, 
    // === CÁC GÓI CÒN LẠI ===
    { id: '1_month', name: 'Gói 1 Tháng', price: '59.000đ', description: 'Phù hợp để trải nghiệm các tính năng.', qrCodeUrl: '/qr/1_month.png' },
    { id: '3_months', name: 'Gói 3 Tháng', price: '149.000đ', description: 'Tiết kiệm hơn.', qrCodeUrl: '/qr/3_months.png' },
    { id: '6_months', name: 'Gói 6 Tháng', price: '299.000đ', description: 'Lựa chọn tối ưu.', qrCodeUrl: '/qr/6_months.png' },
    { id: '1_year', name: 'Gói 1 Năm', price: '499.000đ', description: 'Cam kết dài hạn.', qrCodeUrl: '/qr/1_year.png' },
    { id: 'lifetime', name: 'Gói Vĩnh viễn', price: '999.000đ', description: 'Sử dụng mãi mãi.', qrCodeUrl: '/qr/lifetime.png' },
];

export default function SubscriptionPage({ username }: { username: string }) {
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [showQR, setShowQR] = useState(false);
    const [inputUsername, setInputUsername] = useState(username);
    const [copySuccess, setCopySuccess] = useState('');
    const router = useRouter(); // Khởi tạo router

    const finalUsername = inputUsername.trim() || username.trim();
    const paymentContent = selectedPlan ? `${finalUsername} kh ${selectedPlan.id}`.replace(/_/g, '') : '';

    const handleConfirmPlan = () => {
        if (!selectedPlan) {
            alert('Vui lòng chọn một gói cước.');
            return;
        }
        // Nếu là gói dùng thử, bỏ qua bước QR code
        if (selectedPlan.id === 'free_trial') {
            alert("Bạn đã chọn gói dùng thử. Vui lòng Liên hệ Zalo: 0941.280.777 để kích hoạt tài khoản.");
            // Chuyển hướng về trang login sau khi thông báo
            router.push('/login');
        } else {
            // Hiển thị QR code cho các gói có trả phí
            setShowQR(true);
        }
    };

    const handleCopyContent = () => {
        if (!paymentContent || !finalUsername) {
            alert("Vui lòng nhập tên tài khoản của bạn.");
            return;
        };
        navigator.clipboard.writeText(paymentContent);
        setCopySuccess('Đã sao chép!');
        setTimeout(() => setCopySuccess(''), 2000);
    };

    const handlePaymentConfirmation = () => {
        // Sau khi người dùng xác nhận đã chuyển khoản, chuyển hướng về trang đăng nhập
        alert("Cảm ơn bạn đã thanh toán. Vui lòng đăng nhập lại sau khi tài khoản được kích hoạt.");
        router.push('/login');
    };
    
    return (
        <div className="min-h-screen-minus-header bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto">
                {!showQR ? (
                    // GIAO DIỆN CHỌN GÓI
                    <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                        <h1 className="text-3xl font-bold text-gray-800">Chọn gói cước của bạn</h1>
                        <p className="mt-2 text-gray-600">
                            Vui lòng chọn và thanh toán một gói cước để được kích hoạt.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                            {plans.map(plan => (
                                <div 
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan)}
                                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all text-center ${selectedPlan?.id === plan.id ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 bg-white hover:border-gray-400'}`}
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
                            Xác nhận
                        </button>
                    </div>
                ) : (
                    // GIAO DIỆN HIỂN THỊ QR CODE
                    <div className="bg-white p-8 rounded-xl shadow-lg text-center animate-fade-in">
                         <h1 className="text-2xl font-bold text-green-600">Bước cuối cùng: Thanh toán</h1>
                         <p className="mt-2 text-gray-600 mb-6">Vui lòng quét mã QR tương ứng với gói cước bạn đã chọn. Số tiền đã được điền sẵn.</p>
                         
                         <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                            {/* Hiển thị QR Code động, chỉ hiển thị nếu có QR code */}
                            {selectedPlan?.qrCodeUrl && (
                                <Image 
                                    src={selectedPlan.qrCodeUrl} 
                                    alt={`Mã QR cho ${selectedPlan.name}`} 
                                    width={250} 
                                    height={250} 
                                    className="border rounded-lg shadow-sm"
                                    priority
                                />
                            )}
                            <div className="text-left p-4 bg-gray-50 rounded-lg border w-full md:w-auto">
                                <h3 className="font-semibold mb-2 text-gray-800">Thông tin chuyển khoản:</h3>
                                
                                {!username && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1 text-gray-700">Vui lòng nhập lại Tên tài khoản của bạn:</label>
                                        <input 
                                            type="text" 
                                            value={inputUsername} 
                                            onChange={(e) => setInputUsername(e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            placeholder="Tên tài khoản đã đăng ký"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <p><strong>Gói đã chọn:</strong> <span className="font-bold">{selectedPlan?.name}</span></p>
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
                         
                         {/* === NÚT XÁC NHẬN ĐÃ CHUYỂN KHOẢN MỚI === */}
                         <button
                            onClick={handlePaymentConfirmation}
                            className="mt-8 px-10 py-3 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                         >
                            Xác nhận đã chuyển khoản
                         </button>
                         <p className="mt-2 text-sm text-gray-500">Nếu thời gian kích hoạt quá lâu, liên hệ Zalo: 0941.280.777</p>

                         <button onClick={() => setShowQR(false)} className="mt-4 text-sm text-gray-600 hover:underline">
                            ← Quay lại chọn gói khác
                         </button>
                    </div>
                )}
            </div>
        </div>
    );
}