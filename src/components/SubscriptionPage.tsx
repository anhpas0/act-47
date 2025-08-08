"use client";
import { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

interface Plan {
    id: string;
    name: string;
    price: string;
    description: string;
}

const plans: Plan[] = [
    { id: '1_month', name: 'Gói 1 Tháng', price: '99.000đ', description: 'Phù hợp để trải nghiệm.' },
    { id: '3_months', name: 'Gói 3 Tháng', price: '279.000đ', description: 'Tiết kiệm hơn cho người dùng thường xuyên.' },
    { id: '6_months', name: 'Gói 6 Tháng', price: '549.000đ', description: 'Lựa chọn tối ưu cho doanh nghiệp nhỏ.' },
    { id: '1_year', name: 'Gói 1 Năm', price: '999.000đ', description: 'Cam kết dài hạn, tiết kiệm tối đa.' },
    { id: 'lifetime', name: 'Gói Vĩnh viễn', price: '2.999.000đ', description: 'Sử dụng mãi mãi, không lo gia hạn.' },
];

export default function SubscriptionPage({ username }: { username: string }) {
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [showQR, setShowQR] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    // Tạo nội dung chuyển khoản động
    const paymentContent = selectedPlan ? `${username} kich hoat goi ${selectedPlan.id}`.replace(/_/g, '') : '';

    const handleSelectPlan = async () => {
        if (!selectedPlan) {
            setMessage('Vui lòng chọn một gói cước.');
            return;
        }
        setIsLoading(true);
        try {
            // Gọi API để backend ghi nhận lựa chọn của người dùng
            await axios.post('/api/user/subscribe', { plan: selectedPlan.id });
            setShowQR(true); // Hiển thị mã QR sau khi chọn thành công
            setMessage('');
        } catch (err) {
            setMessage('Đã có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen-minus-header bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto">
                {!showQR ? (
                    // GIAO DIỆN CHỌN GÓI
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-800">Chọn gói cước của bạn</h1>
                        <p className="mt-2 text-gray-600">Tài khoản của bạn đang chờ kích hoạt. Vui lòng chọn và thanh toán một gói cước để bắt đầu.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                            {plans.map(plan => (
                                <div 
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan)}
                                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${selectedPlan?.id === plan.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                                >
                                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                                    <p className="text-3xl font-bold my-4">{plan.price}</p>
                                    <p className="text-gray-500 text-sm">{plan.description}</p>
                                </div>
                            ))}
                        </div>

                        {message && <p className="mt-6 text-red-500">{message}</p>}
                        
                        <button
                            onClick={handleSelectPlan}
                            disabled={!selectedPlan || isLoading}
                            className="mt-8 px-10 py-3 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                        >
                            {isLoading ? "Đang xử lý..." : "Xác nhận và Thanh toán"}
                        </button>
                    </div>
                ) : (
                    // GIAO DIỆN HIỂN THỊ QR CODE
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                         <h1 className="text-2xl font-bold text-green-600">Xác nhận thành công!</h1>
                         <p className="mt-2 text-gray-600 mb-6">Vui lòng quét mã QR dưới đây để thanh toán. Tài khoản sẽ được kích hoạt ngay sau khi Admin xác nhận.</p>
                         
                         <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
                            <Image src="/payment-qr.png" alt="Mã QR thanh toán" width={250} height={250} className="border rounded-lg" />
                            <div className="text-left p-4 bg-gray-50 rounded-lg border">
                                <h3 className="font-semibold mb-2">Thông tin chuyển khoản:</h3>
                                <p><strong>Số tiền:</strong> <span className="text-red-600 font-bold">{selectedPlan?.price}</span> (Vui lòng nhập đúng số tiền)</p>
                                <p className="mt-2"><strong>Nội dung chuyển khoản:</strong></p>
                                <div className="mt-1 p-2 bg-gray-200 rounded font-mono text-sm break-all">
                                    {paymentContent}
                                </div>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(paymentContent)}
                                    className="mt-2 text-xs text-blue-600 hover:underline"
                                >
                                    Sao chép nội dung
                                </button>
                            </div>
                         </div>
                         <p className="mt-6 text-sm text-gray-500">Sau khi chuyển khoản, bạn có thể đăng xuất. Admin sẽ xem và kích hoạt tài khoản cho bạn trong thời gian sớm nhất.</p>
                    </div>
                )}
            </div>
        </div>
    );
}