import { AxiosResponse } from "axios";
import api from "./index";

export interface StudentProfile {
  _id: string;
  user_id: string;
  student_code: string;
  full_name: string;
  gender?: string;
  date_of_birth?: string;
  faculty?: string;
  major?: string;
  class_name?: string;
  isClassMonitor: boolean;
  phone_number?: string;
  email?: string;
  address?: string;
  [key: string]: any; // cho phép thêm thuộc tính mở rộng
}

const API_BASE_URL = "/student-profiles"; 

export const getStudentInfo = async (
  user_id: string
): Promise<StudentProfile> => {
  try {
    const response: AxiosResponse<{ data: StudentProfile }> = await api.get(
      `${API_BASE_URL}/user/${user_id}`
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Lỗi khi lấy thông tin sinh viên:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Status:", error.response.status);
    } else if (error.request) {
      console.error("Không nhận được phản hồi từ server:", error.request);
    } else {
      console.error("Lỗi khi tạo request:", error.message);
    }
    throw error;
  }
};

export const updateStudentInfo = async (
  studentData: StudentProfile
): Promise<StudentProfile> => {
  try {
    const response: AxiosResponse<{ data: StudentProfile }> = await api.put(
      `${API_BASE_URL}/${studentData._id}`,
      studentData
    );
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin sinh viên:", error);
    throw error;
  }
};

export const deleteStudentProfile = async (
  studentId: string
): Promise<{ message: string }> => {
  try {
    const response: AxiosResponse<{ message: string }> = await api.delete(
      `${API_BASE_URL}/${studentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa hồ sơ sinh viên:", error);
    throw error;
  }
};
