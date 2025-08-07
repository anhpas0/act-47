// File: src/app/api/poster/submit/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import axios from 'axios';
import FormData from 'form-data';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
  }

  try {
    const data = await request.formData();
    
    // 1. Lấy tất cả các file ảnh
    const imageFiles = data.getAll('image') as File[];
    const pageId = data.get('page_id') as string | null;
    const pageAccessToken = data.get('page_access_token') as string | null;
    const description = data.get('description') as string || '';
    const footer = data.get('footer') as string || '';
    const scheduledTime = data.get('scheduledTime') as string | undefined;

    if (imageFiles.length === 0 || !pageId || !pageAccessToken) {
      return NextResponse.json({ error: 'Thiếu thông tin cần thiết (ít nhất 1 ảnh, page_id, page_access_token).' }, { status: 400 });
    }

    const caption = footer ? `${description}\n\n${footer}` : description;
    
    // --- LOGIC ĐĂNG 1 ẢNH (ĐƠN GIẢN HÓA) ---
    if (imageFiles.length === 1) {
        const imageFile = imageFiles[0];
        const fbFormData = new FormData();
        fbFormData.append('access_token', pageAccessToken);
        fbFormData.append('caption', caption);
        
        const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
        fbFormData.append('source', imageBuffer, imageFile.name);

        if (scheduledTime) {
            fbFormData.append('published', 'false');
            fbFormData.append('scheduled_publish_time', scheduledTime);
        }

        const url = `https://graph.facebook.com/${pageId}/photos`;
        const response = await axios.post(url, fbFormData, { headers: fbFormData.getHeaders() });
        
        return NextResponse.json({ success: true, data: response.data });
    }

    // --- LOGIC ĐĂNG NHIỀU ẢNH (PHỨC TẠP HƠN) ---
    else {
        // 2. Tải lên từng ảnh với published=false để lấy ID
        const uploadedPhotoIds: string[] = [];
        const uploadUrl = `https://graph.facebook.com/${pageId}/photos`;

        // Sử dụng vòng lặp for...of tuần tự thay vì Promise.all để tránh rate limit của Facebook
        for (const file of imageFiles) {
            const photoFormData = new FormData();
            photoFormData.append('access_token', pageAccessToken);
            photoFormData.append('published', 'false'); // Quan trọng: tải lên nhưng không công bố
            
            const imageBuffer = Buffer.from(await file.arrayBuffer());
            photoFormData.append('source', imageBuffer, file.name);

            try {
                const response = await axios.post(uploadUrl, photoFormData, { 
                    headers: photoFormData.getHeaders(),
                });
                if (response.data.id) {
                    uploadedPhotoIds.push(response.data.id);
                }
            } catch (uploadError) {
                console.error(`Lỗi khi tải lên file: ${file.name}`, uploadError);
                // Có thể bỏ qua ảnh bị lỗi và tiếp tục
            }
        }

        if (uploadedPhotoIds.length === 0) {
            return NextResponse.json({ error: 'Không thể tải lên bất kỳ ảnh nào.' }, { status: 500 });
        }

        // 3. Tạo bài đăng cuối cùng với các ID ảnh đã thu thập
        const feedUrl = `https://graph.facebook.com/${pageId}/feed`;
        
        const finalPostData: any = {
            access_token: pageAccessToken,
            message: caption,
            attached_media: uploadedPhotoIds.map(id => ({ media_fbid: id })),
        };

        if (scheduledTime) {
            finalPostData.published = false;
            finalPostData.scheduled_publish_time = scheduledTime;
        }

        const finalResponse = await axios.post(feedUrl, finalPostData);

        return NextResponse.json({ success: true, data: finalResponse.data });
    }

  } catch (error: any) {
    console.error("Lỗi nghiêm trọng trong API submit:", error.response?.data || error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.response?.data?.error || { message: 'Lỗi không xác định khi đăng bài.' } 
    }, { status: 500 });
  }
}