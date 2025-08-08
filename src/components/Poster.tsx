"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Image from 'next/image';
import type { Session } from "next-auth";

interface FanPage {
  id: string;
  name: string;
  access_token: string;
}

export default function Poster({ session }: { session: Session }) {
  // States cho việc chọn page và quản lý footer
  const [pages, setPages] = useState<FanPage[]>([]);
  const [footers, setFooters] = useState<Record<string, string>>({});
  const [selectedPage, setSelectedPage] = useState<FanPage | null>(null);
  const [isLoadingPages, setIsLoadingPages] = useState(true);

  // States cho việc quản lý ảnh
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); 

  // States cho các chức năng AI
  const [prompt, setPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [description, setDescription] = useState('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [textPrompt, setTextPrompt] = useState('');

  // States chung cho giao diện và hẹn lịch
  const [status, setStatus] = useState(''); // <--- DÒNG ĐÃ ĐƯỢC SỬA
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  
  // ... (Toàn bộ phần còn lại của file giữ nguyên như phiên bản hoàn chỉnh trước đó)
  useEffect(() => {
    const fetchPagesAndFooters = async () => {
      setIsLoadingPages(true);
      setStatus("Đang tải danh sách Fanpage...");
      try {
        const res = await axios.get('/api/user/pages');
        if (Array.isArray(res.data.pages)) {
          setPages(res.data.pages);
          setFooters(res.data.footers || {});
          setStatus("");
        } else {
          setPages([]);
          setStatus("Lỗi: Dữ liệu Fanpage trả về không hợp lệ.");
        }
      } catch (error) { 
        setStatus("Lỗi khi tải Fanpage của bạn.");
      }
      finally { 
        setIsLoadingPages(false); 
      }
    };
    if (session) {
        fetchPagesAndFooters();
    }
  }, [session]);

  const handleFooterChange = (pageId: string, value: string) => {
    setFooters(prev => ({ ...prev, [pageId]: value }));
  };

  const handleSaveFooters = async () => {
    setStatus("Đang lưu cài đặt footer...");
    try {
        await axios.post('/api/user/footers', { footers });
        setStatus("✅ Đã lưu cài đặt footer thành công!");
    } catch (error) {
        setStatus("❌ Lỗi khi lưu footer.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(files);
      setGeneratedImage(null);
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
      setSelectedImageIndex(0);
      setStatus(`Đã chọn ${files.length} ảnh.`);
    }
  };
  
  const handleGenerateImage = async () => {
    if (!prompt) { setStatus("Vui lòng nhập ý tưởng để tạo ảnh."); return; }
    setIsGeneratingImage(true);
    setStatus("🎨 Đang vẽ tranh bằng AI, vui lòng chờ...");
    try {
        const res = await axios.post('/api/poster/generate-image', { prompt });
        setGeneratedImage(res.data.b64_json);
        setImageFiles([]);
        setImagePreviews([]);
        setSelectedImageIndex(0);
        setStatus("✅ Đã tạo ảnh thành công!");
    } catch (error) { setStatus("❌ Lỗi khi tạo ảnh. Có thể bạn đã hết tín dụng OpenAI."); }
    finally { setIsGeneratingImage(false); }
  };

  const handleGenerateDescriptionFromImage = async () => {
    let imageToSend: File | null = null;
    if (imageFiles.length > 0 && imageFiles[selectedImageIndex]) {
        imageToSend = imageFiles[selectedImageIndex];
    } else if (generatedImage) {
        const byteString = atob(generatedImage);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) { ia[i] = byteString.charCodeAt(i); }
        imageToSend = new File([ab], "ai_generated_image.png", { type: 'image/png' });
    }
    if (!imageToSend) { setStatus("Vui lòng chọn một ảnh để tạo mô tả."); return; }
    
    setIsGeneratingDesc(true);
    setStatus(`✍️ Gemini đang viết mô tả TỪ ẢNH...`);
    const formData = new FormData();
    formData.append('image', imageToSend);
    try {
        const res = await axios.post('/api/poster/generate-description', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        const suggestions = res.data.description.split('\n').filter((line: string) => line.trim().startsWith('Gợi ý mô tả'));
        setDescription(suggestions.join('\n'));
        setStatus("✅ Đã tạo mô tả thành công!");
    } catch (error) { setStatus("❌ Lỗi khi tạo mô tả từ ảnh."); }
    finally { setIsGeneratingDesc(false); }
  };
  
  const handleGenerateDescriptionFromText = async () => {
    if (!textPrompt) { setStatus("Vui lòng nhập ý tưởng để tạo mô tả."); return; }
    setIsGeneratingDesc(true);
    setStatus("✍️ Gemini đang viết mô tả TỪ Ý TƯỞNG...");
    try {
        const res = await axios.post('/api/poster/generate-description', 
            { prompt_text: textPrompt },
            { headers: { 'Content-Type': 'application/json' } }
        );
        const suggestions = res.data.description.split('\n').filter((line: string) => line.trim().startsWith('Gợi ý mô tả'));
        setDescription(suggestions.join('\n'));
        setStatus("✅ Đã tạo mô tả thành công!");
    } catch (error) { setStatus("❌ Lỗi khi tạo mô tả từ ý tưởng."); }
    finally { setIsGeneratingDesc(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasImage = imageFiles.length > 0 || !!generatedImage;
    if (!description || !selectedPage) {
        setStatus('Cần chọn Fanpage và có mô tả để đăng bài.');
        return;
    }
    if (!hasImage) {
        const userConfirmed = window.confirm("Bạn chưa có ảnh nào. Bạn có chắc muốn đăng bài chỉ có văn bản không?");
        if (!userConfirmed) return;
    }
    
    setIsLoading(true);
    setStatus('🚀 Đang gửi bài viết đến Facebook...');
    const formData = new FormData();
    if (hasImage) {
        if (generatedImage) {
            const byteString = atob(generatedImage);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) { ia[i] = byteString.charCodeAt(i); }
            const aiFile = new File([ab], "ai_generated_image.png", { type: 'image/png' });
            formData.append('image', aiFile);
        } else {
            for (const file of imageFiles) {
                formData.append('image', file);
            }
        }
    }
    
    formData.append('description', description);
    formData.append('page_id', selectedPage.id);
    formData.append('page_access_token', selectedPage.access_token);
    const activeFooter = footers[selectedPage.id] || '';
    formData.append('footer', activeFooter);
    if (isScheduling && scheduledDateTime) {
        const timestamp = Math.floor(new Date(scheduledDateTime).getTime() / 1000).toString();
        formData.append('scheduledTime', timestamp);
    }
    
    try {
        const res = await axios.post('/api/poster/submit', formData);
        if(res.data.success) {
            setStatus(`🎉 ${isScheduling ? 'Hẹn lịch thành công!' : 'Đăng bài thành công!'} Post ID: ${res.data.data.id || res.data.data.post_id}`);
        } else {
            setStatus(`❌ Lỗi: ${res.data.error?.message || 'Lỗi không xác định'}`);
        }
    } catch (error: any) { 
        setStatus(`❌ Lỗi: ${error.response?.data?.error?.message || 'Không thể kết nối.'}`); 
    }
    finally { setIsLoading(false); }
  };

  return (
    // ... (Phần JSX giữ nguyên)
    <div className="space-y-6">
        {status && <div className={`p-3 my-2 rounded text-center ${status.includes('Lỗi') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{status}</div>}
        {/* ... */}
    </div>
  );
}