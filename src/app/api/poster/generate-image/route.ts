// File: src/app/api/poster/generate-image/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Biến môi trường GEMINI_API_KEY phải được thiết lập.");
}

const MODEL_ID = "gemini-2.0-flash-preview-image-generation";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:streamGenerateContent?key=${apiKey}`;

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Cần có prompt' }, { status: 400 });
    }

    const payload = {
      "contents": [{
        "role": "user",
        "parts": [{
          "text": `Tạo một hình ảnh theo phong cách (vector art, flat illustration, social media post, vibrant colors) với mô tả sau: ${prompt}`
        }]
      }],
      "generationConfig": {
        "responseModalities": ["IMAGE", "TEXT"]
      }
    };

    const response = await axios.post(API_URL, payload, { responseType: 'text' });
    const responseText = response.data as string;

    // === SỬA LỖI LOGIC XỬ LÝ - ĐƠN GIẢN HÓA ===
    let b64_json: string | null = null;
    
    try {
        // 1. Parse toàn bộ chuỗi phản hồi thành một mảng JSON
        const chunks = JSON.parse(responseText);

        // 2. Lặp qua mảng các "khối" (chunks) dữ liệu
        for (const chunk of chunks) {
            const candidate = chunk?.candidates?.[0];
            const imageDataPart = candidate?.content?.parts?.find((part: any) => part.inlineData);

            // 3. Nếu tìm thấy dữ liệu ảnh, lưu lại và thoát khỏi vòng lặp
            if (imageDataPart && imageDataPart.inlineData.data) {
                b64_json = imageDataPart.inlineData.data;
                break; 
            }
        }
    } catch (e) {
        console.error("Lỗi khi parse JSON từ phản hồi streaming:", e);
        console.error("Dữ liệu thô nhận được:", responseText);
        throw new Error("Phản hồi từ API không phải là một JSON array hợp lệ.");
    }
    
    // 4. Kiểm tra xem đã tìm thấy ảnh chưa
    if (b64_json) {
      return NextResponse.json({ b64_json });
    } else {
      console.error("Không tìm thấy dữ liệu hình ảnh trong toàn bộ phản hồi streaming:", responseText);
      throw new Error("Phản hồi của model không chứa dữ liệu hình ảnh.");
    }

  } catch (error: any) {
    if (error.response) {
      console.error("Lỗi từ API Endpoint:", error.response.data);
    } else {
      console.error("Lỗi khi tạo ảnh bằng API Preview:", error.message);
    }
    return NextResponse.json({ error: error.message || 'Lỗi khi tạo ảnh từ Gemini Preview.' }, { status: 500 });
  }
}