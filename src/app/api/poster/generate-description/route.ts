// File: src/app/api/poster/generate-description/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Lỗi nghiêm trọng: GEMINI_API_KEY chưa được cấu hình trên server.");
    return NextResponse.json({ error: 'Lỗi cấu hình server: Thiếu API Key.' }, { status: 500 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const textPrompt = formData.get('prompt_text') as string | null;

    let generatedText = '';

    // === LOGIC MỚI: XỬ LÝ HAI TRƯỜNG HỢP ===

    // Trường hợp 1: Có hình ảnh (Ưu tiên)
    if (imageFile) {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }); // Model xử lý ảnh
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      const imagePart = {
        inlineData: { data: imageBuffer.toString('base64'), mimeType: imageFile.type },
      };
      
      const promptForImage = "Dựa vào hình ảnh này, hãy tạo ra 3 gợi ý mô tả ngắn gọn, hấp dẫn cho bài đăng mạng xã hội. Mỗi gợi ý trên một dòng và bắt đầu bằng 'Gợi ý mô tả X:'. Chỉ trả lời bằng tiếng Việt.";
      
      const result = await model.generateContent([promptForImage, imagePart]);
      generatedText = result.response.text();
    } 
    // Trường hợp 2: Không có ảnh, nhưng có prompt văn bản
    else if (textPrompt) {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Model chuyên về văn bản
      
      const promptForText = `Dựa vào ý tưởng sau: "${textPrompt}", hãy tạo ra 3 gợi ý mô tả ngắn gọn, hấp dẫn cho một bài đăng trên mạng xã hội. Mỗi gợi ý trên một dòng và bắt đầu bằng 'Gợi ý mô tả X:'. Chỉ trả lời bằng tiếng Việt.`;
      
      const result = await model.generateContent(promptForText);
      generatedText = result.response.text();
    } 
    // Trường hợp 3: Không có cả ảnh và prompt
    else {
      return NextResponse.json({ error: 'Cần có hình ảnh hoặc prompt văn bản để tạo mô tả.' }, { status: 400 });
    }

    if (!generatedText) {
      console.error("Gemini API đã trả về một phản hồi hợp lệ nhưng không có nội dung text.");
      return NextResponse.json({ error: 'AI không thể tạo mô tả cho yêu cầu này.' }, { status: 500 });
    }

    return NextResponse.json({ description: generatedText });

  } catch (error: any) {
    console.error("Lỗi khi gọi đến Gemini API:", error);
    return NextResponse.json({ error: `Lỗi từ Gemini: ${error.message || 'Lỗi không xác định'}` }, { status: 500 });
  }
}