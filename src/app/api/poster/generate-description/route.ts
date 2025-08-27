// File: src/app/api/poster/generate-description/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    // Lấy Content-Type để xác định loại yêu cầu
    const contentType = request.headers.get('content-type') || '';

    try {
        let promptText: string;
        
        // Trường hợp 1: Yêu cầu chứa ảnh (multipart/form-data)
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            const imageFile = formData.get('image') as File | null;
            if (!imageFile) {
                return NextResponse.json({ error: 'Không có file ảnh trong yêu cầu' }, { status: 400 });
            }

            const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
            const imagePart = { 
                inlineData: { 
                    data: imageBuffer.toString('base64'), 
                    mimeType: imageFile.type 
                } 
            };
            
            // Prompt đã được nâng cấp với yêu cầu về độ dài
            promptText = "Dựa vào hình ảnh này, hãy tạo ra 3 gợi ý mô tả hấp dẫn cho bài đăng mạng xã hội. Mỗi gợi ý nên có độ dài khoảng 200-250 ký tự để tối ưu hiển thị. Mỗi gợi ý trên một dòng và bắt đầu bằng 'Gợi ý mô tả X:'. Chỉ trả lời bằng tiếng Việt.";
            
            const result = await model.generateContent([promptText, imagePart]);
            return NextResponse.json({ description: result.response.text() });

        // Trường hợp 2: Yêu cầu chứa văn bản (application/json)
        } else if (contentType.includes('application/json')) {
            const { prompt_text } = await request.json();
            if (!prompt_text) {
                return NextResponse.json({ error: 'Không có prompt_text trong yêu cầu' }, { status: 400 });
            }

            // Prompt đã được nâng cấp với yêu cầu về độ dài
            promptText = `Dựa trên ý tưởng sau: "${prompt_text}", hãy viết 3 gợi ý mô tả hấp dẫn cho bài đăng mạng xã hội. Mỗi gợi ý nên có độ dài khoảng 200-250 ký tự. Mỗi gợi ý trên một dòng và bắt đầu bằng 'Gợi ý mô tả X:'. Chỉ trả lời bằng tiếng Việt.`;
            
            const result = await model.generateContent(promptText);
            return NextResponse.json({ description: result.response.text() });

        // Trường hợp không xác định
        } else {
            return NextResponse.json({ error: 'Content-Type không được hỗ trợ. Chỉ chấp nhận multipart/form-data hoặc application/json.' }, { status: 415 });
        }

    } catch (error) {
        console.error("Lỗi từ Gemini API:", error);
        return NextResponse.json({ error: 'Đã có lỗi xảy ra từ phía Gemini.' }, { status: 500 });
    }
}