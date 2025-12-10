import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosResponse } from "axios";
import api from "./index"; // chỉnh path nếu cần

// =============================
//  KIỂU DỮ LIỆU
// =============================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface Feedback {
  _id?: string;
  studentId: string;
  activityId: string;
  rating: number;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

// =============================
//  LẤY TOKEN HEADER
// =============================

const getAuthHeaders = async (): Promise<{ Authorization: string }> => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");
  return { Authorization: `Bearer ${token}` };
};

// =============================
//  API: LẤY FEEDBACK CỦA 1 SINH VIÊN TRONG 1 HOẠT ĐỘNG
// =============================

export const getFeedbackByStudentActivity = async (
  studentId: string,
  activityId: string
): Promise<ApiResponse<Feedback | null>> => {
  try {
    const headers = await getAuthHeaders();

    const res: AxiosResponse<any> = await api.get(
      `/feedback/student/${studentId}/activity/${activityId}`,
      { headers }
    );

    console.log("Feedback response data:", res.data.data);

    // Trường hợp BE trả về null hoặc object
    return {
      success: true,
      data: res.data ? mapBackendFeedback(res.data.data) : null,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Không thể lấy feedback",
    };
  }
};

// =============================
//  API: TẠO FEEDBACK
// =============================

export const createFeedback = async (payload: {
  student_id: string;
  activity_id: string;
  rating: number;
  comment: string;
}): Promise<ApiResponse<Feedback>> => {
  try {
    const headers = await getAuthHeaders();

    const res = await api.post("/feedback", payload, { headers });

    return {
      success: true,
      data: mapBackendFeedback(res.data),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Không thể tạo feedback",
    };
  }
};

// =============================
//  CHUYỂN DATA BACKEND → FE MODEL
// =============================

const mapBackendFeedback = (data: any): Feedback => {
  return {
    _id: data._id,
    studentId: data.student_id?._id || data.studentId,
    activityId: data.activity_id?._id || data.activityId,
    rating: data.rating,
    content: data.comment || data.content,
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt,
  };
};
