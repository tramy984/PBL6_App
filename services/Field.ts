import { AxiosResponse } from "axios";
import api from "./index";

// Kiểu Field
export interface Field {
  _id: string;
  name: string;
  description?: string;
  [key: string]: any;
}

// Kiểu trả về API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Lấy danh sách tất cả lĩnh vực
export const getAllFields = async (): Promise<ApiResponse<Field[]>> => {
  try {
    const response: AxiosResponse<Field[]> = await api.get("/fields");

    // Nếu API trả về mảng trực tiếp
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Get fields error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Lỗi kết nối đến server.",
    };
  }
};
