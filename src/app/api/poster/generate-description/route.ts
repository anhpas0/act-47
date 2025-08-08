import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Lỗi cấu hình server: Thiếu API Key.' }, { status: 500 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const contentType = request.headers.get("content-type") || "";

    let generatedText = '';

    // === XỬ LÝ YÊU CẦU DẠNG FORMDATA (CÓ ẢNH) ===
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const imageFile = formData.get('image') as File | null;
      if (!imageFile) return NextResponse.json({ error: 'FormData không chứa file ảnh.' }, { status: 400 });

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      const imagePart = { inlineData: { data: imageBuffer.toString('base64'), mimeType: imageFile.type } };
      const promptForImage = "Dựa vào hình ảnh này, hãy tạo ra 3 gợi ý mô tả ngắn gọn, hấp dẫn cho bài đăng mạng xã hội. Mỗi gợi ý trên một dòng và bắt đầu bằng 'Gợi ý mô tả X:'. Chỉ trả lời bằng tiếng Việt.";
      
      const result = await model.generateContent([promptForImage, imagePart]);
      generatedText = result.response.text();
    } 
    // === XỬ LÝ YÊU CẦU DẠNG JSON (CHỈ CÓ TEXT) ===
    else if (contentType.includes("application/json")) {
      const { prompt_text } = await request.json();
      if (!prompt_text) return NextResponse.json({ error: 'Yêu cầu JSON không chứa prompt_text.' }, { status: 400 });

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const promptForText = `Dựa vào ý tưởng sau: "${prompt_text}", hãy tạo ra 3 gợi ý mô tả ngắn gọn, hấp dẫn cho một bài đăng trên mạng xã hội. Mỗi gợi ý trên một dòng và bắt đầu bằng 'Gợi ý mô tả X:'. Chỉ trả lời bằng tiếng Việt.`;
      
      const result = await model.generateContent(promptForText);
      generatedText = result.response.text();
    }
    // Trường hợp không hợp lệ
    else {
      return NextResponse.json({ error: `Content-Type không được hỗ trợ: ${contentType}` }, { status: 415 });
    }

    if (!generatedText) {
      return NextResponse.json({ error: 'AI không thể tạo mô tả cho yêu cầu này.' }, { status: 500 });
    }

    return NextResponse.json({ description: generatedText });

  } catch (error: any) {
    console.error("Lỗi khi gọi đến Gemini API:", error);
    return NextResponse.json({ error: `Lỗi từ Gemini: ${error.message || 'Lỗi không xác định'}` }, { status: 500 });
  }
}