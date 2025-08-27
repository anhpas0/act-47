"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Image from 'next/image';
import type { Session } from "next-auth";

// Định nghĩa kiểu dữ liệu cho một Fanpage
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
  const [prompt, setPrompt] = useState(''); // Prompt để tạo ảnh
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [description, setDescription] = useState(''); // State cho nội dung cuối cùng
  const [suggestedDescriptions, setSuggestedDescriptions] = useState<string[]>([]); // State mới cho các gợi ý
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [textPrompt, setTextPrompt] = useState(''); // Prompt để tạo mô tả từ text

  // States chung cho giao diện và hẹn lịch
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  
  // Tải danh sách fanpage và footers
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

  const parseAndCleanSuggestions = (rawText: string): string[] => {
    return rawText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('Gợi ý mô tả'))
      .map(line => line.replace(/Gợi ý mô tả \d+:/, '').trim());
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
    setStatus(`✍️ AI đang viết mô tả TỪ ẢNH...`);
    const formData = new FormData();
    formData.append('image', imageToSend);
    try {
        const res = await axios.post('/api/poster/generate-description', formData);
        const cleanedSuggestions = parseAndCleanSuggestions(res.data.description);
        setSuggestedDescriptions(cleanedSuggestions);
        if (cleanedSuggestions.length > 0) setDescription(cleanedSuggestions[0]);
        setStatus("✅ Đã tạo mô tả thành công! Chọn một gợi ý hoặc chỉnh sửa bên dưới.");
    } catch (error) { setStatus("❌ Lỗi khi tạo mô tả từ ảnh."); }
    finally { setIsGeneratingDesc(false); }
  };
  
  const handleGenerateDescriptionFromText = async () => {
    if (!textPrompt) { setStatus("Vui lòng nhập ý tưởng để tạo mô tả."); return; }
    setIsGeneratingDesc(true);
    setStatus("✍️ AI đang viết mô tả TỪ Ý TƯỞNG...");
    try {
        const res = await axios.post('/api/poster/generate-description', { prompt_text: textPrompt });
        const cleanedSuggestions = parseAndCleanSuggestions(res.data.description);
        setSuggestedDescriptions(cleanedSuggestions);
        if (cleanedSuggestions.length > 0) setDescription(cleanedSuggestions[0]);
        setStatus("✅ Đã tạo mô tả thành công! Chọn một gợi ý hoặc chỉnh sửa bên dưới.");
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
    <div className="space-y-6 text-gray-800">
      {status && <div className={`p-3 my-2 rounded text-center ${status.includes('Lỗi') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{status}</div>}
      
      <div className="p-6 bg-white border rounded-lg shadow-sm">
        <details className="group">
          <summary className="flex justify-between items-center font-semibold cursor-pointer list-none">
            <h2 className="text-xl text-gray-900">Cài đặt Fanpage & Footer</h2>
            <div className="flex items-center">
              <span className="text-sm text-blue-600 mr-2 group-open:hidden">Nhấn để mở rộng</span>
              <span className="text-sm text-gray-500 mr-2 hidden group-open:inline">Nhấn để thu gọn</span>
              <svg className="w-5 h-5 text-gray-500 transition-transform duration-300 group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </summary>
          
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-end mb-4">
                <button onClick={handleSaveFooters} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Lưu tất cả Footer</button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {isLoadingPages ? <p>Đang tải danh sách trang...</p> : (
                    pages.length > 0 ? pages.map(page => (
                        <div key={page.id} className="p-3 bg-gray-50 rounded-md border">
                            <p className="font-semibold text-gray-800">{page.name}</p>
                            <textarea
                                placeholder={`Nhập footer cho trang ${page.name}...`}
                                value={footers[page.id] || ''}
                                onChange={(e) => handleFooterChange(page.id, e.target.value)}
                                className="w-full mt-2 p-2 border rounded text-sm"
                                rows={2}
                            />
                        </div>
                    )) : <p className="text-gray-500">Không tìm thấy Fanpage nào được quản lý bởi tài khoản này.</p>
                )}
            </div>
          </div>
        </details>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="p-6 bg-white border rounded-lg shadow-sm">
            <label className="block mb-2 font-semibold text-gray-700">Chọn Fanpage để đăng</label>
            <select 
                value={selectedPage?.id || ""}
                onChange={(e) => setSelectedPage(pages.find(p => p.id === e.target.value) || null)} 
                className="w-full p-2 border rounded-md" 
                disabled={isLoadingPages || pages.length === 0}
            >
                <option value="" disabled>{isLoadingPages ? "Đang tải..." : (pages.length > 0 ? "-- Chọn một Fanpage --" : "Không có Fanpage để chọn")}</option>
                {pages.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
        </div>

        {selectedPage && (
            <>
                <div className="p-6 bg-white border rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-3 text-gray-900">1. Tạo hoặc Tải lên Hình ảnh</h2>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold mb-2 text-gray-800">Tạo ảnh bằng AI</h3>
                        <div className="flex gap-2">
                            <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Nhập ý tưởng của bạn, ví dụ: một chú mèo phi hành gia..." className="flex-grow p-2 border rounded-md"/>
                            <button type="button" onClick={handleGenerateImage} disabled={isGeneratingImage} className="px-4 py-2 font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-purple-300">
                                {isGeneratingImage ? 'Đang vẽ...' : 'Tạo ảnh'}
                            </button>
                        </div>
                    </div>
                    <div className="text-center my-4 font-semibold text-gray-500">HOẶC</div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold mb-2 text-gray-800">Tải ảnh lên</h3>
                        <input type="file" accept="image/*" multiple onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>
                </div>

                <div className="p-6 bg-white border rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-3 text-gray-900">2. Tạo Mô tả & Nội dung</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-800">Lựa chọn 1: Tạo mô tả từ ảnh</h3>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="w-full aspect-square border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-100 overflow-hidden relative mb-4">
                                {generatedImage ? (
                                    <Image src={`data:image/png;base64,${generatedImage}`} alt="Ảnh do AI tạo" layout="fill" objectFit="contain" />
                                ) : imagePreviews.length > 0 ? (
                                    <Image src={imagePreviews[selectedImageIndex]} alt={`Xem trước ảnh ${selectedImageIndex + 1}`} layout="fill" objectFit="contain" />
                                ) : (
                                    <p className="text-gray-400">Chưa có ảnh</p>
                                )}
                                </div>
                                {imagePreviews.length > 1 && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-2 text-gray-700">Chọn ảnh để tạo mô tả:</h4>
                                        <div className="flex gap-2 overflow-x-auto p-2 bg-gray-100 rounded-lg">
                                        {imagePreviews.map((src, index) => (
                                            <button key={index} type="button" onClick={() => setSelectedImageIndex(index)} className={`flex-shrink-0 w-16 h-16 relative border-2 rounded-md overflow-hidden transition-all ${selectedImageIndex === index ? 'border-blue-500 ring-2 ring-blue-300' : 'border-transparent'}`}>
                                                <Image src={src} alt={`Preview ${index+1}`} layout="fill" objectFit="cover" />
                                            </button>
                                        ))}
                                        </div>
                                    </div>
                                )}
                                <button type="button" onClick={handleGenerateDescriptionFromImage} disabled={isGeneratingDesc || (!generatedImage && imageFiles.length === 0)} className="w-full mt-4 px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300">
                                    Tạo mô tả từ Ảnh đã chọn
                                </button>
                            </div>

                            <div className="text-center my-2 font-semibold text-gray-500">HOẶC</div>

                            <h3 className="font-semibold text-gray-800">Lựa chọn 2: Tạo mô tả từ ý tưởng</h3>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex gap-2">
                                    <input type="text" value={textPrompt} onChange={(e) => setTextPrompt(e.target.value)} placeholder="Ví dụ: lợi ích của việc đọc sách..." className="flex-grow p-2 border rounded-md"/>
                                    <button type="button" onClick={handleGenerateDescriptionFromText} disabled={isGeneratingDesc} className="px-4 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300">Tạo</button>
                                </div>
                            </div>

                            <h3 className="font-semibold text-gray-800 pt-4">Các gợi ý từ AI (Nhấn để chọn)</h3>
                            <div className="space-y-3">
                                {isGeneratingDesc ? (
                                    <div className="p-4 bg-gray-100 rounded-md text-center animate-pulse">Đang tạo gợi ý...</div>
                                ) : suggestedDescriptions.length > 0 ? (
                                    suggestedDescriptions.map((suggestion, index) => (
                                        <div 
                                            key={index} 
                                            onClick={() => setDescription(suggestion)}
                                            className="p-4 bg-gray-50 rounded-md border-2 border-transparent hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                                        >
                                            <p className="text-sm text-gray-700">{suggestion}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 bg-gray-100 rounded-md text-center text-gray-500">
                                        Chưa có gợi ý nào.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-800">Nội dung bài viết (Chỉnh sửa tại đây)</h3>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Chọn một gợi ý hoặc tự viết nội dung của bạn ở đây..." rows={20} className="w-full p-3 border rounded-md bg-white focus:ring-2 focus:ring-blue-500"/>
                        </div>
                    </div>
                </div>
                
                <div className="p-6 bg-white border rounded-lg shadow-sm">
                   <h2 className="text-xl font-semibold mb-3 text-gray-900">3. Hẹn lịch (Tùy chọn)</h2>
                    <div className="flex items-center space-x-4">
                        <input type="checkbox" id="schedule-check" checked={isScheduling} onChange={(e) => setIsScheduling(e.target.checked)} className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"/>
                        <label htmlFor="schedule-check" className="font-medium text-gray-700">Hẹn lịch đăng bài</label>
                    </div>
                    {isScheduling && (
                        <input 
                            type="datetime-local" 
                            value={scheduledDateTime} 
                            onChange={(e) => setScheduledDateTime(e.target.value)} 
                            className="w-full p-2 mt-4 border rounded-md"
                        />
                    )}
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={isLoading} className="px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                        {isLoading ? 'Đang xử lý...' : (isScheduling ? 'Hẹn lịch đăng' : 'Đăng ngay')}
                    </button>
                </div>
            </>
        )}
      </form>
    </div>
  );
}