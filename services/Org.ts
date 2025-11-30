import { AxiosResponse } from "axios";
import api from "./index";

export interface OrgUnit {
  _id: string;
  name: string;
  description?: string;
  [key: string]: any;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const getAllOrgUnits = async (): Promise<ApiResponse<OrgUnit[]>> => {
  try {
    const response: AxiosResponse<OrgUnit[]> = await api.get("/org-units");
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Get org units error:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Lỗi kết nối đến server, vui lòng thử lại sau.",
    };
  }
};
