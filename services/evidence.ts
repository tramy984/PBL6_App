import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosResponse } from "axios";
import api from "./index";

export interface Evidence {
  _id: string;
  title: string;
  status: "approved" | "pending";
  file_url: string;
  submitted_at: string;
  verified_at?: string;
  student_id: {
    _id: string;
    full_name: string;
    student_number: string;
    date_of_birth: string;
    [key: string]: any;
  };
  self_point: number;
  class_point: number;
  faculty_point: number;
  [key: string]: any;
}


interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Lấy token từ AsyncStorage để gửi kèm
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("Chưa đăng nhập");
  return { Authorization: `Bearer ${token}` };
};


// Lấy tất cả minh chứng
export const getAllEvidences = async (): Promise<ApiResponse<Evidence[]>> => {
  try {
    const headers = await getAuthHeaders();
    const response: AxiosResponse<{ data: Evidence[] }> = await api.get("/evidences", { headers });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Get all evidences error:", error);
    return { success: false, message: error.response?.data?.message || "Lỗi kết nối đến server." };
  }
};

// // Lấy chi tiết minh chứng theo ID
// export const getEvidenceDetailsById = async (id: string): Promise<ApiResponse<Evidence>> => {
//   try {
//     const headers = await getAuthHeaders();
//     const response: AxiosResponse<{ data: Evidence }> = await api.get(`/evidences/${id}`, { headers });
//     return { success: true, data: response.data.data };
//   } catch (error: any) {
//     console.error(`Get evidence ${id} error:`, error);
//     return { success: false, message: error.response?.data?.message || "Không thể lấy thông tin minh chứng." };
//   }
// };

// Lấy minh chứng theo ID sinh viên
export const getEvidencesByStudentId = async (studentId: string): Promise<ApiResponse<Evidence[]>> => {
  try {
    const headers = await getAuthHeaders();
    const response: AxiosResponse<{ data: Evidence[] }> = await api.get(`/evidences/student/${studentId}`, { headers });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error(`Get evidence for student ${studentId} error:`, error);
    return { success: false, message: error.response?.data?.message || "Không thể lấy thông tin minh chứng." };
  }
};

// Tạo mới minh chứng
export const submitEvidence = async (evidenceData: Partial<Evidence>): Promise<ApiResponse<Evidence>> => {
  try {
    const headers = await getAuthHeaders();
    const response: AxiosResponse<{ data: Evidence }> = await api.post("/evidences", evidenceData, {
      headers: { ...headers, "Content-Type": "application/json" },
    });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Submit evidence error:", error);
    return { success: false, message: error.response?.data?.message || "Không thể nộp minh chứng." };
  }
};

// Cập nhật minh chứng
export const updateEvidence = async (id: string, updatedData: Partial<Evidence>): Promise<ApiResponse<Evidence>> => {
  try {
    const headers = await getAuthHeaders();
    const response: AxiosResponse<{ data: Evidence }> = await api.put(`/evidences/${id}`, updatedData, {
      headers: { ...headers, "Content-Type": "application/json" },
    });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error(`Update evidence ${id} error:`, error);
    return { success: false, message: error.response?.data?.message || "Không thể cập nhật minh chứng." };
  }
};

// Lấy danh sách minh chứng theo lớp
// export const getEvidencesByClass = async (classId: string): Promise<ApiResponse<Evidence[]>> => {
//   try {
//     const headers = await getAuthHeaders();
//     const response: AxiosResponse<{ data: Evidence[] }> = await api.get(`/evidences/class/${classId}`, { headers });
//     return { success: true, data: response.data.data };
//   } catch (error: any) {
//     console.error(`Get evidences by class ${classId} error:`, error);
//     return { success: false, message: error.response?.data?.message || "Không thể lấy danh sách minh chứng theo lớp." };
//   }
// };

// Duyệt minh chứng
// export const approveEvidence = async (
//   id: string,
//   approveData: { status: "approved" | "rejected"; reason?: string }
// ): Promise<ApiResponse<Evidence>> => {
//   try {
//     const headers = await getAuthHeaders();
//     const response: AxiosResponse<{ data: Evidence }> = await api.put(`/evidences/${id}/approve`, approveData, {
//       headers: { ...headers, "Content-Type": "application/json" },
//     });
//     return { success: true, data: response.data.data };
//   } catch (error: any) {
//     console.error(`Approve evidence ${id} error:`, error);
//     return { success: false, message: error.response?.data?.message || "Không thể duyệt minh chứng." };
//   }
// };
