import { AxiosResponse } from "axios";
import api from "./index";

export interface Faculty {
  _id: string;
  name: string;
  [key: string]: any;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const getAllFaculties = async (): Promise<ApiResponse<Faculty[]>> => {
  try {
    const response: AxiosResponse<Faculty[]> = await api.get("/faculties");
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Get faculties error:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Lỗi kết nối đến server, vui lòng thử lại sau.",
    };
  }
};
