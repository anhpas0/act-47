// File: src/types/index.ts

// Định nghĩa một kiểu dữ liệu chung cho Context của các Route Handler động
export type TParams = {
    userId: string;
    // Thêm các params khác ở đây nếu cần trong tương lai
    // ví dụ: postId: string;
}

export type TRouteContext = {
    params: TParams
}