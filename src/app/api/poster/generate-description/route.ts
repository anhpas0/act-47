import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    try {
        const formData = await request.formData();
        const imageFile = formData.get('image') as File | null;
        if (!imageFile) return NextResponse.json({ error: 'Không có ảnh' }, { status: 400 });
        const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
        const imagePart = { inlineData: { data: imageBuffer.toString('base64'), mimeType: imageFile.type } };
        const prompt = "Dựa vào hình ảnh này, hãy tạo ra 3 gợi ý mô tả ngắn gọn, hấp dẫn cho bài đăng mạng xã hội. Mỗi gợi ý trên một dòng và bắt đầu bằng 'Gợi ý caption X:'. Chỉ trả lời bằng tiếng Việt.";
        const result = await model.generateContent([prompt, imagePart]);
        return NextResponse.json({ description: result.response.text() });
    } catch (err) { // Sửa 'error' thành 'err'
        console.error("Lỗi từ Gemini:", err);
        return NextResponse.json({ error: 'Lỗi từ Gemini' }, { status: 500 });
    }
}