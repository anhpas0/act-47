// File: src/app/api/poster/generate-description/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  // === CẢI TIẾN 1: Kiểm tra sự tồn tại của API Key ngay từ đầu ===
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Lỗi nghiêm trọng: GEMINI_API_KEY chưa được cấu hình trên server.");
    return NextResponse.json({ error: 'Lỗi cấu hình server: Thiếu API Key.' }, { status: 500 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    if (!imageFile) {
      return NextResponse.json({ error: 'Không có file ảnh nào được gửi lên.' }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const imagePart = {
      inlineData: { data: imageBuffer.toString('base64'), mimeType: imageFile.type },
    };
    
    const prompt = "Dựa vào hình ảnh này, hãy tạo ra 3 gợi ý mô tả ngắn gọn, hấp dẫn cho bài đăng mạng xã hội. Mỗi gợi ý trên một dòng và bắt đầu bằng 'Gợi ý mô tả X:'. Chỉ trả lời bằng tiếng Việt.";
    
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();

    // === CẢI TIẾN 2: Đảm bảo 'text' không bao giờ là null/undefined ===
    if (!text) {
        console.error("Gemini API đã trả về một phản hồi hợp lệ nhưng không có nội dung text.");
        return NextResponse.json({ error: 'AI không thể tạo mô tả cho hình ảnh này.' }, { status: 500 });
    }

    return NextResponse.json({ description: text });

  } catch (error: any) {
    // === CẢI TIẾN 3: Ghi log lỗi chi tiết hơn ===
    console.error("Lỗi khi gọi đến Gemini API:", error);
    return NextResponse.json({ error: `Lỗi từ Gemini: ${error.message || 'Lỗi không xác định'}` }, { status: 500 });
  }
}